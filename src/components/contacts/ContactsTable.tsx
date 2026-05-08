'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, Phone,
  MessageCircle, Eye, Search, Download, Filter,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card, CardContent, CardHeader,
  CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import ContactFormSheet from './ContactFormSheet';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { contactsApi } from '@/lib/api/contacts.api';
import { Contact, ContactRole } from '@/types';

const ROLE_LABELS: Record<ContactRole, string> = {
  OWNER: 'Owner',
  AGENT: 'Agent',
};

const ROLE_BADGE_CLASS: Record<ContactRole, string> = {
  OWNER: 'bg-blue-50 text-blue-700 border-blue-200',
  AGENT: 'bg-violet-50 text-violet-700 border-violet-200',
};

function exportToCsv(contacts: Contact[]) {
  const headers = ['Name', 'Role', 'Phone', 'WhatsApp', 'Email', 'National ID', 'Address', 'Notes', 'Status'];
  const rows = contacts.map((c) => [
    c.name, c.role, c.phone, c.whatsapp ?? '',
    c.email ?? '', c.nationalId ?? '',
    c.physicalAddress ?? '', c.notes ?? '',
    c.isActive ? 'Active' : 'Inactive',
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nyumbalink-contacts-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ActionTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

const UNSET = '__ALL__';

export default function ContactsTable() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<ContactRole | undefined>(undefined);

  const { data: contactsResponse, isLoading } = useQuery({
    queryKey: ['contacts', { role: roleFilter }],
    queryFn: () => contactsApi.getAll({ role: roleFilter, limit: 200 }),
  });

  const contacts = contactsResponse?.data ?? [];
  const total = contactsResponse?.meta?.total ?? 0;

  const filtered = search
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          c.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : contacts;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deactivated');
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: () => toast.error('Failed to deactivate contact.'),
  });

  const handleEdit = (c: Contact) => { setSelected(c); setSheetOpen(true); };
  const handleDelete = (c: Contact) => { setSelected(c); setDeleteOpen(true); };

  return (
    <TooltipProvider delayDuration={300}>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>All Contacts</CardTitle>
            <CardDescription>
              {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
              {(search || roleFilter) && total !== filtered.length
                ? ` (filtered from ${total})`
                : ''}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCsv(filtered)}
              disabled={filtered.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => { setSelected(null); setSheetOpen(true); }}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search + Role filter */}
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search name, phone, email..."
                className="pl-8 h-9 text-sm w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={roleFilter ?? UNSET}
              onValueChange={(v) => setRoleFilter(v === UNSET ? undefined : v as ContactRole)}
            >
              <SelectTrigger className="h-9 w-36 text-sm">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>All Roles</SelectItem>
                <SelectItem value="OWNER">Owners</SelectItem>
                <SelectItem value="AGENT">Agents</SelectItem>
              </SelectContent>
            </Select>
            {(search || roleFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={() => { setSearch(''); setRoleFilter(undefined); }}
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Clear
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">
                {search || roleFilter ? 'No contacts match your filters' : 'No contacts yet'}
              </p>
              <p className="text-sm mt-1">
                {search || roleFilter
                  ? 'Try a different search or role filter.'
                  : 'Add your first contact (owner or agent) to get started.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>NIN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_BADGE_CLASS[contact.role]}`}
                        >
                          {ROLE_LABELS[contact.role]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {contact.email ?? <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell>
                        {contact.whatsapp ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                            {contact.whatsapp}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {contact.nationalId ?? <span className="text-gray-400 font-sans">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={contact.isActive ? 'default' : 'secondary'}>
                          {contact.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionTooltip label="View profile">
                            <Link href={`/contacts/${contact.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </ActionTooltip>
                          <ActionTooltip label="Edit contact">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(contact)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Deactivate contact">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(contact)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </ActionTooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ContactFormSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelected(null); }}
        contact={selected}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        isLoading={deleteMutation.isPending}
        title="Deactivate Contact"
        description={`Are you sure you want to deactivate ${selected?.name}? They will no longer appear in the system.`}
      />
    </TooltipProvider>
  );
}