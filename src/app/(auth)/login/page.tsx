'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Building2, Users, ShieldCheck, BarChart3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, LoginFormData } from '@/lib/validators';
import { authApi } from '@/lib/api/auth.api';
import { Logo } from '@/components/shared/Logo';

const FEATURES = [
  {
    icon: Building2,
    title: 'Property Management',
    description: 'List, update, and track every rental unit in one place.',
  },
  {
    icon: Users,
    title: 'Landlord Profiles',
    description: 'Manage contacts, NINs, and communication history.',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description: 'Views, enquiries, and occupancy rates at a glance.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description: 'Full audit trail for every admin action.',
  },
];

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

      // The JWT is now in an httpOnly cookie set by the server — JS cannot read it.
      // We only store the non-sensitive user object so the UI knows who is logged in.
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
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-slide {
          opacity: 0;
          animation: fadeSlideIn 0.55s ease-out forwards;
        }
      `}</style>

      <div className="flex w-full min-h-screen">
        {/* ── Left Column ── */}
        <div className="relative hidden lg:flex w-[52%] flex-col bg-zinc-950 text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex h-full flex-col p-12">
            <div className="anim-fade-slide" style={{ animationDelay: '100ms' }}>
              <div className="dark transform scale-110 origin-left">
                <Logo />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-10 max-w-sm">
              <div className="space-y-3 anim-fade-slide" style={{ animationDelay: '250ms' }}>
                <h2 className="text-3xl font-bold leading-tight text-white">
                  Uganda's rental<br />
                  management platform
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  One dashboard to manage properties, landlords,
                  bookings, and analytics — built for the Ugandan market.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {FEATURES.map(({ icon: Icon, title, description }, index) => (
                  <div
                    key={title}
                    className="flex items-start gap-3.5 anim-fade-slide"
                    style={{ animationDelay: `${420 + index * 110}ms` }}
                  >
                    <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex items-center justify-between anim-fade-slide"
              style={{ animationDelay: '900ms' }}
            >
              <p className="text-xs text-zinc-600">Admin Portal · v1.0</p>
              <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Rentora Houselink Uganda</p>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-1 flex-col min-h-screen bg-white">
          <div className="flex lg:hidden items-center justify-center pt-10">
            <Logo />
          </div>

          <div className="flex flex-1 items-center justify-center px-8 sm:px-12 py-12">
            <div className="w-full max-w-[380px] space-y-8">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                  Sign in to your account
                </h1>
                <p className="text-sm text-gray-500">
                  Admin access only. Enter your credentials below.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="rentorahouselink@gmail.com"
                    autoComplete="email"
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-11 pr-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      {...register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full text-sm font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-gray-400">
                Unauthorised access is strictly prohibited and audited.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-end px-12 pb-6">
            <p className="text-xs text-gray-400">Need access? Contact your system administrator.</p>
          </div>
        </div>
      </div>
    </>
  );
}