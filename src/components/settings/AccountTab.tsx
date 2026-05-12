'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Loader2, Lock, User } from 'lucide-react';
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
import PasswordField from '@/components/settings/PasswordField';

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AccountTab() {
  const queryClient = useQueryClient();
  const [cookieUser, setCookieUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) {
      try {
        setCookieUser(JSON.parse(stored));
      } catch {
        setCookieUser(null);
      }
    }
  }, []);

  const { data: me } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMe,
  });

  const user = (me ?? cookieUser) as CurrentUser | undefined;

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
        try {
          const parsed = JSON.parse(stored);
          Cookies.set('user', JSON.stringify({ ...parsed, ...updated }), { expires: 7 });
        } catch {
          Cookies.set('user', JSON.stringify(updated), { expires: 7 });
        }
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      <div className="space-y-6">
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
                <Badge variant="secondary" className="text-xs">
                  {user?.role}
                </Badge>
              </CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </CardHeader>
        </Card>

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
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...regProfile('email')}
                />
                {profileErrors.email && (
                  <p className="text-sm text-destructive">{profileErrors.email.message}</p>
                )}
              </div>

              <Button type="submit" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-base">Change Password</CardTitle>
            </div>
            <CardDescription>
              Min 8 characters, at least one uppercase letter and one number
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handlePassword((data) => passwordMutation.mutate(data))}
              className="space-y-4"
            >
              <PasswordField
                id="currentPassword"
                label="Current Password"
                placeholder="••••••••"
                error={passwordErrors.currentPassword?.message}
                {...regPassword('currentPassword')}
              />

              <PasswordField
                id="newPassword"
                label="New Password"
                placeholder="••••••••"
                error={passwordErrors.newPassword?.message}
                {...regPassword('newPassword')}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm New Password"
                placeholder="••••••••"
                error={passwordErrors.confirmPassword?.message}
                {...regPassword('confirmPassword')}
              />

              <Button type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}