'use client';

import { useEffect, useState, useRef } from 'react';
import { ShieldAlert, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IdleWarningModalProps {
  /** Whether the modal is currently visible */
  open: boolean;
  /** Seconds remaining before forced logout (should match warningBefore in useIdleTimer) */
  warningSeconds?: number;
  /** Called when admin clicks "Stay signed in" */
  onStaySignedIn: () => void;
  /** Called when admin clicks "Sign out" or the countdown hits 0 */
  onSignOut: () => void;
}

export function IdleWarningModal({
  open,
  warningSeconds = 120, // 2 minutes
  onStaySignedIn,
  onSignOut,
}: IdleWarningModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(warningSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset and start countdown whenever the modal opens
  useEffect(() => {
    if (!open) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSecondsLeft(warningSeconds);
      return;
    }

    setSecondsLeft(warningSeconds);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, warningSeconds]);

  if (!open) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

  // Progress bar: goes from full → empty as time runs out
  const progressPercent = (secondsLeft / warningSeconds) * 100;

  // Colour shifts from amber → red as time runs low
  const isUrgent = secondsLeft <= 30;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-title"
        aria-describedby="idle-desc"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2
                   rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl
                   animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Icon */}
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full
            ${isUrgent ? 'bg-red-50' : 'bg-amber-50'} transition-colors duration-500`}>
          <ShieldAlert
            className={`h-6 w-6 ${isUrgent ? 'text-red-500' : 'text-amber-500'} transition-colors duration-500`}
          />
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5 mb-5">
          <h2 id="idle-title" className="text-base font-semibold text-zinc-900">
            Still there?
          </h2>
          <p id="idle-desc" className="text-sm text-zinc-500 leading-relaxed">
            You've been inactive for a while. For your security, you'll be
            signed out automatically.
          </p>
        </div>

        {/* Countdown */}
        <div className="mb-5 text-center">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-mono font-semibold
              ${isUrgent
                ? 'bg-red-50 text-red-600'
                : 'bg-zinc-100 text-zinc-700'}
              transition-colors duration-500`}>
            <Clock className="h-3.5 w-3.5" />
            {formatted}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear
                ${isUrgent ? 'bg-red-400' : 'bg-amber-400'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-10 text-sm"
            onClick={onSignOut}
          >
            Sign out
          </Button>
          <Button
            className="flex-1 h-10 text-sm"
            onClick={onStaySignedIn}
            autoFocus
          >
            Stay signed in
          </Button>
        </div>
      </div>
    </>
  );
}