import {
  currency,
  formatPnlAmount,
  formatPnlPct,
  pnlClass,
} from '../../../../lib/format';
import HiddenAmount, { HiddenDot } from '../../../../components/HiddenAmount';
import Icon from '../../../../components/Icon';
import { Asset } from '../../../../types/portfolio';
import { formatPrice, formatRelativeDays } from '../../../../lib/number';

export interface StockDetail {
  ticker: string;
  name: string;
  totalShares: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  avgCost?: number;
  currentPrice?: number;
}

interface CashBreakdownProps {
  privacy: boolean;
  cashAssets: Asset[];
  cashCount: number;
  onAddAsset: (type: 'cash' | 'stock') => void;
  onOpenDetail: (type: 'cash' | 'stock') => void;
  /** 開啟快速更新餘額視窗；帶入 id 時聚焦該帳戶 */
  onQuickUpdate: (id?: number) => void;
}

interface StockBreakdownProps {
  privacy: boolean;
  stockDetails: StockDetail[];
  onAddAsset: (type: 'cash' | 'stock') => void;
  onOpenDetail: (type: 'cash' | 'stock', ticker?: string) => void;
}

export const CashBreakdown = ({
  privacy,
  cashAssets,
  cashCount,
  onAddAsset,
  onOpenDetail,
  onQuickUpdate,
}: CashBreakdownProps) => (
  <section className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-200 shadow-sm h-full text-left">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-500 shadow-sm">
          <Icon name="banknote" className="h-4 w-4" />
        </div>
        <h3 className="text-[14px] font-black text-slate-900">現金明細</h3>
        <span className="text-[11px] font-bold text-slate-400">
          {cashCount} 帳戶
        </span>
      </div>
      <div className="flex items-center gap-2">
        {cashAssets.length > 0 && (
          <button
            onClick={() => onQuickUpdate()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition-all active:scale-95"
          >
            <Icon name="refresh-cw" className="h-3 w-3" />
            更新餘額
          </button>
        )}
        <button
          onClick={() => onAddAsset('cash')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
        >
          <Icon name="plus" className="h-3 w-3" />
          新增
        </button>
      </div>
    </div>

    <div className="space-y-2">
      {cashAssets.map((asset) => (
        <button
          type="button"
          key={asset.id}
          onClick={() => onQuickUpdate(asset.id)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer group text-left"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
              {asset.name}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {formatRelativeDays(asset.updatedAt || asset.id)}更新
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-3">
            <div className="text-[14px] font-black text-slate-900 tabular-nums">
              {privacy ? <HiddenAmount /> : currency(asset.amount || 0)}
            </div>
            <Icon
              name="edit-2"
              className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500"
            />
          </div>
        </button>
      ))}
      {cashAssets.length === 0 && (
        <p className="text-[12px] text-slate-400 py-4 text-center">
          尚未新增現金資產
        </p>
      )}
    </div>

    {cashAssets.length > 0 && (
      <button
        onClick={() => onOpenDetail('cash')}
        className="mt-3 w-full flex items-center justify-center gap-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-[12px] font-bold text-slate-600 transition-colors"
      >
        管理帳戶（改名稱、刪除、扣款紀錄）
        <Icon name="chevron-right" className="h-3.5 w-3.5" />
      </button>
    )}
  </section>
);

export const StockBreakdown = ({
  privacy,
  stockDetails,
  onAddAsset,
  onOpenDetail,
}: StockBreakdownProps) => (
  <section className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-slate-200 shadow-sm h-full text-left">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-500 shadow-sm">
          <Icon name="candlestick-chart" className="h-4 w-4" />
        </div>
        <h3 className="text-[14px] font-black text-slate-900">股票持倉</h3>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-slate-400">
          {stockDetails.length} 標的
        </span>
        <button
          onClick={() => onAddAsset('stock')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
        >
          <Icon name="plus" className="h-3 w-3" />
          新增
        </button>
      </div>
    </div>

    <div className="space-y-2">
      {stockDetails.map((stock) => (
        <div
          key={stock.ticker}
          onClick={() => onOpenDetail('stock', stock.ticker)}
          className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer group"
        >
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
              {stock.name}
            </span>
            <span className="mt-0.5 text-[11px] font-bold text-slate-400 tabular-nums truncate">
              {stock.ticker} · {stock.totalShares.toLocaleString('zh-TW')} 股
            </span>
            {stock.avgCost !== undefined && (
              <span className="text-[11px] font-medium text-slate-400 tabular-nums truncate">
                均價 {formatPrice(stock.avgCost)}
                {stock.currentPrice
                  ? ` · 現價 ${formatPrice(stock.currentPrice)}`
                  : ''}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end pl-4 shrink-0">
            <div className="text-[14px] font-black text-slate-900 tabular-nums">
              {privacy ? <HiddenAmount /> : currency(stock.currentValue)}
            </div>
            <div
              className={`text-[12px] font-bold tabular-nums flex items-center justify-end gap-1 mt-0.5 ${pnlClass(stock.pnl)}`}
            >
              <span>
                {privacy ? <HiddenDot count={4} /> : formatPnlAmount(stock.pnl)}
              </span>
              <span>
                {privacy ? <HiddenDot count={2} /> : formatPnlPct(stock.pnlPct)}
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
