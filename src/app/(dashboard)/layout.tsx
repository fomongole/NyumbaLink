'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import { IdleWarningModal } from '@/components/shared/IdleWarningModal';
import { useIdleTimer } from '@/lib/hooks/useIdleTimer';
import { authApi } from '@/lib/api/auth.api';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_SECONDS = 2 * 60;

function clearSession() {
  // Only remove the readable user cookie.
  // The httpOnly access_token cookie is cleared by the server's /auth/logout endpoint.
  Cookies.remove('user');
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    try {
      // Tell the server to blacklist the token and clear the httpOnly cookie
      await authApi.logout();
    } catch {
      // Even if the server call fails, we still clear the local session
    }
    clearSession();
    toast.info('You were signed out due to inactivity.');
    router.push('/login');
  }, [router]);

  const { resetTimer } = useIdleTimer({
    idleTimeout: IDLE_TIMEOUT_MS,
    warningBefore: WARNING_SECONDS * 1_000,
    onWarning: () => setShowWarning(true),
    onIdle: handleLogout,
    onActive: () => setShowWarning(false),
  });

  const handleStaySignedIn = useCallback(() => {
    resetTimer();
    setShowWarning(false);
  }, [resetTimer]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>

      <IdleWarningModal
        open={showWarning}
        warningSeconds={WARNING_SECONDS}
        onStaySignedIn={handleStaySignedIn}
        onSignOut={handleLogout}
      />
    </div>
  );
}