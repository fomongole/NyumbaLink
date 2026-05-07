'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { District } from '@/types';
import { districtsApi } from '@/lib/api/districts.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import DistrictFormSheet from '@/components/settings/DistrictFormSheet';

export default function DistrictsTab() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<District | null>(null);
  const [search, setSearch] = useState('');

  const { data: districts = [], isLoading } = useQuery({
    queryKey: ['districts'],
    queryFn: districtsApi.getAll,
  });

  const filtered = search
    ? districts.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.region?.toLowerCase().includes(search.toLowerCase()),
      )
    : districts;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => districtsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['districts'] });
      toast.success('District deleted');
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Cannot delete — properties may be linked.'),
  });

  const regions = [...new Set(districts.map((d) => d.region).filter(Boolean))].sort();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">Districts</CardTitle>
            <CardDescription>
              {districts.length} district{districts.length !== 1 ? 's' : ''} across{' '}
              {regions.length} region{regions.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add District
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative w-full sm:w-56">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search districts..."
              className="pl-8 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">No districts found</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Region
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Added
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((district) => (
                    <TableRow key={district.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {district.name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {district.region ? (
                          <Badge variant="secondary" className="text-xs">
                            {district.region}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-gray-500">
                          {new Date(district.createdAt).toLocaleDateString('en-UG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(district);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelected(district);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      <DistrictFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        district={selected}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{selected?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the district. This will fail if properties are linked to
              it.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelected(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selected && deleteMutation.mutate(selected.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}