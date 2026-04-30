import { useCallback, useEffect, useState } from 'react';
import type { Asset } from '../../../types/portfolio';
import { STORAGE_KEY, ARCHIVE_KEY } from '../../../lib/storage';

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export type NewAssetPayload =
  | {
      type: 'cash';
      name: string;
      amount: number;
      isInvestmentAccount?: boolean;
    }
  | {
      type: 'stock';
      ticker: string;
      date: string;
      shares: number;
      price: number;
      fundingSourceId?: number;
    };

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [initialLoadState, setInitialLoadState] = useState<
    'unknown' | 'empty' | 'hasData'
  >('unknown');
  const [hasArchive, setHasArchive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parsedAssets = safeParse<Asset[]>(
      localStorage.getItem(STORAGE_KEY),
      [],
    );
    setAssets(parsedAssets);
    setInitialLoadState(parsedAssets.length > 0 ? 'hasData' : 'empty');
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
    setHasArchive(Boolean(localStorage.getItem(ARCHIVE_KEY)));
    setIsReady(true);
  }, []);

  const saveAssets = useCallback((nextAssets: Asset[]) => {
    setAssets(nextAssets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAssets));
  }, []);

  const addAsset = useCallback((payload: NewAssetPayload) => {
    setAssets((prev) => {
      let nextAssets: Asset[] = [...prev];
      if (payload.type === 'cash') {
        const trimmedName = payload.name.trim();
        const existingIndex = prev.findIndex(
          (a) => a.type === 'cash' && a.name?.trim() === trimmedName,
        );
        if (existingIndex !== -1) {
          nextAssets = prev.map((a, i) =>
            i === existingIndex
              ? {
                  ...a,
                  amount: (a.amount || 0) + Number(payload.amount || 0),
                  isInvestmentAccount:
                    payload.isInvestmentAccount !== undefined
                      ? payload.isInvestmentAccount
                      : a.isInvestmentAccount,
                  updatedAt: Date.now(),
                }
              : a,
          );
        } else {
          nextAssets = [
            ...prev,
            {
              id: Date.now(),
              type: 'cash',
              name: trimmedName || '未命名帳戶',
              amount: Number(payload.amount || 0),
              isInvestmentAccount: payload.isInvestmentAccount,
              updatedAt: Date.now(),
            },
          ];
        }
      } else {
        const ticker = payload.ticker.trim().toUpperCase();
        const costAmount =
          Number(payload.shares || 0) * Number(payload.price || 0);

        // Deduct from cash if fundingSourceId is provided
        if (payload.fundingSourceId) {
          nextAssets = nextAssets.map((a) =>
            a.id === payload.fundingSourceId && a.type === 'cash'
              ? {
                  ...a,
                  amount: (a.amount || 0) - costAmount,
                  updatedAt: Date.now(),
                }
              : a,
          );
        }

        nextAssets = [
          ...nextAssets,
          {
            id: Date.now(),
            type: 'stock',
            ticker,
            name: ticker,
            date: payload.date,
            shares: Number(payload.shares || 0),
            price: Number(payload.price || 0),
            costAmount,
            fundingSourceId: payload.fundingSourceId,
            updatedAt: Date.now(),
          },
        ];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAssets));
      return nextAssets;
    });
  }, []);

  const updateAsset = useCallback((id: number, payload: Partial<Asset>) => {
    setAssets((prev) => {
      const nextAssets = prev.map((a) =>
        a.id === id ? { ...a, ...payload, updatedAt: Date.now() } : a,
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAssets));
      return nextAssets;
    });
  }, []);

  const removeAsset = useCallback((id: number) => {
    setAssets((prev) => {
      const nextAssets = prev.filter((a) => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAssets));
      return nextAssets;
    });
  }, []);

  return {
    assets,
    isReady,
    initialLoadState,
    hasArchive,
    setHasArchive,
    saveAssets,
    addAsset,
    updateAsset,
    removeAsset,
  };
}
