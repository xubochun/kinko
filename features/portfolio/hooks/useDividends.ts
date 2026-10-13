import { useCallback, useEffect, useState } from 'react';
import { DIVIDENDS_KEY } from '../../../lib/storage';
import type { DividendRecord } from '../lib/averageCost';

type DividendMap = Record<string, DividendRecord[]>;

const read = (): DividendMap => {
  try {
    const raw = localStorage.getItem(DIVIDENDS_KEY);
    const parsed = raw ? (JSON.parse(raw) as DividendMap) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

/** 每檔股票的現金股利（除息）紀錄，存於 LocalStorage */
export function useDividends() {
  const [map, setMap] = useState<DividendMap>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMap(read());
  }, []);

  const persist = useCallback((updater: (prev: DividendMap) => DividendMap) => {
    setMap((prev) => {
      const next = updater(prev);
      localStorage.setItem(DIVIDENDS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addDividend = useCallback(
    (ticker: string, record: Omit<DividendRecord, 'id'>) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : String(Date.now());
      persist((prev) => ({
        ...prev,
        [ticker]: [...(prev[ticker] || []), { ...record, id }].sort((a, b) =>
          b.date.localeCompare(a.date),
        ),
      }));
    },
    [persist],
  );

  const removeDividend = useCallback(
    (ticker: string, id: string) => {
      persist((prev) => ({
        ...prev,
        [ticker]: (prev[ticker] || []).filter((d) => d.id !== id),
      }));
    },
    [persist],
  );

  const getDividends = useCallback(
    (ticker: string) => map[ticker] || [],
    [map],
  );

  return { getDividends, addDividend, removeDividend };
}
