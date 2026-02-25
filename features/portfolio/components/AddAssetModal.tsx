import { useEffect, useState } from "react";
import type { NewAssetPayload } from "../hooks/usePortfolioData";

type Props = {
  open: boolean;
  onClose: () => void;
  onAddAsset: (payload: NewAssetPayload) => void;
};

export default function AddAssetModal({ open, onClose, onAddAsset }: Props) {
  const [assetType, setAssetType] = useState<"cash" | "stock">("cash");
  const [cashName, setCashName] = useState("");
  const [assetAmount, setAssetAmount] = useState("");
  const [stockTicker, setStockTicker] = useState("");
  const [stockDate, setStockDate] = useState("");
  const [stockShares, setStockShares] = useState("");
  const [stockPrice, setStockPrice] = useState("");

  useEffect(() => {
    if (assetType === "stock" && !stockDate) {
      setStockDate(new Date().toISOString().split("T")[0]);
    }
  }, [assetType, stockDate]);

  const resetForm = () => {
    setAssetType("cash");
    setCashName("");
    setAssetAmount("");
    setStockTicker("");
    setStockDate("");
    setStockShares("");
    setStockPrice("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (assetType === "cash") {
      onAddAsset({
        type: "cash",
        name: cashName,
        amount: Number(assetAmount || 0)
      });
    } else {
      onAddAsset({
        type: "stock",
        ticker: stockTicker,
        date: stockDate,
        shares: Number(stockShares || 0),
        price: Number(stockPrice || 0)
      });
    }

    resetForm();
    onClose();
  };

  return (
    <div id="addModalOverlay" className={`fixed inset-0 z-50 flex items-end md:items-center justify-center ${open ? "modal-enter-active" : "modal-enter"}`}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>

      <div id="addModalSheet" className={`relative w-full bg-white rounded-t-3xl md:rounded-3xl p-6 pb-10 md:pb-6 sm:max-w-sm md:max-w-md mx-auto shadow-2xl ${open ? "sheet-enter-active" : "sheet-enter"}`}>
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

        <button onClick={onClose} className="hidden md:block absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
          <i data-lucide="x" className="h-5 w-5"></i>
        </button>

        <h3 className="text-[18px] font-semibold text-gray-900 mb-4 text-center md:text-left">新增資產紀錄</h3>

        <form id="addAssetForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">資產類型</label>
            <select
              id="assetType"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as "cash" | "stock")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-[14px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            >
              <option value="cash">銀行帳戶 (現金、活定存)</option>
              <option value="stock">股票與 ETF (投資部位)</option>
            </select>
          </div>

          <div id="cashFields" className={`${assetType === "cash" ? "flex" : "hidden"} flex-col gap-4`}>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">帳戶名稱</label>
              <input
                type="text"
                id="cashName"
                placeholder="例如：台新 Richart"
                value={cashName}
                onChange={(e) => setCashName(e.target.value)}
                required={assetType === "cash"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-[14px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">金額 (NT$)</label>
              <input
                type="number"
                id="assetAmount"
                min="0"
                placeholder="例如：50000"
                value={assetAmount}
                onChange={(e) => setAssetAmount(e.target.value)}
                required={assetType === "cash"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-[14px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              />
            </div>
          </div>

          <div id="stockFields" className={`${assetType === "stock" ? "flex" : "hidden"} flex-col gap-4`}>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">股票代號</label>
              <input
                type="text"
                id="stockTicker"
                placeholder="例如：2330"
                value={stockTicker}
                onChange={(e) => setStockTicker(e.target.value)}
                required={assetType === "stock"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-[14px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">買入日期</label>
              <input
                type="date"
                id="stockDate"
                value={stockDate}
                onChange={(e) => setStockDate(e.target.value)}
                required={assetType === "stock"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-[14px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">股數</label>
              <input
                type="number"
                id="stockShares"
                min="1"
                step="any"
                placeholder="例如：1000"
                value={stockShares}
                onChange={(e) => setStockShares(e.target.value)}
                required={assetType === "stock"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-[14px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">買入價格</label>
              <input
                type="number"
                id="stockPrice"
                min="0"
                step="any"
                placeholder="例如：850"
                value={stockPrice}
                onChange={(e) => setStockPrice(e.target.value)}
                required={assetType === "stock"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-[14px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              />
            </div>
            <div className="text-[12px] text-gray-500 leading-relaxed">
              <i data-lucide="info" className="inline h-3 w-3 mr-1 mb-0.5"></i>系統將根據代號自動獲取標的名稱與現價
            </div>
          </div>

          <button type="submit" className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] active:scale-[0.98]">
            <i data-lucide="check" className="h-5 w-5"></i>
            儲存資產
          </button>
        </form>
      </div>
    </div>
  );
}
