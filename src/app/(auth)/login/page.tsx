'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, LoginFormData } from '@/lib/validators';
import { authApi } from '@/lib/api/auth.api';
import { Logo } from '@/components/shared/Logo';

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      const response = await authApi.login(data);

      if (response.user.role !== 'ADMIN') {
        toast.error('Access denied. Admin accounts only.');
        return;
      }

      Cookies.set('token', response.accessToken, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 });

      toast.success(`Welcome back, ${response.user.name}!`);

      router.push('/');
    } catch {
      toast.error('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Column - Branding (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col bg-zinc-950 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900/50" />

        <div className="relative z-20 flex h-full flex-col justify-between p-12">
          <Logo className="scale-125 origin-left" />

          <div className="space-y-6">
            <blockquote className="space-y-2">
              <p className="text-xl font-medium leading-relaxed">
                "Curating and managing Uganda's premier rental properties.
                Empowering landlords, connecting renters."
              </p>

              <footer className="text-sm text-zinc-400">
                Admin Portal v1.0
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2 px-8 sm:px-12 md:px-24">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-center lg:hidden mb-8">
            <Logo />
          </div>

          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>

            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                type="email"
                placeholder="admin@nyumbalink.com"
                className="h-11"
                {...register('email')}
              />

              {errors.email && (
                <p className="text-sm font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 pr-11"
                  {...register('password')}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {errors.password && (
                <p className="text-sm font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="h-11 w-full text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}