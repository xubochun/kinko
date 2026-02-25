import HiddenAmount from "../../../components/HiddenAmount";
import { currency } from "../../../lib/format";

type Props = {
  hasAssets: boolean;
  isReady: boolean;
  cashPct: string;
  stockPct: string;
  cashCount: number;
  stockCount: number;
  cashTotal: number;
  stockTotal: number;
  privacy: boolean;
  onOpenDetail: (type: "cash" | "stock") => void;
  onAddAsset: () => void;
};

export default function AssetStructureSection({
  hasAssets,
  isReady,
  cashPct,
  stockPct,
  cashCount,
  stockCount,
  cashTotal,
  stockTotal,
  privacy,
  onOpenDetail,
  onAddAsset
}: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between"></div>

      <div id="assetStructureContent" className="flex flex-col gap-3 sm:gap-4">
        <div className={`w-full ${hasAssets ? "" : "hidden"}`}>
          <div className="mb-5">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div id="cashBar" className="bg-slate-800 transition-all duration-500" style={{ width: `${cashPct}%` }} title="現金"></div>
              <div id="stockBar" className="bg-[#2563EB] transition-all duration-500" style={{ width: `${stockPct}%` }} title="股票"></div>
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-medium text-gray-500">
              <span>現金 <span id="cashPct" className="font-semibold text-slate-800">{cashPct}%</span></span>
              <span>股票現值 <span id="stockPct" className="font-semibold text-[#2563EB]">{stockPct}%</span></span>
            </div>
          </div>

          <button onClick={() => onOpenDetail("cash")} className="w-full group mb-3 flex items-center justify-between gap-4 border-b border-gray-100 pb-3 min-h-[32px] transition-opacity hover:opacity-70">
            <div className="flex flex-1 min-w-0 items-center gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-800">
                <i data-lucide="banknote" className="h-4 w-4 text-white"></i>
              </div>
              <div className="text-[13px] font-semibold text-gray-500 truncate text-left">
                現金 <span id="cashCount" className="text-[11px] font-normal text-gray-400 ml-1">{cashCount} 個帳戶</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div id="cashValue" className="tabular-nums shrink-0 text-right text-[16px] font-semibold text-gray-900 transition-all duration-300 min-h-[1.3em] leading-[1.2] min-w-[96px]">
                {privacy ? <HiddenAmount sizeClass="h-3.5 w-3.5" justifyClass="justify-end" heightClass="h-[1.2em]" lineHeightClass="leading-[1.2]" minWidthClass="min-w-[96px]" /> : currency(cashTotal)}
              </div>
              <i data-lucide="chevron-right" className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5"></i>
            </div>
          </button>

          <button onClick={() => onOpenDetail("stock")} className="w-full group flex items-center justify-between gap-4 min-h-[32px] transition-opacity hover:opacity-70">
            <div className="flex flex-1 min-w-0 items-center gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#2563EB]">
                <i data-lucide="candlestick-chart" className="h-4 w-4 text-white"></i>
              </div>
              <div className="text-[13px] font-semibold text-gray-500 truncate text-left">
                股票 <span id="stockCount" className="text-[11px] font-normal text-gray-400 ml-1">{stockCount} 檔標的</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div id="stockValue" className="tabular-nums shrink-0 text-right text-[16px] font-semibold text-gray-900 transition-all duration-300 min-h-[1.3em] leading-[1.2] min-w-[96px]">
                {privacy ? <HiddenAmount sizeClass="h-3.5 w-3.5" justifyClass="justify-end" heightClass="h-[1.2em]" lineHeightClass="leading-[1.2]" minWidthClass="min-w-[96px]" /> : currency(stockTotal)}
              </div>
              <i data-lucide="chevron-right" className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5"></i>
            </div>
          </button>
        </div>

        <div id="emptyStateStructure" className={`w-full text-center ${hasAssets || !isReady ? "hidden" : ""}`}>
          <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-slate-50 ring-1 ring-black/[.04] mb-3">
            <i data-lucide="pie-chart" className="h-6 w-6 text-gray-300"></i>
          </div>
          <div className="text-[14px] font-semibold text-gray-900 mb-1">資產配置概覽</div>
          <div className="text-[12px] text-gray-500 leading-relaxed">
            新增資產後，這裡將顯示您的現金與股票配置比例
          </div>
        </div>

        <button
          onClick={onAddAsset}
          className={`md:hidden w-full mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-slate-800 ${!isReady ? "hidden" : ""}`}
        >
          新增資產
        </button>
      </div>
    </section>
  );
}
