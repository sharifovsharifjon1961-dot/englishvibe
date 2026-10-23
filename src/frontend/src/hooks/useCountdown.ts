import { useCallback, useEffect, useRef, useState } from "react";

export interface CountdownControls {
  secondsLeft: number;
  isRunning: boolean;
  isFinished: boolean;
  start: () => void;
  pause: () => void;
  reset: (seconds?: number) => void;
}

/**
 * Countdown timer in whole seconds. Calls `onComplete` once when it reaches
 * zero. Used by the mock-test runner, reading timer and speaking prep/speak.
 */
export function useCountdown(
  initialSeconds: number,
  onComplete?: () => void,
): CountdownControls {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setIsRunning(false);
          if (!completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning((running) => {
      if (!running) completedRef.current = false;
      return true;
    });
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(
    (seconds?: number) => {
      setIsRunning(false);
      completedRef.current = false;
      setSecondsLeft(seconds ?? initialSeconds);
    },
    [initialSeconds],
  );

  return {
    secondsLeft,
    isRunning,
    isFinished: secondsLeft === 0,
    start,
    pause,
    reset,
  };
}

/** Formats a second count as `mm:ss`. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
