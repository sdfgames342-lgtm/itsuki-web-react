import { useEffect, useRef, useState } from 'react';

/**
 * Reintenta una función de setup con backoff exponencial.
 * `setup` debe devolver un cleanup.
 * Devuelve `attempt` (0 = OK) y `delayMs` (próximo intento).
 */
export function useReconnect(
  setup: () => (() => void) | void,
  opts: { baseMs?: number; maxMs?: number } = {},
) {
  const baseMs = opts.baseMs ?? 1000;
  const maxMs  = opts.maxMs  ?? 30000;
  const [attempt, setAttempt] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<number | null>(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  useEffect(() => {
    const cleanup = setup();
    cleanupRef.current = typeof cleanup === 'function' ? cleanup : null;
    return () => {
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = null;
    };
  }, [attempt]);

  const triggerRetry = () => {
    if (!aliveRef.current) return;
    const delay = Math.min(maxMs, baseMs * 2 ** attempt);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (aliveRef.current) setAttempt((a) => a + 1);
    }, delay);
  };

  const reset = () => setAttempt(0);

  return { attempt, triggerRetry, reset };
}
