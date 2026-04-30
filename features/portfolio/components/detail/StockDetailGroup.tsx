import { Asset } from '../../../../types/portfolio';
import {
  currency,
  formatPnlAmount,
  formatPnlPct,
  pnlClass,
} from '../../../../lib/format';
import Icon from '../../../../components/Icon';
import ActionMenu from './ActionMenu';
import StockLotItem from './StockLotItem';

interface StockDetailGroupProps {
  ticker: string;
  lots: Asset[];
  price: number;
  isOpen: boolean;
  editingTicker: string | null;
  editName: string;
  showActionMenuId: number | string | null;
  editingId: number | null;
  editShares: string;
  editPrice: string;
  editDate: string;
  onTickerToggle: (ticker: string) => void;
  setEditName: (val: string) => void;
  setEditShares: (val: string) => void;
  setEditPrice: (val: string) => void;
  setEditDate: (val: string) => void;
  onSave: () => void;
  onCancelTickerEdit: () => void;
  onCancelLotEdit: () => void;
  onEditTicker: (ticker: string) => void;
  onEditLot: (lot: Asset) => void;
  onDeleteTicker: (ticker: string) => void;
  onDeleteLot: (id: number) => void;
  onShowMenu: (id: number | string) => void;
  onHideMenu: () => void;
}

export default function StockDetailGroup({
  ticker,
  lots,
  price,
  isOpen,
  editingTicker,
  editName,
  showActionMenuId,
  editingId,
  editShares,
  editPrice,
  editDate,
  onTickerToggle,
  setEditName,
  setEditShares,
  setEditPrice,
  setEditDate,
  onSave,
  onCancelTickerEdit,
  onCancelLotEdit,
  onEditTicker,
  onEditLot,
  onDeleteTicker,
  onDeleteLot,
  onShowMenu,
  onHideMenu,
}: StockDetailGroupProps) {
  const name = lots[0]?.name || ticker;
  const totalShares = lots.reduce((s, l) => s + Number(l.shares || 0), 0);
  const totalCost = lots.reduce(
    (s, l) => s + Number(l.costAmount || (l.shares || 0) * (l.price || 0)),
    0,
  );
  const totalValue = totalShares * price;
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const valueHtml = currency(totalValue);
  const pnlHtmlLocal = formatPnlAmount(totalPnl);
  const pnlPctHtmlLocal = formatPnlPct(totalPnlPct);
  const costHtml = currency(totalCost);

  return (
    <div
      className={`group relative bg-white rounded-[28px] border border-slate-200 transition-all duration-300 overflow-hidden ${isOpen ? 'shadow-lg border-slate-300 ring-1 ring-slate-900/5' : 'hover:border-slate-300 hover:shadow-md'}`}
    >
      {editingTicker === ticker ? (
        <div className="p-6 bg-white animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Icon name="edit-3" className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-slate-900 tracking-tight">
                修改標的名稱
              </h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {ticker}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
              標的自定義名稱
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
              placeholder="例如：台積電 (2330)"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onCancelTickerEdit}
              className="flex-1 px-4 py-3 text-[13px] font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            >
              取消
            </button>
            <button
              onClick={onSave}
              className="flex-[2] px-4 py-3 text-[13px] font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-sm transition-all"
            >
              儲存
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`p-4 cursor-pointer transition-colors ${isOpen ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}
          onClick={() => onTickerToggle(ticker)}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white border border-slate-200 text-slate-900 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                <span className="text-[13px] font-black uppercase tracking-tight">
                  {ticker.slice(0, 4)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-black text-slate-900 truncate tracking-tight">
                  {name}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-500">
                    {ticker}
                  </span>
                  <span className="opacity-30">•</span>
                  <span>{totalShares} 股</span>
                </div>
              </div>
            </div>

            <div className="text-right flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="text-[16px] font-black text-slate-900 tabular-nums tracking-tight">
                  {valueHtml}
                </div>
                {!isOpen && (
                  <div
                    className={`text-[12px] font-bold tabular-nums flex items-center gap-1.5 ${pnlClass(totalPnl)}`}
                  >
                    {pnlHtmlLocal}
                    <span className="text-[10px] opacity-80">
                      {pnlPctHtmlLocal}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowMenu(ticker);
                }}
                className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-200"
              >
                <Icon name="more-vertical" className="h-4 w-4" />
              </button>
              <Icon
                name="chevron-down"
                className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-900' : 'group-hover:text-slate-500'}`}
              />
            </div>
          </div>

          {showActionMenuId === ticker && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-200">
              <ActionMenu
                onEdit={(e) => {
                  e.stopPropagation();
                  onEditTicker(ticker);
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDeleteTicker(ticker);
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

      {/* Expanded Body */}
      <div
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className="px-5 pb-6 border-t border-slate-100 bg-white">
          {/* Summary Cards Inside Expanded View */}
          <div className="grid grid-cols-2 gap-3 py-5">
            <div
              className={`rounded-2xl border p-4 transition-colors ${pnlClass(totalPnl)} bg-slate-50/50`}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">
                總計損益
              </div>
              <div className="text-[16px] font-black tabular-nums">
                {pnlHtmlLocal}
              </div>
              <div className="text-[11px] font-bold opacity-80">
                {pnlPctHtmlLocal}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                總投資成本
              </div>
              <div className="text-[16px] font-black text-slate-700 tabular-nums">
                {costHtml}
              </div>
              <div className="text-[11px] font-bold text-slate-400 mt-1">
                目前市值 {valueHtml}
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 px-1">
            <Icon name="history" className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              成交明細
            </span>
          </div>

          <div className="space-y-3">
            {lots.map((lot) => (
              <StockLotItem
                key={lot.id}
                lot={lot}
                price={price}
                isEditing={editingId === lot.id}
                showActionMenu={showActionMenuId === lot.id}
                editShares={editShares}
                editPrice={editPrice}
                editDate={editDate}
                setEditShares={setEditShares}
                setEditPrice={setEditPrice}
                setEditDate={setEditDate}
                onSave={onSave}
                onCancelEdit={onCancelLotEdit}
                onEdit={onEditLot}
                onDelete={onDeleteLot}
                onHideMenu={onHideMenu}
                onShowMenu={onShowMenu}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
