// Yahoo Finance API fetcher via CORS proxy
// The user reported Yahoo Finance API was failing. This is usually due to CORS restrictions in the browser.
// We use a public CORS proxy (e.g., allorigins or corsproxy.io) to bypass this, or fetch from TWSE as fallback.

async function fetchStockPriceFromYahoo(ticker) {
    // Yahoo finance requires .TW for TWSE and .TWO for TPEx.
    // We'll try .TW first, if it fails or returns null, we can try .TWO.
    // For simplicity, we can fetch from Yahoo Finance Chart API
    const yahooTicker = `${ticker}.TW`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}`;
    // Use corsproxy.io to bypass CORS issues from the browser
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Check if result exists and has meta
        if (data.chart && data.chart.result && data.chart.result.length > 0) {
            const meta = data.chart.result[0].meta;
            return {
                price: meta.regularMarketPrice,
                name: ticker // Yahoo API doesn't always give a nice Chinese name in the chart API, so we fallback to ticker or query TWSE for names later if needed.
            };
        }
    } catch (error) {
        console.error(`Yahoo Finance API fetch failed for ${ticker}:`, error);
    }

    // If .TW fails, try .TWO (TPEx)
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

