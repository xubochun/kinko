const fmt = new Intl.NumberFormat("zh-Hant-TW");
const currency = (n) => `NT$ ${fmt.format(Math.round(n))}`;
const STORAGE_KEY = 'my_portfolio_assets_v3';
const HISTORY_KEY = 'my_portfolio_history';
const ARCHIVE_KEY = 'my_portfolio_assets_archive';
const HISTORY_ARCHIVE_KEY = 'my_portfolio_history_archive';

const state = {
    privacy: false,
    total: 0,
    cash: 0,
    stocks: 0,
    updatedAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    range: "3m",
    modalOpen: false,
    history: [],
    stockPrices: {},
    detailOpen: false,
    detailType: null
};

let userAssets = [];

async function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        userAssets = JSON.parse(stored);
    } else {
        userAssets = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userAssets));
    }

    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
        state.history = JSON.parse(storedHistory);
    }

    await recalculateState();
}

async function recalculateState() {
    let cashTotal = 0;
    let cashNames = new Set();
    let stockTickers = new Set();
    let stockShares = {};
    state.stockPrices = {};

    userAssets.forEach(asset => {
        if (asset.type === 'cash') {
            cashTotal += Number(asset.amount);
            cashNames.add(asset.name);
        } else if (asset.type === 'stock') {
            stockTickers.add(asset.ticker);
            if (!stockShares[asset.ticker]) stockShares[asset.ticker] = 0;
            stockShares[asset.ticker] += Number(asset.shares);
        }
    });

    let stockCurrentTotal = 0;
    for (let ticker in stockShares) {
        let price = 0;

        // 優先嘗試從 Yahoo Finance API 獲取
        try {
            const yahooData = await fetchStockPriceFromYahoo(ticker);
            if (yahooData) {
                price = yahooData.price;
                console.log(`[Yahoo API] ${ticker} 獲取成功: ${price}`);
            }
        } catch (e) {
            console.warn(`[Yahoo API] ${ticker} 失敗，改用備用 API`);
        }

        stockCurrentTotal += stockShares[ticker] * price;
        state.stockPrices[ticker] = price;
    }

    state.cash = cashTotal;
    state.stocks = stockCurrentTotal;
    state.total = cashTotal + stockCurrentTotal;

    document.getElementById('cashCount').textContent = `${cashNames.size} 個帳戶`;
    document.getElementById('stockCount').textContent = `${stockTickers.size} 檔標的`;

    recordTodayNetWorth(state.total);
}

function recordTodayNetWorth(totalValue) {
    const todayStr = new Date().toISOString().split('T')[0];

    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterdayStr = y.toISOString().split('T')[0];
    const hasYesterday = state.history.some(h => h.date === yesterdayStr);
    const onlyToday = state.history.length === 0
        || (state.history.length === 1 && state.history[0].date === todayStr);
    if (!hasYesterday && onlyToday) {
        state.history.push({ date: yesterdayStr, value: 0 });
    }

    const idx = state.history.findIndex(h => h.date === todayStr);
    if (idx >= 0) {
        state.history[idx].value = totalValue;
    } else {
        state.history.push({ date: todayStr, value: totalValue });
    }

    state.history.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
}

function toggleFormFields() {
    const type = document.getElementById('assetType').value;
    const cashFields = document.getElementById('cashFields');
    const stockFields = document.getElementById('stockFields');

    const cashName = document.getElementById('cashName');
    const assetAmount = document.getElementById('assetAmount');

    const stockTicker = document.getElementById('stockTicker');
    const stockDate = document.getElementById('stockDate');
    const stockShares = document.getElementById('stockShares');
    const stockPrice = document.getElementById('stockPrice');

    if (type === 'stock') {
        cashFields.classList.add('hidden');
        cashFields.classList.remove('flex');
        stockFields.classList.remove('hidden');
        stockFields.classList.add('flex');

        cashName.removeAttribute('required');
        assetAmount.removeAttribute('required');

        stockTicker.setAttribute('required', 'true');
        stockDate.setAttribute('required', 'true');
        stockShares.setAttribute('required', 'true');
        stockPrice.setAttribute('required', 'true');

        if (!stockDate.value) {
            stockDate.value = new Date().toISOString().split('T')[0];
        }
    } else {
        cashFields.classList.remove('hidden');
        cashFields.classList.add('flex');
        stockFields.classList.add('hidden');
        stockFields.classList.remove('flex');

        cashName.setAttribute('required', 'true');
        assetAmount.setAttribute('required', 'true');

        stockTicker.removeAttribute('required');
        stockDate.removeAttribute('required');
        stockShares.removeAttribute('required');
        stockPrice.removeAttribute('required');
    }
}

