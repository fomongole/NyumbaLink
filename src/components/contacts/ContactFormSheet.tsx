'use client';

import { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { contactSchema, ContactFormInput, ContactFormData } from '@/lib/validators';
import { contactsApi } from '@/lib/api/contacts.api';
import { Contact } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  contact?: Contact | null;
}

const ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Owner — property owner' },
  { value: 'AGENT', label: 'Agent — broker / property manager' },
];

export default function ContactFormSheet({ open, onClose, contact }: Props) {
  const isEditing = !!contact;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormInput, unknown, ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name,
        phone: contact.phone,
        role: contact.role,
        email: contact.email ?? '',
        whatsapp: contact.whatsapp ?? '',
        nationalId: contact.nationalId ?? '',
        physicalAddress: contact.physicalAddress ?? '',
        notes: contact.notes ?? '',
      });
    } else {
      reset({
        name: '', phone: '', role: undefined as any,
        email: '', whatsapp: '', nationalId: '',
        physicalAddress: '', notes: '',
      });
    }
  }, [contact, reset]);

  const mutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      isEditing
        ? contactsApi.update(contact!.id, data)
        : contactsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success(isEditing ? 'Contact updated successfully' : 'Contact created successfully');
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2 pb-1 border-t">
      {children}
    </p>
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!max-w-[600px] !w-[90vw] overflow-y-auto p-6 sm:p-8">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? 'Edit Contact' : 'Add New Contact'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update contact details.'
              : 'Register a property owner or agent.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <SectionLabel>Role</SectionLabel>
          <div className="space-y-1.5">
            <Label>Role <span className="text-destructive">*</span></Label>
            <Select
              value={watch('role') ?? ''}
              onValueChange={(v) => setValue('role', v as ContactFormData['role'], { shouldValidate: true })}
            >
              <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>

          <SectionLabel>Contact Information</SectionLabel>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
            <Input id="name" placeholder="e.g. Joseph Kato" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
              <Input id="phone" placeholder="+256701234567" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" placeholder="+256701234567" {...register('whatsapp')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="joseph.kato@gmail.com"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <SectionLabel>Verification</SectionLabel>
          <div className="space-y-1.5">
            <Label htmlFor="nationalId">National ID (NIN)</Label>
            <Input
              id="nationalId"
              placeholder="e.g. CM9100001234567"
              {...register('nationalId')}
            />
            <p className="text-xs text-gray-500">Uganda National Identification Number</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="physicalAddress">Physical Address</Label>
            <Input
              id="physicalAddress"
              placeholder="e.g. Plot 45, Bukoto Street, Kampala"
              {...register('physicalAddress')}
            />
          </div>

          <SectionLabel>Notes</SectionLabel>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Prefers contact after 5pm"
              rows={3}
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-6 mt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : isEditing ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}