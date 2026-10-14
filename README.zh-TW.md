[English](README.md) | **繁體中文**

# Kinko

以隱私為優先、專為台灣投資人設計的個人資產與投資組合追蹤工具。把現金帳戶與台股（上市／上櫃）持股集中管理，即時掌握價格與損益。

## 功能

- **淨值總覽** – 總資產、資產配置與淨值歷史走勢圖。
- **股票持倉** – 每一筆買進都以成交紀錄（日期、股數、價格）記錄，可查看單筆與個股的成本、市值與損益。
- **現金明細** – 管理銀行帳戶、快速更新餘額，並可設定「投資扣款帳戶」，買股時自動從該帳戶扣款。
- **即時股價** – 依需求取得台股與 ETF 的價格（含重新整理按鈕），並依代號自動帶出標的名稱。
- **平均成本計算機** – 試算加碼後的均價、反推達成目標均價所需股數，並可納入現金股利調整。
- **目標** – 為個股設定目標股數並追蹤進度。
- **隱私模式** – 一鍵遮蔽畫面上所有金額。
- **CSV 匯入／匯出** – 備份或搬移資料（現金、持股與目標）。

## 隱私

沒有後端資料庫。所有資料都儲存在瀏覽器的 `localStorage`，不會離開你的裝置；唯一的對外請求是查詢你持有標的的價格與名稱。

## 損益算法

- **成本** = 股數 × 買價
- **損益** = (當前價位 − 買價) × 股數

個股的數字為其所有成交紀錄的加總。

## 技術棧

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Chart.js · TanStack Query · Vitest

## 快速開始

需要 Node.js 與 [pnpm](https://pnpm.io/)。

```bash
pnpm install
pnpm dev
```

接著開啟 <http://localhost:3000>。

| 指令              | 說明                   |
| ----------------- | ---------------------- |
| `pnpm dev`        | 啟動開發伺服器         |
| `pnpm build`      | 建置正式版             |
| `pnpm start`      | 執行正式版             |
| `pnpm lint`       | 程式碼檢查             |
| `pnpm type-check` | TypeScript 型別檢查    |
| `pnpm test`       | 執行單元測試（Vitest） |

## 專案結構

```
app/                 Next.js 路由（總覽、投資、計算機、設定、/api/stock）
features/portfolio/  元件、hooks 與計算邏輯
components/, lib/    共用 UI 與工具
types/               共用 TypeScript 型別
DATA_FORMAT.md       資料結構與 CSV 格式
```

## 貢獻

計算邏輯需附上 Vitest 單元測試。專案慣例請見 [AGENT.md](AGENT.md)，資料結構請見 [DATA_FORMAT.md](DATA_FORMAT.md)。

## 授權

本專案以 [MIT License](LICENSE) 授權釋出。
