"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import TopBar from "../../features/portfolio/components/TopBar";
import BottomNav from "../../features/portfolio/components/BottomNav";
import Icon from "../../components/Icon";
import { useLucideIcons } from "../../features/portfolio/hooks/useLucideIcons";
import { usePortfolioData } from "../../features/portfolio/hooks/usePortfolioData";
import {
  HISTORY_KEY,
  STOCK_GOALS_SHARES_KEY,
  STORAGE_KEY
} from "../../lib/storage";
import type { Asset } from "../../types/portfolio";

type ParsedRow = {
  type: string;
  name?: string;
  ticker?: string;
  date?: string;
  shares?: number;
  price?: number;
  amount?: number;
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

export default function SettingsPage() {
  useLucideIcons();
  const { toggleClearData, loadDemoData } = usePortfolioData({ privacy: false });
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isLocalhost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  const handleImport = async (file: File) => {
    setIsParsing(true);
    try {
  const rows = await parseCsv(file);
      if (!rows.length) {
        alert("未偵測到有效資料，請確認 CSV 格式。");
        return;
      }

      const assets: Asset[] = [];
      const now = Date.now();
      let cursor = 0;

      rows.forEach((row) => {
        const type = row.type?.toLowerCase();
        if (type === "stock" && row.ticker && row.shares && row.price && row.date) {
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
        }
      });

      const confirmed = confirm("匯入會覆蓋目前資料，確定要繼續嗎？");
      if (!confirmed) return;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
      localStorage.setItem(STOCK_GOALS_SHARES_KEY, JSON.stringify({}));
      localStorage.setItem(HISTORY_KEY, JSON.stringify([]));

      window.location.reload();
    } finally {
      setIsParsing(false);
    }
  };

  const triggerImport = () => {
    if (isParsing) return;
    fileInputRef.current?.click();
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await handleImport(file);
  };

  return (
    <main className="min-h-screen relative z-10">
      <TopBar />
      <div className="mx-auto max-w-[720px] px-4 pb-28 pt-6 sm:px-6 sm:pt-8 md:pt-16 md:pb-14">
        <div className="mb-4">
          <h1 className="text-[18px] font-semibold text-slate-900">設定</h1>
        </div>

        <section className="mb-6">
          <div className="mb-2 text-[11px] font-semibold text-slate-500">資料</div>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <button
              onClick={triggerImport}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon name="file-up" className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-slate-900">匯入 CSV</div>
                  <div className="text-[11px] text-slate-500">會覆蓋目前資料</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">{isParsing ? "匯入中..." : ""}</div>
            </button>

            <div className="px-4 pb-3 text-[12px] text-slate-500">
              <details className="group rounded-xl bg-slate-50/70 p-3 ring-1 ring-black/[.04]">
                <summary className="cursor-pointer list-none text-[11px] font-semibold text-slate-600">
                  查看 CSV 生成提示詞
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-[11px] text-slate-600">{`請產出一份 CSV，僅包含股票資料，欄位固定為：
type,name,ticker,date,shares,price,amount,goal

規則：
- type 只能是 stock
- stock 需要 ticker、date(YYYY-MM-DD)、shares、price，name 可選
- 其他欄位請留空

Excel 範例：
type,name,ticker,date,shares,price,amount,goal
stock,台積電,2330,2024-01-05,20,600,0,
stock,聯發科,2454,2024-02-10,8,980,0,
stock,鴻海,2317,2024-03-12,30,170,0,
stock,中華電,2412,2024-04-20,15,120,0,`}</pre>
              </details>
            </div>

          </div>
        </section>

        <section>
          <div className="mb-2 text-[11px] font-semibold text-slate-500">其他</div>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {isLocalhost ? (
              <>
                <button
                  onClick={loadDemoData}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      <Icon name="sparkles" className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">載入示範資料</div>
                      <div className="text-[11px] text-slate-500">僅限本機環境</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400"></div>
                </button>
                <div className="h-px bg-slate-100"></div>
              </>
            ) : null}

            <button
              onClick={toggleClearData}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-rose-50"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon name="archive" className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-rose-700">清空資料</div>
                  <div className="text-[11px] text-rose-500">清空後會保留備份</div>
                </div>
              </div>
              <div className="text-[11px] text-rose-400"></div>
            </button>
          </div>
        </section>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      <BottomNav />
    </main>
  );
}
