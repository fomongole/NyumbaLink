'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LandlordFormSheet from './LandlordFormSheet';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { landlordsApi } from '@/lib/api/landlords.api';
import { Landlord } from '@/types';

export default function LandlordsTable() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Landlord | null>(null);

  const { data: landlords = [], isLoading } = useQuery({
    queryKey: ['landlords'],
    queryFn: landlordsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => landlordsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlords'] });
      toast.success('Landlord deactivated successfully');
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: () => toast.error('Failed to delete landlord.'),
  });

  const handleEdit = (landlord: Landlord) => {
    setSelected(landlord);
    setSheetOpen(true);
  };

  const handleDelete = (landlord: Landlord) => {
    setSelected(landlord);
    setDeleteOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setSelected(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Landlords</CardTitle>
            <CardDescription>
              {landlords.length} landlord{landlords.length !== 1 ? 's' : ''} registered
            </CardDescription>
          </div>
          <Button onClick={() => { setSelected(null); setSheetOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Landlord
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : landlords.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">No landlords yet</p>
              <p className="text-sm mt-1">Add your first landlord to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {landlords.map((landlord) => (
                  <TableRow key={landlord.id}>
                    <TableCell className="font-medium">{landlord.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5" />
                        {landlord.phone}
                      </div>
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
                    <TableCell className="max-w-xs truncate text-sm text-gray-600">
                      {landlord.notes ?? <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={landlord.isActive ? 'default' : 'secondary'}>
                        {landlord.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(landlord)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(landlord)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LandlordFormSheet
        open={sheetOpen}
        onClose={handleCloseSheet}
        landlord={selected}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        isLoading={deleteMutation.isPending}
        title="Delete Landlord"
        description={`Are you sure you want to deactivate ${selected?.name}? They will no longer appear in the system.`}
      />
    </>
  );
}