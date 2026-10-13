import { Asset } from '../../../../types/portfolio';
import { currency, formatTimestamp } from '../../../../lib/format';
import Icon from '../../../../components/Icon';
import ActionMenu from './ActionMenu';

interface CashDetailItemProps {
  asset: Asset;
  isEditing: boolean;
  showActionMenu: boolean;
  editName: string;
  editAmount: string;
  editIsInvestmentAccount: boolean;
  setEditName: (val: string) => void;
  setEditAmount: (val: string) => void;
  setEditIsInvestmentAccount: (val: boolean) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
  onShowMenu: (id: number) => void;
  onHideMenu: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  fundedStocks?: Asset[];
}

export default function CashDetailItem({
  asset,
  isEditing,
  showActionMenu,
  editName,
  editAmount,
  editIsInvestmentAccount,
  setEditName,
  setEditAmount,
  setEditIsInvestmentAccount,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
  onShowMenu,
  onHideMenu,
  isOpen = false,
  onToggle = () => {},
  fundedStocks = [],
}: CashDetailItemProps) {
  // Use a stable root element to prevent "removeChild" errors during reconciliation
  return (
    <div className="relative w-full transition-all duration-300">
      {isEditing ? (
        <div className="bg-white rounded-[24px] border-2 border-slate-900 p-5 shadow-lg animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Icon name="edit-3" className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-slate-900 tracking-tight">
                編輯現金帳戶
              </h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                更新帳戶資訊
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                帳戶名稱
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
                placeholder="例如：國泰世華 薪轉戶"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                目前餘額
              </label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all tabular-nums"
                placeholder="0"
              />
            </div>
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={editIsInvestmentAccount}
                onChange={(e) => setEditIsInvestmentAccount(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-slate-900 tracking-tight">
                  設為投資扣款帳戶
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  此帳戶的資金可用於扣款買入股票
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onCancelEdit}
              className="flex-1 px-4 py-3 text-[13px] font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
            >
              取消
            </button>
            <button
              onClick={onSave}
              className="flex-[2] px-4 py-3 text-[13px] font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-sm transition-all active:scale-95"
            >
              儲存變更
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`group relative bg-white rounded-[24px] border border-slate-200 transition-all hover:border-slate-300 hover:shadow-md select-none overflow-hidden ${asset.isInvestmentAccount ? 'cursor-pointer active:scale-[0.99]' : ''}`}
          onClick={asset.isInvestmentAccount ? onToggle : undefined}
        >
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                <Icon name="banknote" className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-black text-slate-900 break-words tracking-tight leading-snug">
                  {asset.name || '未命名帳戶'}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    現金帳戶
                  </span>
                  {asset.isInvestmentAccount && (
                    <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest border border-blue-100">
                      投資帳戶
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right flex flex-col items-end">
                <div className="text-[17px] font-black text-slate-900 tabular-nums tracking-tight">
                  {currency(Number(asset.amount || 0))}
                </div>
                <div className="text-[10px] font-black text-slate-300 uppercase mt-0.5">
                  {formatTimestamp(asset.updatedAt || asset.id)}
                </div>{' '}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowMenu(asset.id);
                }}
                className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <Icon name="more-vertical" className="h-4 w-4" />
              </button>
              {asset.isInvestmentAccount && (
                <Icon
                  name="chevron-down"
                  className={`hidden sm:block h-4 w-4 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-900' : 'group-hover:text-slate-500'}`}
                />
              )}
            </div>
          </div>

          {isOpen && asset.isInvestmentAccount && (
            <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <Icon name="history" className="h-3 w-3 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    投資扣款紀錄 ({fundedStocks.length})
                  </span>
                </div>
                {fundedStocks.length === 0 ? (
                  <div className="py-4 text-center text-[12px] font-bold text-slate-400 bg-slate-50 rounded-xl">
                    尚無扣款紀錄
                  </div>
                ) : (
                  fundedStocks.map((stock) => (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-black text-slate-900 tracking-tight">
                            {stock.name || stock.ticker}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/50 text-[9px] font-black text-slate-500 uppercase">
                            {stock.ticker}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {stock.date?.replace(/-/g, '/')}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <div className="text-[13px] font-black text-rose-600 tabular-nums flex items-baseline gap-1">
                          -<span className="text-[11px]">NT$</span>
                          {(
                            Number(stock.price || 0) * Number(stock.shares || 0)
                          ).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 tabular-nums">
                          {Number(stock.shares || 0)} 股 @{' '}
                          {Number(stock.price || 0)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {showActionMenu && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-200">
              <ActionMenu
                onEdit={(e) => {
                  e.stopPropagation();
                  onEdit(asset);
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDelete(asset.id);
                }}
                onClose={(e) => {
                  e.stopPropagation();
                  onHideMenu();
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
