import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  // 1. 抓取價格
  const priceData = await fetchPrice(ticker);

  // 2. 抓取名稱 (多重策略)
  let nameData = await fetchNameFromSearch(ticker);
  if (!nameData || /^[A-Z\s]+$/.test(nameData)) {
    // 如果沒拿到或拿到純英文大寫
    const backupName = await fetchNameFromQuote(ticker);
    if (backupName) nameData = backupName;
  }

  if (priceData) {
    return NextResponse.json({
      ...priceData,
      name: nameData || ticker,
    });
  }

  return NextResponse.json(
    { error: `Could not find data for ticker: ${ticker}` },
    { status: 404 },
  );
}

async function fetchPrice(ticker: string) {
  const suffixes = ['TW', 'TWO'];
  for (const suffix of suffixes) {
    const yahooTicker = `${ticker}.${suffix}`;
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1d&range=1d`;
    try {
      const response = await fetch(url, {
        next: { revalidate: 300 },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        },
      });
      if (!response.ok) continue;
      const data = await response.json();
      const meta = data.chart?.result?.[0]?.meta;
      if (meta) return { price: meta.regularMarketPrice, symbol: meta.symbol };
    } catch {}
  }
  return null;
}

async function fetchNameFromSearch(ticker: string) {
  // 策略：直接搜尋代號 + ".TW"，並強制要求中文環境
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${ticker}.TW&lang=zh-TW&region=TW&quotesCount=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-TW,zh;q=0.9',
      },
    });
    const data = await response.json();
    const result = data.quotes?.[0];
    // 優先回傳 dispname (通常是中文簡稱)
    return result?.dispname || result?.shortname || null;
  } catch {
    return null;
  }
}

async function fetchNameFromQuote(ticker: string) {
  // 備援策略：使用 v7 quote 接口
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${ticker}.TW`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-TW,zh;q=0.9',
      },
    });
    const data = await response.json();
    const result = data.quoteResponse?.result?.[0];
    return result?.longName || result?.shortName || null;
  } catch {
    return null;
  }
}
