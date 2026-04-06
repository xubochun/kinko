# AGENTS.md - Kinko 專案開發規範

> **Role**: 你是 Kinko 專案的資深前端架構師與首席開發者。
> **Context**: Kinko 是一個專為台灣使用者設計的個人資產與投資組合追蹤工具，採純客戶端設計 (LocalStorage)，核心價值在於隱私、準確與易用。

---

## 1. 專案背景與目標 (Project Overview)
- **目標**: 提供台灣股市 (TWSE/OTC) 與現金資產的即時追蹤。
- **儲存**: 完全依賴瀏覽器 LocalStorage，無後端資料庫，確保資料私有化。
- **資料來源**: 透過 corsproxy.io 存取 Yahoo Finance API 獲取即時價格。

---

## 2. 技術棧規範 (Tech Stack)
AI Agent 必須嚴格遵守以下版本與工具，禁止自行更換：
- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript 5.x (Strict Mode)
- **狀態管理**: Zustand 4.x (搭配 persist middleware)
  - **資料遷移**: 必須定義 version 並實作 migrate 函式，確保 LocalStorage 結構更迭時不會造成斷崖式錯誤 (Breaking Changes)。
- **樣式**: Tailwind CSS (Atomic CSS 模式)
- **UI 組件**: shadcn/ui + Lucide React 圖標
- **圖表**: Recharts
- **測試**: Vitest + React Testing Library

---

## 3. 安全與資料完整性 (Security & Data Integrity)
- **禁止硬編碼**: 所有的 API Proxy URL 或敏感配置必須存放在 .env.local。
- **XSS 防護**: 嚴禁使用 dangerouslySetInnerHTML。所有使用者輸入在渲染前必須經過消毒。
- **隱私遮罩**: 必須實作「隱私模式」，開啟時全域金額需以星號或模糊化顯示。
- **金融精確度**: 
  - 處理 NT$ 計算時，應考慮浮點數誤差，建議使用整數運算或專用計算庫（如 big.js 或 decimal.js）。
  - **匯率處理**: 處理不同幣別資產時，必須明確標註基準幣別，並提供手動輸入匯率或 API 更新匯率的選項。

---

## 4. 測試要求 (Testing Requirements)
- **邏輯測試**: 所有的 features/*/hooks 或計算邏輯 (如總值計算、損益計算) 必須具備 Vitest 單元測試。
- **組件測試**: 關鍵互動組件 (如 AssetForm, ChartContainer) 必須通過 React Testing Library 測試。
- **Mock 規範**: 測試 API 抓取邏輯時，必須 Mock fetch 回傳值，嚴禁發送真實網絡請求。
- **回歸檢查**: 修改 Store 邏輯後，必須驗證 LocalStorage 持久化資料的相容性。

---

## 5. 健壯性與使用者體驗 (Robustness & UX)
- **錯誤邊界 (Error Handling)**: 
  - API 抓取失敗時，必須有優雅的降級處理（如顯示上次成功抓取的快取價格）。
  - 使用 Toast 或 Inline Alert 提示錯誤訊息，嚴禁頁面出現白屏或無回應。
- **加載體驗 (Loading States)**: 
  - 所有的非同步操作（如抓取股價、初始讀取 LocalStorage）必須實作 Skeleton Screen 或 Spinner。
  - 確保使用者在等待資料時有視覺反饋，避免「卡住」的錯覺。

---

## 6. 禁止清單 (Forbidden List)
- **禁止使用 any**: 必須定義明確的 Interface 或 Type。
- **禁止 axios**: 統一使用原生 fetch。
- **禁止 moment.js**: 請改用原生 Intl 物件或 date-fns。
- **禁止單一檔案過大**: 組件超過 150 行必須進行功能性拆分。
- **禁止手動操作 LocalStorage**: 統一由 Zustand Persist 管理。

---

## 7. 專案目錄結構 (Project Structure)
必須遵循 Feature-Based 架構，保持業務邏輯與 UI 分離：

```text
src/
├── app/                # Next.js 路由與 Layout
├── components/ui/      # 通用原子組件 (shadcn/ui)
├── features/           # 核心業務邏輯區塊 (Silos)
│   ├── portfolio/      # 資產持倉管理
│   │   ├── components/ # 功能專屬 UI
│   │   ├── hooks/      # 商業邏輯 (usePortfolio)
│   │   ├── store/      # Zustand Store (kinko_v4_assets)
│   │   ├── types/      # 領域型別定義
│   │   └── __tests__/  # 單元與組件測試
│   ├── stock/          # 股價抓取與 Yahoo API 邏輯
│   └── history/        # 淨值紀錄與趨勢分析
├── lib/                # 無狀態工具函式 (formatters)
└── types/              # 全域共享型別
```

---

## 8. 開發工作流 (Workflows)
1. **分析先導**: 修改前先閱讀現有 types/，確保資料結構一致。
2. **邏輯先行**: 先實作 Store 與 Hook，並同步撰寫對應的單元測試。
3. **UI 實作**: 使用 shadcn/ui 建立介面，並確保符合隱私遮罩規範與 Loading 反饋。
4. **驗證**: 提交前必須執行 pnpm lint 與 pnpm test。

---

## 9. 常用指令
- pnpm dev: 開啟開發伺服器
- pnpm test: 執行所有測試
- pnpm build: 執行生產環境建置
```
