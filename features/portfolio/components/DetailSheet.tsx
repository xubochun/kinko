import { useEffect, useMemo, useState } from "react";
import type { Asset } from "../../../types/portfolio";
import { currency, formatDate, formatPnlAmount, formatPnlPct, pnlClass } from "../../../lib/format";
import { groupStocks, summarizeStocks } from "../lib/portfolio";

type Props = {
  open: boolean;
  type: "cash" | "stock" | null;
  assets: Asset[];
  cashTotal: number;
  cashCount: number;
  stockPrices: Record<string, number>;
  onClose: () => void;
  onUpdateAsset: (id: number, payload: Partial<Asset>) => void;
  onRemoveAsset: (id: number) => void;
};

export default function DetailSheet({
  open,
  type,
  assets,
  cashTotal,
  cashCount,
  stockPrices,
  onClose,
  onUpdateAsset,
  onRemoveAsset
}: Props) {
  const [openTicker, setOpenTicker] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editShares, setEditShares] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showActionMenuId, setShowActionMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (open) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [open]);

  useEffect(() => {
    if (!open) setOpenTicker(null);
    if (open && type === "stock") setOpenTicker(null);
  }, [open, type]);

  const stockAssets = useMemo(
    () => assets.filter((a) => a.type === "stock"),
    [assets]
  );

  const groupedStocks = useMemo(() => groupStocks(stockAssets), [stockAssets]);
  const stockSummary = useMemo(
    () => summarizeStocks(groupedStocks, stockPrices),
    [groupedStocks, stockPrices]
  );

  const onTickerToggle = (ticker: string) => {
    setOpenTicker((prev) => (prev === ticker ? null : ticker));
  };

  const [editingTicker, setEditingTicker] = useState<string | null>(null);

  const handleEdit = (assetOrTicker: Asset | string) => {
    if (typeof assetOrTicker === "string") {
      setEditingTicker(assetOrTicker);
      const firstLot = assets.find(a => a.ticker === assetOrTicker);
      setEditName(firstLot?.name || assetOrTicker);
      return;
    }

    setEditingId(assetOrTicker.id);
    if (assetOrTicker.type === "cash") {
      setEditName(assetOrTicker.name || "");
      setEditAmount(String(assetOrTicker.amount || ""));
    } else {
      setEditDate(assetOrTicker.date || "");
      setEditShares(String(assetOrTicker.shares || ""));
      setEditPrice(String(assetOrTicker.price || ""));
    }
  };

  const handleSave = () => {
    if (editingTicker) {
      const targetLots = assets.filter(a => a.ticker === editingTicker);
      targetLots.forEach(lot => {
        onUpdateAsset(lot.id, { name: editName });
      });
      setEditingTicker(null);
      return;
    }

    if (editingId) {
      const asset = assets.find(a => a.id === editingId);
      if (asset?.type === "cash") {
        onUpdateAsset(editingId, {
          name: editName,
          amount: Number(editAmount)
        });
      } else {
        onUpdateAsset(editingId, {
          date: editDate,
          shares: Number(editShares),
          price: Number(editPrice),
          costAmount: Number(editShares) * Number(editPrice)
        });
      }
      setEditingId(null);
    }
  };

  const handleDelete = (idOrTicker: number | string) => {
    if (typeof idOrTicker === "string") {
      if (confirm(`確定要刪除 ${idOrTicker} 的所有持股紀錄嗎？`)) {
        const targetIds = assets
          .filter((a) => a.type === "stock" && a.ticker === idOrTicker)
          .map((a) => a.id);
        targetIds.forEach((id) => onRemoveAsset(id));
        setShowActionMenuId(null);
      }
      return;
    }

    if (confirm("確定要刪除這筆紀錄嗎？")) {
      onRemoveAsset(idOrTicker);
      setShowActionMenuId(null);
    }
  };

  const startPress = (id: number | string) => {
    const timer = setTimeout(() => {
      setShowActionMenuId(id as any);
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10); // 俐落的短促震動 (類似 iOS Haptic)
      }
    }, 500);
    setLongPressTimer(timer);
  };

  const endPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div id="detailOverlay" className={`fixed inset-0 z-50 flex items-end md:items-center justify-center ${open ? "modal-enter-active" : "modal-enter"}`}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>
      <div
        id="detailSheet"
        className={`detail-sheet detail-sheet--fullscreen relative w-full bg-white mx-auto shadow-2xl ${open ? "sheet-enter-active" : "sheet-enter"} ${type === "stock" ? "detail-sheet--stock" : ""}`}
      >
        <div className="detail-header detail-header--minimal">
          <button onClick={onClose} className="detail-close detail-close--single">
            <i data-lucide="x" className="h-5 w-5"></i>
          </button>
        </div>
        <div className="detail-content overflow-y-auto flex-1">
          <div id="detailSummary" className={`detail-summary mb-4 ${type === "stock" ? "detail-summary--stock" : ""}`}>
            {type === "cash" && (
              <>
                <div className="text-[12px] text-gray-500">總現金</div>
                <div className="text-[18px] font-semibold text-gray-900">{currency(cashTotal)}</div>
                <div className="text-[12px] text-gray-500 mt-1">{cashCount} 個帳戶</div>
              </>
            )}
            {type === "stock" && (
              <>
                <div className="summary-top">
                  <div className="summary-label">總市值</div>
                  <div className="summary-value summary-value--right summary-value--accent">{currency(stockSummary.totalValue)}</div>
                </div>
                <div className="summary-rows">
                  <div className="summary-row">
                    <div className="summary-label">總成本</div>
                    <div className="summary-value-sm summary-value--right summary-value--muted">{currency(stockSummary.totalCost)}</div>
                  </div>
                  <div className="summary-row">
                    <div className="summary-label">總損益</div>
                    <div className={`summary-value-sm summary-value--right ${pnlClass(stockSummary.totalPnl)}`}>
                      <span>{formatPnlAmount(stockSummary.totalPnl)}</span>
                      <span className="summary-sub">{formatPnlPct(stockSummary.totalPnlPct)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div id="detailBody" className={`detail-body ${type === "stock" ? "detail-body--stock" : ""}`}>
            {type === "cash" && (
              assets.filter((a) => a.type === "cash").length === 0 ? (
                <div className="detail-row text-[13px] text-gray-500">尚未新增現金帳戶</div>
              ) : (
                assets.filter((a) => a.type === "cash").map((asset) => (
                  <div
                    key={asset.id}
                    className="detail-row flex-col items-stretch gap-3 !h-auto relative active:scale-[0.98] transition-transform select-none"
                    onTouchStart={() => startPress(asset.id)}
                    onTouchEnd={endPress}
                    onMouseDown={() => startPress(asset.id)}
                    onMouseUp={endPress}
                    onMouseLeave={endPress}
                  >
                    {editingId === asset.id ? (
                      <div className="flex flex-col gap-3 p-1">
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-medium text-slate-500">帳戶名稱</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-[13px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                            placeholder="帳戶名稱"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-medium text-slate-500">金額</label>
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-[13px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                            placeholder="金額"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                          <button onClick={() => setEditingId(null)} className="px-4 py-2 text-[12px] font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
                          <button onClick={handleSave} className="px-4 py-2 text-[12px] font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors">儲存變更</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
                            <i data-lucide="banknote" className="h-4.5 w-4.5"></i>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[14px] font-bold text-gray-900 truncate">{asset.name || "未命名帳戶"}</div>
                            <div className="text-[11px] font-medium text-slate-400 mt-0.5">現金資產</div>
                          </div>
                        </div>
                        <div className="text-right text-[15px] font-bold text-gray-900 tabular-nums">
                          {currency(Number(asset.amount || 0))}
                        </div>

                        {showActionMenuId === asset.id && (
                          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center gap-10 rounded-2xl animate-in fade-in zoom-in duration-200">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(asset); setShowActionMenuId(null); }}
                              className="text-blue-600 active:scale-90 transition-transform"
                            >
                              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                                <i data-lucide="edit-3" className="h-6 w-6"></i>
                              </div>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
                              className="text-red-600 active:scale-90 transition-transform"
                            >
                              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                                <i data-lucide="trash-2" className="h-6 w-6"></i>
                              </div>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowActionMenuId(null); }}
                              className="text-slate-500 active:scale-90 transition-transform"
                            >
                              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <i data-lucide="x" className="h-6 w-6"></i>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )
            )}

            {type === "stock" && (
              stockAssets.length === 0 ? (
                <div className="detail-row text-[13px] text-gray-500">尚未新增股票資產</div>
              ) : (
                Object.keys(groupedStocks).map((ticker) => {
                  const lots = groupedStocks[ticker];
                  const name = lots[0]?.name || ticker;
                  const shares = lots.reduce((s, l) => s + Number(l.shares || 0), 0);
                  const cost = lots.reduce((s, l) => s + Number(l.costAmount || (l.shares || 0) * (l.price || 0)), 0);
                  const price = Number(stockPrices[ticker] || 0);
                  const value = shares * price;
                  const pnl = value - cost;
                  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;

                  const priceHtml = price ? currency(price) : "—";
                  const valueHtml = currency(value);
                  const pnlHtmlLocal = formatPnlAmount(pnl);
                  const pnlPctHtmlLocal = formatPnlPct(pnlPct);
                  const costHtml = currency(cost);

                  const isOpen = openTicker === ticker;

                    return (
                      <div key={ticker} className={`detail-stock-item relative ${isOpen ? "is-open" : ""} ${showActionMenuId === (ticker as any) ? "z-20" : ""}`}>
                        {editingTicker === ticker ? (
                          <div className="p-4 bg-white border-b border-gray-100 flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[11px] font-medium text-slate-500">修改股票名稱 ({ticker})</label>
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
                              <button onClick={() => setEditingTicker(null)} className="px-4 py-2 text-[12px] font-semibold text-gray-500">取消</button>
                              <button onClick={handleSave} className="px-4 py-2 text-[12px] font-semibold bg-[#2563EB] text-white rounded-lg">儲存</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="detail-stock-button relative active:scale-[0.98] transition-transform select-none"
                            type="button"
                            data-ticker={ticker}
                            aria-expanded={isOpen}
                            aria-controls={`stock-${ticker}`}
                            onClick={() => onTickerToggle(ticker)}
                            onTouchStart={() => startPress(ticker)}
                            onTouchEnd={endPress}
                            onMouseDown={() => startPress(ticker)}
                            onMouseUp={endPress}
                            onMouseLeave={endPress}
                          >
                            <div className="detail-stock-left">
                              <div className="detail-stock-text">
                                <div className="detail-stock-name">{name}</div>
                                <div className="detail-stock-meta detail-stock-meta--compact">
                                  <span className="badge">{ticker}</span>
                                  <span className="meta-dot">•</span>
                                  <span>{shares} 股</span>
                                </div>
                              </div>
                            </div>
                            <div className="detail-stock-right">
                              <div className="detail-stock-value">{valueHtml}</div>
                              {!isOpen && (
                                <div className={`detail-stock-pnl detail-stock-pnl--compact ${pnlClass(pnl)}`}>
                                  {pnlHtmlLocal} <span>{pnlPctHtmlLocal}</span>
                                </div>
                              )}
                            </div>
                            <i data-lucide="chevron-down" className="detail-chevron h-4 w-4 text-gray-400"></i>

                            {showActionMenuId === (ticker as any) && (
                              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center gap-10 rounded-2xl animate-in fade-in zoom-in duration-200">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEdit(ticker); setShowActionMenuId(null); }}
                                  className="text-blue-600 active:scale-90 transition-transform"
                                >
                                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                                    <i data-lucide="edit-3" className="h-6 w-6"></i>
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(ticker); }}
                                  className="text-red-600 active:scale-90 transition-transform"
                                >
                                  <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                                    <i data-lucide="trash-2" className="h-6 w-6"></i>
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowActionMenuId(null); }}
                                  className="text-slate-500 active:scale-90 transition-transform"
                                >
                                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <i data-lucide="x" className="h-6 w-6"></i>
                                  </div>
                                </button>
                              </div>
                            )}
                          </button>
                        )}
                        <div id={`stock-${ticker}`} className={`detail-stock-body ${isOpen ? "" : "hidden"}`} data-ticker={ticker}>
                          <div className="detail-asset-metrics">
                            <div className={`metric-block metric-block--pnl ${pnlClass(pnl)}`}>
                              <div className="metric-label">損益</div>
                              <div className="metric-value">{pnlHtmlLocal}</div>
                              <div className="metric-sub">{pnlPctHtmlLocal}</div>
                            </div>
                            <div className="metric-block">
                              <div className="metric-label">總成本</div>
                              <div className="metric-value">{costHtml}</div>
                            </div>
                          </div>
                          <div className="detail-asset-foot">
                            <span>總市值 {valueHtml}</span>
                          </div>
                          <div className="detail-lot-list">
                            {lots.map((lot) => {
                              const lotCost = Number(lot.costAmount || (lot.shares || 0) * (lot.price || 0));
                              const lotValue = Number(lot.shares || 0) * price;
                              const lotPnl = lotValue - lotCost;
                              const lotPnlPct = lotCost > 0 ? (lotPnl / lotCost) * 100 : 0;
                              const lotCostHtml = currency(lotCost);
                              const lotValueHtml = currency(lotValue);
                              const lotPnlHtml = formatPnlAmount(lotPnl);
                              const lotPctHtml = formatPnlPct(lotPnlPct);
                              const lotDate = lot.date ? formatDate(lot.date) : "—";

                              if (editingId === lot.id) {
                                return (
                                  <div key={lot.id} className="detail-lot-row flex-col items-stretch gap-3 !h-auto">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-medium text-slate-500">股數</label>
                                        <input
                                          type="number"
                                          value={editShares}
                                          onChange={(e) => setEditShares(e.target.value)}
                                          className="w-full rounded-lg border border-gray-200 p-2 text-[12px] outline-none focus:border-blue-500"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-medium text-slate-500">買入價</label>
                                        <input
                                          type="number"
                                          value={editPrice}
                                          onChange={(e) => setEditPrice(e.target.value)}
                                          className="w-full rounded-lg border border-gray-200 p-2 text-[12px] outline-none focus:border-blue-500"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <label className="text-[10px] font-medium text-slate-500">日期</label>
                                      <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-2 text-[12px] outline-none focus:border-blue-500 h-[38px]"
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2 border-t pt-2">
                                      <button onClick={() => setEditingId(null)} className="px-3 py-1 text-[11px] font-medium text-gray-500">取消</button>
                                      <button onClick={handleSave} className="px-3 py-1 text-[11px] font-medium bg-blue-600 text-white rounded-md">儲存</button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={lot.id}
                                  className="detail-lot-row relative active:scale-[0.98] transition-transform select-none"
                                  onTouchStart={() => startPress(lot.id)}
                                  onTouchEnd={endPress}
                                  onMouseDown={() => startPress(lot.id)}
                                  onMouseUp={endPress}
                                  onMouseLeave={endPress}
                                >
                                  <div className="detail-lot-main">
                                    <div className="detail-lot-date">{lotDate}</div>
                                    <div className="detail-lot-meta">{Number(lot.shares || 0)} 股 · 成本 {lotCostHtml}</div>
                                  </div>
                                  <div className="detail-lot-right">
                                    <div className="detail-lot-value">{lotValueHtml}</div>
                                    <div className={`detail-lot-pnl ${pnlClass(lotPnl)}`}>{lotPnlHtml} <span>{lotPctHtml}</span></div>
                                  </div>

                                  {showActionMenuId === lot.id && (
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center gap-8 rounded-xl animate-in fade-in zoom-in duration-200">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(lot); setShowActionMenuId(null); }}
                                        className="text-blue-600 active:scale-90 transition-transform"
                                      >
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                          <i data-lucide="edit-3" className="h-5 w-5"></i>
                                        </div>
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(lot.id); }}
                                        className="text-red-600 active:scale-90 transition-transform"
                                      >
                                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                                          <i data-lucide="trash-2" className="h-5 w-5"></i>
                                        </div>
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setShowActionMenuId(null); }}
                                        className="text-slate-500 active:scale-90 transition-transform"
                                      >
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                          <i data-lucide="x" className="h-5 w-5"></i>
                                        </div>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                })
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
