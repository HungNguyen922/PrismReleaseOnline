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

  // Use points unit for higher precision (1 in = 72 points)
  const doc = new jsPDF({
    unit: 'pt',
    format: [8.5 * 72, 11 * 72]  // [612, 792] points
  });

  const pageW = 8.5 * 72;  // 612 pts
  const pageH = 11 * 72;   // 792 pts

  const cols = 3;
  const rows = 3;

  // Compute cell sizes in points
  const cellW = pageW / cols;  // 204 pts each if exact
  const cellH = pageH / rows;  // 264 pts each if exact

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

    const x0 = col * cellW;
    const y0 = row * cellH;

    // OPTION A: Fill the full cell (cover) → image might be cropped
    // OPTION B: Contain inside cell → might leave internal whitespace

    // For "touching" columns, the *cell boundaries* must touch. So layout uses exact cellW, no gutter.

    // If you want images to also touch (no internal whitespace), use cover scaling:

    const scaleX = cellW / img.width;
    const scaleY = cellH / img.height;
    const scale = Math.max(scaleX, scaleY);  // ensures image covers the whole cell

    const drawW = img.width * scale;
    const drawH = img.height * scale;

    const offsetX = x0 + (cellW - drawW) / 2;
    const offsetY = y0 + (cellH - drawH) / 2;

    // Using drawImage; format might be 'PNG' if using PNG images
    doc.addImage(img, 'PNG', offsetX, offsetY, drawW, drawH);
  }

  doc.save('cards_no_gap_highprecision.pdf');
}
