export type AssetType = 'cash' | 'stock';

export type Asset = {
  id: number;
  type: AssetType;
  name?: string;
  amount?: number;
  ticker?: string;
  date?: string;
  shares?: number;
  price?: number;
  costAmount?: number;
  updatedAt?: number;
  isInvestmentAccount?: boolean;
  fundingSourceId?: number;
};

export type HistoryEntry = {
  date: string;
  value: number;
};

export type RangeKey = '1W' | '1M' | '3M' | '1Y' | 'ALL';
