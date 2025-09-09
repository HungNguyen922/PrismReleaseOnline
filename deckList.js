document.getElementById('export-button').addEventListener('click', () => {
    const rows = [];
    document.querySelectorAll('#deck-cards .deck-card').forEach(card => {
      const name = card.getAttribute('data-card-name');
      const countEl = card.querySelector('.card-count');
      const count = countEl ? countEl.textContent.trim() : '0';
      rows.push([count, name]);
    });

    // Assemble as CSV—each row "count,name"
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\r\n");

    // Create and "click" a hidden download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'deck_list.csv');
    document.body.appendChild(link); // needed for Firefox
    link.click();
    document.body.removeChild(link);
  });
