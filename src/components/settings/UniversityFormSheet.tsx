'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { University } from '@/types';
import { universitiesApi } from '@/lib/api/universities.api';
import { universitySchema, UniversityFormData, UniversityFormInput } from '@/lib/validators';
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

export default function UniversityFormSheet({
  open,
  onClose,
  university,
}: {
  open: boolean;
  onClose: () => void;
  university?: University | null;
}) {
  const isEditing = !!university;
  const queryClient = useQueryClient();

    const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    } = useForm<UniversityFormInput, any, UniversityFormData>({
    resolver: zodResolver(universitySchema),
    });

  useEffect(() => {
    if (university) {
      reset({
        name: university.name,
        shortName: university.shortName ?? '',
        location: university.location ?? '',
      });
    } else {
      reset({ name: '', shortName: '', location: '' });
    }
  }, [university, reset]);

  const mutation = useMutation({
    mutationFn: (data: UniversityFormData) =>
      isEditing
        ? universitiesApi.update(university!.id, data)
        : universitiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universities'] });
      toast.success(isEditing ? 'University updated' : 'University added');
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Something went wrong'),
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!w-[420px] !max-w-[95vw] p-0">
        <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Edit University' : 'Add University'}</SheetTitle>
            <SheetDescription>
              {isEditing
                ? 'Update university details.'
                : 'Add a university to enable hostel-to-university filtering.'}
            </SheetDescription>
          </SheetHeader>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4 px-6 py-5"
        >
          <div className="space-y-1.5">
            <Label>
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Makerere University"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Short Name / Abbreviation</Label>
            <Input placeholder="e.g. MUK" {...register('shortName')} />
            <p className="text-xs text-gray-500">
              Shown in dropdowns and property cards (max 20 characters)
            </p>
            {errors.shortName && (
              <p className="text-xs text-destructive">{errors.shortName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Location / Area</Label>
            <Input
              placeholder="e.g. Wandegeya, Kampala"
              {...register('location')}
            />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
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
                'Add University'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}