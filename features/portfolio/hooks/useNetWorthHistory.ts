import { useCallback, useEffect, useState } from 'react';
import type { HistoryEntry } from '../../../types/portfolio';
import { HISTORY_KEY } from '../../../lib/storage';
import { recordTodayNetWorth } from '../lib/history';

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export function useNetWorthHistory(totalValue: number, isReady: boolean) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parsedHistory = safeParse<HistoryEntry[]>(
      localStorage.getItem(HISTORY_KEY),
      [],
    );
    setHistory(parsedHistory);
    if (!localStorage.getItem(HISTORY_KEY)) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!isReady || !hasLoaded || typeof window === 'undefined') return;

    // Use a small timeout to avoid triggering history updates during fast intermediate state changes
    const timer = setTimeout(() => {
      setHistory((prev) => {
        const next = recordTodayNetWorth(prev, totalValue);
        if (JSON.stringify(prev) !== JSON.stringify(next)) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        }
        return next;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [totalValue, isReady, hasLoaded]);

  const saveHistory = useCallback((nextHistory: HistoryEntry[]) => {
    setHistory(nextHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  }, []);

  return {
    history,
    saveHistory,
  };
}
