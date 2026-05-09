'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Info } from 'lucide-react';

import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

import { propertySchema, PropertyFormData } from '@/lib/validators';
import { propertiesApi } from '@/lib/api/properties.api';
import { contactsApi } from '@/lib/api/contacts.api';
import { districtsApi } from '@/lib/api/districts.api';
import { getFieldConfig } from '@/lib/property-field-rules';
import { BillingCycle, Property } from '@/types';

const PROPERTY_TYPES = [
  { value: 'RESIDENTIAL_HOUSE', label: 'Residential House' },
  { value: 'APARTMENT',         label: 'Apartment' },
  { value: 'AIRBNB',            label: 'AirBnB' },
  { value: 'OFFICE_SPACE',      label: 'Office Space' },
  { value: 'BUSINESS_SPACE',    label: 'Business Space' },
  { value: 'HOSTEL',            label: 'Hostel (with rooms)' },
  { value: 'HOTEL_LODGE',       label: 'Hotel / Lodge' },
];

const RESIDENTIAL_SUBTYPES = [
  { value: 'SINGLE', label: 'Single (1 bedroom / bedsitter)' },
  { value: 'DOUBLE', label: 'Double (2 bedrooms)' },
];

const FURNISHING_OPTIONS = [
  { value: 'FURNISHED',      label: 'Furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'UNFURNISHED',    label: 'Unfurnished' },
];

const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  DAILY:       'Daily',
  MONTHLY:     'Monthly',
  QUARTERLY:   'Quarterly (3 months)',
  FOUR_MONTHS: '4 Months',
  BIANNUAL:    'Biannual (6 months)',
  ANNUAL:      'Annual (1 year)',
};

const UNSET = '__NONE__';

interface Props {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
}

