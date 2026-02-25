import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  // 嘗試 .TW (上市)
  const result = await fetchYahoo(ticker, 'TW');
  if (result) return NextResponse.json(result);

  // 嘗試 .TWO (上櫃)
  const resultTwo = await fetchYahoo(ticker, 'TWO');
  if (resultTwo) return NextResponse.json(resultTwo);

  return NextResponse.json({ error: 'Failed to fetch data' }, { status: 404 });
}

async function fetchYahoo(ticker: string, suffix: string) {
  const yahooTicker = `${ticker}.${suffix}`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 }, // 快取 5 分鐘
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) return null;
    const data = await response.json();

    if (data.chart?.result?.[0]?.meta) {
      const meta = data.chart.result[0].meta;
      return {
        price: meta.regularMarketPrice,
        name: ticker,
        currency: meta.currency,
        symbol: meta.symbol
      };
    }
  } catch (error) {
    console.error(`API Route: Yahoo fetch failed for ${yahooTicker}:`, error);
  }
  return null;
}
