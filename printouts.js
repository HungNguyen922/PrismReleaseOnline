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

  // Load Image objects (with width/height)
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

    // Use "contain" scaling so image stays inside the cell
    const scaleX = cellW / img.width;
    const scaleY = cellH / img.height;
    const scale = Math.min(scaleX, scaleY);

    const drawW = img.width * scale;
    const drawH = img.height * scale;

    let offsetX = x0 + (cellW - drawW) / 2;
    let offsetY = y0 + (cellH - drawH) / 2;

    // Clamp into the cell
    if (offsetX < x0) offsetX = x0;
    if (offsetY < y0) offsetY = y0;
    if (offsetX + drawW > x0 + cellW) offsetX = (x0 + cellW) - drawW;
    if (offsetY + drawH > y0 + cellH) offsetY = (y0 + cellH) - drawH;

    // Round values
    const rx = Math.round(offsetX);
    const ry = Math.round(offsetY);
    const rw = Math.round(drawW);
    const rh = Math.round(drawH);

    doc.addImage(img, 'PNG', rx, ry, rw, rh);
  }

  // **You must save the document** for download
  doc.save('printoutSheet.pdf');
}
