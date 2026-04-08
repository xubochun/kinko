import { useQueries } from '@tanstack/react-query';
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

  const stockPrices: Record<string, number> = {};
  const stockNames: Record<string, string> = {};

  queries.forEach((query, index) => {
    const ticker = tickers[index];
    if (query.data) {
      stockPrices[ticker] = query.data.price;
      stockNames[ticker] = query.data.name;
    }
  });

  const isLoading = queries.some((q) => q.isLoading);

  return {
    stockPrices,
    stockNames,
    isLoading,
  };
}
