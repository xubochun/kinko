'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import BottomNav from '../../features/portfolio/components/BottomNav';
import Sidebar from '../../features/portfolio/components/Sidebar';
import PortfolioHeader from '../../features/portfolio/components/PortfolioHeader';
import AddAssetModal from '../../features/portfolio/components/AddAssetModal';
import Icon from '../../components/Icon';
import {
  HISTORY_KEY,
  STOCK_GOALS_SHARES_KEY,
  STORAGE_KEY,
} from '../../lib/storage';
import { Asset } from '../../types/portfolio';
import { useLucideIcons } from '../../features/portfolio/hooks/useLucideIcons';
import { usePortfolioData } from '../../features/portfolio/hooks/usePortfolioData';

export default function SettingsPage() {
  useLucideIcons();
  const { toggleClearData, assets, addAsset } = usePortfolioData({
    privacy: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setIsParsing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleAddModal = () => setModalOpen((prev) => !prev);

  const isLocalhost =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const triggerImport = () => fileInputRef.current?.click();

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        alert('CSV 格式錯誤或無資料');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(',').map((c) => c.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => (row[h] = cols[i]));
        return row;
      });

      const newAssets: Omit<Asset, 'id'>[] = [];
      const newGoals: Record<string, number> = {};
      const now = Date.now();

      rows.forEach((row, _idx) => {
        if (row.type === 'cash') {
          newAssets.push({
            type: 'cash',
            name: row.name || '未命名帳戶',
            amount: Number(row.amount || 0),
          });
        } else if (row.type === 'stock') {
          newAssets.push({
            type: 'stock',
            ticker: row.ticker,
            name: row.name || row.ticker,
            date: row.date,
            shares: Number(row.shares || 0),
            price: Number(row.price || 0),
            costAmount: Number(row.shares || 0) * Number(row.price || 0),
          });
        } else if (row.type === 'goal') {
          newGoals[row.ticker] = Number(row.goal || 0);
        }
      });

      if (confirm('匯入將覆蓋現有資料，確定要繼續嗎？')) {
        // Apply IDs
        const finalAssets: Asset[] = newAssets.map((a, i) => ({
          ...a,
          id: now + i,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalAssets));
        localStorage.setItem(STOCK_GOALS_SHARES_KEY, JSON.stringify(newGoals));
        localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert('匯入失敗');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const loadDemoData = async () => {
    if (confirm('將載入範例資料並覆蓋現有資料，確定嗎？')) {
      const { demoAssets } =
        await import('../../features/portfolio/lib/demoAssets');
      const { buildDemoHistory } =
        await import('../../features/portfolio/lib/demoHistory');

      const demoHistory = buildDemoHistory();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoAssets));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(demoHistory));
      localStorage.setItem(STOCK_GOALS_SHARES_KEY, JSON.stringify({}));
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar onAddAsset={toggleAddModal} />

      <main className="flex-1 md:ml-64 relative z-10">
        <div className="w-full px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-12 md:pb-12 text-left">
          {/* Mobile Header */}
          <div className="md:hidden">
            <PortfolioHeader
              hasAssets={assets.length > 0}
              privacy={false}
              onTogglePrivacy={() => {}}
            />
          </div>

          <header className="mb-10 hidden md:block">
            <h1 className="text-[26px] font-black text-slate-900 tracking-tight">
              系統設定
            </h1>
            <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Data Management & System
            </p>
          </header>

          <div className="max-w-xl space-y-6">
            <section className="space-y-3">
              <div className="px-1 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Data Operations
              </div>
              <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden">
                <button
                  onClick={triggerImport}
                  className="w-full flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 text-left transition hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon name="file-up" className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-slate-900">
                        匯入 CSV 資料
                      </div>
                      <div className="text-[12px] font-medium text-slate-400">
                        支援現金、持股與目標匯入
                      </div>
                    </div>
                  </div>
                  <Icon
                    name="chevron-right"
                    className="h-5 w-5 text-slate-300"
                  />
                </button>

                {isLocalhost && (
                  <>
                    <div className="h-px bg-slate-100 mx-6"></div>
                    <button
                      onClick={loadDemoData}
                      className="w-full flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 text-left transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                          <Icon name="sparkles" className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-[15px] font-bold text-slate-900">
                            載入範例測試資料
                          </div>
                          <div className="text-[12px] font-medium text-slate-400">
                            僅在本地開發環境顯示
                          </div>
                        </div>
                      </div>
                      <Icon
                        name="chevron-right"
                        className="h-5 w-5 text-slate-300"
                      />
                    </button>
                  </>
                )}

                <div className="h-px bg-slate-100 mx-6"></div>
                <button
                  onClick={toggleClearData}
                  className="w-full flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 text-left transition hover:bg-rose-50 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <Icon name="trash-2" className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-slate-900">
                        清空所有資料
                      </div>
                      <div className="text-[12px] font-medium text-slate-400">
                        此操作無法復原，請謹慎使用
                      </div>
                    </div>
                  </div>
                  <Icon
                    name="chevron-right"
                    className="h-5 w-5 text-slate-300 group-hover:text-rose-300"
                  />
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <div className="px-1 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                About
              </div>
              <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-slate-200/60 shadow-sm p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center mb-4 shadow-xl shadow-slate-900/20">
                    <span className="text-white text-[24px] font-black">K</span>
                  </div>
                  <div className="text-[18px] font-black text-slate-900">
                    Kinko Portfolio
                  </div>
                  <div className="text-[13px] font-bold text-slate-400 mt-1">
                    v1.0.0
                  </div>
                  <p className="text-[13px] font-medium text-slate-500 mt-4 leading-relaxed max-w-[280px]">
                    極簡、私密且強大的個人資產追蹤工具。所有資料均儲存於您的瀏覽器中。
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <BottomNav onAddAsset={toggleAddModal} />

      <AddAssetModal
        open={modalOpen}
        onClose={toggleAddModal}
        onAddAsset={addAsset}
      />

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
