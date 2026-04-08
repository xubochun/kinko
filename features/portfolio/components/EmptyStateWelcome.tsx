import React from 'react';
import Icon from '../../../components/Icon';

type Props = {
  hasAssets: boolean;
  isReady: boolean;
  onAddAsset: () => void;
};

export default function EmptyStateWelcome({
  hasAssets,
  isReady,
  onAddAsset,
}: Props) {
  if (!isReady || hasAssets) return null;

  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center animate-in fade-in duration-500">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Icon name="plus" className="h-6 w-6" />
      </div>
      <h3 className="mb-1 text-[15px] font-black text-slate-900">
        尚未建立投資組合
      </h3>
      <p className="mb-6 text-[13px] font-medium text-slate-400">
        點擊下方按鈕開始記錄您的第一筆資產。
      </p>
      <button
        onClick={onAddAsset}
        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-900/10"
      >
        <Icon name="plus" className="h-4 w-4" />
        開始新增
      </button>
    </div>
  );
}
