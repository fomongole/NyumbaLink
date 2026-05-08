'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

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

import { hostelRoomsApi } from '@/lib/api/hostel-rooms.api';
import { BillingCycle, HostelRoom } from '@/types';

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  type: z.enum(['SINGLE', 'DOUBLE', 'SHARED']),
  price: z.preprocess((v) => Number(v), z.number().min(1, 'Price is required')),
  billingCycle: z.enum(['MONTHLY', 'FOUR_MONTHS', 'BIANNUAL', 'ANNUAL'] as const, {
    message: 'Select a billing period',
  }),
  floor: z.preprocess(
    (v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number().min(0).optional(),
  ),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Single (1 occupant)' },
  { value: 'DOUBLE', label: 'Double (2 occupants)' },
  { value: 'SHARED', label: 'Shared / Dormitory' },
];

const BILLING_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: 'MONTHLY',     label: 'Monthly' },
  { value: 'FOUR_MONTHS', label: '4 Months' },
  { value: 'BIANNUAL',    label: 'Biannual (6 months)' },
  { value: 'ANNUAL',      label: 'Annual (1 year)' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  room?: HostelRoom | null;
}

export default function HostelRoomFormSheet({ open, onClose, propertyId, room }: Props) {
  const isEditing = !!room;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as any,
  });

useEffect(() => {
    if (room) {
      reset({
        roomNumber:   room.roomNumber,
        type:         room.type,
        price:        room.price,
        billingCycle: room.billingCycle as RoomFormData['billingCycle'],
        floor:        room.floor,
        description:  room.description ?? '',
        amenities:    room.amenities ?? [],
      });
    } else {
      reset({ roomNumber: '', description: '', amenities: [] });
    }
  }, [room, reset]);

  const mutation = useMutation({
    mutationFn: (data: RoomFormData) =>
      isEditing
        ? hostelRoomsApi.update(propertyId, room!.id, data)
        : hostelRoomsApi.create(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['hostel-room-stats', propertyId] });
      toast.success(isEditing ? 'Room updated' : 'Room added successfully');
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Something went wrong'),
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!w-[440px] !max-w-[95vw] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Edit Room' : 'Add Room'}</SheetTitle>
            <SheetDescription>
              {isEditing ? 'Update room details.' : 'Add a new room to this hostel property.'}
            </SheetDescription>
          </SheetHeader>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="px-6 py-5 space-y-4"
        >
          {/* Room Number + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Room Number <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. 101" {...register('roomNumber')} />
              {errors.roomNumber && (
                <p className="text-xs text-destructive">{errors.roomNumber.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Room Type <span className="text-destructive">*</span></Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v as RoomFormData['type'])}
              >
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
          </div>

          {/* Price + Billing Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Price (UGX) <span className="text-destructive">*</span></Label>
              <Input type="number" placeholder="e.g. 350000" {...register('price')} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Billing Period <span className="text-destructive">*</span></Label>
              <Select
                value={watch('billingCycle') ?? ''}
                onValueChange={(v) => setValue('billingCycle', v as RoomFormData['billingCycle'])}
              >
                <SelectTrigger className={errors.billingCycle ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_OPTIONS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.billingCycle && (
                <p className="text-xs text-destructive">{errors.billingCycle.message}</p>
              )}
            </div>
          </div>

          {/* Floor */}
          <div className="space-y-1.5">
            <Label>Floor / Level</Label>
            <Input type="number" min={0} placeholder="e.g. 2 (0 = ground)" {...register('floor')} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="e.g. Corner room with good natural light"
              rows={3}
              className="resize-none"
              {...register('description')}
            />
          </div>

          {/* Amenities */}
          <div className="space-y-1.5">
            <Label>Amenities</Label>
            <Input
              placeholder="e.g. En-suite, Desk, Wardrobe"
              onChange={(e) =>
                setValue(
                  'amenities',
                  e.target.value.split(',').map((a) => a.trim()).filter(Boolean),
                )
              }
              defaultValue={room?.amenities?.join(', ') ?? ''}
            />
            <p className="text-xs text-gray-500">Separate with commas</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : isEditing ? 'Update Room' : 'Add Room'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}