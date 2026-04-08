'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Icon from '../../../components/Icon';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: '首頁', href: '/', icon: 'home' as const },
    { name: '存股', href: '/investment', icon: 'pie-chart' as const },
    { name: '設定', href: '/settings', icon: 'settings' as const },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-100 z-30">
      <div className="p-8 flex items-center gap-3">
        <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden bg-white flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="kinko logo"
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-[18px] font-black text-black tracking-tight">
          Kinko
        </span>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1">
        <div className="px-4 mb-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
          選單
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-slate-50 text-slate-900 ring-1 ring-slate-900/5'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                name={item.icon}
                className={`h-5 w-5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[12px] font-bold">
            U
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-slate-900 truncate">
              我的帳戶
            </div>
            <div className="text-[11px] text-slate-400">免費版</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
