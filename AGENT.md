# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**myWallet** is a personal portfolio tracker built with Next.js 14 and TypeScript. It helps users track their net worth by managing cash accounts and stock holdings, with automatic price updates from Yahoo Finance.

The app is a client-side SPA that stores all data in localStorage. It features:
- Cash account tracking
- Taiwan stock tracking (2330.TW format)
- Real-time stock price fetching via Yahoo Finance API
- Historical net worth visualization with Chart.js
- Privacy mode for hiding amounts
- Archive/restore functionality

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server (localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages
  - `page.tsx` - Main application page (single-page app)
  - `layout.tsx` - Root layout with HTML structure
  - `head.tsx` - Head component with meta tags and fonts
  - `globals.css` - Global styles and Tailwind imports
- `components/` - Reusable React components
  - `MainChart.tsx` - Chart.js line chart for net worth history
  - `HiddenAmount.tsx` - Privacy mode placeholder for sensitive amounts
- `lib/` - Utility functions
  - `format.ts` - Currency, date, and P&L formatting utilities
  - `storage.ts` - localStorage key constants
  - `yahoo.ts` - Yahoo Finance API integration via CORS proxy
- `types/` - TypeScript type definitions
  - `portfolio.ts` - Core types (Asset, HistoryEntry, RangeKey)
- `legacy-static/` - Old static HTML/JS version (pre-Next.js migration, can be ignored)

### Data Model

**Asset Types:**
```typescript
type Asset = {
  id: number;           // Timestamp-based unique ID
  type: "cash" | "stock";
  // Cash fields
  name?: string;        // Account name (e.g., "LINE Bank")
  amount?: number;      // Cash amount in NT$
  // Stock fields
  ticker?: string;      // Stock ticker (e.g., "2330")
  date?: string;        // Purchase date (YYYY-MM-DD)
  shares?: number;      // Number of shares
  price?: number;       // Purchase price per share
  costAmount?: number;  // Total cost (shares × price)
};
```

**History Entry:**
```typescript
type HistoryEntry = {
  date: string;   // YYYY-MM-DD format
  value: number;  // Net worth snapshot
};
```

**localStorage Keys:**
- `my_portfolio_assets_v3` - Current assets array
- `my_portfolio_history` - Historical net worth entries
- `my_portfolio_assets_archive` - Backup of assets (for restore)
- `my_portfolio_history_archive` - Backup of history (for restore)

### Key Architecture Patterns

1. **Client-Side Only**: All data lives in browser localStorage, no backend
2. **Single Page App**: All UI in `app/page.tsx` with modal overlays for forms
3. **Stock Price Fetching**: Uses `corsproxy.io` to bypass CORS for Yahoo Finance API
   - Tries `.TW` suffix first, falls back to `.TWO` for OTC stocks
4. **Auto-Recording**: System automatically records today's net worth once per day
5. **Animated Transitions**: Uses requestAnimationFrame for smooth value updates

## Stock Price Integration

The app fetches real-time prices from Yahoo Finance:

```typescript
// Endpoint pattern
https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}.TW
// Uses corsproxy.io to avoid CORS issues
```

**Important Notes:**
- Ticker format: Taiwan stocks use `.TW` suffix (e.g., `2330.TW` for TSMC)
- OTC stocks use `.TWO` suffix
- The API returns `meta.regularMarketPrice` for current price
- Fetching happens client-side on component mount and when assets change

## Component Notes

### MainChart.tsx
- Uses Chart.js with auto-destroy on re-render
- Filters history by selected range ("1m", "3m", "1y", "all")
- Handles single data point (shows dot instead of line)
- Click handler for point selection
- Custom tooltips with NT$ currency formatting

### HiddenAmount.tsx
- Simple privacy mode component showing placeholder dots
- Used throughout UI when privacy mode is enabled

## State Management

No external state library. All state managed with React hooks in `app/page.tsx`:
- `assets` - Array of cash/stock assets
- `history` - Array of net worth snapshots
- `stockPrices` - Map of ticker → current price
- `privacy` - Boolean for hiding amounts
- Computed values: cashTotal, stockTotal, total, percentages

## Styling

- **Tailwind CSS** for utility classes
- Custom classes defined in `globals.css`:
  - `.hero-glow` - Background gradient effect
  - `.soft-card` - Card component with shadow/border
  - `.seg` - Segmented control buttons
  - `.detail-*` - Modal sheet styling
  - `.floating-add-btn` - Fixed add button
- Uses `IBM Plex Sans` font family from Google Fonts
- Responsive design with mobile-first approach
- Bottom navigation for mobile (`md:hidden`)

## Taiwan-Specific Considerations

- App is in Traditional Chinese (`zh-Hant`)
- Currency: NT$ (New Taiwan Dollar)
- Stock market: Taiwan Stock Exchange (TWSE) and OTC
- Date format: YYYY年MM月DD日
- Number formatting: Uses `Intl.NumberFormat("zh-Hant-TW")`

## Testing & Development Tips

1. **Demo Data**: Click "載入示範資料" button to populate sample assets
2. **Clear Data**: "清空" button archives current data and resets
3. **Restore**: "恢復" button appears when archive exists
4. **Privacy Mode**: Eye icon toggles amount visibility
5. **Stock Testing**: Use ticker `2330` (TSMC) or `2454` (MediaTek) for testing

## Common Workflows

### Adding a New Asset Type
1. Update `AssetType` in `types/portfolio.ts`
2. Add fields to `Asset` interface
3. Update form in `app/page.tsx` modal
4. Add rendering logic in detail sheets
5. Update total calculation logic

### Modifying Stock Price API
- Edit `lib/yahoo.ts`
- Consider fallback/retry logic for API failures
- Note: CORS proxy is required for browser-based fetch

### Changing localStorage Schema
- Update keys in `lib/storage.ts`
- Add migration logic in `useEffect` on mount
- Consider backwards compatibility

## Known Limitations

- No backend/database - data loss if localStorage is cleared
- Stock prices require working CORS proxy (`corsproxy.io`)
- No authentication or multi-user support
- Taiwan stocks only (Yahoo Finance `.TW` suffix)
- History is auto-recorded once per day (no manual editing)
