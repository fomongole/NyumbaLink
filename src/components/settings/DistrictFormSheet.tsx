'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { District } from '@/types';
import { districtsApi } from '@/lib/api/districts.api';
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

const districtSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  region: z.string().optional(),
});

type DistrictFormData = z.infer<typeof districtSchema>;

export default function DistrictFormSheet({
  open,
  onClose,
  district,
}: {
  open: boolean;
  onClose: () => void;
  district?: District | null;
}) {
  const isEditing = !!district;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DistrictFormData>({
    resolver: zodResolver(districtSchema),
  });

  useEffect(() => {
    if (district) {
      reset({ name: district.name, region: district.region ?? '' });
    } else {
      reset({ name: '', region: '' });
    }
  }, [district, reset]);

  const mutation = useMutation({
    mutationFn: (data: DistrictFormData) =>
      isEditing ? districtsApi.update(district!.id, data) : districtsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['districts'] });
      toast.success(isEditing ? 'District updated' : 'District created');
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Something went wrong'),
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!w-[400px] !max-w-[95vw] p-0">
        <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Edit District' : 'Add District'}</SheetTitle>
            <SheetDescription>
              {isEditing ? 'Update district details.' : 'Add a new district to the system.'}
            </SheetDescription>
          </SheetHeader>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4 px-6 py-5"
        >
          <div className="space-y-1.5">
            <Label>
              District Name <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="e.g. Nakaseke" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Region</Label>
            <Input placeholder="e.g. Central" {...register('region')} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update'
              ) : (
                'Add District'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}