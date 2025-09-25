const inputEl = document.getElementById('card-input');
const previewGrid = document.getElementById('preview-grid');
const exportBtn = document.getElementById('export-btn');

let imageSrcs = [];  // array of data URLs or object URLs

inputEl.addEventListener('change', (ev) => {
  imageSrcs = [];  // reset
  previewGrid.innerHTML = '';

  const files = ev.target.files;
  for (let i = 0; i < files.length && i < 9; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      imageSrcs.push(dataUrl);

      const img = document.createElement('img');
      img.src = dataUrl;
      previewGrid.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

exportBtn.addEventListener('click', () => {
  if (imageSrcs.length === 0) {
    alert('Please select at least one card image.');
    return;
  }
  exportCardsToPDF(imageSrcs);
});

// The exportCardsToPDF function from earlier
async function exportCardsToPDF(images) {
  const { jsPDF } = window.jspdf;
  const cols = 3, rows = 3;
  const pageW_in = 8.5, pageH_in = 11;
  const cardW_in = 2.5, cardH_in = 3.5;
  const margin_in = 0.2, gutter_in = 0.08;

  const doc = new jsPDF({
    unit: 'in',
    format: [pageW_in, pageH_in]
  });

  // Preload images
  const imgs = await Promise.all(images.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  }));

  const usableW = pageW_in - 2 * margin_in;
  const usableH = pageH_in - 2 * margin_in;
  const cellW = (usableW - gutter_in * (cols - 1)) / cols;
  const cellH = (usableH - gutter_in * (rows - 1)) / rows;

  for (let i = 0; i < imgs.length && i < cols * rows; i++) {
    const img = imgs[i];
    const col = i % cols;
    const row = Math.floor(i / cols);

    const x0 = margin_in + col * (cellW + gutter_in);
    const y0 = margin_in + row * (cellH + gutter_in);

    const imgAspect = img.width / img.height;
    const cellAspect = cellW / cellH;

    let drawW, drawH;
    if (imgAspect > cellAspect) {
      drawW = cellW;
      drawH = drawW / imgAspect;
    } else {
      drawH = cellH;
      drawW = drawH * imgAspect;
    }

    const offsetX = x0 + (cellW - drawW) / 2;
    const offsetY = y0 + (cellH - drawH) / 2;

    doc.addImage(img, 'PNG', offsetX, offsetY, drawW, drawH);
  }

  doc.save('card_sheet.pdf');
}
