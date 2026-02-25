import { useCallback, useEffect, useRef, useState } from "react";

export function useAnimatedTotal(total: number, privacy: boolean) {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const nextAnimationMsRef = useRef<number | null>(null);

  useEffect(() => {
    nextAnimationMsRef.current = 600;
  }, []);

  useEffect(() => {
    if (privacy) {
      setAnimatedTotal(total);
      return;
    }

    const ms = nextAnimationMsRef.current;
    if (!ms) {
      setAnimatedTotal(total);
      return;
    }

    nextAnimationMsRef.current = null;
    const start = total * 0.95;
    const t0 = performance.now();
    let rafId = 0;

    const tick = (t: number) => {
      if (privacy) return;
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const v = start + (total - start) * e;
      setAnimatedTotal(v);
      if (p < 1) rafId = requestAnimationFrame(tick);
      else setAnimatedTotal(total);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [total, privacy]);

  const setNextAnimationMs = useCallback((ms: number) => {
    nextAnimationMsRef.current = ms;
  }, []);

  return { animatedTotal, setNextAnimationMs };
}
