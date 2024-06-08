async function fetchJSON(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function createTable(data) {
  const table = document.getElementById('jsonTable').getElementsByTagName('tbody')[0];
  data.forEach(item => {
    const row = table.insertRow();
    row.insertCell().textContent = item.num;
    row.insertCell().textContent = item.date_meet;
    row.insertCell().textContent = item.date_pub;
    const subjCell = row.insertCell();
    if (item.subj) {
      const subjLink = document.createElement('a');
      subjLink.href = item.url;
      subjLink.textContent = item.subj;
      subjCell.appendChild(subjLink);
      if (item.msg) {
        const renderedMsg = document.createTextNode(' (Note: ' + item.msg + ')');
        subjCell.appendChild(renderedMsg);
      }
    } else {
      subjCell.textContent = item.msg;
    }
  });
}

function compareRows(a, b, columnIndex) {
    const aText = a.cells[columnIndex].textContent.trim();
    const bText = b.cells[columnIndex].textContent.trim();
    return aText.localeCompare(bText, undefined, { numeric: true, sensitivity: 'base' });
}

function sortTable(columnIndex) {
  const table = document.getElementById('jsonTable');
  const columnHeader = table.getElementsByTagName('th')[columnIndex];
  if (columnHeader.getAttribute('data-sortable') === 'false') {
    return;
  }

  const sortOrder = columnHeader.getAttribute('data-sort-order');
  columnHeader.setAttribute('data-sort-order', sortOrder === 'asc' ? 'desc' : 'asc');

  // Update sort icons
  const allSortableHeaders = table.querySelectorAll('th[data-sortable="true"]');
  allSortableHeaders.forEach(header => {
    const icon = header.querySelector('.sort-icon');
    icon.classList.remove('bi-arrow-down', 'bi-arrow-up');
    icon.classList.add('bi-arrow-down-up');
  });

  const currentIcon = columnHeader.querySelector('.sort-icon');
  currentIcon.classList.remove('bi-arrow-down-up');
  currentIcon.classList.add(sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down');

  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  const sortedRows = rows.sort((a, b) => {
    const comparison = compareRows(a, b, columnIndex) || compareRows(a, b, 1); // date_meet tiebreak
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  sortedRows.forEach((row, index) => {
    const newRow = tbody.insertRow(index);
    newRow.className = row.className;

    Array.from(row.cells).forEach((cell, cellIndex) => {
      newRow.insertCell(cellIndex).innerHTML = cell.innerHTML;
    });

    tbody.deleteRow(index + 1);
  });
}

async function init() {
  const url = '/psc.json';
  const data = await fetchJSON(url);
  createTable(data);
  sortTable(0);
}

init();
