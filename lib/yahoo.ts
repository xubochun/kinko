export async function fetchStockPriceFromYahoo(ticker: string) {
  // 優先使用我們自己的 API Route 作為 Proxy
  const internalUrl = `/api/stock?ticker=${encodeURIComponent(ticker)}&t=${Date.now()}`;

  try {
    const response = await fetch(internalUrl, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data.price) {
        return {
          price: data.price,
          name: data.name || ticker
        };
      }
    } else if (response.status === 404) {
      console.warn(`Internal API route not found (404), falling back to external proxy for ${ticker}`);
    }
  } catch (error) {
    console.warn(`Internal API Proxy failed for ${ticker}, trying fallback...`, error);
  }

  // Fallback: 使用外部 Proxy (原本的方法)
  const yahooTicker = `${ticker}.TW`;
  const externalUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(externalUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      // 嘗試 .TWO
      const yahooTickerTwo = `${ticker}.TWO`;
      const externalUrlTwo = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTickerTwo}`;
      const proxyUrlTwo = `https://corsproxy.io/?${encodeURIComponent(externalUrlTwo)}`;
      const responseTwo = await fetch(proxyUrlTwo);
      if (!responseTwo.ok) throw new Error(`External proxy also failed`);
      const dataTwo = await responseTwo.json();
      if (dataTwo.chart?.result?.[0]?.meta) {
        return { price: dataTwo.chart.result[0].meta.regularMarketPrice, name: ticker };
      }
    }
    const data = await response.json();
    if (data.chart?.result?.[0]?.meta) {
      return {
        price: data.chart.result[0].meta.regularMarketPrice,
        name: ticker
      };
    }
  } catch (error) {
    console.error(`All fetch methods failed for ${ticker}:`, error);
  }

  return null;
}
