'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, Images, ToggleLeft,
  ToggleRight, Eye, Download, MoreHorizontal, Star,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import PropertyFormSheet from './PropertyFormSheet';
import ImageUploadManager from './ImageUploadManager';
import PropertyFilterBar from './PropertyFilterBar';
import SetFeaturedSheet from './SetFeaturedSheet';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { propertiesApi } from '@/lib/api/properties.api';
import { Property, PropertyFilters, BillingCycle } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL_HOUSE: 'Residential House',
  APARTMENT:         'Apartment',
  AIRBNB:            'AirBnB',
  OFFICE_SPACE:      'Office Space',
  BUSINESS_SPACE:    'Business Space',
  HOSTEL:            'Hostel',
  HOTEL_LODGE:       'Hotel / Lodge',
};

const BILLING_LABELS: Record<BillingCycle, string> = {
  DAILY:       'Daily',
  MONTHLY:     'Monthly',
  QUARTERLY:   'Quarterly',
  FOUR_MONTHS: '4 Months',
  BIANNUAL:    'Biannual',
  ANNUAL:      'Annual',
};

const DEFAULT_FILTERS: PropertyFilters & { search?: string } = {};

function exportToCsv(properties: Property[]) {
  const headers = [
    'Title', 'Area', 'District', 'Type', 'Price (UGX)', 'Billing',
    'Rooms', 'Status', 'Furnishing',
    'Contact', 'Phone', 'Role', 'Views', 'Enquiries',
  ];

  const rows = properties.map((p) => [
    p.title,
    p.area,
    p.district.name,
    TYPE_LABELS[p.type] ?? p.type,
    p.price,
    p.billingCycle ? BILLING_LABELS[p.billingCycle] : '',
    p.numberOfRooms,
    p.status,
    p.furnishing ?? '',
    p.contact.name,
    p.contact.phone,
    p.contact.role,
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
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const [selected, setSelected] = useState<Property | null>(null);

  const serverFilters: PropertyFilters = {
    districtId:    filters.districtId,
    type:          filters.type,
    status:        filters.status,
    billingCycle:  filters.billingCycle,
    minPrice:      filters.minPrice,
    maxPrice:      filters.maxPrice,
    numberOfRooms: filters.numberOfRooms,
    universityId:  filters.universityId,  // ← fixed: was missing
    isFeatured:    filters.isFeatured,    // ← fixed: was missing
    search:        filters.search,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['properties', serverFilters],
    queryFn: () => propertiesApi.getAll(serverFilters),
  });

  const properties = data?.data ?? [];

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

  const handleEdit = (p: Property) => { setSelected(p); setFormOpen(true); };
  const handleDelete = (p: Property) => { setSelected(p); setDeleteOpen(true); };
  const handleImages = (p: Property) => { setSelected(p); setImagesOpen(true); };
  const handleSetFeatured = (p: Property) => { setSelected(p); setFeaturedOpen(true); };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setPage(1);
    setFilters(newFilters);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card>
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
            onChange={handleFiltersChange}
            onReset={() => {
              setPage(1);
              setFilters(DEFAULT_FILTERS);
            }}
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
                    <TableHead>Price</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => {
                    const primary =
                      property.images.find((i) => i.isPrimary) ?? property.images[0];
                    return (
                      <TableRow key={property.id}>
                        {/* Property */}
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
                              {property.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-yellow-600 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5 mt-0.5">
                                  <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        {/* Type */}
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {TYPE_LABELS[property.type] ?? property.type}
                          </Badge>
                        </TableCell>
                        {/* District */}
                        <TableCell className="text-sm">{property.district.name}</TableCell>
                        {/* Price */}
                        <TableCell className="text-sm font-medium">
                          UGX {Number(property.price).toLocaleString()}
                        </TableCell>
                        {/* Billing */}
                        <TableCell className="text-sm text-gray-600">
                          {property.billingCycle
                            ? BILLING_LABELS[property.billingCycle]
                            : <span className="text-gray-400">—</span>}
                        </TableCell>
                        {/* Contact */}
                        <TableCell className="text-sm">
                          <div>
                            <p className="font-medium leading-tight">{property.contact.name}</p>
                            <p className="text-xs text-gray-500">{property.contact.role}</p>
                          </div>
                        </TableCell>
                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={property.status === 'AVAILABLE' ? 'default' : 'secondary'}
                          >
                            {property.status === 'AVAILABLE' ? 'Available' : 'Rented Out'}
                          </Badge>
                        </TableCell>
                        {/* Views */}
                        <TableCell className="text-sm text-gray-500">
                          {property.viewCount}
                        </TableCell>
                        {/* Images */}
                        <TableCell className="text-sm text-gray-500">
                          {property.images.length}/4
                        </TableCell>
                        {/* Actions — View (primary) + ⋯ dropdown (secondary) */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Primary: View */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/properties/${property.id}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                View details
                              </TooltipContent>
                            </Tooltip>
                            {/* Secondary: ⋯ dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleImages(property)}
                                  className="gap-2 cursor-pointer"
                                >
                                  <Images className="h-3.5 w-3.5 text-gray-500" />
                                  Manage images
                                  <span className="ml-auto text-xs text-gray-400">
                                    {property.images.length}/4
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(property)}
                                  className="gap-2 cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-gray-500" />
                                  Edit property
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleMutation.mutate(property.id)}
                                  disabled={toggleMutation.isPending}
                                  className="gap-2 cursor-pointer"
                                >
                                  {property.status === 'AVAILABLE' ? (
                                    <>
                                      <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                                      Mark as rented
                                    </>
                                  ) : (
                                    <>
                                      <ToggleLeft className="h-3.5 w-3.5 text-gray-400" />
                                      Mark as available
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSetFeatured(property)}
                                  className="gap-2 cursor-pointer"
                                >
                                  <Star
                                    className={`h-3.5 w-3.5 ${
                                      property.isFeatured
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-gray-500'
                                    }`}
                                  />
                                  {property.isFeatured ? 'Manage featured' : 'Set as featured'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(property)}
                                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete property
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t">
              <p className="text-sm text-gray-500">
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, data.meta.total)} of {data.meta.total} properties
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  ← Prev
                </Button>
                <span className="text-sm text-gray-500">Page {page} of {data.meta.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>
                  Next →
                </Button>
              </div>
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

      {selected && (
        <SetFeaturedSheet
          open={featuredOpen}
          onClose={() => { setFeaturedOpen(false); setSelected(null); }}
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
    </TooltipProvider>
  );
}