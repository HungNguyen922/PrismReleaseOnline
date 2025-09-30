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

  // Compute integer widths for columns
  const baseW = Math.floor(pageW / cols);            // e.g. 612 / 3 = 204
  const extra = pageW - baseW * cols;                // leftover pts
  // Build array of widths so that the first `extra` columns get +1 pt
  const cellWidths = Array(cols).fill(baseW).map((w, c) => w + (c < extra ? 1 : 0));

  // Compute x offsets for each column
  const xOffsets = [];
  let cumX = 0;
  for (let c = 0; c < cols; c++) {
    xOffsets.push(cumX);
    cumX += cellWidths[c];
  }

  // You may or may not want the same trick for heights — for vertical you can keep fractional
  const cellH = pageH / rows;

  // Load images
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

    // Compute the top-left “ideal” position for this card cell
    const x0 = col * (CARD_W + marginX);
    const y0 = row * (CARD_H + marginY);

    // Compute scale so the image fits within the card’s dimensions, but doesn’t upscale
    const scaleX = CARD_W / img.width;
    const scaleY = CARD_H / img.height;
    const scale = Math.min(scaleX, scaleY, 1);

    const drawW = img.width * scale;
    const drawH = img.height * scale;

    // Center the image within the card cell
    const offsetX = x0 + (CARD_W - drawW) / 2;
    const offsetY = y0 + (CARD_H - drawH) / 2;

    doc.addImage(img, 'PNG',
      Math.round(offsetX), Math.round(offsetY),
      Math.round(drawW), Math.round(drawH));
  }

  doc.save('cards_sheet.pdf');
}
