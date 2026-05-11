'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import { IdleWarningModal } from '@/components/shared/IdleWarningModal';
import { useIdleTimer } from '@/lib/hooks/useIdleTimer';

// ── Tune these to your preference ────────────────────────────────────────────
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 min of inactivity → warning
const WARNING_SECONDS = 2 * 60;          // 2 min countdown on the warning dialog
// ─────────────────────────────────────────────────────────────────────────────

function clearSession() {
  Cookies.remove('token');
  Cookies.remove('user');
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    clearSession();
    toast.info('You were signed out due to inactivity.');
    router.push('/login');
  }, [router]);

  const { resetTimer } = useIdleTimer({
    idleTimeout:   IDLE_TIMEOUT_MS,
    warningBefore: WARNING_SECONDS * 1_000,
    onWarning: () => setShowWarning(true),
    onIdle:    handleLogout,
    onActive:  () => setShowWarning(false),
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