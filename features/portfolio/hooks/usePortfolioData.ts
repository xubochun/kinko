import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAnimatedTotal } from './useAnimatedTotal';
import { useAssets, type NewAssetPayload } from './useAssets';
import { useStockPrices } from './useStockPrices';
import { useNetWorthHistory } from './useNetWorthHistory';
import {
  ARCHIVE_KEY,
  DIVIDENDS_KEY,
  HISTORY_ARCHIVE_KEY,
  HISTORY_KEY,
  NETWORTH_GOAL_KEY,
  STOCK_GOALS_SHARES_KEY,
  STOCK_PRICE_CACHE_KEY,
  STORAGE_KEY,
} from '../../../lib/storage';
import { demoAssets } from '../lib/demoAssets';
import { buildDemoHistory } from '../lib/demoHistory';
import type { Asset } from '../../../types/portfolio';

type UsePortfolioDataOptions = {
  privacy: boolean;
};

export type { NewAssetPayload };

export function usePortfolioData({ privacy }: UsePortfolioDataOptions) {
  const {
    assets,
    isReady,
    initialLoadState,
    hasArchive,
    setHasArchive,
    saveAssets,
    addAsset: addAssetBase,
    updateAsset: updateAssetBase,
    removeAsset: removeAssetBase,
  } = useAssets();

  // Extract unique stock tickers for the query
  const uniqueTickers = useMemo(() => {
    const tickers = new Set<string>();
    assets.forEach((a) => {
      if (a.type === 'stock' && a.ticker) tickers.add(a.ticker);
    });
    return Array.from(tickers);
  }, [assets]);

  const queryClient = useQueryClient();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    stockPrices,
    stockNames,
    isLoading: isPricesLoading,
    isFetching: isPricesFetching,
  } = useStockPrices(uniqueTickers);

  const isRefreshing = isPricesFetching || isManualRefreshing;

  const refreshData = useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['stockPrice'] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsManualRefreshing(false);
    }
  }, [queryClient]);

  const [cashTotal, setCashTotal] = useState(0);
  const [stockTotal, setStockTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [cashCount, setCashCount] = useState(0);
  const [stockCount, setStockCount] = useState(0);
  const [cashPct, setCashPct] = useState('0.0');
  const [stockPct, setStockPct] = useState('0.0');
  const [chartResetKey, setChartResetKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState('');

  const { animatedTotal, setNextAnimationMs } = useAnimatedTotal(
    total,
    privacy,
  );
  const { history, saveHistory } = useNetWorthHistory(
    total,
    isReady && !isPricesLoading,
  );

  // Sync names fetched from Yahoo into local storage assets
  useEffect(() => {
    let changed = false;
    const nextAssets = assets.map((a) => {
      if (a.type === 'stock' && a.ticker && stockNames[a.ticker]) {
        if (
          (!a.name || a.name === a.ticker) &&
          a.name !== stockNames[a.ticker]
        ) {
          changed = true;
          return { ...a, name: stockNames[a.ticker] };
        }
      }
      return a;
    });
    if (changed) {
      saveAssets(nextAssets);
    }
  }, [assets, stockNames, saveAssets]);

  // Derived state calculations
  useEffect(() => {
    let cashTotalValue = 0;
    const cashNames = new Set<string>();
    const stockTickers = new Set<string>();
    const stockShares: Record<string, number> = {};

    assets.forEach((asset) => {
      if (asset.type === 'cash') {
        cashTotalValue += Number(asset.amount || 0);
        if (asset.name) cashNames.add(asset.name);
      } else if (asset.type === 'stock' && asset.ticker) {
        stockTickers.add(asset.ticker);
        if (!stockShares[asset.ticker]) stockShares[asset.ticker] = 0;
        stockShares[asset.ticker] += Number(asset.shares || 0);
      }
    });

    let stockCurrentTotal = 0;
    for (const ticker of Object.keys(stockShares)) {
      const price = stockPrices[ticker] || 0;
      stockCurrentTotal += stockShares[ticker] * price;
    }

    const totalValue = cashTotalValue + stockCurrentTotal;

    setCashTotal(cashTotalValue);
    setStockTotal(stockCurrentTotal);
    setTotal(totalValue);
    setCashCount(cashNames.size);
    setStockCount(stockTickers.size);
    setChartResetKey((prev) => prev + 1);

    if (totalValue > 0) {
      setCashPct(((cashTotalValue / totalValue) * 100).toFixed(1));
      setStockPct(((stockCurrentTotal / totalValue) * 100).toFixed(1));
    } else {
      setCashPct('0.0');
      setStockPct('0.0');
    }

    if (!isPricesLoading) {
      setUpdatedAt(
        new Date().toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    }
  }, [assets, stockPrices, isPricesLoading]);

  const addAsset = useCallback(
    (payload: NewAssetPayload) => {
      addAssetBase(payload);
      setNextAnimationMs(800);
    },
    [addAssetBase, setNextAnimationMs],
  );

  const updateAsset = useCallback(
    (id: number, payload: Partial<Asset>) => {
      updateAssetBase(id, payload);
      setNextAnimationMs(400);
    },
    [updateAssetBase, setNextAnimationMs],
  );

  const removeAsset = useCallback(
    (id: number) => {
      removeAssetBase(id);
      setNextAnimationMs(600);
    },
    [removeAssetBase, setNextAnimationMs],
  );

  const clearCurrentData = useCallback(async () => {
    const currentAssets = localStorage.getItem(STORAGE_KEY);
    const currentHistory = localStorage.getItem(HISTORY_KEY);

    if (currentAssets) localStorage.setItem(ARCHIVE_KEY, currentAssets);
    if (currentHistory)
      localStorage.setItem(HISTORY_ARCHIVE_KEY, currentHistory);

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(STOCK_GOALS_SHARES_KEY);
    localStorage.removeItem(NETWORTH_GOAL_KEY);
    localStorage.removeItem(STOCK_PRICE_CACHE_KEY);
    localStorage.removeItem(DIVIDENDS_KEY);

    saveAssets([]);
    saveHistory([]);
    setHasArchive(false);
    setNextAnimationMs(600);

    alert('✅ 所有資料已徹底清除並完成備份！');
    window.location.reload();
  }, [saveAssets, saveHistory, setHasArchive, setNextAnimationMs]);

  const toggleClearData = useCallback(async () => {
    const confirmed = confirm('確定要清空所有資料嗎？\n\n資料將被備份。');
    if (confirmed) {
      await clearCurrentData();
    }
  }, [clearCurrentData]);

  const loadDemoData = useCallback(async () => {
    const confirmed = confirm(
      '載入示範資料將覆蓋目前的資料（如有）。\n\n示範資料包含：\n• 2 個銀行帳戶\n• 台積電投資紀錄\n\n確定要繼續嗎？',
    );
    if (!confirmed) return;

    saveAssets(demoAssets as Asset[]);
    setNextAnimationMs(800);

    const dh = buildDemoHistory();
    saveHistory(dh);

    alert('✅ 示範資料載入完成！\n系統正在獲取台積電最新股價...');
  }, [saveAssets, saveHistory, setNextAnimationMs]);

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
    loadDemoData,
    isRefreshing,
    refreshData,
  };
}
