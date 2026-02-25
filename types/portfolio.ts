export type AssetType = "cash" | "stock";

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
};

export type HistoryEntry = {
  date: string;
  value: number;
};

export type RangeKey = "1m" | "3m" | "1y" | "all";