async function handleAddNewAsset(e) {
    e.preventDefault();
    const type = document.getElementById('assetType').value;
    let newRecord = { id: Date.now(), type };

    if (type === 'cash') {
        newRecord.name = document.getElementById('cashName').value;
        newRecord.amount = Number(document.getElementById('assetAmount').value);
    } else {
        newRecord.ticker = document.getElementById('stockTicker').value.trim();

        // 從 Yahoo Fetcher 取得名稱或直接使用代號
        newRecord.name = newRecord.ticker;

        newRecord.date = document.getElementById('stockDate').value;
        newRecord.shares = Number(document.getElementById('stockShares').value);
        newRecord.price = Number(document.getElementById('stockPrice').value);
        newRecord.costAmount = newRecord.shares * newRecord.price;
    }

    userAssets.push(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userAssets));

    document.getElementById('addAssetForm').reset();
    toggleFormFields();
    toggleAddModal();

    // 重新計算，這裡可能會發出 API 請求
    await recalculateState();
    updateDOMValues();
    buildMainChart(state.range);
    animateNumber("totalValue", state.total, 800);
}

function toggleAddModal() {
    state.modalOpen = !state.modalOpen;
    const overlay = document.getElementById('addModalOverlay');
    const sheet = document.getElementById('addModalSheet');

    if (state.modalOpen) {
        overlay.classList.remove('modal-enter');
        overlay.classList.add('modal-enter-active');
        sheet.classList.remove('sheet-enter');
        sheet.classList.add('sheet-enter-active');
        toggleFormFields();
    } else {
        overlay.classList.remove('modal-enter-active');
        overlay.classList.add('modal-enter');
        sheet.classList.remove('sheet-enter-active');
        sheet.classList.add('sheet-enter');
    }
}

function renderHiddenAmount(actualText, sizeClass = "h-3.5 w-3.5", justifyClass = "justify-center") {
    return `
    <span class="relative inline-flex items-center w-full min-h-[18px]">
      <span class="absolute inset-0 flex items-center ${justifyClass} gap-1.5 opacity-55 text-gray-400 whitespace-nowrap">
        <i data-lucide="eye-closed" class="${sizeClass}"></i>
        <i data-lucide="eye-closed" class="${sizeClass}"></i>
        <i data-lucide="eye-closed" class="${sizeClass}"></i>
      </span>
    </span>
  `;
}

