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
};

export default function DetailSheet({
  open,
  type,
  assets,
  cashTotal,
  cashCount,
  stockPrices,
  onClose
}: Props) {
  const [openTicker, setOpenTicker] = useState<string | null>(null);

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

  return (
    <div id="detailOverlay" className={`fixed inset-0 z-50 flex items-end md:items-center justify-center ${open ? "modal-enter-active" : "modal-enter"}`}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>
      <div
        id="detailSheet"
        className={`detail-sheet detail-sheet--fullscreen relative w-full bg-white sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto shadow-2xl ${open ? "sheet-enter-active" : "sheet-enter"} ${type === "stock" ? "detail-sheet--stock" : ""}`}
      >
        <div className="detail-header detail-header--minimal">
          <button onClick={onClose} className="detail-close detail-close--single">
            <i data-lucide="x" className="h-5 w-5"></i>
          </button>
        </div>
        <div className="detail-content overflow-y-auto max-h-[80vh] md:max-h-[75vh]">
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
                  <div key={asset.id} className="detail-row">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                        <i data-lucide="banknote" className="h-4 w-4"></i>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-gray-900 truncate">{asset.name || "未命名帳戶"}</div>
                        <div className="text-[11px] text-gray-500">現金資產</div>
                      </div>
                    </div>
                    <div className="text-right text-[14px] font-semibold text-gray-900">{currency(Number(asset.amount || 0))}</div>
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
                      <div key={ticker} className={`detail-stock-item ${isOpen ? "is-open" : ""}`}>
                        <button className="detail-stock-button" type="button" data-ticker={ticker} aria-expanded={isOpen} aria-controls={`stock-${ticker}`} onClick={() => onTickerToggle(ticker)}>
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
                        </button>
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

                              return (
                                <div key={lot.id} className="detail-lot-row">
                                  <div className="detail-lot-main">
                                    <div className="detail-lot-date">{lotDate}</div>
                                    <div className="detail-lot-meta">{Number(lot.shares || 0)} 股 · 成本 {lotCostHtml}</div>
                                  </div>
                                  <div className="detail-lot-right">
                                    <div className="detail-lot-value">{lotValueHtml}</div>
                                    <div className={`detail-lot-pnl ${pnlClass(lotPnl)}`}>{lotPnlHtml} <span>{lotPctHtml}</span></div>
                                  </div>
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
