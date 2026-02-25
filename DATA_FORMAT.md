# 資料格式說明

本文件描述目前專案使用的資料結構與 CSV 匯入規格。所有內容皆以本機 `localStorage` 為主。

## 儲存鍵（localStorage）
- `my_portfolio_assets`：資產陣列（現金 + 股票）
- `my_portfolio_history`：淨值歷史紀錄（陣列）
- `my_portfolio_stock_goals_shares`：存股目標（ticker -> 目標股數）
- `my_portfolio_assets_archive`：清空後備份（資產）
- `my_portfolio_history_archive`：清空後備份（歷史）

## 資產資料格式（Asset）

### 現金
```
{
  id: number,
  type: "cash",
  name: string,
  amount: number
}
```

### 股票
```
{
  id: number,
  type: "stock",
  ticker: string,
  name: string,
  date: "YYYY-MM-DD",
  shares: number,
  price: number,
  costAmount: number
}
```

## 存股目標（Stock Goals）
```
{
  "2330": 100,
  "2454": 50
}
```

## CSV 匯入規格（Settings -> 匯入 CSV）

目前 CSV 匯入 **只接受股票資料**，其餘列會被忽略。

### 必要欄位
```
type,name,ticker,date,shares,price,amount,goal
```

### 規則
- `type` 只能是 `stock`
- `ticker` 必填
- `date` 必填（YYYY-MM-DD）
- `shares` 必填
- `price` 必填
- `name` 選填
- 其他欄位（amount、goal）請留空

### Excel 範例
```
type,name,ticker,date,shares,price,amount,goal
stock,台積電,2330,2024-01-05,20,600,0,
stock,聯發科,2454,2024-02-10,8,980,0,
stock,鴻海,2317,2024-03-12,30,170,0,
stock,中華電,2412,2024-04-20,15,120,0,
```
