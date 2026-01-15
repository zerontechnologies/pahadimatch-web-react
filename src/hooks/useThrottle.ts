import { useRef, useCallback } from 'react';

/**
 * Custom hook for throttling function calls
 * Useful for scroll handlers, resize handlers, etc.
 * 
 * @param func - Function to throttle
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): T {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        func(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          func(...args);
        }, delay - (now - lastRun.current));
      }
    }) as T,
    [func, delay]
  );
}

