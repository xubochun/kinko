import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  // 1. 嘗試抓取價格 (v8 接口)
  const priceData = await fetchPrice(ticker);
  
  // 2. 嘗試抓取中文名稱 (使用 Search 接口，對台股名稱最準)
  const nameData = await fetchName(ticker);

  if (priceData) {
    return NextResponse.json({
      ...priceData,
      name: nameData || ticker // 如果抓不到名稱就用代號
    });
  }

  return NextResponse.json({ error: `Could not find data for ticker: ${ticker}` }, { status: 404 });
}

async function fetchPrice(ticker: string) {
  const suffixes = ['TW', 'TWO'];
  for (const suffix of suffixes) {
    const yahooTicker = `${ticker}.${suffix}`;
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1d&range=1d`;
    try {
      const response = await fetch(url, {
        next: { revalidate: 300 },
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' }
      });
      if (!response.ok) continue;
      const data = await response.json();
      const meta = data.chart?.result?.[0]?.meta;
      if (meta) return { price: meta.regularMarketPrice, symbol: meta.symbol };
    } catch (e) {}
  }
  return null;
}

async function fetchName(ticker: string) {
  // Yahoo Search API 加入 zh-TW 標頭
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${ticker}.TW`;
  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' // 強制要求中文
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    
    // 尋找對應的代號
    const result = data.quotes?.find((q: any) => q.symbol === `${ticker}.TW` || q.symbol === `${ticker}.TWO`);
    
    // 對台股來說，shortname 通常是「台積電」，longname 是「台灣積體電路製造股份有限公司」
    // 我們優先取短名稱
    return result?.shortname || result?.longname || null;
  } catch (e) {
    return null;
  }
}
