'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, Phone,
  MessageCircle, Eye, Search, Download,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import LandlordFormSheet from './LandlordFormSheet';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { landlordsApi } from '@/lib/api/landlords.api';
import { Landlord } from '@/types';

function exportToCsv(landlords: Landlord[]) {
  const headers = ['Name', 'Phone', 'WhatsApp', 'Email', 'National ID', 'Address', 'Notes', 'Status'];
  const rows = landlords.map((l) => [
    l.name, l.phone, l.whatsapp ?? '',
    l.email ?? '', l.nationalId ?? '',
    l.physicalAddress ?? '', l.notes ?? '',
    l.isActive ? 'Active' : 'Inactive',
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nyumbalink-landlords-${new Date().toISOString().split('T')[0]}.csv`;
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

export default function LandlordsTable() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Landlord | null>(null);
  const [search, setSearch] = useState('');

  const { data: landlordsResponse, isLoading } = useQuery({
    queryKey: ['landlords'],
    queryFn: () => landlordsApi.getAll(),
  });

  const landlords = landlordsResponse?.data ?? [];

  const filtered = search
    ? landlords.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.phone.includes(search) ||
          l.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : landlords;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => landlordsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlords'] });
      toast.success('Landlord deactivated');
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: () => toast.error('Failed to deactivate landlord.'),
  });

  const handleEdit = (l: Landlord) => { setSelected(l); setSheetOpen(true); };
  const handleDelete = (l: Landlord) => { setSelected(l); setDeleteOpen(true); };

  return (
    <TooltipProvider delayDuration={300}>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>All Landlords</CardTitle>
            <CardDescription>
              {filtered.length} landlord{filtered.length !== 1 ? 's' : ''}
              {search && landlords.length !== filtered.length
                ? ` (filtered from ${landlords.length})`
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
              Add Landlord
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search name, phone, email..."
              className="pl-8 h-9 text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                {search ? 'No landlords match your search' : 'No landlords yet'}
              </p>
              <p className="text-sm mt-1">
                {search ? 'Try a different search term.' : 'Add your first landlord to get started.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>NIN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((landlord) => (
                    <TableRow key={landlord.id}>
                      <TableCell className="font-medium">{landlord.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5" />
                          {landlord.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {landlord.email ?? <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell>
                        {landlord.whatsapp ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                            {landlord.whatsapp}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {landlord.nationalId ?? <span className="text-gray-400 font-sans">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={landlord.isActive ? 'default' : 'secondary'}>
                          {landlord.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionTooltip label="View profile">
                            <Link href={`/landlords/${landlord.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </ActionTooltip>

                          <ActionTooltip label="Edit landlord">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(landlord)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </ActionTooltip>

                          <ActionTooltip label="Deactivate landlord">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(landlord)}
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

      <LandlordFormSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelected(null); }}
        landlord={selected}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        isLoading={deleteMutation.isPending}
        title="Deactivate Landlord"
        description={`Are you sure you want to deactivate ${selected?.name}? They will no longer appear in the system.`}
      />
    </TooltipProvider>
  );
}