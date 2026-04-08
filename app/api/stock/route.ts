import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// FinMind API 配置 (免費版每小時 300 次請求)
const FINMIND_API_URL = 'https://api.finmindtrade.com/api/v4/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  // 1. 抓取價格 (嘗試 .TW 和 .TWO)
  const priceData = await fetchPrice(ticker);

  // 2. 抓取名稱 (多重策略)
  // 優先策略 A: FinMind API (最準確的台股中文名)
  let nameData = await fetchNameFromFinMind(ticker);

  // 備援策略 B: Yahoo Search (如果 FinMind 失敗或沒資料)
  if (!nameData || isPrimarilyEnglish(nameData)) {
    const yahooSearchName = await fetchNameFromSearch(ticker);
    if (yahooSearchName && !isPrimarilyEnglish(yahooSearchName)) {
      nameData = yahooSearchName;
    }
  }

  // 備援策略 C: Yahoo Quote (最後一線希望)
  if (!nameData || isPrimarilyEnglish(nameData)) {
    const backupName = await fetchNameFromQuote(ticker);
    if (backupName) {
      nameData = backupName;
    }
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

function isPrimarilyEnglish(str: string) {
  // 檢查是否不包含任何中文字元
  return !/[\u4e00-\u9fa5]/.test(str);
}

async function fetchNameFromFinMind(ticker: string) {
  // 嘗試從 FinMind 取得台股總覽資訊
  const url = `${FINMIND_API_URL}?dataset=TaiwanStockInfo&data_id=${ticker}`;
  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // 名稱不常變動，快取一天
    });
    if (!response.ok) return null;

    const json = await response.json();
    if (json.msg === 'success' && json.data && json.data.length > 0) {
      // 回傳格式範例: { stock_id: '2330', stock_name: '台積電', ... }
      return json.data[0].stock_name || null;
    }
  } catch (e) {
    console.warn(`[FinMind API] Failed for ${ticker}:`, e);
  }
  return null;
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
  const queries = [`${ticker}.TW`, `${ticker}.TWO`, ticker];
  for (const q of queries) {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${q}&lang=zh-Hant-TW&region=TW&quotesCount=5`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8',
        },
      });
      const data = await response.json();
      const results = data.quotes || [];
      for (const res of results) {
        if (res.symbol?.startsWith(ticker)) {
          const name = res.dispname || res.shortname || res.longname;
          if (name && !isPrimarilyEnglish(name)) return name;
        }
      }
      for (const res of results) {
        const name = res.dispname || res.shortname || res.longname;
        if (name && !isPrimarilyEnglish(name)) return name;
      }
    } catch {}
  }
  return null;
}

async function fetchNameFromQuote(ticker: string) {
  const suffixes = ['TW', 'TWO'];
  for (const suffix of suffixes) {
    const symbol = `${ticker}.${suffix}`;
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbol}&lang=zh-Hant-TW&region=TW`;
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
      if (result) {
        const name = result.longName || result.shortName;
        if (name) return name;
      }
    } catch {}
  }
  return null;
}
