async function fetchJSON(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function msgidToUrl (msgid) {
  return 'https://www.nntp.perl.org/group/perl.perl5.porters/;msgid=' + encodeURI(msgid)
}

function createTable(data) {
  const table = document.getElementById('jsonTable').tBodies[0];
  data.forEach(item => {
    const row = table.insertRow();
    Object.assign(row.insertCell(), { 'className': 'num', 'textContent': item.num });
    Object.assign(row.insertCell(), { 'className': 'date', 'textContent': item.date_meet });
    Object.assign(row.insertCell(), { 'className': 'date', 'textContent': item.date_pub });
    const subjCell = row.insertCell();
    if (item.mail_subj) {
      const minutesLink = Object.assign(document.createElement('a'), { 'href': msgidToUrl(item.mail_msgid), 'textContent': item.mail_subj });
      const minutesDiv = Object.assign(document.createElement('div'), { 'className': 'minutes' });
      minutesDiv.appendChild(minutesLink);
      subjCell.appendChild(minutesDiv);
      if (item.remark) {
        const renderedMsg = document.createTextNode(' (Note: ' + item.remark + ')');
        minutesDiv.appendChild(renderedMsg);
      }
      if (item.blog) {
        const blogLink = Object.assign(document.createElement('a'), { 'href': item.blog, 'textContent': item.blog_title });
        const blogDiv = Object.assign(document.createElement('div'), { 'className': 'blog' });
        blogDiv.appendChild(blogLink);
        subjCell.appendChild(blogDiv);
      }
      if (item.scribe) {
        const scribeDiv = Object.assign(document.createElement('div'), { 'className': 'scribe', 'textContent': item.scribe });
        subjCell.appendChild(scribeDiv);
      }
    } else {
      subjCell.textContent = item.remark;
    }
    const attendeesCell = Object.assign(row.insertCell(), { 'className': 'people' });
    if (item.attendees) {
      item.attendees.forEach(name => {
        const div = Object.assign(document.createElement('div'), { 'textContent':  name });
        attendeesCell.appendChild(div);
      });
    }
    const inviteesCell = Object.assign(row.insertCell(), { 'className': 'people' });
    if (item.invitees) {
      item.invitees.forEach(name => {
        const div = Object.assign(document.createElement('div'), { 'textContent':  name });
        inviteesCell.appendChild(div);
      });
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

  const sortOrder = columnHeader.getAttribute('data-sort-order');
  columnHeader.setAttribute('data-sort-order', sortOrder === 'asc' ? 'desc' : 'asc');

  // Update sort icons
  const allSortableHeaders = table.querySelectorAll('th[data-sort-order]');
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

  const newBody = table.createTBody();
  sortedRows.forEach(row => newBody.appendChild(row));
  table.removeChild(tbody);
}

async function init() {
  const json_url = '/psc.json';
  const data = await fetchJSON(json_url);
  createTable(data);
  sortTable(0);

  let url = location.href.replace(/\/$/, "");

  if (location.hash) {
    const hash = url.split('#');

    let tabTrigger = document.querySelector(`#nav-tab button[data-bs-target="#${hash[1]}"]`);
    if (tabTrigger) { // Check if the tabTrigger exists
        let tab = new bootstrap.Tab(tabTrigger);
        tab.show();
    }
    url = location.href.replace(/\/#.+/, '/');
}
}

init();

