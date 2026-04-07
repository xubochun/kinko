'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import BottomNav from '../../features/portfolio/components/BottomNav';
import Sidebar from '../../features/portfolio/components/Sidebar';
import Icon from '../../components/Icon';
import { useLucideIcons } from '../../features/portfolio/hooks/useLucideIcons';
import { usePortfolioData } from '../../features/portfolio/hooks/usePortfolioData';
import {
  HISTORY_KEY,
  STOCK_GOALS_SHARES_KEY,
  STORAGE_KEY,
} from '../../lib/storage';
import type { Asset } from '../../types/portfolio';
import PortfolioHeader from '../../features/portfolio/components/PortfolioHeader';

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

export default function SettingsPage() {
  useLucideIcons();
  const { toggleClearData, loadDemoData, isReady } = usePortfolioData({
    privacy: false,
  });
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isLocalhost =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const handleImport = async (file: File) => {
    setIsParsing(true);
    try {
      const rows = await parseCsv(file);
      if (!rows.length) {
        alert('未偵測到有效資料，請確認 CSV 格式。');
        return;
      }

      const assets: Asset[] = [];
      const now = Date.now();
      let cursor = 0;

      rows.forEach((row) => {
        const type = row.type?.toLowerCase();
        if (
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
        }
      });

      const confirmed = confirm('匯入會覆蓋目前資料，確定要繼續嗎？');
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
    event.target.value = '';
    if (!file) return;
    await handleImport(file);
  };

  if (!isReady) return null;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      <main className="flex-1 md:ml-64 relative z-10">
        <div className="w-full px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-20 md:pb-14">
          {/* Mobile Header */}
          <div className="md:hidden">
            <PortfolioHeader
              hasAssets={true}
              privacy={false}
              onAddAsset={() => {}}
              onTogglePrivacy={() => {}}
              onToggleClearData={() => {}}
            />
          </div>

          {/* Desktop Header */}
          <header className="mb-10 hidden md:block">
            <h1 className="text-[28px] font-black text-slate-900 tracking-tight">
              系統設定
            </h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">
              管理您的資產資料與應用程式偏好
            </p>
          </header>

          <div className="space-y-8">
            <section>
              <div className="mb-3 px-1 flex items-center gap-2">
                <Icon name="archive" className="h-4 w-4 text-slate-400" />
                <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  資料管理
                </span>
              </div>
              <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden">
                <button
                  onClick={triggerImport}
                  className="w-full flex items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                      <Icon name="file-up" className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[15px] font-bold text-slate-900">
                        匯入 CSV 資產清單
                      </div>
                      <div className="text-[12px] font-medium text-slate-500">
                        快速同步您的投資組合
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-slate-400">
                      {isParsing ? '正在匯入...' : ''}
                    </span>
                    <Icon
                      name="chevron-right"
                      className="h-5 w-5 text-slate-300"
                    />
                  </div>
                </button>

                <div className="h-px bg-slate-100 mx-6"></div>

                <div className="p-6">
                  <details className="group rounded-[24px] bg-slate-50/50 p-4 border border-slate-100">
                    <summary className="cursor-pointer list-none flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          name="search"
                          className="h-4 w-4 text-slate-400"
                        />
                        <span className="text-[12px] font-bold text-slate-600">
                          查看 CSV 格式範例與生成提示詞
                        </span>
                      </div>
                      <Icon
                        name="chevron-down"
                        className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <div className="mt-4">
                      <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-[11px] text-slate-300 font-mono leading-relaxed">{`type,name,ticker,date,shares,price,amount,goal
stock,台積電,2330,2024-01-05,20,600,0,
stock,聯發科,2454,2024-02-10,8,980,0,
stock,鴻海,2317,2024-03-12,30,170,0,`}</pre>
                      </div>
                      <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                        您可以直接將此範例貼給 AI (如
                        ChatGPT/Claude)，要求產出符合格式的投資清單 CSV。
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3 px-1 flex items-center gap-2">
                <Icon name="sparkles" className="h-4 w-4 text-slate-400" />
                <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  進階與實驗性功能
                </span>
              </div>
              <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden">
                {isLocalhost && (
                  <>
                    <button
                      onClick={loadDemoData}
                      className="w-full flex items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                          <Icon name="sparkles" className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="text-[15px] font-bold text-slate-900">
                            載入示範資料
                          </div>
                          <div className="text-[12px] font-medium text-slate-500">
                            快速預覽應用程式功能
                          </div>
                        </div>
                      </div>
                      <Icon
                        name="chevron-right"
                        className="h-5 w-5 text-slate-300"
                      />
                    </button>
                    <div className="h-px bg-slate-100 mx-6"></div>
                  </>
                )}

                <button
                  onClick={toggleClearData}
                  className="w-full flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 text-left transition hover:bg-rose-50 group"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-500 group-hover:bg-rose-100 transition-colors">
                      <Icon name="trash-2" className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[15px] font-bold text-rose-600">
                        重設所有資料
                      </div>
                      <div className="text-[12px] font-medium text-rose-400">
                        清空並從頭開始 (系統將自動備份)
                      </div>
                    </div>
                  </div>
                  <Icon
                    name="chevron-right"
                    className="h-5 w-5 text-rose-200"
                  />
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <BottomNav />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
