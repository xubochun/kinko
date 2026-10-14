**English** | [繁體中文](README.zh-TW.md)

# Kinko

A privacy-first personal asset and investment portfolio tracker, built for Taiwan investors. Track your cash accounts and TWSE/OTC stock holdings in one place, with live prices and profit/loss at a glance.

## Features

- **Net worth dashboard** – total assets, asset allocation and a net-worth history chart.
- **Stock holdings** – record every buy as a lot (date, shares, price); see per-lot and per-ticker cost, market value and profit/loss.
- **Cash accounts** – manage bank accounts, quick-update balances, and mark an account as an investment funding source so buys can deduct from it.
- **Live prices** – fetched on demand (with a refresh button) for Taiwan-listed stocks and ETFs; names are resolved automatically from the ticker.
- **Average cost calculator** – simulate additional buys, work out how many shares you need to hit a target average, and account for cash dividends.
- **Goals** – set share-count targets for tickers and track progress.
- **Privacy mode** – one tap to mask every amount on screen.
- **CSV import / export** – back up or migrate your data (cash, holdings and goals).

## Privacy

There is no backend database. All of your data is stored in your browser's `localStorage` and never leaves your device. The only network calls are price/name lookups for the tickers you hold.

## How profit/loss is calculated

- **Cost** = shares × buy price
- **Profit/Loss** = (current price − buy price) × shares

Per-ticker figures are the sum of its lots.

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Chart.js · TanStack Query · Vitest

## Getting started

Requires Node.js and [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

| Command           | Description              |
| ----------------- | ------------------------ |
| `pnpm dev`        | Start the dev server     |
| `pnpm build`      | Production build         |
| `pnpm start`      | Run the production build |
| `pnpm lint`       | Lint the codebase        |
| `pnpm type-check` | TypeScript type check    |
| `pnpm test`       | Run unit tests (Vitest)  |

## Project structure

```
app/                 Next.js routes (dashboard, investment, calculator, settings, /api/stock)
features/portfolio/  Components, hooks and calculation logic
components/, lib/    Shared UI and utilities
types/               Shared TypeScript types
DATA_FORMAT.md       Data model and CSV format
```

## Contributing

Calculation logic should come with Vitest unit tests. See [AGENT.md](AGENT.md) for project conventions and [DATA_FORMAT.md](DATA_FORMAT.md) for the data model.

## License

Released under the [MIT License](LICENSE).
