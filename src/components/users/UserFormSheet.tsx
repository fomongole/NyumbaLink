'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { createAdminSchema, CreateAdminFormData } from '@/lib/validators';
import { usersApi } from '@/lib/api/users.api';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserFormSheet({ open, onClose }: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { role: 'ADMIN' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateAdminFormData) => usersApi.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Admin user created successfully');
      reset();
      onClose();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create user.');
    },
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!max-w-[500px] !w-[90vw] overflow-y-auto p-6 sm:p-8">
        <SheetHeader className="mb-6">
          <SheetTitle>Create Admin User</SheetTitle>
          <SheetDescription>
            Add a new user to the NyumbaLink admin team.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. Sarah Nakato" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Email Address <span className="text-destructive">*</span></Label>
            <Input
              type="email"
              placeholder="sarah@nyumbalink.com"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Password <span className="text-destructive">*</span></Label>
            <Input
              type="password"
              placeholder="Minimum 6 characters"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              value={watch('role')}
              onValueChange={(v) => setValue('role', v as 'ADMIN' | 'RENTER')}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="RENTER">Renter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-6 mt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
              ) : 'Create User'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}