function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日`;
}

function updateDOMValues() {
    const hasAssets = userAssets.length > 0;
    const totalEl = document.getElementById("totalValue");
    if (!hasAssets) {
        totalEl.classList.remove("text-gray-400");
        if (state.privacy) {
            totalEl.title = "已隱藏金額";
            totalEl.innerHTML = renderHiddenAmount(currency(0), "h-4 w-4", "justify-center lg:justify-start");
        } else {
            totalEl.title = currency(0);
            totalEl.textContent = currency(0);
        }
    } else {
        totalEl.classList.remove("text-gray-400");
        totalEl.title = state.privacy ? "已隱藏金額" : currency(state.total);
        totalEl.innerHTML = state.privacy
            ? renderHiddenAmount(currency(state.total), "h-4 w-4", "justify-center lg:justify-start")
            : currency(state.total);
    }

    document.getElementById("cashValue").innerHTML = state.privacy
        ? renderHiddenAmount(currency(state.cash), "h-3.5 w-3.5", "justify-end")
        : currency(state.cash);

    document.getElementById("stockValue").innerHTML = state.privacy
        ? renderHiddenAmount(currency(state.stocks), "h-3.5 w-3.5", "justify-end")
        : currency(state.stocks);

    const totalAsset = state.cash + state.stocks;
    let cashPct = "0.0";
    let stockPct = "0.0";

    if (totalAsset > 0) {
        cashPct = ((state.cash / totalAsset) * 100).toFixed(1);
        stockPct = ((state.stocks / totalAsset) * 100).toFixed(1);
    }

    setTimeout(() => {
        document.getElementById("cashBar").style.width = `${cashPct}%`;
        document.getElementById("stockBar").style.width = `${stockPct}%`;
        document.getElementById("cashPct").textContent = `${cashPct}%`;
        document.getElementById("stockPct").textContent = `${stockPct}%`;
    }, 100);

    const sp = document.getElementById("selectedPoint");
    if (sp.textContent !== "—") sp.innerHTML = "—";

    updateEmptyStates();

    if (window.lucide) lucide.createIcons();
}

function updateEmptyStates() {
    const hasAssets = userAssets.length > 0;
    const emptyStateWelcome = document.getElementById("emptyStateWelcome");
    const emptyStateChart = document.getElementById("emptyStateChart");
    const emptyStateStructure = document.getElementById("emptyStateStructure");
    const assetStructureContent = document.getElementById("assetStructureContent");
    const chartWithData = document.getElementById("chartWithData");
    const headerAddBtn = document.getElementById("headerAddBtn");
    const clearDataBtn = document.getElementById("clearDataBtn");

    if (hasAssets) {
        // 有資產：隱藏空狀態，顯示實際內容和操作按鈕
        emptyStateWelcome?.classList.add("hidden");
        emptyStateStructure?.classList.add("hidden");
        assetStructureContent?.querySelector('.soft-card')?.classList.remove('hidden');

        // 圖表區域：顯示圖表和控制項，隱藏空狀態
        if (emptyStateChart) {
            emptyStateChart.classList.add("hidden");
            emptyStateChart.classList.remove("flex");
        }
        if (chartWithData) {
            chartWithData.classList.remove("hidden");
            chartWithData.classList.add("flex");
        }

        // 顯示操作按鈕
        if (headerAddBtn) {
            headerAddBtn.classList.remove("hidden");
            headerAddBtn.classList.add("inline-flex");
        }
        if (clearDataBtn) {
            clearDataBtn.classList.remove("hidden");
            clearDataBtn.classList.add("inline-flex");
        }
    } else {
        // 無資產：顯示空狀態，隱藏實際內容和操作按鈕
        emptyStateWelcome?.classList.remove("hidden");
        emptyStateStructure?.classList.remove("hidden");
        assetStructureContent?.querySelector('.soft-card')?.classList.add('hidden');

        // 圖表區域：隱藏圖表和控制項，顯示空狀態
        if (emptyStateChart) {
            emptyStateChart.classList.remove("hidden");
            emptyStateChart.classList.add("flex");
        }
        if (chartWithData) {
            chartWithData.classList.add("hidden");
            chartWithData.classList.remove("flex");
        }

        // 隱藏操作按鈕
        if (headerAddBtn) {
            headerAddBtn.classList.add("hidden");
            headerAddBtn.classList.remove("inline-flex");
        }
        if (clearDataBtn) {
            clearDataBtn.classList.add("hidden");
            clearDataBtn.classList.remove("inline-flex");
        }
    }
}

function formatPnlAmount(value) {
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    return `${sign}${currency(Math.abs(value))}`;
}

function formatPnlPct(value) {
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    return `${sign}${Math.abs(value).toFixed(2)}%`;
}

function pnlClass(value) {
    if (value > 0) return "text-emerald-600";
    if (value < 0) return "text-rose-600";
    return "text-gray-500";
}

function bindStockAccordion(bodyEl) {
    bodyEl.onclick = (evt) => {
        const button = evt.target.closest(".detail-stock-button");
        if (!button || !bodyEl.contains(button)) return;

        const item = button.closest(".detail-stock-item");
        const panel = item ? item.querySelector(".detail-stock-body") : null;
        if (!item || !panel) return;

        const isOpen = !panel.classList.contains("hidden");
        bodyEl.querySelectorAll(".detail-stock-item").forEach(other => {
            if (other === item) return;
            other.classList.remove("is-open");
            const otherPanel = other.querySelector(".detail-stock-body");
            const otherButton = other.querySelector(".detail-stock-button");
            if (otherPanel) otherPanel.classList.add("hidden");
            if (otherButton) otherButton.setAttribute("aria-expanded", "false");
        });

        if (isOpen) {
            panel.classList.add("hidden");
            item.classList.remove("is-open");
            button.setAttribute("aria-expanded", "false");
        } else {
            panel.classList.remove("hidden");
            item.classList.add("is-open");
            button.setAttribute("aria-expanded", "true");
        }
    };
}

function openDetail(type) {
    if (!userAssets.length) return;
    state.detailOpen = true;
    state.detailType = type;

    const overlay = document.getElementById("detailOverlay");
    const sheet = document.getElementById("detailSheet");

    renderDetailContent(type);

    overlay.classList.remove("modal-enter");
    overlay.classList.add("modal-enter-active");
    sheet.classList.remove("sheet-enter");
    sheet.classList.add("sheet-enter-active");
    document.body.classList.add("no-scroll");
}

function closeDetail() {
    state.detailOpen = false;
    state.detailType = null;
    const overlay = document.getElementById("detailOverlay");
    const sheet = document.getElementById("detailSheet");
    overlay.classList.remove("modal-enter-active");
    overlay.classList.add("modal-enter");
    sheet.classList.remove("sheet-enter-active");
    sheet.classList.add("sheet-enter");
    document.body.classList.remove("no-scroll");
}

function renderDetailContent(type) {
    const titleEl = document.getElementById("detailTitle");
    const subtitleEl = document.getElementById("detailSubtitle");
    const summaryEl = document.getElementById("detailSummary");
    const bodyEl = document.getElementById("detailBody");
    const sheetEl = document.getElementById("detailSheet");

    if (sheetEl) sheetEl.classList.toggle("detail-sheet--stock", type === "stock");
    if (bodyEl) bodyEl.classList.toggle("detail-body--stock", type === "stock");

    if (type === "cash") {
        titleEl.textContent = "現金帳戶明細";
        if (subtitleEl) subtitleEl.textContent = "查看每個帳戶的餘額";
        summaryEl.className = "detail-summary mb-4";
        const cashAssets = userAssets.filter(a => a.type === "cash");
        const total = cashAssets.reduce((sum, a) => sum + Number(a.amount || 0), 0);
        const totalHtml = currency(total);
        summaryEl.innerHTML = `
          <div class="text-[12px] text-gray-500">總現金</div>
          <div class="text-[18px] font-semibold text-gray-900">${totalHtml}</div>
          <div class="text-[12px] text-gray-500 mt-1">${cashAssets.length} 個帳戶</div>
        `;

        if (!cashAssets.length) {
            bodyEl.innerHTML = `<div class="detail-row text-[13px] text-gray-500">尚未新增現金帳戶</div>`;
        } else {
            bodyEl.innerHTML = cashAssets.map(a => {
                const amountHtml = currency(a.amount || 0);
                return `
                  <div class="detail-row">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                        <i data-lucide="banknote" class="h-4 w-4"></i>
                      </div>
                      <div class="min-w-0">
                        <div class="text-[13px] font-semibold text-gray-900 truncate">${a.name || "未命名帳戶"}</div>
                        <div class="text-[11px] text-gray-500">現金資產</div>
                      </div>
                    </div>
                    <div class="text-right text-[14px] font-semibold text-gray-900">${amountHtml}</div>
                  </div>
                `;
            }).join("");
        }
    } else if (type === "stock") {
        titleEl.textContent = "股票資產明細";
        if (subtitleEl) subtitleEl.textContent = "先看各股摘要，點擊可展開買入批次細節";
        summaryEl.className = "detail-summary detail-summary--stock mb-4";
        const stockAssets = userAssets.filter(a => a.type === "stock");
        const grouped = {};
        stockAssets.forEach(a => {
            if (!grouped[a.ticker]) grouped[a.ticker] = [];
            grouped[a.ticker].push(a);
        });

        let totalCost = 0;
        let totalValue = 0;
        Object.keys(grouped).forEach(ticker => {
            const lots = grouped[ticker];
            const shares = lots.reduce((s, l) => s + Number(l.shares || 0), 0);
            const cost = lots.reduce((s, l) => s + Number(l.costAmount || (l.shares * l.price) || 0), 0);
            const price = Number(state.stockPrices[ticker] || 0);
            totalCost += cost;
            totalValue += shares * price;
        });
        const totalPnl = totalValue - totalCost;
        const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

        const totalValueHtml = currency(totalValue);
        const pnlHtml = formatPnlAmount(totalPnl);
        const pnlPctHtml = formatPnlPct(totalPnlPct);

        summaryEl.innerHTML = `
          <div class="summary-top">
            <div class="summary-label">總市值</div>
            <div class="summary-value summary-value--right">${totalValueHtml}</div>
          </div>
          <div class="summary-rows">
            <div class="summary-row">
              <div class="summary-label">總成本</div>
              <div class="summary-value-sm summary-value--right">${currency(totalCost)}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">總損益</div>
              <div class="summary-value-sm summary-value--right ${pnlClass(totalPnl)}">
                <span>${pnlHtml}</span>
                <span class="summary-sub">${pnlPctHtml}</span>
              </div>
            </div>
          </div>
        `;

        if (!stockAssets.length) {
            bodyEl.innerHTML = `<div class="detail-row text-[13px] text-gray-500">尚未新增股票資產</div>`;
        } else {
            bodyEl.innerHTML = Object.keys(grouped).map(ticker => {
                const lots = grouped[ticker];
                const name = lots[0].name || ticker;
                const shares = lots.reduce((s, l) => s + Number(l.shares || 0), 0);
                const cost = lots.reduce((s, l) => s + Number(l.costAmount || (l.shares * l.price) || 0), 0);
                const price = Number(state.stockPrices[ticker] || 0);
                const value = shares * price;
                const pnl = value - cost;
                const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;

                const priceHtml = price ? currency(price) : "—";
                const valueHtml = currency(value);
                const pnlHtmlLocal = formatPnlAmount(pnl);
                const pnlPctHtmlLocal = formatPnlPct(pnlPct);
                const costHtml = currency(cost);

                const lotRows = lots.map(lot => {
                    const lotCost = Number(lot.costAmount || (lot.shares * lot.price) || 0);
                    const lotValue = Number(lot.shares || 0) * price;
                    const lotPnl = lotValue - lotCost;
                    const lotPnlPct = lotCost > 0 ? (lotPnl / lotCost) * 100 : 0;
                    const lotCostHtml = currency(lotCost);
                    const lotValueHtml = currency(lotValue);
                    const lotPnlHtml = formatPnlAmount(lotPnl);
                    const lotPctHtml = formatPnlPct(lotPnlPct);
                    const lotDate = lot.date ? formatDate(lot.date) : "—";
                    return `
                      <div class="detail-table-row">
                        <div class="detail-cell">${lotDate}</div>
                        <div class="detail-cell detail-cell--num">${Number(lot.shares || 0)} 股</div>
                        <div class="detail-cell detail-cell--num">${lotCostHtml}</div>
                        <div class="detail-cell detail-cell--num">${lotValueHtml}</div>
                        <div class="detail-cell detail-cell--num detail-cell--pnl ${pnlClass(lotPnl)}">${lotPnlHtml}<span class="detail-pnl-pct">（${lotPctHtml}）</span></div>
                      </div>
                    `;
                }).join("");

                return `
                  <div class="detail-stock-item">
                    <button class="detail-stock-button" type="button" data-ticker="${ticker}" aria-expanded="false" aria-controls="stock-${ticker}">
                      <div class="detail-stock-left">
                        <div class="detail-stock-icon">
                          <i data-lucide="candlestick-chart" class="h-4 w-4"></i>
                        </div>
                        <div class="detail-stock-text">
                          <div class="detail-stock-name">${name}</div>
                          <div class="detail-stock-meta">
                            <span class="badge">${ticker}</span>
                            <span class="meta-dot">•</span>
                            <span>${shares} 股</span>
                            <span class="meta-dot">•</span>
                            <span>現價 ${priceHtml}</span>
                          </div>
                        </div>
                      </div>
                      <div class="detail-stock-right">
                        <div class="detail-stock-value">${valueHtml}</div>
                        <div class="detail-stock-pnl ${pnlClass(pnl)}">${pnlHtmlLocal} <span>${pnlPctHtmlLocal}</span></div>
                      </div>
                      <i data-lucide="chevron-down" class="detail-chevron h-4 w-4 text-gray-400"></i>
                    </button>
                    <div id="stock-${ticker}" class="detail-stock-body hidden" data-ticker="${ticker}">
                      <div class="detail-asset-metrics">
                        <div class="metric-block">
                          <div class="metric-label">總市值</div>
                          <div class="metric-value">${valueHtml}</div>
                        </div>
                        <div class="metric-block metric-block--pnl ${pnlClass(pnl)}">
                          <div class="metric-label">損益</div>
                          <div class="metric-value">${pnlHtmlLocal}</div>
                          <div class="metric-sub">${pnlPctHtmlLocal}</div>
                        </div>
                      </div>
                      <div class="detail-asset-foot">
                        <span>總成本 ${costHtml}</span>
                      </div>
                      <div class="detail-table-wrap">
                        <div class="detail-table">
                          <div class="detail-table-head">
                            <div class="detail-cell">買入日期</div>
                            <div class="detail-cell detail-cell--num">股數</div>
                            <div class="detail-cell detail-cell--num">成本</div>
                            <div class="detail-cell detail-cell--num">現值</div>
                            <div class="detail-cell detail-cell--num">損益</div>
                          </div>
                          ${lotRows}
                        </div>
                      </div>
                    </div>
                  </div>
                `;
            }).join("");
            bindStockAccordion(bodyEl);
        }
    }

    if (window.lucide) lucide.createIcons();
}

let mainChart = null;
function buildMainChart(rangeKey) {
    const canvas = document.getElementById("mainChart");
    const ctx = canvas.getContext("2d");

    if (mainChart) mainChart.destroy();

    let filteredHistory = [...state.history];
    filteredHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Show empty state if no history
    if (filteredHistory.length === 0) {
        canvas.style.display = 'none';
        return;
    } else {
        canvas.style.display = 'block';
    }

    const labels = filteredHistory.map(h => h.date);
    const values = filteredHistory.map(h => h.value);

    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.parentElement.clientHeight || 240);
    gradient.addColorStop(0, "rgba(46,125,100, 0.25)");
    gradient.addColorStop(1, "rgba(46,125,100, 0.0)");

    const isSinglePoint = values.length === 1;

    mainChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "總資產",
                data: values.map(v => Math.round(v)),
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
                pointRadius: isSinglePoint ? 6 : 0,
                pointHoverRadius: isSinglePoint ? 8 : 6,
                pointHitRadius: 15,
                pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
                tension: 0.34,
                fill: true,
                backgroundColor: gradient
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(255,255,255,.96)",
                    titleColor: "rgba(17,24,39,.92)",
                    bodyColor: "rgba(17,24,39,.82)",
                    borderColor: "rgba(17,24,39,.10)",
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        title: (items) => formatDate(items[0].label),
                        label: (item) => `淨值 ${currency(item.raw)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: "rgba(17,24,39,.45)",
                        font: { size: 11, weight: "500" },
                        autoSkip: true,
                        maxTicksLimit: 6
                    },
                    border: { display: false }
                },
                y: {
                    grid: { color: "rgba(17,24,39,.04)", drawTicks: false },
                    ticks: {
                        color: "rgba(17,24,39,.45)", font: { size: 11, weight: "500" },
                        callback: (v) => {
                            if (v >= 100000000) return `${(v / 100000000).toFixed(1)}億`;
                            if (v >= 10000) return `${(v / 10000).toFixed(1)}萬`;
                            return Math.round(v);
                        },
                        maxTicksLimit: 4
                    },
                    border: { display: false }
                }
            },
            onClick: (evt) => {
                const points = mainChart.getElementsAtEventForMode(evt, "nearest", { intersect: false }, true);
                if (!points.length) return;
                const idx = points[0].index;
                const rawLabel = mainChart.data.labels[idx];
                const fullDate = formatDate(rawLabel);
                const val = mainChart.data.datasets[0].data[idx];

                const targetEl = document.getElementById("selectedPoint");
                if (state.privacy) {
                    targetEl.innerHTML = `<span>日期 ${fullDate}｜淨值 </span>${renderHiddenAmount(currency(val), "h-3.5 w-3.5", "justify-end")}`;
                    lucide.createIcons();
                } else {
                    targetEl.textContent = `日期 ${fullDate}｜淨值 ${currency(val)}`;
                }
            }
        }
    });
}

