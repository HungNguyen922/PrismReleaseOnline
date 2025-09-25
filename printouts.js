const inputEl = document.getElementById('card-input');
const exportBtn = document.getElementById('export-btn');
let imageSrcs = [];

inputEl.addEventListener('change', (ev) => {
  imageSrcs = [];
  const files = ev.target.files;
  let loadPromises = [];

  for (let i = 0; i < files.length && i < 9; i++) {
    const file = files[i];
    const reader = new FileReader();

    let p = new Promise((resolve, reject) => {
      reader.onload = (e) => {
        imageSrcs.push(e.target.result);
        resolve();
      };
      reader.onerror = reject;
    });
    loadPromises.push(p);
    reader.readAsDataURL(file);
  }

  // Optionally wait until all images are loaded before enabling export button
  Promise.all(loadPromises).then(() => {
    // All data URLs loaded
    console.log("All images read, ready to export:", imageSrcs.length);
  }).catch(err => {
    console.warn("Failed reading some images:", err);
  });
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
  const pageW = 8.5 * 72;
  const pageH = 11 * 72;
  const doc = new jsPDF({
    unit: 'pt',
    format: [pageW, pageH]
  });

  const cols = 3;
  const rows = 3;
  const rawCellW = pageW / cols;
  const cellH = pageH / rows;

  // Preload images
  const imgs = await Promise.all(images.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }));

  let accumulatedX = 0;

  for (let idx = 0; idx < imgs.length && idx < cols * rows; idx++) {
    const img = imgs[idx];
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    // Determine x0 by snapping to accumulated
    const x0 = accumulatedX;
    // Next’s accumulation
    accumulatedX += rawCellW;

    const y0 = row * cellH;

    // CONTAIN scaling
    const scaleX = rawCellW / img.width;
    const scaleY = cellH / img.height;
    const scale = Math.min(scaleX, scaleY);

    const drawW = img.width * scale;
    const drawH = img.height * scale;

    let offsetX = x0 + (rawCellW - drawW) / 2;
    let offsetY = y0 + (cellH - drawH) / 2;

    if (offsetX < x0) offsetX = x0;
    if (offsetY < y0) offsetY = y0;
    if (offsetX + drawW > x0 + rawCellW) offsetX = (x0 + rawCellW) - drawW;
    if (offsetY + drawH > y0 + cellH) offsetY = (y0 + cellH) - drawH;

    const rx = Math.round(offsetX);
    const ry = Math.round(offsetY);
    const rw = Math.round(drawW);
    const rh = Math.round(drawH);

    doc.addImage(img, 'PNG', rx, ry, rw, rh);
  }

  doc.save('snapcolumns.pdf');
}
