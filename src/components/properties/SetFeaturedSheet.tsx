'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Star, StarOff, Info } from 'lucide-react';
import { Property } from '@/types';
import { propertiesApi } from '@/lib/api/properties.api';
import { setFeaturedSchema, SetFeaturedFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface Props {
  open: boolean;
  onClose: () => void;
  property: Property;
}

export default function SetFeaturedSheet({ open, onClose, property }: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SetFeaturedFormData>({
    resolver: zodResolver(setFeaturedSchema),
    defaultValues: {
      isFeatured: false,
      featuredUntil: '',
    },
  });

  const isFeatured = watch('isFeatured');

  useEffect(() => {
    if (open) {
      reset({
        isFeatured: property.isFeatured,
        featuredUntil: property.featuredUntil
          ? new Date(property.featuredUntil).toISOString().split('T')[0]
          : '',
      });
    }
  }, [open, property, reset]);

  const mutation = useMutation({
    mutationFn: (data: SetFeaturedFormData) =>
      propertiesApi.setFeatured(property.id, {
        isFeatured: data.isFeatured,
        featuredUntil: data.featuredUntil || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', property.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(
        isFeatured ? 'Property is now featured!' : 'Featured status removed.',
      );
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Failed to update featured status.'),
  });

  // Minimum date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!w-[420px] !max-w-[95vw] p-0">
        <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <SheetHeader>
            <SheetTitle>Featured Listing</SheetTitle>
            <SheetDescription>
              Featured properties appear above standard listings in all search results and receive
              a "Featured" badge.
            </SheetDescription>
          </SheetHeader>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-5 px-6 py-5"
        >
          {/* Current status indicator */}
          <div
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              property.isFeatured
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            {property.isFeatured ? (
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 shrink-0" />
            ) : (
              <StarOff className="h-5 w-5 text-gray-400 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {property.isFeatured ? 'Currently Featured' : 'Not Featured'}
              </p>
              {property.isFeatured && property.featuredUntil && (
                <p className="text-xs text-gray-500">
                  Expires{' '}
                  {new Date(property.featuredUntil).toLocaleDateString('en-UG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Toggle */}
          <div className="space-y-2">
            <Label>Feature this property?</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue('isFeatured', true)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                  isFeatured
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Star className={`h-4 w-4 ${isFeatured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                Yes, Feature It
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('isFeatured', false);
                  setValue('featuredUntil', '');
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                  !isFeatured
                    ? 'border-gray-400 bg-gray-100 text-gray-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <StarOff className="h-4 w-4" />
                Remove Feature
              </button>
            </div>
          </div>

          {/* Expiry date — only shown when featuring */}
          {isFeatured && (
            <div className="space-y-1.5">
              <Label>
                Featured Until <span className="text-destructive">*</span>
              </Label>
              <Input type="date" min={minDate} {...register('featuredUntil')} />
              <p className="text-xs text-gray-500">
                The featured status auto-expires at midnight on this date. Set this after
                confirming payment from the property owner.
              </p>
              {errors.featuredUntil && (
                <p className="text-xs text-destructive">{errors.featuredUntil.message}</p>
              )}
            </div>
          )}

          {!isFeatured && property.isFeatured && (
            <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                This will immediately remove the featured status and clear the expiry date.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}