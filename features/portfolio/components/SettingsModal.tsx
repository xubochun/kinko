import { useState } from 'react';
import {
  HISTORY_KEY,
  STOCK_GOALS_SHARES_KEY,
  STORAGE_KEY,
} from '../../../lib/storage';
import type { Asset } from '../../../types/portfolio';
import Icon from '../../../components/Icon';

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

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = (key: string) => headers.indexOf(key);

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const get = (key: string) => {
      const i = idx(key);
      return i >= 0 ? cols[i] : '';
    };

    return {
      type: get('type'),
      name: get('name') || undefined,
      ticker: get('ticker') || undefined,
      date: get('date') || undefined,
      shares: Number(get('shares') || 0) || undefined,
      price: Number(get('price') || 0) || undefined,
      amount: Number(get('amount') || 0) || undefined,
      goal: Number(get('goal') || 0) || undefined,
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
        alert('未偵測到有效資料，請確認 CSV 格式。');
        return;
      }

      const assets: Asset[] = [];
      const goals: Record<string, number> = {};
      const now = Date.now();
      let cursor = 0;

      rows.forEach((row) => {
        const type = row.type?.toLowerCase();
        if (type === 'cash' && row.amount && row.name) {
          assets.push({
            id: now + cursor++,
            type: 'cash',
            name: row.name,
            amount: Number(row.amount || 0),
          });
        } else if (
          type === 'stock' &&
          row.ticker &&
          row.shares &&
          row.price &&
          row.date
        ) {
          const ticker = row.ticker.trim();
          const shares = Number(row.shares || 0);
          const price = Number(row.price || 0);
          assets.push({
            id: now + cursor++,
            type: 'stock',
            ticker,
            name: row.name || ticker,
            date: row.date,
            shares,
            price,
            costAmount: shares * price,
          });
        } else if (type === 'goal' && row.ticker && row.goal) {
          goals[row.ticker.trim()] = Number(row.goal || 0);
        }
      });

      const confirmed = confirm('匯入會覆蓋目前資料，確定要繼續嗎？');
      if (!confirmed) return;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
      localStorage.setItem(STOCK_GOALS_SHARES_KEY, JSON.stringify(goals));
      localStorage.setItem(HISTORY_KEY, JSON.stringify([]));

      window.location.reload();
    } finally {
      setIsParsing(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-end md:items-center justify-center`}
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      <div
        className={`relative w-full bg-white rounded-t-[32px] md:rounded-[32px] p-8 pb-10 md:pb-8 sm:max-w-md mx-auto shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300`}
      >
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 md:hidden"></div>

        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[20px] font-black text-slate-900 tracking-tight">
            系統設定
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-6">
            <div className="text-[15px] font-black text-slate-900 mb-1">
              匯入資料 (CSV)
            </div>
            <p className="text-[12px] font-medium text-slate-400 leading-relaxed mb-4">
              欄位：`type,name,ticker,date,shares,price,amount,goal`
            </p>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                欄位說明
              </div>
              <div className="text-[11px] font-bold text-slate-500 space-y-1">
                <div>• cash：name, amount</div>
                <div>• stock：ticker, date, shares, price</div>
                <div>• goal：ticker, goal</div>
              </div>
            </div>

            <input
              type="file"
              accept=".csv"
              className="w-full text-[13px] text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[12px] file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button
              onClick={handleImport}
              disabled={!file || isParsing}
              className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-black text-white transition-all shadow-xl ${file ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10 active:scale-[0.98]' : 'bg-slate-200 cursor-not-allowed shadow-none'}`}
            >
              {isParsing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  <Icon name="file-up" className="h-4 w-4" />
                  開始匯入資料
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
