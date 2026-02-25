import React from "react";

type Props = {
  hasAssets: boolean;
  isReady: boolean;
  onAddAsset: () => void;
};

export default function EmptyStateWelcome({ hasAssets, isReady, onAddAsset }: Props) {
  return (
    <div id="emptyStateWelcome" className={`soft-card p-6 ${hasAssets || !isReady ? "hidden" : ""}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
          <span>新增任何資產後，總資產會立即顯示</span>
        </div>
        <div className="text-[18px] font-semibold text-gray-900">先新增一筆資產，立刻看到總資產與走勢圖</div>
        <div className="grid gap-2 sm:grid-cols-3 text-[12px] text-gray-600">
          <div className="step-chip">
            <span className="step-dot">1</span>新增現金或股票
          </div>
          <div className="step-chip">
            <span className="step-dot">2</span>自動抓取現價
          </div>
          <div className="step-chip">
            <span className="step-dot">3</span>生成淨值走勢
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={onAddAsset} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] active:scale-[0.98]">
            <i data-lucide="plus" className="h-5 w-5"></i>
            新增第一筆資產
          </button>
        </div>
      </div>
    </div>
  );
}
