import { Asset } from '../../../../types/portfolio';
import { currency, formatPnlAmount, pnlClass } from '../../../../lib/format';
import ActionMenu from './ActionMenu';
import Icon from '../../../../components/Icon';

interface StockLotItemProps {
  lot: Asset;
  price: number;
  isEditing: boolean;
  showActionMenu: boolean;
  editShares: string;
  editPrice: string;
  editDate: string;
  setEditShares: (val: string) => void;
  setEditPrice: (val: string) => void;
  setEditDate: (val: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
  onShowMenu: (id: number) => void;
  onHideMenu: () => void;
}

export default function StockLotItem({
  lot,
  price,
  isEditing,
  showActionMenu,
  editShares,
  editPrice,
  editDate,
  setEditShares,
  setEditPrice,
  setEditDate,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
  onShowMenu,
  onHideMenu,
}: StockLotItemProps) {
  const lotCost = Number(
    lot.costAmount || (lot.shares || 0) * (lot.price || 0),
  );
  const lotValue = Number(lot.shares || 0) * price;
  const lotPnl = lotValue - lotCost;
  const lotValueHtml = currency(lotValue).replace('NT$', '');
  const lotPnlHtml = formatPnlAmount(lotPnl);

  // Extract date in YYYY.MM.DD format directly from the raw string to avoid long labels
  const rawDate = lot.date || ''; // YYYY-MM-DD
  const displayDate = rawDate.replace(/-/g, '.');

  return (
    <div className="relative w-full">
      {isEditing ? (
        <div className="bg-white rounded-2xl border-2 border-slate-900 p-4 mb-3 shadow-lg animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="edit-2" className="h-3.5 w-3.5 text-slate-900" />
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
              編輯成交紀錄
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider ml-1">
                股數
              </label>
              <input
                type="number"
                value={editShares}
                onChange={(e) => setEditShares(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-bold text-slate-900 outline-none focus:border-slate-900 transition-all tabular-nums"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider ml-1">
                買入價格
              </label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-bold text-slate-900 outline-none focus:border-slate-900 transition-all tabular-nums"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mt-3">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider ml-1">
              成交日期
            </label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-bold text-slate-900 outline-none focus:border-slate-900 transition-all h-[40px]"
            />
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              取消
            </button>
            <button
              onClick={onSave}
              className="px-5 py-2 text-[12px] font-bold bg-slate-900 text-white rounded-lg shadow-sm"
            >
              儲存
            </button>
          </div>
        </div>
      ) : (
        <div className="group flex items-center gap-1 sm:gap-2 py-3 border-b border-slate-100 last:border-0 hover:bg-white transition-all rounded-xl px-1">
          {/* Date: Dark color, wider column for YYYY.MM.DD */}
          <div className="w-[70px] shrink-0">
            <div className="text-[10px] sm:text-[11px] font-black text-slate-900 tabular-nums leading-none">
              {displayDate || '—'}
            </div>
          </div>

          {/* Shares: Fixed-width aligned column */}
          <div className="w-[60px] sm:w-[75px] shrink-0 flex items-center justify-end gap-0.5 sm:gap-1">
            <span className="text-[12px] sm:text-[13px] font-black text-slate-900 tabular-nums leading-none">
              {Number(lot.shares || 0).toLocaleString()}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase shrink-0">
              股
            </span>
          </div>

          {/* Price: Auto-growing column with dark labels */}
          <div className="flex-1 min-w-[50px] px-1 sm:px-2 flex items-center border-l border-slate-100 ml-1 sm:ml-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 tabular-nums leading-none truncate">
              @{Number(lot.price || 0).toLocaleString()}
            </span>
          </div>

          {/* Value & PnL: Unified right-aligned group */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="text-right flex flex-col items-end min-w-[80px] sm:min-w-[95px]">
              <div className="text-[13px] sm:text-[14px] font-black text-slate-900 tabular-nums leading-none mb-1 truncate max-w-[80px] sm:max-w-none">
                {lotValueHtml}
              </div>
              <div
                className={`text-[10px] sm:text-[11px] font-black tabular-nums leading-none truncate max-w-[80px] sm:max-w-none ${pnlClass(lotPnl)}`}
              >
                {lotPnlHtml}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowMenu(lot.id);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors rounded-lg"
            >
              <Icon name="more-vertical" className="h-4 w-4" />
            </button>
          </div>

          {showActionMenu && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-200 rounded-xl">
              <ActionMenu
                onEdit={(e) => {
                  e.stopPropagation();
                  onEdit(lot);
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDelete(lot.id);
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
