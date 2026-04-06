# Kinko 專案資料格式規範 (Data Schema)

> **版本**: 1.1 (2024-04-06)
> **狀態**: 規範中 (Strict)
> **核心機制**: 本專案採用 Zustand Persist 進行全域狀態持久化，所有資料將封裝於 LocalStorage 中的單一鍵值 `kinko_v4_store`。

---

## 1. 全域狀態結構 (Global Store State)

為了確保資料一致性，所有的業務資料皆應存放於 `PortfolioStore` 中，而非分散的 LocalStorage Key。

```typescript
interface PortfolioStore {
  // 核心資料
  assets: Asset[];           // 所有資產 (現金 + 股票)
  history: HistoryPoint[];   // 淨值歷史紀錄點
  stockGoals: {              // 存股目標 (Ticker -> 目標股數)
    [ticker: string]: number 
  };

  // 系統設定
  settings: {
    isPrivacyMode: boolean;  // 隱私模式 (金額遮罩)
    baseCurrency: "TWD";     // 基準幣別
    lastUpdated: string;     // 最後更新時間 (ISO 8601)
  };

  // 備份資料 (選擇性實作)
  archives: {
    assets: Asset[];
    history: HistoryPoint[];
  };
}
```

---

## 2. 資產物件定義 (Asset Object)

資產分為 `cash` (現金) 與 `stock` (股票) 兩大類。

### 共通欄位 (Common Fields)
- `id`: `string` (必須使用 `crypto.randomUUID()` 產生的唯一識別碼)
- `type`: `"cash" | "stock"`
- `currency`: `"TWD" | "USD"` (預設為 `"TWD"`)

### A. 現金 (Cash)
```typescript
{
  id: string,
  type: "cash",
  name: string,      // 例如: "台幣活存", "國泰世華", "美金定存"
  currency: "TWD" | "USD",
  amount: number     // 當前餘額 (允許為負值，代表負債)
}
```

### B. 股票 (Stock)
> **注意**: 股票資產必須記錄「總投入成本」，以避免手續費與稅金造成的計算誤差。

```typescript
{
  id: string,
  type: "stock",
  ticker: string,    // 例如: "2330.TW", "AAPL", "0050.TW"
  name: string,      // 股票名稱
  date: string,      // 購入日期 "YYYY-MM-DD"
  shares: number,    // 持股股數 (允許零碎股)
  price: number,     // 平均成本價 (每股)
  costAmount: number,// 總投入成本 (包含手續費，用於精確損益計算)
  currency: "TWD" | "USD"
}
```

---

## 3. 淨值歷史紀錄 (HistoryPoint)

用於繪製資產趨勢圖，建議每日或每次手動更新時記錄一個點。

```typescript
{
  date: string,      // 日期 "YYYY-MM-DD"
  totalValue: number,// 當時的總市值 (含現金 + 股票現值)
  netProfit: number, // 累計損益額
  netProfitRate: number // 累計損益率 (百分比)
}
```

---

## 4. 存股目標 (Stock Goals)

對應 `ticker` 的目標持有股數。

```json
{
  "2330.TW": 1000,
  "0050.TW": 5000
}
```

---

## 5. CSV 匯入規範 (CSV Import Spec)

匯入功能目前僅針對「股票」資產設計。

### 欄位標頭 (Headers)
必須包含以下 7 個欄位，順序不限，但名稱必須完全正確：
`type,ticker,name,date,shares,price,costAmount`

### 規則說明
1. `type`: 統一填寫 `stock`。
2. `ticker`: 必須包含交易所後綴 (如 `.TW`, `.TWO`) 以利 Yahoo Finance API 查詢。
3. `date`: 格式必須為 `YYYY-MM-DD`。
4. `costAmount`: 必須大於 0，代表該筆交易實際支付的總金額。

### 範例 CSV 內容
```csv
type,ticker,name,date,shares,price,costAmount
stock,2330.TW,台積電,2024-01-05,20,600,12000
stock,2454.TW,聯發科,2024-02-10,8,980,7840
stock,AAPL,Apple,2024-03-15,5,170,25500
```

---

## 6. 開發者提示 (For AI Agent)

1. **ID 生成**: 新增資產時，嚴禁使用數字遞增 ID，請一律使用 `string` 型別的 UUID。
2. **資料校驗**: 匯入 CSV 時，若 `costAmount` 欄位缺失，請以 `shares * price` 作為備選計算值。
3. **精確度**: 計算總資產時，請確保 `TWD` 類別的最終結果使用 `Math.round()` 取至整數位。
4. **Ticker 格式**: 台灣股市代號請引導使用者輸入 `.TW` (上市) 或 `.TWO` (上櫃)。
