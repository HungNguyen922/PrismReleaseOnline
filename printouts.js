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

async function exportPDFNoOverlap(images) {
  const { jsPDF } = window.jspdf;

  const pageW = 8.5 * 72;
  const pageH = 11 * 72;
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

  // CONTAIN: ensure the image fits fully inside the cell (no bleed)
  const scaleX = cellW / img.width;
  const scaleY = cellH / img.height;
  const scale = Math.min(scaleX, scaleY);  // <<< changed

  const drawW = img.width * scale;
  const drawH = img.height * scale;

  // center inside the cell
  let offsetX = x0 + (cellW - drawW) / 2;
  let offsetY = y0 + (cellH - drawH) / 2;

  // Clamp to the cell (not the whole page)
  if (offsetX < x0) offsetX = x0;
  if (offsetY < y0) offsetY = y0;
  if (offsetX + drawW > x0 + cellW) offsetX = (x0 + cellW) - drawW;
  if (offsetY + drawH > y0 + cellH) offsetY = (y0 + cellH) - drawH;

  // Round to avoid fractional drift
  const rx = Math.round(offsetX);
  const ry = Math.round(offsetY);
  const rw = Math.round(drawW);
  const rh = Math.round(drawH);

  doc.addImage(img, 'PNG', rx, ry, rw, rh);
}
