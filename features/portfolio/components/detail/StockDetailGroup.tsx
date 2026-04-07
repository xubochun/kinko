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
  onHideMenu: () => void;
  startPress: (id: number | string) => void;
  endPress: () => void;
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
  onHideMenu,
  startPress,
  endPress,
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
      className={`detail-stock-item relative ${isOpen ? 'is-open' : ''} ${showActionMenuId === ticker ? 'z-20' : ''}`}
    >
      {editingTicker === ticker ? (
        <div className="p-4 bg-white border-b border-gray-100 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-500">
              修改股票名稱 ({ticker})
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-[14px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              placeholder="輸入新名稱"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancelTickerEdit}
              className="px-4 py-2 text-[12px] font-semibold text-gray-500"
            >
              取消
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 text-[12px] font-semibold bg-[#2563EB] text-white rounded-lg"
            >
              儲存
            </button>
          </div>
        </div>
      ) : (
        <div
          className="detail-stock-button relative active:scale-[0.98] transition-transform select-none cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => onTickerToggle(ticker)}
          onTouchStart={() => startPress(ticker)}
          onTouchEnd={endPress}
          onMouseDown={() => startPress(ticker)}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onTickerToggle(ticker);
            }
          }}
        >
          <div className="detail-stock-left">
            <div className="detail-stock-text">
              <div className="detail-stock-name text-[15px] font-bold">
                {name}
              </div>
              <div className="detail-stock-meta detail-stock-meta--compact mt-1">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                  {ticker}
                </span>
                <span className="meta-dot ml-1">•</span>
                <span className="font-medium text-slate-500">
                  {totalShares} 股
                </span>
              </div>
            </div>
          </div>
          <div className="detail-stock-right">
            <div className="detail-stock-value tabular-nums">{valueHtml}</div>
            {!isOpen && (
              <div
                className={`detail-stock-pnl detail-stock-pnl--compact ${pnlClass(totalPnl)} tabular-nums`}
              >
                {pnlHtmlLocal} <span>{pnlPctHtmlLocal}</span>
              </div>
            )}
          </div>
          <Icon
            name="chevron-down"
            className={`detail-chevron h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />

          {showActionMenuId === ticker && (
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
          )}
        </div>
      )}

      <div
        id={`stock-${ticker}`}
        className={`detail-stock-body ${isOpen ? '' : 'hidden'}`}
      >
        <div className="detail-asset-metrics">
          <div
            className={`metric-block metric-block--pnl ${pnlClass(totalPnl)}`}
          >
            <div className="metric-label">損益</div>
            <div className="metric-value tabular-nums">{pnlHtmlLocal}</div>
            <div className="metric-sub">{pnlPctHtmlLocal}</div>
          </div>
          <div className={`metric-block`}>
            <div className="metric-label">總成本</div>
            <div className="metric-value tabular-nums">{costHtml}</div>
          </div>
        </div>
        <div className="detail-asset-foot">
          <span>總市值 {valueHtml}</span>
        </div>
        <div className="detail-lot-list">
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
              startPress={startPress}
              endPress={endPress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
