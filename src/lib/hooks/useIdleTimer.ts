import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  /** Total idle time before forced logout (ms). Default: 30 minutes */
  idleTimeout?: number;
  /** How long before logout to show the warning dialog (ms). Default: 2 minutes */
  warningBefore?: number;
  /** Called when the user has been idle for (idleTimeout - warningBefore) */
  onWarning: () => void;
  /** Called when the full idleTimeout has elapsed — do your logout logic here */
  onIdle: () => void;
  /** Called when the user becomes active again (e.g. clicked "Stay signed in") */
  onActive?: () => void;
}

// DOM events on `window` that count as "user activity"
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'wheel',
  'focus', // catches tab switching back
];

export function useIdleTimer({
  idleTimeout   = 30 * 60 * 1000,   // 30 min
  warningBefore = 2  * 60 * 1000,   // 2 min warning
  onWarning,
  onIdle,
  onActive,
}: UseIdleTimerOptions) {
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWarningRef    = useRef(false); // track if warning is currently showing

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (idleTimerRef.current)    clearTimeout(idleTimerRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();

    // First timer: show warning dialog
    warningTimerRef.current = setTimeout(() => {
      isWarningRef.current = true;
      onWarning();

      // Second timer: force logout after the warning window
      idleTimerRef.current = setTimeout(() => {
        onIdle();
      }, warningBefore);

    }, idleTimeout - warningBefore);
  }, [idleTimeout, warningBefore, onWarning, onIdle, clearTimers]);

  // Called externally (e.g. user clicked "Stay signed in")
  const resetTimer = useCallback(() => {
    if (isWarningRef.current) {
      isWarningRef.current = false;
      onActive?.();
    }
    startTimers();
  }, [startTimers, onActive]);

  useEffect(() => {
    // Throttle activity handler — no need to reset timers on every pixel of mouse movement
    let throttleHandle: ReturnType<typeof setTimeout> | null = null;

    const handleActivity = () => {
      // While the warning is visible, ignore activity — the user must explicitly
      // click "Stay signed in" to reset. This prevents a background mouse movement
      // from silently dismissing the warning without the user noticing.
      if (isWarningRef.current) return;

      if (throttleHandle) return; // already scheduled
      throttleHandle = setTimeout(() => {
        throttleHandle = null;
        startTimers();
      }, 1_000); // reset at most once per second
    };

    // Attach window activity listeners
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );

    // visibilitychange lives on document, not window
    document.addEventListener('visibilitychange', handleActivity);

    // Start the clock immediately
    startTimers();

    return () => {
      clearTimers();
      if (throttleHandle) clearTimeout(throttleHandle);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
      document.removeEventListener('visibilitychange', handleActivity);
    };
  }, [startTimers, clearTimers]);

  return { resetTimer };
}