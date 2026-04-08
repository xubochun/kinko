import {
  currency,
  formatPnlAmount,
  formatPnlPct,
  pnlClass,
} from '../../../../lib/format';
import HiddenAmount from '../../../../components/HiddenAmount';
import Icon from '../../../../components/Icon';
import { Asset } from '../../../../types/portfolio';

interface StockDetail {
  ticker: string;
  name: string;
  totalShares: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
}

interface CashBreakdownProps {
  privacy: boolean;
  cashAssets: Asset[];
  cashCount: number;
  onAddAsset: (type: 'cash' | 'stock') => void;
}

interface StockBreakdownProps {
  privacy: boolean;
  stockDetails: StockDetail[];
  onAddAsset: (type: 'cash' | 'stock') => void;
}

export const CashBreakdown = ({
  privacy,
  cashAssets,
  cashCount,
  onAddAsset,
}: CashBreakdownProps) => (
  <section className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-200 shadow-sm h-full text-left">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Icon name="banknote" className="h-4 w-4 text-slate-400" />
        <h3 className="text-[14px] font-black text-slate-900">現金明細</h3>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-slate-400">
          {cashCount} 帳戶
        </span>
        <button
          onClick={() => onAddAsset('cash')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-bold hover:bg-slate-100 transition-colors"
        >
          <Icon name="plus" className="h-3 w-3" />
          新增
        </button>
      </div>
    </div>

    <div className="space-y-4">
      {cashAssets.map((asset) => (
        <div
          key={asset.id}
          className="flex items-center justify-between group cursor-default"
        >
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-700">
              {asset.name}
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Cash Account
            </span>
          </div>
          <div className="text-[14px] font-black text-slate-900 tabular-nums">
            {privacy ? (
              <HiddenAmount
                sizeClass="h-3 w-3"
                justifyClass="justify-end"
                minWidthClass="min-w-[60px]"
              />
            ) : (
              currency(asset.amount || 0)
            )}
          </div>
        </div>
      ))}
      {cashAssets.length === 0 && (
        <p className="text-[12px] text-slate-400 py-4 text-center">
          尚未新增現金資產
        </p>
      )}
    </div>
  </section>
);

export const StockBreakdown = ({
  privacy,
  stockDetails,
  onAddAsset,
}: StockBreakdownProps) => (
  <section className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-200 shadow-sm h-full text-left">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Icon name="candlestick-chart" className="h-4 w-4 text-slate-400" />
        <h3 className="text-[14px] font-black text-slate-900">股票持倉</h3>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-slate-400">
          {stockDetails.length} 標的
        </span>
        <button
          onClick={() => onAddAsset('stock')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-bold hover:bg-slate-100 transition-colors"
        >
          <Icon name="plus" className="h-3 w-3" />
          新增
        </button>
      </div>
    </div>

    <div className="space-y-4">
      {stockDetails.map((stock) => (
        <div
          key={stock.ticker}
          className="flex items-center justify-between group py-1"
        >
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-bold text-slate-700 truncate">
              {stock.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-black text-slate-300">
                {stock.ticker}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-200"></span>
              <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                {stock.totalShares} 股
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end pl-4 shrink-0">
            <div className="text-[14px] font-black text-slate-900 tabular-nums text-right">
              {privacy ? (
                <HiddenAmount
                  sizeClass="h-3 w-3"
                  justifyClass="justify-end"
                  minWidthClass="min-w-[70px]"
                />
              ) : (
                currency(stock.currentValue)
              )}
            </div>
            <div
              className={`text-[11px] font-bold tabular-nums flex items-center justify-end gap-1 mt-0.5 ${pnlClass(stock.pnl)}`}
            >
              <span>{privacy ? '••••' : formatPnlAmount(stock.pnl)}</span>
              <span className="opacity-70 text-[9px]">
                {privacy ? '••%' : formatPnlPct(stock.pnlPct)}
              </span>
            </div>
          </div>
        </div>
      ))}
      {stockDetails.length === 0 && (
        <p className="text-[12px] text-slate-400 py-4 text-center">
          尚未新增股票資產
        </p>
      )}
    </div>
  </section>
);
