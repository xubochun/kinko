export async function fetchStockPriceFromYahoo(ticker: string) {
  const yahooTicker = `${ticker}.TW`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.chart && data.chart.result && data.chart.result.length > 0) {
      const meta = data.chart.result[0].meta;
      return {
        price: meta.regularMarketPrice,
        name: ticker
      };
    }
  } catch (error) {
    console.error(`Yahoo Finance API fetch failed for ${ticker}:`, error);
  }

  try {
    const yahooTickerTwo = `${ticker}.TWO`;
    const urlTwo = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTickerTwo}`;
    const proxyUrlTwo = `https://corsproxy.io/?${encodeURIComponent(urlTwo)}`;

    const responseTwo = await fetch(proxyUrlTwo);
    if (!responseTwo.ok) throw new Error(`HTTP error! status: ${responseTwo.status}`);
    const dataTwo = await responseTwo.json();

    if (dataTwo.chart && dataTwo.chart.result && dataTwo.chart.result.length > 0) {
      const meta = dataTwo.chart.result[0].meta;
      return {
        price: meta.regularMarketPrice,
        name: ticker
      };
    }
  } catch (error) {
    console.error(`Yahoo Finance API fetch failed for ${ticker} (.TWO):`, error);
  }

  return null;
}