function setRange(key) {
    state.range = key;
    document.getElementById("btn1m").setAttribute("aria-pressed", key === "1m");
    document.getElementById("btn3m").setAttribute("aria-pressed", key === "3m");
    document.getElementById("btn1y").setAttribute("aria-pressed", key === "1y");
    document.getElementById("btnAll").setAttribute("aria-pressed", key === "all");

    const canvas = document.getElementById("mainChart");
    canvas.style.opacity = 0;
    canvas.style.transition = "opacity 0.2s ease";
    setTimeout(() => {
        buildMainChart(key);
        canvas.style.opacity = 1;
    }, 200);
}

function togglePrivacy() {
    state.privacy = !state.privacy;
    const btn = document.getElementById("privacyBtn");
    btn.innerHTML = state.privacy
        ? `<i data-lucide="eye" class="h-[18px] w-[18px]"></i>`
        : `<i data-lucide="eye-off" class="h-[18px] w-[18px]"></i>`;
    btn.setAttribute("aria-pressed", String(state.privacy));
    btn.setAttribute("title", state.privacy ? "顯示金額" : "隱藏金額");

    updateDOMValues();
}

async function toggleClearData() {
    const hasArchive = localStorage.getItem(ARCHIVE_KEY);

    if (hasArchive) {
        // 有備份資料，顯示恢復選項
        const confirmed = confirm('偵測到備份資料！\n\n✅ 確定 = 恢復備份資料\n❌ 取消 = 清空當前資料並備份');

        if (confirmed) {
            // 恢復資料
            const archivedAssets = localStorage.getItem(ARCHIVE_KEY);
            const archivedHistory = localStorage.getItem(HISTORY_ARCHIVE_KEY);

            if (archivedAssets) {
                localStorage.setItem(STORAGE_KEY, archivedAssets);
                userAssets = JSON.parse(archivedAssets);
            }

            if (archivedHistory) {
                localStorage.setItem(HISTORY_KEY, archivedHistory);
                state.history = JSON.parse(archivedHistory);
            }

            // 清除備份
            localStorage.removeItem(ARCHIVE_KEY);
            localStorage.removeItem(HISTORY_ARCHIVE_KEY);

            await recalculateState();
            updateDOMValues();
            buildMainChart(state.range);
            animateNumber("totalValue", state.total, 600);
            updateClearButton();

            alert('✅ 資料已恢復！');
        } else {
            // 清空當前資料
            await clearCurrentData();
        }
    } else {
        // 沒有備份資料，直接清空
        const confirmed = confirm('確定要清空所有資料嗎？\n\n資料將被備份，可隨時恢復。');
        if (confirmed) {
            await clearCurrentData();
        }
    }
}

