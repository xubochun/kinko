type StockPriceCacheEntry = {
  price: number;
  updatedAt: number;
};

type StockPriceCache = Record<string, StockPriceCacheEntry>;

export function readStockPriceCache(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StockPriceCache;
  } catch {
    return null;
  }
}

export function getCachedPrice(
  cache: StockPriceCache | null,
  ticker: string
): StockPriceCacheEntry | null {
  if (!cache) return null;
  return cache[ticker] || null;
}

export function upsertCachedPrice(
  cache: StockPriceCache,
  ticker: string,
  price: number
) {
  cache[ticker] = {
    price,
    updatedAt: Date.now()
  };
}

export function isCacheFresh(entry: StockPriceCacheEntry | null, ttlMs: number) {
  if (!entry) return false;
  return Date.now() - entry.updatedAt <= ttlMs;
}
