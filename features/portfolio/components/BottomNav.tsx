'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Icon from '../../../components/Icon';

type Props = {
  onAddAsset?: () => void;
};

export default function BottomNav({ onAddAsset: _onAddAsset }: Props) {
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '';
  const isInvestment = pathname.startsWith('/investment');
  const isSettings = pathname.startsWith('/settings');

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-slate-200/60 pb-safe z-40 md:hidden">
      <div className="mx-auto max-w-[1024px] grid grid-cols-3 gap-1 px-4 pt-2 pb-1">
        <Link
          href="/"
          prefetch
          className={`group flex flex-col items-center justify-center w-full gap-1 ${isHome ? 'text-slate-900' : 'text-gray-400 hover:text-slate-900 transition-colors'}`}
        >
          <div
            className={`relative grid h-8 w-8 place-items-center rounded-xl transition-colors ${isHome ? 'bg-slate-900/5' : 'group-hover:bg-slate-900/5'}`}
          >
            <Icon name="home" className="h-[22px] w-[22px]" />
          </div>
          <span className="text-[10px] font-bold">首頁</span>
        </Link>
        <Link
          href="/investment"
          prefetch
          className={`group flex flex-col items-center justify-center w-full gap-1 ${isInvestment ? 'text-slate-900' : 'text-gray-400 hover:text-slate-900 transition-colors'}`}
        >
          <div
            className={`relative grid h-8 w-8 place-items-center rounded-xl transition-colors ${isInvestment ? 'bg-slate-900/5' : 'group-hover:bg-slate-900/5'}`}
          >
            <Icon name="pie-chart" className="h-[22px] w-[22px]" />
          </div>
          <span className="text-[10px] font-bold">存股</span>
        </Link>
        <Link
          href="/settings"
          prefetch
          className={`group flex flex-col items-center justify-center w-full gap-1 ${isSettings ? 'text-slate-900' : 'text-gray-400 hover:text-slate-900 transition-colors'}`}
        >
          <div
            className={`relative grid h-8 w-8 place-items-center rounded-xl transition-colors ${isSettings ? 'bg-slate-900/5' : 'group-hover:bg-slate-900/5'}`}
          >
            <Icon name="settings" className="h-[22px] w-[22px]" />
          </div>
          <span className="text-[10px] font-bold">設定</span>
        </Link>
      </div>
    </nav>
  );
}
