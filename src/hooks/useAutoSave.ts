import { useEffect, useRef } from "react";

/**
 * Runs `callback` after `delay` ms of no changes to `value`.
 * Skips the initial mount so we don't save right after loading.
 */
export function useAutoSave<T>(value: T, delay: number, callback: (v: T) => void | Promise<void>) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRun = useRef(true);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(value);
    }, delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value), delay]);
}
