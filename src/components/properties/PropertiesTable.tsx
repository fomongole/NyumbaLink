'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, Images, ToggleLeft,
  ToggleRight, Eye, RotateCcw, Download,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card, CardContent, CardHeader,
  CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

import PropertyFormSheet from './PropertyFormSheet';
import ImageUploadManager from './ImageUploadManager';
import PropertyFilterBar from './PropertyFilterBar';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { propertiesApi } from '@/lib/api/properties.api';
import { Property, PropertyFilters } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  SINGLE_ROOM: 'Single Room',
  DOUBLE_ROOM: 'Double Room',
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  STUDIO: 'Studio',
  HOSTEL: 'Hostel',
};

const FURNISHING_LABELS: Record<string, string> = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi',
  UNFURNISHED: 'Unfurnished',
};

const DEFAULT_FILTERS: PropertyFilters & { search?: string } = {};

function exportToCsv(properties: Property[]) {
  const headers = [
    'Title', 'Area', 'District', 'Type', 'Price (UGX)',
    'Bedrooms', 'Bathrooms', 'Status', 'Furnishing',
    'Lease Term', 'Landlord', 'Phone', 'Views', 'Enquiries',
  ];
  const rows = properties.map((p) => [
    p.title,
    p.area,
    p.district.name,
    TYPE_LABELS[p.type],
    p.price,
    p.bedrooms,
    p.bathrooms,
    p.status,
    p.furnishing ?? '',
    p.leaseTerm ?? '',
    p.landlord.name,
    p.landlord.phone,
    p.viewCount,
    p.enquiryCount,
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nyumbalink-properties-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PropertiesTable() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PropertyFilters & { search?: string }>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [selected, setSelected] = useState<Property | null>(null);

  const serverFilters: PropertyFilters = {
    districtId: filters.districtId,
    type: filters.type,
    status: filters.status,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    bedrooms: filters.bedrooms,
    limit: 100,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['properties', serverFilters],
    queryFn: () => propertiesApi.getAll(serverFilters),
  });

  const properties = useMemo(() => {
    const all = data?.data ?? [];
    if (!filters.search) return all;
    const q = filters.search.toLowerCase();
    return all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.landlord.name.toLowerCase().includes(q),
    );
  }, [data, filters.search]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property deleted');
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: () => toast.error('Failed to delete property.'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.toggleStatus(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(
        `Marked as ${updated.status === 'AVAILABLE' ? 'Available' : 'Rented Out'}`,
      );
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property restored');
    },
    onError: () => toast.error('Failed to restore property.'),
  });

  const handleEdit = (p: Property) => { setSelected(p); setFormOpen(true); };
  const handleDelete = (p: Property) => { setSelected(p); setDeleteOpen(true); };
  const handleImages = (p: Property) => { setSelected(p); setImagesOpen(true); };

  return (
    <>
      <Card>
        {/* Updated responsive CardHeader */}
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>All Properties</CardTitle>
            <CardDescription>
              {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}
              {data?.meta.total && data.meta.total !== properties.length
                ? ` (filtered from ${data.meta.total})`
                : ''}
            </CardDescription>
          </div>
          {/* Updated flexible button wrapper */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCsv(properties)}
              disabled={properties.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={() => { setSelected(null); setFormOpen(true); }}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <PropertyFilterBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">No properties found</p>
              <p className="text-sm mt-1">
                {Object.keys(filters).some((k) => (filters as Record<string, unknown>)[k])
                  ? 'Try adjusting your filters.'
                  : 'Add your first property listing to get started.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Price/mo</TableHead>
                    <TableHead>Furnishing</TableHead>
                    <TableHead>Landlord</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Imgs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => {
                    const primary =
                      property.images.find((i) => i.isPrimary) ?? property.images[0];
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
                              <Link
                                href={`/properties/${property.id}`}
                                className="font-medium text-sm leading-tight hover:text-primary hover:underline transition-colors"
                              >
                                {property.title}
                              </Link>
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
                        <TableCell className="text-sm text-gray-600">
                          {property.furnishing
                            ? FURNISHING_LABELS[property.furnishing]
                            : <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell className="text-sm">{property.landlord.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              property.status === 'AVAILABLE' ? 'default' : 'secondary'
                            }
                          >
                            {property.status === 'AVAILABLE' ? 'Available' : 'Rented Out'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {property.viewCount}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {property.images.length}/8
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/properties/${property.id}`}>
                              <Button size="sm" variant="outline" title="View details">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
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
                              {property.status === 'AVAILABLE' ? (
                                <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-3.5 w-3.5 text-gray-400" />
                              )}
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
            </div>
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
        description={`Are you sure you want to delete "${selected?.title}"? This action is reversible — you can restore the property later.`}
      />
    </>
  );
}