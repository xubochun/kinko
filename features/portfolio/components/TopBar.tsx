"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Icon from "../../../components/Icon";

type Props = {
  onAdd?: () => void;
  privacy?: boolean;
  onTogglePrivacy?: () => void;
};

export default function TopBar({ onAdd, privacy, onTogglePrivacy }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const isInvestment = pathname.startsWith("/investment");
  const isSettings = pathname.startsWith("/settings");

  return (
    <div className="hidden md:block fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200/60">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          {/* Left: Navigation */}
          <div className="flex flex-1 items-center gap-2">
            <Link
              href="/"
              prefetch
              aria-label="首頁"
              title="首頁"
              className={`inline-flex items-center justify-center h-[32px] w-[32px] rounded-full transition ring-1 ring-black/[.06] ${isHome ? "bg-slate-900/10 text-slate-900" : "bg-white/80 text-gray-500 hover:text-slate-900 hover:bg-white hover:ring-slate-300"}`}
            >
              <Icon name="home" className="h-4 w-4" />
            </Link>
            <Link
              href="/investment"
              prefetch
              aria-label="存股"
              title="存股"
              className={`inline-flex items-center justify-center h-[32px] w-[32px] rounded-full transition ring-1 ring-black/[.06] ${isInvestment ? "bg-slate-900/10 text-slate-900" : "bg-white/80 text-gray-500 hover:text-slate-900 hover:bg-white hover:ring-slate-300"}`}
            >
              <Icon name="pie-chart" className="h-4 w-4" />
            </Link>
          </div>

          {/* Center: Logo */}
          <div className="flex flex-none items-center justify-center">
            <Link href="/" className="transition active:scale-95">
              <div className="h-8 w-8 rounded-full border border-slate-200 overflow-hidden bg-white shadow-sm ring-2 ring-white">
                <Image 
                  src="/logo.png" 
                  alt="kinko logo" 
                  width={32} 
                  height={32} 
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-1 items-center justify-end gap-2">
            {onTogglePrivacy ? (
              <button
                onClick={onTogglePrivacy}
                aria-label="隱私模式"
                aria-pressed={privacy}
                title={privacy ? "顯示金額" : "隱藏金額"}
                className={`inline-flex items-center justify-center rounded-full h-[32px] w-[32px] ring-1 ring-black/[.06] transition-all active:scale-[0.98] ${privacy ? "bg-slate-900 text-white ring-slate-900/20 hover:bg-slate-800" : "bg-white/80 text-gray-600 hover:bg-white hover:ring-slate-300"}`}
              >
                <Icon name={privacy ? "eye" : "eye-off"} className="h-4 w-4" />
              </button>
            ) : null}
            <Link
              href="/settings"
              prefetch
              aria-label="設定"
              title="設定"
              className={`inline-flex items-center justify-center rounded-full h-[32px] w-[32px] text-gray-700 ring-1 ring-black/[.06] transition-all active:scale-[0.98] ${isSettings ? "bg-slate-900/10" : "bg-white/80 hover:bg-white hover:ring-slate-300"}`}
            >
              <Icon name="settings" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
