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
    const p = new Promise((resolve, reject) => {
      reader.onload = (e) => {
        imageSrcs.push(e.target.result);
        resolve();
      };
      reader.onerror = reject;
    });
    loadPromises.push(p);
    reader.readAsDataURL(file);
  }

  Promise.all(loadPromises)
    .then(() => {
      console.log("All images read, ready to export:", imageSrcs.length);
    })
    .catch(err => {
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
  if (typeof jsPDF !== 'function') {
    console.error("jsPDF is not loaded or not in window.jspdf");
    return;
  }

  const pageW = 8.5 * 72;   // 612 pts
  const pageH = 11 * 72;    // 792 pts
  const doc = new jsPDF({
    unit: 'pt',
    format: [pageW, pageH]
  });

  const cols = 3;
  const rows = 3;

  // The physical size you want per card
  const CARD_W = 2.5 * 72;  // 180 pts
  const CARD_H = 3.5 * 72;  // 252 pts

  // If you want gutters, set these; otherwise zero
  const marginX = 0;
  const marginY = 0;

  // Center the entire grid on page (optional)
  const totalGridW = cols * CARD_W + (cols - 1) * marginX;
  const totalGridH = rows * CARD_H + (rows - 1) * marginY;
  const startX = (pageW - totalGridW) / 2;
  const startY = (pageH - totalGridH) / 2;

  // Load images into Image objects
  const imgs = await Promise.all(images.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => {
        console.error("Image load error:", err, src);
        resolve(null);  // resolve null to not break all
      };
      img.src = src;
    });
  }));

  for (let idx = 0; idx < imgs.length && idx < cols * rows; idx++) {
    const img = imgs[idx];
    if (!img) continue;  // skip failed ones
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x0 = startX + col * (CARD_W + marginX);
    const y0 = startY + row * (CARD_H + marginY);

    const scaleX = CARD_W / img.width;
    const scaleY = CARD_H / img.height;
    const scale = Math.min(scaleX, scaleY, 1);

    const drawW = img.width * scale;
    const drawH = img.height * scale;

    const offsetX = x0 + (CARD_W - drawW) / 2;
    const offsetY = y0 + (CARD_H - drawH) / 2;

    doc.addImage(img, 'PNG',
      Math.round(offsetX),
      Math.round(offsetY),
      Math.round(drawW),
      Math.round(drawH));
  }

  doc.save('cards_sheet.pdf');
}