export default function PropertyFormSheet({ open, onClose, property }: Props) {
  const isEditing = !!property;
  const queryClient = useQueryClient();

  const { data: contactsResponse } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.getAll({ limit: 200 }),
  });
  const contacts = contactsResponse?.data ?? [];

  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: districtsApi.getAll,
  });

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitted },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      title: '', description: '', area: '', address: '',
      contactId: '', districtId: '',
      parkingAvailable: false, amenities: [],
    },
  });

  const selectedType = watch('type');
  const fieldConfig = getFieldConfig(selectedType as any);

  useEffect(() => {
    setValue('billingCycle', undefined);
    if (selectedType !== 'RESIDENTIAL_HOUSE') {
      setValue('residentialSubtype', undefined);
    }
  }, [selectedType, setValue]);

  useEffect(() => {
    if (property) {
      reset({
        title:               property.title,
        description:         property.description,
        type:                property.type,
        residentialSubtype:  property.residentialSubtype ?? undefined,
        price:               property.price,
        billingCycle:        property.billingCycle ?? undefined,
        bedrooms:            property.bedrooms,
        bathrooms:           property.bathrooms,
        area:                property.area,
        address:             property.address ?? '',
        latitude:            property.latitude,
        longitude:           property.longitude,
        furnishing:          property.furnishing,
        securityDeposit:     property.securityDeposit,
        availableFrom:       property.availableFrom ? property.availableFrom.split('T')[0] : '',
        floor:               property.floor,
        parkingAvailable:    property.parkingAvailable ?? false,
        contactId:           property.contact.id,
        districtId:          property.district.id,
        amenities:           property.amenities ?? [],
      });
    } else {
      reset({
        title: '', description: '', area: '', address: '',
        contactId: '', districtId: '',
        parkingAvailable: false, amenities: [],
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
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const setVal = (field: keyof PropertyFormData, value: unknown) =>
    setValue(field, value as any, { shouldValidate: isSubmitted, shouldDirty: true });

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2 pb-1 border-t">
      {children}
    </p>
  );

  const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="text-sm text-destructive mt-1">{message}</p> : null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      {/*
        Key structural change:
        - SheetContent is now flex flex-col p-0 (no overflow-y-auto on the whole panel)
        - A scrollable middle section holds the form fields
        - A sticky footer holds the action buttons — always visible regardless of scroll position
      */}
      <SheetContent className="!max-w-[800px] !w-[90vw] flex flex-col p-0">

        {/* ── Non-scrolling header ── */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b shrink-0">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</SheetTitle>
            <SheetDescription>
              {isEditing
                ? 'Update the property details below.'
                : 'Fill in all required details to list a new property.'}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* ── Scrollable form body ── */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5">
          <form
            id="property-form"
            onSubmit={handleSubmit((d) => mutation.mutate(d), () =>
              toast.error('Please fill in all required fields before submitting.'),
            )}
            className="space-y-4"
          >
            <SectionLabel>Basic Information</SectionLabel>

            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Spacious 2BR Apartment in Kololo"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="space-y-1.5">
              <Label>Description <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Describe the property in detail..."
                rows={4}
                {...register('description')}
                className={errors.description ? 'border-destructive' : ''}
              />
              <FieldError message={errors.description?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Property Type <span className="text-destructive">*</span></Label>
                <Select
                  value={watch('type') ?? ''}
                  onValueChange={(v) => setVal('type', v as PropertyFormData['type'])}
                >
                  <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.type?.message} />
              </div>

              <div className="space-y-1.5">
                <Label>Price (UGX) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  placeholder="e.g. 800000"
                  {...register('price')}
                  className={errors.price ? 'border-destructive' : ''}
                />
                <FieldError message={errors.price?.message} />
              </div>
            </div>

            {fieldConfig?.showResidentialSubtype && (
              <div className="space-y-1.5">
                <Label>House Type <span className="text-destructive">*</span></Label>
                <Select
                  value={watch('residentialSubtype') ?? ''}
                  onValueChange={(v) => setVal('residentialSubtype', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Single or Double?" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESIDENTIAL_SUBTYPES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {fieldConfig?.showBillingCycle && (
              <div className="space-y-1.5">
                <Label>Billing Period <span className="text-destructive">*</span></Label>
                <Select
                  value={watch('billingCycle') ?? ''}
                  onValueChange={(v) => setVal('billingCycle', v)}
                >
                  <SelectTrigger className={errors.billingCycle ? 'border-destructive' : ''}>
                    <SelectValue placeholder="How often is rent paid?" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldConfig.allowedBillingCycles.map((c) => (
                      <SelectItem key={c} value={c}>{BILLING_CYCLE_LABELS[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-gray-500">The price above is per this billing period.</p>
                <FieldError message={errors.billingCycle?.message} />
              </div>
            )}

            {fieldConfig?.isHostel && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  After saving, you can add individual rooms with their own prices and billing
                  periods from the property detail page.
                </p>
              </div>
            )}

            {(fieldConfig?.showBedrooms || fieldConfig?.showBathrooms) && (
              <div className="grid grid-cols-2 gap-4">
                {fieldConfig?.showBedrooms && (
                  <div className="space-y-1.5">
                    <Label>Bedrooms</Label>
                    <Input type="number" min={1} placeholder="1" {...register('bedrooms')} />
                  </div>
                )}
                {fieldConfig?.showBathrooms && (
                  <div className="space-y-1.5">
                    <Label>Bathrooms</Label>
                    <Input type="number" min={1} placeholder="1" {...register('bathrooms')} />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Area / Neighbourhood <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Kololo"
                  {...register('area')}
                  className={errors.area ? 'border-destructive' : ''}
                />
                <FieldError message={errors.area?.message} />
              </div>
              <div className="space-y-1.5">
                <Label>Street Address</Label>
                <Input placeholder="e.g. Plot 23, Acacia Ave" {...register('address')} />
              </div>
            </div>

            <SectionLabel>GPS Coordinates</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Latitude</Label>
                <Input type="number" step="any" placeholder="e.g. 0.347596" {...register('latitude')} />
                <p className="text-[10px] text-gray-500">Copy/paste from Google Maps</p>
              </div>
              <div className="space-y-1.5">
                <Label>Longitude</Label>
                <Input type="number" step="any" placeholder="e.g. 32.582520" {...register('longitude')} />
              </div>
            </div>

            <SectionLabel>District & Contact</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>District <span className="text-destructive">*</span></Label>
                <Select
                  value={watch('districtId') ?? ''}
                  onValueChange={(v) => setVal('districtId', v)}
                >
                  <SelectTrigger className={errors.districtId ? 'border-destructive' : ''}>
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
                <Label>Owner / Agent <span className="text-destructive">*</span></Label>
                <Select
                  value={watch('contactId') ?? ''}
                  onValueChange={(v) => setVal('contactId', v)}
                >
                  <SelectTrigger className={errors.contactId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.role}) — {c.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.contactId?.message} />
              </div>
            </div>

            {(fieldConfig?.showFurnishing ||
              fieldConfig?.showSecurityDeposit ||
              fieldConfig?.showFloor ||
              fieldConfig?.showParking) && (
              <>
                <SectionLabel>Additional Details</SectionLabel>

                {fieldConfig?.showFurnishing && (
                  <div className="space-y-1.5">
                    <Label>Furnishing</Label>
                    <Select
                      value={watch('furnishing') ?? UNSET}
                      onValueChange={(v) => setVal('furnishing', v === UNSET ? undefined : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select furnishing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNSET}>Not specified</SelectItem>
                        {FURNISHING_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {fieldConfig?.showSecurityDeposit && (
                    <div className="space-y-1.5">
                      <Label>Security Deposit (UGX)</Label>
                      <Input type="number" placeholder="e.g. 500000" {...register('securityDeposit')} />
                    </div>
                  )}
                  {fieldConfig?.showFloor && (
                    <div className="space-y-1.5">
                      <Label>Floor / Level</Label>
                      <Input type="number" min={0} placeholder="0 = ground" {...register('floor')} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Available From</Label>
                    <Input type="date" {...register('availableFrom')} />
                  </div>
                  {fieldConfig?.showParking && (
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
                  )}
                </div>
              </>
            )}

            <SectionLabel>Amenities</SectionLabel>
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

            {isSubmitted && Object.keys(errors).length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <p className="font-medium mb-1">Please fix the following before submitting:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {errors.title       && <li>Title — {errors.title.message}</li>}
                  {errors.description && <li>Description — {errors.description.message}</li>}
                  {errors.type        && <li>Property Type — {errors.type.message}</li>}
                  {errors.price       && <li>Price — {errors.price.message}</li>}
                  {errors.area        && <li>Area — {errors.area.message}</li>}
                  {errors.districtId  && <li>District — {errors.districtId.message}</li>}
                  {errors.contactId   && <li>Owner / Agent — {errors.contactId.message}</li>}
                </ul>
              </div>
            )}

            {/* Bottom padding so last field isn't hidden behind the sticky footer */}
            <div className="h-2" />
          </form>
        </div>

        {/* ── Sticky footer — always visible ── */}
        <div className="shrink-0 border-t bg-white px-6 sm:px-8 py-4">
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            {/*
              form="property-form" links this button to the <form id="property-form"> above,
              allowing it to live outside the form element while still triggering submission.
            */}
            <Button
              type="submit"
              form="property-form"
              className="flex-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : isEditing ? 'Update Property' : 'Create Property'}
            </Button>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}