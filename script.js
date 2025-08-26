function showBtnClear(){
  const btnContainer = document.getElementById('btnClear');
  btnContainer.style.display = 'block';
};

function buildColIndexMap(table) {
  const headers = Array.from(table.querySelectorAll('thead th'))
                       .map(th => th.textContent.trim());
  const map = {};
  headers.forEach((h, i) => map[h.toLowerCase()] = i);
  return map;
}

function getAllTrades(table) {
  const colIndex = buildColIndexMap(table);
  const rows     = Array.from(table.querySelectorAll('tbody tr'));
  return rows.map(row => {
    const cells = row.querySelectorAll('td');
    const parseNum = key => parseFloat(cells[colIndex[key]].textContent) || 0;
    const parseDate = key => new Date(cells[colIndex[key]].textContent);

    return {
      symbol:       cells[colIndex['symbol']].textContent.trim(),
      type:         cells[colIndex['type']].textContent.trim(),       // “Buy”/“Sell”
      lots:         parseNum('lots'),
      profit:       parseNum('profit'),
      commission:   parseNum('commission'),
      entryTime:    parseDate('open time'),
      exitTime:     parseDate('close time')
    };
  });
}

function summarizeBySymbol(trades) {
  const summary = {};

  trades.forEach(t => {
    if (!summary[t.symbol]) {
      summary[t.symbol] = {
        symbol:        t.symbol,
        trades:        0,
        buys:          0,
        sells:         0,
        totalLots:     0,
        netPnL:        0,
        totalComm:     0,
        totalHours:    0
      };
    }

    const s = summary[t.symbol];
    s.trades++;
    s[t.type.toLowerCase() + 's']++;
    s.totalLots   += t.lots;
    s.netPnL      += t.profit;
    s.totalComm   += t.commission;
    s.totalHours  += (t.exitTime - t.entryTime) / 1000 / 3600;
  });

  // Convert to array and round hours to 2 decimals
  return Object.values(summary).map(s => ({
    ...s,
    totalHours: Math.round(s.totalHours * 100) / 100
  }));
}

function computeTotals(summaryData) {
  return summaryData.reduce((tot, row) => {
    tot.assets        += 1;
    tot.trades        += row.trades;
    tot.orders        += row.trades;          // or row.buys + row.sells if you prefer
    tot.buys          += row.buys;
    tot.sells         += row.sells;
    tot.totalLots     += row.totalLots;
    tot.netPnL        += row.netPnL;
    tot.totalComm     += row.totalComm;
    tot.totalHours    += row.totalHours;
    return tot;
  }, {
    assets: 0,
    trades: 0,
    orders: 0,
    buys: 0,
    sells: 0,
    totalLots: 0,
    netPnL: 0,
    totalComm: 0,
    totalHours: 0
  });
}

function renderSummary(data, containerId) {
  const container = document.getElementById(containerId);
  if (!data.length) {
    container.innerHTML = '<p>No trades found.</p>';
    return;
  }

  let html = `
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Symbol</th>
          <th># Trades</th>
          <th># Buys</th>
          <th># Sells</th>
          <th>Total Lots</th>
          <th>Net P/L</th>
          <th>Total Commission</th>
          <th>Total Hours</th>
        </tr>
      </thead>
      <tbody>`;

  data.forEach(r => {
    html += `
      <tr>
        <td>${r.symbol}</td>
        <td>${r.trades}</td>
        <td>${r.buys}</td>
        <td>${r.sells}</td>
        <td>${r.totalLots.toFixed(2)}</td>
        <td>${r.netPnL.toFixed(2)}</td>
        <td>${r.totalComm.toFixed(2)}</td>
        <td>${r.totalHours}</td>
      </tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function renderTotals(totals, containerId) {
  const c = document.getElementById(containerId);
  if (!totals.assets) {
    c.innerHTML = '';
    return;
  }

  c.innerHTML = `
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Assets Traded</th>
          <th>Total Trades</th>
          <th>Total Orders</th>
          <th>Total Buys</th>
          <th>Total Sells</th>
          <th>Total Lots</th>
          <th>Net P/L</th>
          <th>Total Commission</th>
          <th>Total Hours</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${totals.assets}</td>
          <td>${totals.trades}</td>
          <td>${totals.orders}</td>
          <td>${totals.buys}</td>
          <td>${totals.sells}</td>
          <td>${totals.totalLots.toFixed(2)}</td>
          <td>${totals.netPnL.toFixed(2)}</td>
          <td>${totals.totalComm.toFixed(2)}</td>
          <td>${Math.round(totals.totalHours * 100) / 100}</td>
        </tr>
      </tbody>
    </table>
  `;
}

document.getElementById('btnCalculate')
  .addEventListener('click', () => {
    const table  = document.querySelector('table');            // adjust selector if needed
    const trades = getAllTrades(table);
    const summary = summarizeBySymbol(trades);
    renderSummary(summary, 'tradeSummary');
    const totals = computeTotals(summary);
    renderTotals(totals, 'tradeTotals');
    showBtnClear();
  });

  document.getElementById('btnClear')
  .addEventListener('click', () => {
    const container = document.getElementById('tradeSummary');

    // Remove all summary content
    container.innerHTML = '';

          if (confirm('Clear all summary data?')) {
          container.innerHTML = '';

          document.getElementById('btnClear').style.display = 'none';
          document.getElementById('tradeTotals').style.display = 'none';
      }
  });