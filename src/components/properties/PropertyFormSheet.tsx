'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { propertySchema, PropertyFormData } from '@/lib/validators';
import { propertiesApi } from '@/lib/api/properties.api';
import { landlordsApi } from '@/lib/api/landlords.api';
import { districtsApi } from '@/lib/api/districts.api';
import { Property } from '@/types';

const PROPERTY_TYPES = [
  { value: 'SINGLE_ROOM', label: 'Single Room' },
  { value: 'DOUBLE_ROOM', label: 'Double Room' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'STUDIO', label: 'Studio' },
];

const FURNISHING_OPTIONS = [
  { value: 'FURNISHED', label: 'Furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
];

const LEASE_TERM_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly (3 months)' },
  { value: 'BIANNUAL', label: 'Biannual (6 months)' },
  { value: 'ANNUAL', label: 'Annual (1 year)' },
];

const UNSET = '__NONE__';

interface Props {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
}

export default function PropertyFormSheet({ open, onClose, property }: Props) {
  const isEditing = !!property;
  const queryClient = useQueryClient();

  const { data: landlords = [] } = useQuery({
    queryKey: ['landlords'],
    queryFn: landlordsApi.getAll,
  });

  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: districtsApi.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        description: property.description,
        type: property.type,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        address: property.address ?? '',
        furnishing: property.furnishing,
        leaseTerm: property.leaseTerm,
        securityDeposit: property.securityDeposit,
        availableFrom: property.availableFrom
          ? property.availableFrom.split('T')[0]
          : '',
        floor: property.floor,
        parkingAvailable: property.parkingAvailable ?? false,
        landlordId: property.landlord.id,
        districtId: property.district.id,
        amenities: property.amenities ?? [],
      });
    } else {
      reset({
        title: '', description: '', area: '', address: '',
        landlordId: '', districtId: '',
        parkingAvailable: false,
        amenities: [],
      });
    }
  }, [property, reset]);

  const mutation = useMutation({
    mutationFn: (data: PropertyFormData) =>
      isEditing
        ? propertiesApi.update(property!.id, data)
        : propertiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(isEditing ? 'Property updated!' : 'Property created!');
      onClose();
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  });

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2 pb-1 border-t">
      {children}
    </p>
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      {/* Using !max-w-[800px] and !w-[90vw] to force override Shadcn's internal width limits 
        Added p-6 sm:p-8 back to fix the flush-to-edge issue
      */}
      <SheetContent className="!max-w-[800px] !w-[90vw] overflow-y-auto p-6 sm:p-8">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the property details below.'
              : 'Fill in all required details to list a new property.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          {/* ── Basic Info ── */}
          <SectionLabel>Basic Information</SectionLabel>
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. Spacious 2BR Apartment in Kololo" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Textarea
              placeholder="Describe the property in detail..."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Type + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Property Type <span className="text-destructive">*</span></Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v as PropertyFormData['type'])}
              >
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Rent (UGX) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                placeholder="e.g. 800000"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
          </div>

          {/* Beds + Baths */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Bedrooms</Label>
              <Input
                type="number" min={1} placeholder="1"
                {...register('bedrooms', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bathrooms</Label>
              <Input
                type="number" min={1} placeholder="1"
                {...register('bathrooms', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Area + Address */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Area / Neighbourhood <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Kololo" {...register('area')} />
              {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Street Address</Label>
              <Input placeholder="e.g. Plot 23, Acacia Ave" {...register('address')} />
            </div>
          </div>

          {/* District + Landlord */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>District <span className="text-destructive">*</span></Label>
              <Select
                value={watch('districtId')}
                onValueChange={(v) => setValue('districtId', v)}
              >
                <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — {d.region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.districtId && (
                <p className="text-sm text-destructive">{errors.districtId.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Landlord <span className="text-destructive">*</span></Label>
              <Select
                value={watch('landlordId')}
                onValueChange={(v) => setValue('landlordId', v)}
              >
                <SelectTrigger><SelectValue placeholder="Select landlord" /></SelectTrigger>
                <SelectContent>
                  {landlords.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name} — {l.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.landlordId && (
                <p className="text-sm text-destructive">{errors.landlordId.message}</p>
              )}
            </div>
          </div>

          {/* ── Rental Terms ── */}
          <SectionLabel>Rental Terms</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Furnishing</Label>
              <Select
                value={watch('furnishing') ?? UNSET}
                onValueChange={(v) =>
                  setValue(
                    'furnishing',
                    v === UNSET ? undefined : (v as PropertyFormData['furnishing']),
                  )
                }
              >
                <SelectTrigger><SelectValue placeholder="Select furnishing" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Not specified</SelectItem>
                  {FURNISHING_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Lease Term</Label>
              <Select
                value={watch('leaseTerm') ?? UNSET}
                onValueChange={(v) =>
                  setValue(
                    'leaseTerm',
                    v === UNSET ? undefined : (v as PropertyFormData['leaseTerm']),
                  )
                }
              >
                <SelectTrigger><SelectValue placeholder="Select lease term" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Not specified</SelectItem>
                  {LEASE_TERM_OPTIONS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Security Deposit (UGX)</Label>
              <Input
                type="number"
                placeholder="e.g. 500000"
                {...register('securityDeposit', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Available From</Label>
              <Input type="date" {...register('availableFrom')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Floor / Level</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 3 (0 = ground)"
                {...register('floor', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parking Available</Label>
              <div className="flex items-center gap-3 h-9 px-3 border rounded-md bg-white">
                <input
                  type="checkbox"
                  id="parkingAvailable"
                  className="h-4 w-4 accent-primary"
                  checked={watch('parkingAvailable') ?? false}
                  onChange={(e) => setValue('parkingAvailable', e.target.checked)}
                />
                <label htmlFor="parkingAvailable" className="text-sm text-gray-700 cursor-pointer">
                  Yes, parking is available
                </label>
              </div>
            </div>
          </div>

          {/* ── Additional ── */}
          <SectionLabel>Additional</SectionLabel>
          <div className="space-y-1.5">
            <Label>Amenities</Label>
            <Input
              placeholder="e.g. Water, Electricity, WiFi, Security"
              onChange={(e) =>
                setValue(
                  'amenities',
                  e.target.value.split(',').map((a) => a.trim()).filter(Boolean),
                )
              }
              defaultValue={property?.amenities?.join(', ') ?? ''}
            />
            <p className="text-xs text-gray-500">Separate each amenity with a comma</p>
          </div>

          <div className="flex gap-3 pt-6 mt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : isEditing ? 'Update Property' : 'Create Property'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}