'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import { University } from '@/types';
import { universitiesApi } from '@/lib/api/universities.api';
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
import UniversityFormSheet from '@/components/settings/UniversityFormSheet';

export default function UniversitiesTab() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<University | null>(null);
  const [search, setSearch] = useState('');

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['universities'],
    queryFn: universitiesApi.getAll,
  });

  const filtered = search
    ? universities.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.shortName?.toLowerCase().includes(search.toLowerCase()) ||
          u.location?.toLowerCase().includes(search.toLowerCase()),
      )
    : universities;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => universitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast.success('University deleted');
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ??
          'Cannot delete — hostel properties may be linked to this university.',
      ),
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">Universities</CardTitle>
            <CardDescription>
              {universities.length} universit{universities.length !== 1 ? 'ies' : 'y'} — used to
              link hostels and enable proximity filtering
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
            Add University
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative w-full sm:w-64">
            <GraduationCap className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search universities..."
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
              <GraduationCap className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">No universities found</p>
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
                      Short Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Location
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((university) => (
                    <TableRow key={university.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {university.name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {university.shortName ? (
                          <Badge variant="secondary" className="text-xs font-mono">
                            {university.shortName}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {university.location ?? (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(university);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelected(university);
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

      <UniversityFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        university={selected}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{selected?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the university. The action will fail if any hostel
              properties are still linked to it — reassign those hostels first.
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