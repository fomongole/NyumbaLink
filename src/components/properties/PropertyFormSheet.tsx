'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Info } from 'lucide-react';

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
import { getFieldConfig } from '@/lib/property-field-rules';
import { Property } from '@/types';

const PROPERTY_TYPES = [
  { value: 'SINGLE_ROOM', label: 'Single Room' },
  { value: 'DOUBLE_ROOM', label: 'Double Room' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'HOSTEL', label: 'Hostel (Campus / Managed)' },
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
    formState: { errors, isSubmitted },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      title: '',
      description: '',
      area: '',
      address: '',
      landlordId: '',
      districtId: '',
      parkingAvailable: false,
      amenities: [],
    },
  });

  const selectedType = watch('type');
  const fieldConfig = getFieldConfig(selectedType as any);

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
        latitude: property.latitude,
        longitude: property.longitude,
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
        title: '',
        description: '',
        area: '',
        address: '',
        landlordId: '',
        districtId: '',
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
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        'Something went wrong. Please try again.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  // Called when Zod validation fails on submit — tell the user clearly
  const onValidationError = () => {
    toast.error('Please fill in all required fields before submitting.');
  };

  // Helper: setValue that also triggers validation so errors appear immediately
  const setValidatedValue = (
    field: keyof PropertyFormData,
    value: unknown,
  ) => {
    setValue(field, value as any, { shouldValidate: isSubmitted, shouldDirty: true });
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2 pb-1 border-t">
      {children}
    </p>
  );

  // Reusable error message component
  const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="text-sm text-destructive mt-1">{message}</p> : null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!max-w-[800px] !w-[90vw] overflow-y-auto p-6 sm:p-8">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the property details below.'
              : 'Fill in all required details to list a new property.'}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(
            (data) => mutation.mutate(data as PropertyFormData),
            onValidationError,
          )}
          className="space-y-4"
        >
          <SectionLabel>Basic Information</SectionLabel>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Spacious 2BR Apartment in Kololo"
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
            />
            <FieldError message={errors.title?.message} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Describe the property in detail... (min. 20 characters)"
              rows={4}
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
            />
            <FieldError message={errors.description?.message} />
          </div>

          {/* Type + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Property Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('type') ?? ''}
                onValueChange={(v) =>
                  setValidatedValue('type', v as PropertyFormData['type'])
                }
              >
                <SelectTrigger
                  className={errors.type ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.type?.message} />
            </div>

            <div className="space-y-1.5">
              <Label>
                {fieldConfig?.isHostel
                  ? 'Starting Price (UGX)'
                  : 'Monthly Rent (UGX)'}
                <span className="text-destructive"> *</span>
              </Label>
              <Input
                type="number"
                placeholder="e.g. 800000"
                {...register('price')}
                className={errors.price ? 'border-destructive' : ''}
              />
              {fieldConfig?.isHostel && (
                <p className="text-[10px] text-gray-500">
                  This is the hostel's base price. Individual rooms set their own price.
                </p>
              )}
              <FieldError message={errors.price?.message} />
            </div>
          </div>

          {/* Hostel notice banner */}
          {fieldConfig?.isHostel && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                After saving this hostel property, you can add individual rooms
                with their own prices, types, and availability from the property
                detail page.
              </p>
            </div>
          )}

          {/* Bedrooms + Bathrooms (conditional) */}
          {(fieldConfig?.showBedrooms || fieldConfig?.showBathrooms) && (
            <div className="grid grid-cols-2 gap-4">
              {fieldConfig.showBedrooms && (
                <div className="space-y-1.5">
                  <Label>Bedrooms</Label>
                  <Input type="number" min={1} placeholder="1" {...register('bedrooms')} />
                </div>
              )}
              {fieldConfig.showBathrooms && (
                <div className="space-y-1.5">
                  <Label>Bathrooms</Label>
                  <Input type="number" min={1} placeholder="1" {...register('bathrooms')} />
                </div>
              )}
            </div>
          )}

          {/* Area + Address */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Area / Neighbourhood <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. Kololo"
                {...register('area')}
                className={errors.area ? 'border-destructive' : ''}
              />
              <FieldError message={errors.area?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Street Address</Label>
              <Input
                placeholder="e.g. Plot 23, Acacia Ave"
                {...register('address')}
              />
            </div>
          </div>

          {/* Geolocation */}
          <SectionLabel>Geolocation (GPS Coordinates)</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 0.347596"
                {...register('latitude')}
              />
              <p className="text-[10px] text-gray-500">Copy/paste from Google Maps</p>
            </div>
            <div className="space-y-1.5">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 32.582520"
                {...register('longitude')}
              />
            </div>
          </div>

          {/* District + Landlord */}
          <SectionLabel>District & Landlord</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                District <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('districtId') ?? ''}
                onValueChange={(v) => setValidatedValue('districtId', v)}
              >
                <SelectTrigger
                  className={errors.districtId ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} — {d.region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.districtId?.message} />
            </div>

            <div className="space-y-1.5">
              <Label>
                Landlord <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('landlordId') ?? ''}
                onValueChange={(v) => setValidatedValue('landlordId', v)}
              >
                <SelectTrigger
                  className={errors.landlordId ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Select landlord" />
                </SelectTrigger>
                <SelectContent>
                  {landlords.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} — {l.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.landlordId?.message} />
            </div>
          </div>

          {/* Rental Terms (conditional) */}
          {(fieldConfig?.showFurnishing ||
            fieldConfig?.showLeaseTerm ||
            fieldConfig?.showSecurityDeposit ||
            fieldConfig?.showFloor ||
            fieldConfig?.showParking) && (
            <>
              <SectionLabel>Rental Terms & Details</SectionLabel>

              {(fieldConfig.showFurnishing || fieldConfig.showLeaseTerm) && (
                <div className="grid grid-cols-2 gap-4">
                  {fieldConfig.showFurnishing && (
                    <div className="space-y-1.5">
                      <Label>Furnishing</Label>
                      <Select
                        value={watch('furnishing') ?? UNSET}
                        onValueChange={(v) =>
                          setValidatedValue(
                            'furnishing',
                            v === UNSET
                              ? undefined
                              : (v as PropertyFormData['furnishing']),
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select furnishing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNSET}>Not specified</SelectItem>
                          {FURNISHING_OPTIONS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {fieldConfig.showLeaseTerm && (
                    <div className="space-y-1.5">
                      <Label>Lease Term</Label>
                      <Select
                        value={watch('leaseTerm') ?? UNSET}
                        onValueChange={(v) =>
                          setValidatedValue(
                            'leaseTerm',
                            v === UNSET
                              ? undefined
                              : (v as PropertyFormData['leaseTerm']),
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lease term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNSET}>Not specified</SelectItem>
                          {LEASE_TERM_OPTIONS.map((l) => (
                            <SelectItem key={l.value} value={l.value}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {(fieldConfig.showSecurityDeposit || fieldConfig.showFloor) && (
                <div className="grid grid-cols-2 gap-4">
                  {fieldConfig.showSecurityDeposit && (
                    <div className="space-y-1.5">
                      <Label>Security Deposit (UGX)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 500000"
                        {...register('securityDeposit')}
                      />
                    </div>
                  )}
                  {fieldConfig.showFloor && (
                    <div className="space-y-1.5">
                      <Label>Floor / Level</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 3 (0 = ground)"
                        {...register('floor')}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Available From</Label>
                  <Input type="date" {...register('availableFrom')} />
                </div>

                {fieldConfig.showParking && (
                  <div className="space-y-1.5">
                    <Label>Parking Available</Label>
                    <div className="flex items-center gap-3 h-9 px-3 border rounded-md bg-white">
                      <input
                        type="checkbox"
                        id="parkingAvailable"
                        className="h-4 w-4 accent-primary"
                        checked={watch('parkingAvailable') ?? false}
                        onChange={(e) =>
                          setValue('parkingAvailable', e.target.checked)
                        }
                      />
                      <label
                        htmlFor="parkingAvailable"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        Yes, parking is available
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Amenities */}
          <SectionLabel>Additional</SectionLabel>
          <div className="space-y-1.5">
            <Label>Amenities</Label>
            <Input
              placeholder="e.g. Water, Electricity, WiFi, Security"
              onChange={(e) =>
                setValue(
                  'amenities',
                  e.target.value
                    .split(',')
                    .map((a) => a.trim())
                    .filter(Boolean),
                )
              }
              defaultValue={property?.amenities?.join(', ') ?? ''}
            />
            <p className="text-xs text-gray-500">
              Separate each amenity with a comma
            </p>
          </div>

          {/* Summary of errors shown at bottom if any exist after first submit attempt */}
          {isSubmitted && Object.keys(errors).length > 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <p className="font-medium mb-1">
                Please fix the following before submitting:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {errors.title && <li>Title — {errors.title.message}</li>}
                {errors.description && (
                  <li>Description — {errors.description.message}</li>
                )}
                {errors.type && <li>Property Type — {errors.type.message}</li>}
                {errors.price && <li>Price — {errors.price.message}</li>}
                {errors.area && <li>Area — {errors.area.message}</li>}
                {errors.districtId && (
                  <li>District — {errors.districtId.message}</li>
                )}
                {errors.landlordId && (
                  <li>Landlord — {errors.landlordId.message}</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-6 mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Property'
              ) : (
                'Create Property'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}