async function loadDemoData() {
    const confirmed = confirm('載入示範資料將覆蓋目前的資料（如有）。\n\n示範資料包含：\n• 2 個銀行帳戶\n• 台積電投資紀錄\n\n確定要繼續嗎？');

    if (!confirmed) return;

    // 載入預設示範資料
    userAssets = [
        { "id": 1771863903995, "type": "cash", "name": "LINE Bank", "amount": 944479 },
        { "id": 1771863934043, "type": "cash", "name": "富邦銀行", "amount": 1000799 },
        { "id": 1771864315240, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2021-01-20", "shares": 600, "price": 560.32, "costAmount": 336192 },
        { "id": 1771864344465, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2024-03-07", "shares": 10, "price": 671, "costAmount": 6710 },
        { "id": 1771864344466, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2024-06-28", "shares": 90, "price": 970, "costAmount": 87300 },
        { "id": 1771864344467, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2024-07-19", "shares": 20, "price": 985, "costAmount": 19700 },
        { "id": 1771864344468, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2024-07-26", "shares": 30, "price": 929, "costAmount": 27870 },
        { "id": 1771864344469, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2024-08-05", "shares": 50, "price": 848, "costAmount": 42400 },
        { "id": 1771864344470, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2025-02-14", "shares": 30, "price": 1065, "costAmount": 31950 },
        { "id": 1771864344471, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2025-03-04", "shares": 30, "price": 1010, "costAmount": 30300 },
        { "id": 1771864344472, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2025-03-21", "shares": 40, "price": 977, "costAmount": 39080 },
        { "id": 1771864344473, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2025-03-31", "shares": 20, "price": 922, "costAmount": 18440 },
        { "id": 1771864344474, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2025-04-09", "shares": 20, "price": 798, "costAmount": 15960 },
        { "id": 1771864344475, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2025-10-28", "shares": 60, "price": 1485, "costAmount": 89100 },
        { "id": 1771864344476, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2026-01-28", "shares": 30, "price": 1820, "costAmount": 54600 },
        { "id": 1771864344477, "type": "stock", "ticker": "2330", "name": "台積電", "date": "2026-02-02", "shares": 10, "price": 1755, "costAmount": 17550 },
        { "id": 1771865344401, "type": "stock", "ticker": "2454", "name": "聯發科", "date": "2023-08-15", "shares": 120, "price": 815, "costAmount": 97800 },
        { "id": 1771865344402, "type": "stock", "ticker": "2454", "name": "聯發科", "date": "2024-05-22", "shares": 80, "price": 920, "costAmount": 73600 },
        { "id": 1771865344403, "type": "stock", "ticker": "2454", "name": "聯發科", "date": "2025-12-05", "shares": 60, "price": 1045, "costAmount": 62700 }
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userAssets));

    await recalculateState();
    updateDOMValues();
    buildMainChart(state.range);
    animateNumber("totalValue", state.total, 800);

    alert('✅ 示範資料載入完成！\n系統正在獲取台積電最新股價...');
}

async function clearCurrentData() {
    // 備份當前資料
    const currentAssets = localStorage.getItem(STORAGE_KEY);
    const currentHistory = localStorage.getItem(HISTORY_KEY);

    if (currentAssets) {
        localStorage.setItem(ARCHIVE_KEY, currentAssets);
    }

    if (currentHistory) {
        localStorage.setItem(HISTORY_ARCHIVE_KEY, currentHistory);
    }

    // 清空當前顯示
    userAssets = [];
    state.history = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));

    await recalculateState();
    updateDOMValues();
    buildMainChart(state.range);
    updateClearButton();

    alert('✅ 資料已清空並備份！\n隨時可點擊「恢復」按鈕還原資料。');
}

function updateClearButton() {
    const btn = document.getElementById("clearDataBtn");
    const btnMobile = document.getElementById("clearDataBtn-mobile");
    const hasArchive = localStorage.getItem(ARCHIVE_KEY);

    const updateButton = (button) => {
        if (!button) return;

        if (hasArchive) {
            const isMobile = button.id.includes('mobile');
            button.innerHTML = `<i data-lucide="archive-restore" class="h-4 w-4"></i>${isMobile ? '' : ' <span class="hidden sm:inline">恢復</span>'}`;
            button.title = "恢復備份資料";
            button.classList.remove('hover:ring-red-200', 'hover:text-red-600');
            button.classList.add('hover:ring-green-200', 'hover:text-green-600');
        } else {
            const isMobile = button.id.includes('mobile');
            button.innerHTML = `<i data-lucide="archive" class="h-4 w-4"></i>${isMobile ? '' : ' <span class="hidden sm:inline">清空</span>'}`;
            button.title = "清空資料（可恢復）";
            button.classList.remove('hover:ring-green-200', 'hover:text-green-600');
            button.classList.add('hover:ring-red-200', 'hover:text-red-600');
        }
    };

    updateButton(btn);
    updateButton(btnMobile);

    lucide.createIcons();
}

async function init() {
    resetDetailUI();
    await loadData();

    lucide.createIcons();
    updateDOMValues();
    updateClearButton();
    document.getElementById("updatedAt").textContent = state.updatedAt;

    buildMainChart(state.range);
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => buildMainChart(state.range), 250);
    });

    document.getElementById("btn1m").addEventListener("click", () => setRange("1m"));
    document.getElementById("btn3m").addEventListener("click", () => setRange("3m"));
    document.getElementById("btn1y").addEventListener("click", () => setRange("1y"));
    document.getElementById("btnAll").addEventListener("click", () => setRange("all"));
    document.getElementById("privacyBtn").addEventListener("click", togglePrivacy);

    if (userAssets.length > 0) {
    animateNumber("totalValue", state.total, 600);
}

function resetDetailUI() {
    state.detailOpen = false;
    state.detailType = null;
    document.body.classList.remove("no-scroll");
    const overlay = document.getElementById("detailOverlay");
    const sheet = document.getElementById("detailSheet");
    if (overlay) {
        overlay.classList.remove("modal-enter-active");
        overlay.classList.add("modal-enter");
    }
    if (sheet) {
        sheet.classList.remove("sheet-enter-active");
        sheet.classList.add("sheet-enter");
    }
}
}

function animateNumber(elId, target, ms) {
    const el = document.getElementById(elId);
    const start = target * 0.95;
    const t0 = performance.now();
    function tick(t) {
        if (state.privacy) return;
        const p = Math.min(1, (t - t0) / ms);
        const e = 1 - Math.pow(1 - p, 3);
        const v = start + (target - start) * e;
        el.textContent = currency(v);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = currency(target);
    }
    requestAnimationFrame(tick);
}

init();
