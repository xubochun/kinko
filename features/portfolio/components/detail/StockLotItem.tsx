import { Asset } from '../../../../types/portfolio';
import {
  currency,
  formatDate,
  formatPnlAmount,
  formatPnlPct,
  pnlClass,
} from '../../../../lib/format';
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
  const lotPnlPct = lotCost > 0 ? (lotPnl / lotCost) * 100 : 0;
  const lotValueHtml = currency(lotValue);
  const lotPnlHtml = formatPnlAmount(lotPnl);
  const lotPctHtml = formatPnlPct(lotPnlPct);
  const lotDate = lot.date ? formatDate(lot.date) : '—';

  return (
    <div className="relative w-full transition-all duration-300">
      {isEditing ? (
        <div className="bg-slate-50 rounded-[20px] border-2 border-slate-900 p-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="edit-2" className="h-3.5 w-3.5 text-slate-900" />
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
              編輯成交紀錄
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                股數
              </label>
              <input
                type="number"
                value={editShares}
                onChange={(e) => setEditShares(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-slate-900 outline-none focus:border-slate-900 transition-all tabular-nums"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                買入價格
              </label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-slate-900 outline-none focus:border-slate-900 transition-all tabular-nums"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
              成交日期
            </label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-slate-900 outline-none focus:border-slate-900 transition-all h-[40px]"
            />
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-all"
            >
              取消
            </button>
            <button
              onClick={onSave}
              className="px-5 py-2 text-[12px] font-bold bg-slate-900 text-white rounded-lg shadow-sm hover:bg-slate-800 transition-all active:scale-95"
            >
              儲存
            </button>
          </div>
        </div>
      ) : (
        <div className="group relative bg-slate-50/50 rounded-2xl border border-slate-100 p-3.5 transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm active:scale-[0.99] select-none overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {lotDate}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-900 tabular-nums leading-none">
                    {Number(lot.shares || 0)}
                    <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                      股
                    </span>
                  </span>
                </div>
                <span className="h-3 w-px bg-slate-200"></span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-500 tabular-nums leading-none">
                    @
                    {Number.isInteger(Number(lot.price || 0))
                      ? Number(lot.price || 0)
                      : Number(lot.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right flex flex-col items-end">
                <div className="text-[14px] font-black text-slate-900 tabular-nums leading-none">
                  {lotValueHtml}
                </div>
                <div
                  className={`text-[11px] font-bold tabular-nums flex items-center gap-1 mt-1 ${pnlClass(lotPnl)}`}
                >
                  {lotPnlHtml}
                  <span className="text-[10px] opacity-70">{lotPctHtml}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowMenu(lot.id);
                }}
                className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-200"
              >
                <Icon name="more-vertical" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showActionMenu && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-200 rounded-2xl">
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
