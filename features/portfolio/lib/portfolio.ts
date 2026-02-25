import type { Asset } from "../../../types/portfolio";

export function groupStocks(assets: Asset[]) {
  const grouped: Record<string, Asset[]> = {};
  assets.forEach((asset) => {
    if (asset.type !== "stock" || !asset.ticker) return;
    if (!grouped[asset.ticker]) grouped[asset.ticker] = [];
    grouped[asset.ticker].push(asset);
  });
  return grouped;
}

export function summarizeStocks(
  grouped: Record<string, Asset[]>,
  stockPrices: Record<string, number>
) {
  let totalCost = 0;
  let totalValue = 0;

  Object.keys(grouped).forEach((ticker) => {
    const lots = grouped[ticker];
    const shares = lots.reduce((s, l) => s + Number(l.shares || 0), 0);
    const cost = lots.reduce(
      (s, l) => s + Number(l.costAmount || (l.shares || 0) * (l.price || 0)),
      0
    );
    const price = Number(stockPrices[ticker] || 0);
    totalCost += cost;
    totalValue += shares * price;
  });

  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return {
    totalCost,
    totalValue,
    totalPnl,
    totalPnlPct
  };
}
