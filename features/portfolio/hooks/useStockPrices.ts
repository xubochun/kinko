import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchStockPriceFromYahoo } from '../../../lib/yahoo';

const fetchPrice = async (ticker: string) => {
  const yahooData = await fetchStockPriceFromYahoo(ticker);
  if (!yahooData) throw new Error(`Failed to fetch ${ticker}`);
  return yahooData;
};

export function useStockPrices(tickers: string[]) {
  const queries = useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: ['stockPrice', ticker],
      queryFn: () => fetchPrice(ticker),
      staleTime: 60 * 60 * 1000, // 1 hour fresh
      refetchInterval: false, // Do not auto refetch in background
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);
  const dataStr = JSON.stringify(queries.map((q) => q.data));

  const { stockPrices, stockNames } = useMemo(() => {
    const prices: Record<string, number> = {};
    const names: Record<string, string> = {};

    queries.forEach((query, index) => {
      const ticker = tickers[index];
      if (query.data) {
        prices[ticker] = query.data.price;
        names[ticker] = query.data.name;
      }
    });

    return { stockPrices: prices, stockNames: names };
  }, [tickers.join(','), dataStr]);

  return {
    stockPrices,
    stockNames,
    isLoading,
    isFetching,
  };
}
