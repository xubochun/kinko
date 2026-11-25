import { useQuery } from '@tanstack/react-query';
import type { DayRange } from '../lib/stockStats';

const shift = (date: string, days: number) =>
  new Date(Date.parse(date) + days * 86_400_000).toISOString().slice(0, 10);

/** 取得這些成交日前後一週的每日股價區間，用來推算被舊版改過的買價 */
export function usePriceHistory(ticker: string, dates: string[]) {
  const sorted = dates.filter((d) => !isNaN(Date.parse(d))).sort();
  const start = sorted.length ? shift(sorted[0], -7) : '';
  const end = sorted.length ? shift(sorted[sorted.length - 1], 7) : '';
  return useQuery({
    queryKey: ['priceHistory', ticker, start, end],
    queryFn: async (): Promise<DayRange[]> => {
      const res = await fetch(
        `/api/stock/history?ticker=${encodeURIComponent(ticker)}&start=${start}&end=${end}`,
      );
      if (!res.ok) throw new Error(`History unavailable for ${ticker}`);
      return res.json();
    },
    // 至少兩筆被改過才推算得出倍數
    enabled: sorted.length > 1,
    staleTime: Infinity,
  });
}
