'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { landlordSchema, LandlordFormData } from '@/lib/validators';
import { landlordsApi } from '@/lib/api/landlords.api';
import { Landlord } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  landlord?: Landlord | null;
}

export default function LandlordFormSheet({ open, onClose, landlord }: Props) {
  const isEditing = !!landlord;
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LandlordFormData>({
    resolver: zodResolver(landlordSchema),
  });

  useEffect(() => {
    if (landlord) {
      reset({
        name: landlord.name,
        phone: landlord.phone,
        whatsapp: landlord.whatsapp ?? '',
        notes: landlord.notes ?? '',
      });
    } else {
      reset({ name: '', phone: '', whatsapp: '', notes: '' });
    }
  }, [landlord, reset]);

  const mutation = useMutation({
    mutationFn: (data: LandlordFormData) =>
      isEditing
        ? landlordsApi.update(landlord!.id, data)
        : landlordsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlords'] });
      toast.success(isEditing ? 'Landlord updated successfully' : 'Landlord created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.');
    },
  });

  const onSubmit = (data: LandlordFormData) => mutation.mutate(data);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? 'Edit Landlord' : 'Add New Landlord'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update landlord contact details.' : 'Fill in the details to register a new landlord.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
            <Input id="name" placeholder="e.g. Joseph Kato" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
            <Input id="phone" placeholder="+256701234567" {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input id="whatsapp" placeholder="+256701234567" {...register('whatsapp')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Prefers contact after 5pm"
              rows={3}
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : isEditing ? 'Update Landlord' : 'Create Landlord'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}