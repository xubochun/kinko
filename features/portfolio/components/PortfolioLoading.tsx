import React from 'react';

interface PortfolioLoadingProps {
  onAdd: () => void;
}

export default function PortfolioLoading({
  onAdd: _onAdd,
}: PortfolioLoadingProps) {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200/60 z-30 shadow-sm animate-pulse">
        <div className="p-6 flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100"></div>
          <div className="h-6 w-20 bg-slate-100 rounded-lg"></div>
        </div>
        <nav className="flex-1 px-4 mt-4 space-y-4">
          <div className="h-10 w-full bg-slate-50 rounded-xl"></div>
          <div className="h-10 w-full bg-slate-50 rounded-xl"></div>
          <div className="h-10 w-full bg-slate-50 rounded-xl"></div>
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
          <div className="h-16 w-full bg-slate-50 rounded-2xl"></div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 relative z-10">
        <div className="w-full px-4 pb-28 pt-5 sm:px-6 sm:pt-7 md:px-10 md:pt-12 md:pb-14">
          <header className="mb-10 hidden md:flex items-end justify-between animate-pulse">
            <div className="space-y-2">
              <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
              <div className="h-4 w-56 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-10 w-40 bg-white border border-slate-200/60 rounded-xl"></div>
          </header>

          <div className="soft-card p-6 md:p-8 animate-pulse">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-slate-200 rounded-xl"></div>
                <div className="h-4 w-40 bg-slate-100 rounded-lg"></div>
              </div>
              <div className="space-y-3">
                <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
                <div className="h-4 w-40 bg-slate-100 rounded-lg"></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 mt-4">
                <div className="h-20 bg-slate-50 rounded-2xl border border-slate-200/40"></div>
                <div className="h-20 bg-slate-50 rounded-2xl border border-slate-200/40"></div>
                <div className="h-20 bg-slate-50 rounded-2xl border border-slate-200/40"></div>
              </div>
              <div className="h-40 w-full bg-slate-50 rounded-[32px] mt-4"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
