// Global store for all rows and a Set for unique headers
const allData = [];
const headerSet = new Set();
const preview = document.getElementById('preview');

function enableSummaryButtons(){
  document.getElementById('btnCalculate').disabled = false;
  document.getElementById('btnClear').disabled = false;
};

function showBtnCalculate(){
  const btnContainer = document.getElementById('btnCalculate');
  btnContainer.style.display = 'block';
};
function showBtnClear(){
  const btnContainer = document.getElementById('btnClear');
  btnContainer.style.display = 'block';
};

// Add CSV button
document.getElementById('addCsvBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('csvFile');
  if (!fileInput.files.length) return alert('Select a CSV first');
  const file = fileInput.files[0];

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: ({ data, meta }) => {
      // Merge new headers
      meta.fields.forEach(h => headerSet.add(h));

      // Append new rows
      data.forEach(row => allData.push(row));

      // Re-render table
      renderTable();
      fileInput.value = ''; // reset input for next upload
      enableSummaryButtons();
      showBtnCalculate();
    }
  });
});

// Clear Table button
document.getElementById('clearTableBtn').addEventListener('click', () => {
  allData.length = 0;
  headerSet.clear();
  renderTable();
  document.getElementById('btnCalculate').disabled = true;
  document.getElementById('btnCalculate').style.display = 'none';
  document.getElementById('btnClear').style.display = 'none';
});

// Render function combines headers & rows
function renderTable() {
  // Convert Set to ordered array
  const headers = Array.from(headerSet);
  preview.innerHTML = '';

  // Build THEAD
  const thead = preview.createTHead();
  const headerRow = thead.insertRow();
  headers.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });

  // Build TBODY
  const tbody = preview.createTBody();
  allData.forEach(row => {
    const tr = tbody.insertRow();
    headers.forEach(col => {
      const td = tr.insertCell();
      td.textContent = row[col] ?? '';
    });
  });
}