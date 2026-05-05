'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Images, ToggleLeft, ToggleRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PropertyFormSheet from './PropertyFormSheet';
import ImageUploadManager from './ImageUploadManager';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { propertiesApi } from '@/lib/api/properties.api';
import { Property } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  SINGLE_ROOM: 'Single Room',
  DOUBLE_ROOM: 'Double Room',
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  STUDIO: 'Studio',
};

export default function PropertiesTable() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [selected, setSelected] = useState<Property | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll({ limit: 100 }),
  });

  const properties = data?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property deleted successfully');
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: () => toast.error('Failed to delete property.'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.toggleStatus(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(`Property marked as ${updated.status === 'AVAILABLE' ? 'Available' : 'Rented Out'}`);
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const handleEdit = (p: Property) => { setSelected(p); setFormOpen(true); };
  const handleDelete = (p: Property) => { setSelected(p); setDeleteOpen(true); };
  const handleImages = (p: Property) => { setSelected(p); setImagesOpen(true); };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Properties</CardTitle>
            <CardDescription>
              {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} listed
            </CardDescription>
          </div>
          <Button onClick={() => { setSelected(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">No properties yet</p>
              <p className="text-sm mt-1">Add your first property listing to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Price/mo</TableHead>
                  <TableHead>Landlord</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => {
                  const primary = property.images.find((i) => i.isPrimary) ?? property.images[0];
                  return (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {primary ? (
                              <Image
                                src={primary.url}
                                alt={property.title}
                                width={64}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm leading-tight">{property.title}</p>
                            <p className="text-xs text-gray-500">{property.area}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{TYPE_LABELS[property.type]}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{property.district.name}</TableCell>
                      <TableCell className="text-sm font-medium">
                        UGX {Number(property.price).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{property.landlord.name}</TableCell>
                      <TableCell>
                        <Badge variant={property.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                          {property.status === 'AVAILABLE' ? 'Available' : 'Rented Out'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {property.images.length}/8
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            title="Manage Images"
                            onClick={() => handleImages(property)}
                          >
                            <Images className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Toggle Status"
                            onClick={() => toggleMutation.mutate(property.id)}
                            disabled={toggleMutation.isPending}
                          >
                            {property.status === 'AVAILABLE'
                              ? <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                              : <ToggleLeft className="h-3.5 w-3.5 text-gray-400" />
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(property)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(property)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PropertyFormSheet
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelected(null); }}
        property={selected}
      />

      {selected && (
        <ImageUploadManager
          open={imagesOpen}
          onClose={() => { setImagesOpen(false); setSelected(null); }}
          property={selected}
        />
      )}

      <DeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        isLoading={deleteMutation.isPending}
        title="Delete Property"
        description={`Are you sure you want to delete "${selected?.title}"? This will also remove all images.`}
      />
    </>
  );
}