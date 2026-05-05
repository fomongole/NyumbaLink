'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Loader2, User, Lock } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import {
  updateProfileSchema,
  changePasswordSchema,
  UpdateProfileFormData,
  ChangePasswordFormData,
} from '@/lib/validators';
import { usersApi } from '@/lib/api/users.api';

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

  // ── Profile form ──
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
      // Update cookie so header reflects change immediately
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

  // ── Password form ──
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
      <Header title="Settings" description="Manage your account and preferences" />
      
      {/* Replaced max-w-2xl with full width and max-w-6xl for better ultrawide display */}
      <main className="flex-1 p-6 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Profile Summary & Update Profile */}
          <div className="space-y-6">
            {/* Profile card */}
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
                    <Input
                      id="name"
                      placeholder="Your full name"
                      {...regProfile('name')}
                    />
                    {profileErrors.name && (
                      <p className="text-sm text-destructive">{profileErrors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@nyumbalink.com"
                      {...regProfile('email')}
                    />
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

          {/* Right Column: Change Password */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-base">Change Password</CardTitle>
                </div>
                <CardDescription>
                  Use a strong password at least 6 characters long
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handlePassword((data) => passwordMutation.mutate(data))}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      {...regPassword('currentPassword')}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-destructive">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      {...regPassword('newPassword')}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-destructive">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...regPassword('confirmPassword')}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {passwordErrors.confirmPassword.message}
                      </p>
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
      </main>
    </>
  );
}