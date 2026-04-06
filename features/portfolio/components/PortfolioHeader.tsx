import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '../../../components/Icon';

type Props = {
  hasAssets: boolean;
  privacy: boolean;
  onAddAsset: () => void;
  onTogglePrivacy: () => void;
  onToggleClearData: () => void;
};

export default function PortfolioHeader({
  hasAssets: _hasAssets,
  privacy,
  onAddAsset,
  onTogglePrivacy,
  onToggleClearData: _onToggleClearData,
}: Props) {
  return (
    <header className="mb-10 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden ring-1 ring-black/[.06] bg-white shadow-sm flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="kinko logo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="leading-tight">
            <div className="text-[18px] font-black text-black tracking-tight">
              Kinko
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-1">
          <Link
            href="/"
            prefetch
            className="px-3 py-2 rounded-lg bg-slate-900/5 text-[13px] font-semibold text-slate-900"
          >
            首頁
          </Link>
          <Link
            href="/investment"
            prefetch
            className="px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-slate-900 hover:bg-slate-900/5 transition"
          >
            存股
          </Link>
          <Link
            href="#"
            className="px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-slate-900 hover:bg-slate-900/5 transition"
          >
            探索
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center">
          <button
            onClick={onAddAsset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] active:scale-[0.98]"
          >
            <Icon name="plus" className="h-4 w-4" />
            新增資產
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="privacyBtn"
            aria-label="隱私模式"
            aria-pressed={privacy}
            title={privacy ? '顯示金額' : '隱藏金額'}
            onClick={onTogglePrivacy}
            className={`inline-flex items-center justify-center rounded-full min-w-[44px] min-h-[44px] ring-1 ring-black/[.06] transition-all active:scale-[0.97] ${privacy ? 'bg-slate-900 text-white ring-slate-900/20 hover:bg-slate-800' : 'bg-white/70 text-gray-600 hover:bg-white hover:ring-slate-300'}`}
          >
            <i
              data-lucide={privacy ? 'eye' : 'eye-off'}
              className="h-[18px] w-[18px]"
            ></i>
          </button>
        </div>
      </div>
    </header>
  );
}
