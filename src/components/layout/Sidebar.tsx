'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Users, ShieldCheck,
  ScrollText, Settings, LogOut, CalendarCheck,
  MessageSquareWarning, ContactRound,
  Bell,
} from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard',      href: '/',               icon: LayoutDashboard },
  { label: 'Properties',     href: '/properties',     icon: Building2 },
  { label: 'Contacts',       href: '/contacts',       icon: ContactRound },
  { label: 'Bookings',       href: '/bookings',       icon: CalendarCheck },
  { label: 'Complaints',     href: '/complaints',     icon: MessageSquareWarning },
  { label: 'Notifications',  href: '/notifications',  icon: Bell },
  { label: 'Users',          href: '/users',          icon: ShieldCheck },
  { label: 'Audit Logs',     href: '/audit-logs',     icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <>
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-gray-900 text-white flex-col shrink-0">
        <div className="py-5 border-b border-gray-800 shrink-0">
          <div className="dark transform scale-90 origin-left">
            <Logo />
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  // border-l-[3px] on every item keeps layout stable (no shift on active toggle)
                  // pl-[9px] compensates for the 3px border so text stays visually at 12px from edge
                  'flex items-center gap-3 pl-[9px] pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-[3px]',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary-foreground/40'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border-transparent',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 space-y-0.5 shrink-0">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 pl-[9px] pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-[3px]',
              pathname === '/settings'
                ? 'bg-primary text-primary-foreground border-primary-foreground/40'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white border-transparent',
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            className="flex items-center gap-3 pl-[9px] pr-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full border-l-[3px] border-transparent"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your admin dashboard?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}