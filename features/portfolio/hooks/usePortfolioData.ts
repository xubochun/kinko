import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import type { Asset, HistoryEntry } from "../../../types/portfolio";
import { ARCHIVE_KEY, HISTORY_ARCHIVE_KEY, HISTORY_KEY, STOCK_PRICE_CACHE_KEY, STORAGE_KEY } from "../../../lib/storage";
import { fetchStockPriceFromYahoo } from "../../../lib/yahoo";
import { demoAssets } from "../lib/demoAssets";
import { buildDemoHistory } from "../lib/demoHistory";
import { recordTodayNetWorth } from "../lib/history";
import { useAnimatedTotal } from "./useAnimatedTotal";
import { getCachedPrice, isCacheFresh, readStockPriceCache, upsertCachedPrice } from "../lib/stockPriceCache";

export type NewAssetPayload =
  | { type: "cash"; name: string; amount: number }
  | { type: "stock"; ticker: string; date: string; shares: number; price: number };

type UsePortfolioDataOptions = {
  privacy: boolean;
};

type CacheState = {
  assets: Asset[] | null;
  history: HistoryEntry[] | null;
  hasArchive: boolean;
};

let memoryCache: CacheState = {
  assets: null,
  history: null,
  hasArchive: false
};

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export function usePortfolioData({ privacy }: UsePortfolioDataOptions) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  const [cashTotal, setCashTotal] = useState(0);
  const [stockTotal, setStockTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [cashCount, setCashCount] = useState(0);
  const [stockCount, setStockCount] = useState(0);
  const [cashPct, setCashPct] = useState("0.0");
  const [stockPct, setStockPct] = useState("0.0");
  const [updatedAt, setUpdatedAt] = useState("");
  const [hasArchive, setHasArchive] = useState(false);
  const [chartResetKey, setChartResetKey] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [initialLoadState, setInitialLoadState] = useState<"unknown" | "empty" | "hasData">("unknown");
  const { animatedTotal, setNextAnimationMs } = useAnimatedTotal(total, privacy);
  const priceTtlMs = 10 * 60 * 1000;

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if (memoryCache.assets) {
      setAssets(memoryCache.assets);
      setInitialLoadState(memoryCache.assets.length > 0 ? "hasData" : "empty");
    } else {
      const parsedAssets = safeParse<Asset[]>(localStorage.getItem(STORAGE_KEY), []);
      setAssets(parsedAssets);
      setInitialLoadState(parsedAssets.length > 0 ? "hasData" : "empty");
    }

    if (memoryCache.history) {
      setHistory(memoryCache.history);
    } else {
      const parsedHistory = safeParse<HistoryEntry[]>(localStorage.getItem(HISTORY_KEY), []);
      setHistory(parsedHistory);
    }

    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(HISTORY_KEY)) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    }

    memoryCache.hasArchive = Boolean(localStorage.getItem(ARCHIVE_KEY));
    setHasArchive(memoryCache.hasArchive);
    setUpdatedAt(
      new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
    );
    setNextAnimationMs(600);
    setIsReady(true);
  }, [setNextAnimationMs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let active = true;

    const run = async () => {
      let cashTotalValue = 0;
      const cashNames = new Set<string>();
      const stockTickers = new Set<string>();
      const stockShares: Record<string, number> = {};

      assets.forEach((asset) => {
        if (asset.type === "cash") {
          cashTotalValue += Number(asset.amount || 0);
          if (asset.name) cashNames.add(asset.name);
        } else if (asset.type === "stock" && asset.ticker) {
          stockTickers.add(asset.ticker);
          if (!stockShares[asset.ticker]) stockShares[asset.ticker] = 0;
          stockShares[asset.ticker] += Number(asset.shares || 0);
        }
      });

      let stockCurrentTotal = 0;
      const prices: Record<string, number> = {};
      const cache = readStockPriceCache(localStorage.getItem(STOCK_PRICE_CACHE_KEY)) || {};
      let cacheUpdated = false;
      let assetsUpdated = false;
      const nextAssets = [...assets];

      for (const ticker of Object.keys(stockShares)) {
        let price = 0;
        let name = "";
        const cached = getCachedPrice(cache, ticker);
        
        // 檢查快取是否新鮮
        const isFresh = isCacheFresh(cached, priceTtlMs);
        
        // 判斷是否需要更新名稱：如果當前資產裡任何一個名稱還是代號，就視為需要更新
        const needsNameUpdate = nextAssets.some(a => a.type === "stock" && a.ticker === ticker && (!a.name || a.name === ticker));
        
        // 如果快取新鮮 且 不需要更新名稱，才使用快取
        if (isFresh && cached && !needsNameUpdate) {
          price = cached.price;
          name = cached.name || "";
        } else {
          // 否則，去抓新的 (包含名稱)
          try {
            const yahooData = await fetchStockPriceFromYahoo(ticker);
            if (yahooData) {
              price = yahooData.price;
              name = yahooData.name;

              if (name && name !== ticker) {
                nextAssets.forEach((a, idx) => {
                  if (a.type === "stock" && a.ticker === ticker) {
                    // 只有當目前的名稱是空的，或者是原始代號時，才自動更新為 API 抓到的中文名
                    if (!a.name || a.name === ticker) {
                      nextAssets[idx] = { ...a, name: name };
                      assetsUpdated = true;
                    }
                  }
                });
              }
            }
          } catch (e) {
            console.warn(`[Yahoo API] ${ticker} 失敗`);
          }
          upsertCachedPrice(cache, ticker, price, name);
          cacheUpdated = true;
        }
        stockCurrentTotal += stockShares[ticker] * price;
        prices[ticker] = price;
      }

      const totalValue = cashTotalValue + stockCurrentTotal;

      if (!active) return;
      if (assetsUpdated) {
        setAssets(nextAssets);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAssets));
      }
      setCashTotal(cashTotalValue);
      setStockTotal(stockCurrentTotal);
      setTotal(totalValue);
      setCashCount(cashNames.size);
      setStockCount(stockTickers.size);
      setStockPrices(prices);
      setHasArchive(Boolean(localStorage.getItem(ARCHIVE_KEY)));
      setChartResetKey((prev) => prev + 1);

      if (cacheUpdated) {
        localStorage.setItem(STOCK_PRICE_CACHE_KEY, JSON.stringify(cache));
      }

      setHistory((prev) => {
        const next = recordTodayNetWorth(prev, totalValue);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        memoryCache.history = next;
        return next;
      });

      memoryCache.assets = assets;
      memoryCache.hasArchive = Boolean(localStorage.getItem(ARCHIVE_KEY));
    };

    const schedule =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 120);

    schedule(() => {
      run();
    });
    return () => {
      active = false;
    };
  }, [assets]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isReady) return;
    const stored = safeParse<Asset[]>(localStorage.getItem(STORAGE_KEY), []);
    if (assets.length === 0 && stored.length > 0) {
      setAssets(stored);
      setInitialLoadState(stored.length > 0 ? "hasData" : "empty");
      memoryCache.assets = stored;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    memoryCache.assets = assets;
  }, [assets, isReady]);

  useEffect(() => {
    const totalAsset = cashTotal + stockTotal;
    let cashPctValue = "0.0";
    let stockPctValue = "0.0";

    if (totalAsset > 0) {
      cashPctValue = ((cashTotal / totalAsset) * 100).toFixed(1);
      stockPctValue = ((stockTotal / totalAsset) * 100).toFixed(1);
    }

    const timer = window.setTimeout(() => {
      setCashPct(cashPctValue);
      setStockPct(stockPctValue);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [cashTotal, stockTotal]);

  const addAsset = useCallback(
    (payload: NewAssetPayload) => {
      const type = payload.type;
      const newRecord: Asset = { id: Date.now(), type };

      if (type === "cash") {
        newRecord.name = payload.name;
        newRecord.amount = Number(payload.amount || 0);
      } else {
        const ticker = payload.ticker.trim();
        newRecord.ticker = ticker;
        newRecord.name = ticker;
        newRecord.date = payload.date;
        newRecord.shares = Number(payload.shares || 0);
        newRecord.price = Number(payload.price || 0);
        newRecord.costAmount =
          Number(payload.shares || 0) * Number(payload.price || 0);
      }

      const nextAssets = [...assets, newRecord];
      setAssets(nextAssets);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAssets));
      memoryCache.assets = nextAssets;
      setNextAnimationMs(800);
    },
    [assets, setNextAnimationMs]
  );

  const updateAsset = useCallback(
    (id: number, payload: Partial<Asset>) => {
      const nextAssets = assets.map((a) => (a.id === id ? { ...a, ...payload } : a));
      setAssets(nextAssets);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAssets));
      memoryCache.assets = nextAssets;
      setNextAnimationMs(400);
    },
    [assets, setNextAnimationMs]
  );

  const removeAsset = useCallback(
    (id: number) => {
      const nextAssets = assets.filter((a) => a.id !== id);
      setAssets(nextAssets);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAssets));
      memoryCache.assets = nextAssets;
      setNextAnimationMs(600);
    },
    [assets, setNextAnimationMs]
  );

  const clearCurrentData = useCallback(async () => {
    const currentAssets = localStorage.getItem(STORAGE_KEY);
    const currentHistory = localStorage.getItem(HISTORY_KEY);

    if (currentAssets) localStorage.setItem(ARCHIVE_KEY, currentAssets);
    if (currentHistory) localStorage.setItem(HISTORY_ARCHIVE_KEY, currentHistory);

    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    setAssets([]);
    setHistory([]);
    memoryCache.assets = [];
    memoryCache.history = [];
    setNextAnimationMs(600);

    alert("✅ 資料已清空並備份！");
  }, [setNextAnimationMs]);

  const toggleClearData = useCallback(async () => {
    const confirmed = confirm("確定要清空所有資料嗎？\n\n資料將被備份。");
    if (confirmed) {
      await clearCurrentData();
    }
  }, [clearCurrentData, setNextAnimationMs]);

  const loadDemoData = useCallback(async () => {
    const confirmed = confirm(
      "載入示範資料將覆蓋目前的資料（如有）。\n\n示範資料包含：\n• 2 個銀行帳戶\n• 台積電投資紀錄\n\n確定要繼續嗎？"
    );
    if (!confirmed) return;

    setAssets(demoAssets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoAssets));
    memoryCache.assets = demoAssets;
    setNextAnimationMs(800);

    const demoHistory = buildDemoHistory();
    setHistory(demoHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(demoHistory));
    memoryCache.history = demoHistory;

    alert("✅ 示範資料載入完成！\n系統正在獲取台積電最新股價...");
  }, [setNextAnimationMs]);

  return {
    assets,
    history,
    stockPrices,
    cashTotal,
    stockTotal,
    total,
    animatedTotal,
    cashCount,
    stockCount,
    cashPct,
    stockPct,
    updatedAt,
    hasArchive,
    chartResetKey,
    isReady,
    initialLoadState,
    addAsset,
    updateAsset,
    removeAsset,
    toggleClearData,
    loadDemoData
  };
}
