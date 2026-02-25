export async function fetchStockPriceFromYahoo(ticker: string) {
  // 優先使用我們自己的 API Route 作為 Proxy，避免瀏覽器 CORS 限制
  const url = `/api/stock?ticker=${encodeURIComponent(ticker)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.price) {
      return {
        price: data.price,
        name: data.name || ticker
      };
    }
  } catch (error) {
    console.error(`Internal API Proxy fetch failed for ${ticker}:`, error);
  }

  return null;
}
