"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon from "../../../components/Icon";

export default function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const isInvestment = pathname.startsWith("/investment");

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur border-t border-slate-200/60 pb-safe md:hidden">
      <div className="mx-auto max-w-[1024px] grid grid-cols-3 gap-1 px-4 py-2">
        <Link href="/" prefetch className={`group flex flex-col items-center justify-center w-full gap-1 ${isHome ? "text-slate-900" : "text-gray-400 hover:text-slate-900 transition-colors"}`}>
          <div className={`relative grid h-8 w-8 place-items-center rounded-xl transition-colors ${isHome ? "bg-slate-900/5" : "group-hover:bg-slate-900/5"}`}>
            <Icon name="home" className="h-[22px] w-[22px]" />
          </div>
          <span className="text-[10px] font-medium">首頁</span>
        </Link>
        <Link href="/investment" prefetch className={`group flex flex-col items-center justify-center w-full gap-1 ${isInvestment ? "text-slate-900" : "text-gray-400 hover:text-slate-900 transition-colors"}`}>
          <div className={`relative grid h-8 w-8 place-items-center rounded-xl transition-colors ${isInvestment ? "bg-slate-900/5" : "group-hover:bg-slate-900/5"}`}>
            <Icon name="pie-chart" className="h-[22px] w-[22px]" />
          </div>
          <span className="text-[10px] font-medium">存股</span>
        </Link>
        <Link href="/settings" prefetch className={`group flex flex-col items-center justify-center w-full gap-1 ${pathname.startsWith("/settings") ? "text-slate-900" : "text-gray-400 hover:text-slate-900 transition-colors"}`}>
          <div className={`relative grid h-8 w-8 place-items-center rounded-xl transition-colors ${pathname.startsWith("/settings") ? "bg-slate-900/5" : "group-hover:bg-slate-900/5"}`}>
            <Icon name="settings" className="h-[22px] w-[22px]" />
          </div>
          <span className="text-[10px] font-medium">設定</span>
        </Link>
      </div>
    </nav>
  );
}
