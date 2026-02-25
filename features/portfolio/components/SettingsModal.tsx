import { useState } from "react";
import {
  HISTORY_KEY,
  STOCK_GOALS_SHARES_KEY,
  STORAGE_KEY
} from "../../../lib/storage";
import type { Asset } from "../../../types/portfolio";

type Props = {
  open: boolean;
  onClose: () => void;
};

type ParsedRow = {
  type: string;
  name?: string;
  ticker?: string;
  date?: string;
  shares?: number;
  price?: number;
  amount?: number;
  goal?: number;
};

const parseCsv = async (file: File): Promise<ParsedRow[]> => {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (key: string) => headers.indexOf(key);

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const get = (key: string) => {
      const i = idx(key);
      return i >= 0 ? cols[i] : "";
    };

    return {
      type: get("type"),
      name: get("name") || undefined,
      ticker: get("ticker") || undefined,
      date: get("date") || undefined,
      shares: Number(get("shares") || 0) || undefined,
      price: Number(get("price") || 0) || undefined,
      amount: Number(get("amount") || 0) || undefined,
      goal: Number(get("goal") || 0) || undefined
    };
  });
};

export default function SettingsModal({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleImport = async () => {
    if (!file) return;
    setIsParsing(true);

    try {
      const rows = await parseCsv(file);
      if (!rows.length) {
        alert("未偵測到有效資料，請確認 CSV 格式。");
        return;
      }

      const assets: Asset[] = [];
      const goals: Record<string, number> = {};
      const now = Date.now();
      let cursor = 0;

      rows.forEach((row) => {
        const type = row.type?.toLowerCase();
        if (type === "cash" && row.amount && row.name) {
          assets.push({
            id: now + cursor++,
            type: "cash",
            name: row.name,
            amount: Number(row.amount || 0)
          });
        } else if (type === "stock" && row.ticker && row.shares && row.price && row.date) {
          const ticker = row.ticker.trim();
          const shares = Number(row.shares || 0);
          const price = Number(row.price || 0);
          assets.push({
            id: now + cursor++,
            type: "stock",
            ticker,
            name: row.name || ticker,
            date: row.date,
            shares,
            price,
            costAmount: shares * price
          });
        } else if (type === "goal" && row.ticker && row.goal) {
          goals[row.ticker.trim()] = Number(row.goal || 0);
        }
      });

      const confirmed = confirm("匯入會覆蓋目前資料，確定要繼續嗎？");
      if (!confirmed) return;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
      localStorage.setItem(STOCK_GOALS_SHARES_KEY, JSON.stringify(goals));
      localStorage.setItem(HISTORY_KEY, JSON.stringify([]));

      window.location.reload();
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end md:items-center justify-center ${open ? "modal-enter-active" : "modal-enter"}`}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>

      <div className={`relative w-full bg-white rounded-t-3xl md:rounded-3xl p-6 pb-8 md:pb-6 sm:max-w-sm md:max-w-md mx-auto shadow-2xl ${open ? "sheet-enter-active" : "sheet-enter"}`}>
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

        <button onClick={onClose} className="hidden md:block absolute top-4 right-4 h-9 w-9 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
          <i data-lucide="x" className="h-5 w-5"></i>
        </button>

        <h3 className="text-[18px] font-semibold text-gray-900 mb-4 text-center md:text-left">設定</h3>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="text-[13px] font-semibold text-gray-900">匯入資料 (CSV)</div>
            <div className="mt-1 text-[12px] text-gray-500">
              欄位：`type,name,ticker,date,shares,price,amount,goal`
            </div>
            <div className="mt-3 text-[11px] text-gray-500 leading-relaxed">
              type = cash/stock/goal<br />
              cash：name + amount<br />
              stock：ticker + date + shares + price (name 可選)<br />
              goal：ticker + goal
            </div>
            <input
              type="file"
              accept=".csv"
              className="mt-3 w-full text-[12px] text-gray-600"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={handleImport}
              disabled={!file || isParsing}
              className={`mt-4 w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition ${file ? "bg-[#2563EB] hover:bg-[#1d4ed8]" : "bg-slate-300 cursor-not-allowed"}`}
            >
              {isParsing ? "匯入中..." : "開始匯入"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
