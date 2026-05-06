'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Loader2, User, Lock, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet';

import {
  updateProfileSchema,
  changePasswordSchema,
  UpdateProfileFormData,
  ChangePasswordFormData,
} from '@/lib/validators';
import { usersApi } from '@/lib/api/users.api';
import { districtsApi } from '@/lib/api/districts.api';
import { District } from '@/types';

// ─── District form schema ────────────────────────────────────────────────────
const districtSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  region: z.string().optional(),
});
type DistrictFormData = z.infer<typeof districtSchema>;

// ─── District form sheet ─────────────────────────────────────────────────────
function DistrictFormSheet({
  open, onClose, district,
}: {
  open: boolean; onClose: () => void; district?: District | null;
}) {
  const isEditing = !!district;
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DistrictFormData>({
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
      isEditing
        ? districtsApi.update(district!.id, data)
        : districtsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['districts'] });
      toast.success(isEditing ? 'District updated' : 'District created');
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Something went wrong'),
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!w-[400px] !max-w-[95vw] p-0">
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Edit District' : 'Add District'}</SheetTitle>
            <SheetDescription>
              {isEditing ? 'Update district details.' : 'Add a new district to the system.'}
            </SheetDescription>
          </SheetHeader>
        </div>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="px-6 py-5 space-y-4"
        >
          <div className="space-y-1.5">
            <Label>District Name <span className="text-destructive">*</span></Label>
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : isEditing ? 'Update' : 'Add District'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ─── Districts Tab Content ────────────────────────────────────────────────────
function DistrictsTab() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<District | null>(null);
  const [search, setSearch] = useState('');

  const { data: districts = [], isLoading } = useQuery({
    queryKey: ['districts'],
    queryFn: districtsApi.getAll,
  });

  const filtered = search
    ? districts.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.region?.toLowerCase().includes(search.toLowerCase()),
      )
    : districts;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => districtsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['districts'] });
      toast.success('District deleted');
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Cannot delete — properties may be linked.'),
  });

  // Group by region
  const regions = [...new Set(districts.map((d) => d.region).filter(Boolean))].sort();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">Districts</CardTitle>
            <CardDescription>
              {districts.length} district{districts.length !== 1 ? 's' : ''} across {regions.length} region{regions.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => { setSelected(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add District
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full sm:w-56">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search districts..."
              className="pl-8 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">No districts found</p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Region</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Added</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((district) => (
                    <TableRow key={district.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{district.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {district.region ? (
                          <Badge variant="secondary" className="text-xs">
                            {district.region}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">
                          {new Date(district.createdAt).toLocaleDateString('en-UG', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setSelected(district); setFormOpen(true); }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => { setSelected(district); setDeleteOpen(true); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DistrictFormSheet
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelected(null); }}
        district={selected}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{selected?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the district. This will fail if properties are linked to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelected(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selected && deleteMutation.mutate(selected.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [cookieUser, setCookieUser] = useState<{
    id: string; name: string; email: string; role: string;
  } | null>(null);

  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) setCookieUser(JSON.parse(stored));
  }, []);

  const { data: me } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMe,
  });

  const user = me ?? cookieUser;

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    if (user) resetProfile({ name: user.name, email: user.email });
  }, [user, resetProfile]);

  const profileMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => usersApi.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      const stored = Cookies.get('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        Cookies.set('user', JSON.stringify({ ...parsed, ...updated }), { expires: 7 });
      }
      toast.success('Profile updated successfully');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update profile.');
    },
  });

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      usersApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed successfully');
      resetPassword();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to change password.');
    },
  });

  return (
    <>
      <Header title="Settings" description="Manage your account and system configuration" />

      <main className="flex-1 p-6">
        <Tabs defaultValue="account">
          <TabsList className="mb-6 bg-gray-100 p-1 h-10">
            <TabsTrigger value="account" className="gap-1.5 data-[state=active]:bg-white">
              <User className="h-3.5 w-3.5" />
              Account
            </TabsTrigger>
            <TabsTrigger value="districts" className="gap-1.5 data-[state=active]:bg-white">
              <MapPin className="h-3.5 w-3.5" />
              Districts
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
              <div className="space-y-6">
                {/* Profile Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {user?.name}
                        <Badge variant="secondary" className="text-xs">{user?.role}</Badge>
                      </CardTitle>
                      <CardDescription>{user?.email}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                {/* Update Profile */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <CardTitle className="text-base">Update Profile</CardTitle>
                    </div>
                    <CardDescription>Change your display name or email address</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleProfile((data) => profileMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Your full name" {...regProfile('name')} />
                        {profileErrors.name && (
                          <p className="text-sm text-destructive">{profileErrors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="you@example.com" {...regProfile('email')} />
                        {profileErrors.email && (
                          <p className="text-sm text-destructive">{profileErrors.email.message}</p>
                        )}
                      </div>
                      <Button type="submit" disabled={profileMutation.isPending}>
                        {profileMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                        ) : 'Save Changes'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Change Password */}
              <div>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-500" />
                      <CardTitle className="text-base">Change Password</CardTitle>
                    </div>
                    <CardDescription>Use a strong password at least 6 characters long</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handlePassword((data) => passwordMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" placeholder="••••••••" {...regPassword('currentPassword')} />
                        {passwordErrors.currentPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" placeholder="••••••••" {...regPassword('newPassword')} />
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="••••••••" {...regPassword('confirmPassword')} />
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                        )}
                      </div>
                      <Button type="submit" disabled={passwordMutation.isPending}>
                        {passwordMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                        ) : 'Change Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Districts Tab */}
          <TabsContent value="districts">
            <div className="max-w-3xl">
              <DistrictsTab />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}