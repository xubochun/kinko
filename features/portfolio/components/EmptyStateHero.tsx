type Props = {
  onAddAsset: () => void;
};

export default function EmptyStateHero({ onAddAsset }: Props) {
  return (
    <section
      id="emptyStateHero"
      className="soft-card relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12 bg-gradient-to-br from-white via-slate-50/70 to-white"
    >
      <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-slate-100/70 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-slate-100/60 blur-3xl"></div>

      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="flex flex-col gap-5 text-center lg:text-left">
          <div className="text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-gray-900">
            先新增一筆資產，馬上看到整體淨值與趨勢
          </div>
          <p className="text-[14px] sm:text-[15px] text-gray-600 leading-relaxed">
            用最少的輸入，快速掌握現金與股票配置；系統會自動幫你整理走勢與變化。
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center lg:justify-start">
            <button
              onClick={onAddAsset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] active:scale-[0.98]"
            >
              <i data-lucide="plus" className="h-5 w-5"></i>
              新增第一筆資產
            </button>
            <button
              onClick={onAddAsset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/90 px-5 py-3 text-[13px] font-semibold text-gray-700 ring-1 ring-black/[.06] transition hover:bg-white active:scale-[0.98]"
            >
              <i data-lucide="pie-chart" className="h-4 w-4"></i>
              我想先新增股票
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5 text-slate-700">
                <i data-lucide="wallet" className="h-4 w-4"></i>
              </span>
              3 步驟完成建立
            </div>
            <div className="mt-3 grid gap-2 text-[12px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="step-dot">1</span>新增現金或股票
              </div>
              <div className="flex items-center gap-2">
                <span className="step-dot">2</span>自動抓取現價
              </div>
              <div className="flex items-center gap-2">
                <span className="step-dot">3</span>生成淨值走勢
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5 text-slate-700">
                <i data-lucide="line-chart" className="h-4 w-4"></i>
              </span>
              自動整理重點
            </div>
            <p className="mt-2 text-[12px] text-slate-500 leading-relaxed">
              系統會把淨值走勢與資產配置整理成一目了然的視覺化資訊。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
