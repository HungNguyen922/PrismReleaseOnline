const inputEl = document.getElementById('card-input');
const exportBtn = document.getElementById('export-btn');
let imageSrcs = [];

inputEl.addEventListener('change', (ev) => {
  imageSrcs = [];
  const files = ev.target.files;
  for (let i = 0; i < files.length && i < 9; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (e) => {
      imageSrcs.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

exportBtn.addEventListener('click', () => {
  if (imageSrcs.length === 0) {
    alert("Please select images");
    return;
  }
  exportPDFHighPrecision(imageSrcs);
});

async function exportPDFHighPrecision(images) {
  const { jsPDF } = window.jspdf;

  const pageW = 8.5 * 72;  // 612 pts
  const pageH = 11 * 72;   // 792 pts
  const doc = new jsPDF({
    unit: 'pt',
    format: [pageW, pageH]
  });

  const cols = 3;
  const rows = 3;
  const cellW = pageW / cols;
  const cellH = pageH / rows;

  const imgs = await Promise.all(images.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }));

  for (let idx = 0; idx < imgs.length && idx < cols * rows; idx++) {
    const img = imgs[idx];
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x0 = col * cellW;
    const y0 = row * cellH;

    const scaleX = cellW / img.width;
    const scaleY = cellH / img.height;
    const scale = Math.max(scaleX, scaleY);

    let drawW = img.width * scale;
    let drawH = img.height * scale;

    let offsetX = x0 + (cellW - drawW) / 2;
    let offsetY = y0 + (cellH - drawH) / 2;

    // Clamp so no part draws outside the page
    if (offsetY < 0) {
      // move down or shrink
      drawH = drawH + offsetY;  // reduces height
      offsetY = 0;
    }
    if (offsetY + drawH > pageH) {
      drawH = pageH - offsetY;
    }
    if (offsetX < 0) {
      drawW = drawW + offsetX;
      offsetX = 0;
    }
    if (offsetX + drawW > pageW) {
      drawW = pageW - offsetX;
    }

    // Round to avoid fractional pts
    const rx = Math.round(offsetX);
    const ry = Math.round(offsetY);
    const rw = Math.round(drawW);
    const rh = Math.round(drawH);

    doc.addImage(img, 'PNG', rx, ry, rw, rh);
  }

  doc.save('printoutSheet.pdf');
}
