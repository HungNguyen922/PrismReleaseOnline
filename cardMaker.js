const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

// === Load your assets ===
const assets = {
  background: "cardAssets/cardBase.png",
  border: "cardAssets/cardGutter.png",
  powerIcon: "cardAssets/POW.png",
  bulkIcon: "cardAssets/BLK.png",
  colors: {
    None: "",
    Red: "cardAssets/Palette/R.png",
    Orange: "cardAssets/Palette/O.png",
    Yellow: "cardAssets/Palette/Y.png",
    
    Green: "cardAssets/Palette/G.png",
    Cyan: "cardAssets/Palette/C.png",
    Blue: "cardAssets/Palette/B.png",
    
    Violet: "cardAssets/Palette/V.png",
    Magenta: "cardAssets/Palette/M.png",
    Pink: "cardAssets/Palette/P.png",
    
    White: "cardAssets/Palette/W.png",
    Black: "cardAssets/Palette/K.png"
  }
};

// preload images
function loadImages(obj) {
  const images = {};
  const promises = [];
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      images[key] = new Image();
      images[key].src = obj[key];
      promises.push(new Promise(res => images[key].onload = res));
    } else {
      images[key] = loadImages(obj[key]);
    }
  }
  return images;
}

const loaded = loadImages(assets);

// color dropdowns
const colorOptions = Object.keys(assets.colors);
function populateDropdowns() {
  ["color1","color2","color3","color4"].forEach(id => {
    const select = document.getElementById(id);
    colorOptions.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
  });
}

function drawCard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background
  ctx.drawImage(loaded.background, 0, 0, canvas.width, canvas.height);

  // uploaded user art
  if (userArt) {
    ctx.drawImage(userArt, artX, artY, artW, artH);
  }

  // name text
  const name = document.getElementById("cardName").value;
  ctx.fillStyle = "black";
  ctx.font = "56px Fjalla";
  ctx.textAlign = "center";
  ctx.lineWidth = 10;                // thickness of the outline
  ctx.strokeStyle = "white";        // outline color
  ctx.strokeText(name, canvas.width / 2, 80);
  ctx.fillText(name, canvas.width / 2, 80);

  // power + bulk icons
  ctx.drawImage(loaded.powerIcon, 25, 25, 80, 80);
  ctx.drawImage(loaded.bulkIcon, 25, 100, 80, 80);

  // power & bulk text
  const power = document.getElementById("power").value;
  const bulk = document.getElementById("bulk").value;
  ctx.font = "70px Fjalla";
  ctx.textAlign = "center";
  ctx.lineWidth = 10;                // thickness of the outline
  ctx.strokeStyle = "white";        // outline color
  ctx.strokeText(power, 65, 90);
  ctx.fillText(power, 65, 90);
  ctx.strokeText(bulk, 65, 170);
  ctx.fillText(bulk, 65, 170);

  // color icons
  const colors = [
    document.getElementById("color1").value,
    document.getElementById("color2").value,
    document.getElementById("color3").value,
    document.getElementById("color4").value
  ];
  const positions = [
    {x: 645, y: 25},
    {x: 645, y: 100},
    {x: 645, y: 175},
    {x: 645, y: 250}
  ];
  colors.forEach((c, i) => {
    if (!c) return;
    const img = loaded.colors[c];
    ctx.drawImage(img, positions[i].x, positions[i].y, 80, 80);
  });

  // === card text (effects / traits) ===
  ctx.font = "50px 'Fjalla";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "white";
  
  const effectLines = [
    document.getElementById("line1").value,
    document.getElementById("line2").value,
    document.getElementById("line3").value
  ];
  
  const textYStart = 700;   // adjust based on your card size
  const lineHeight = 100;    // space between lines
  effectLines.forEach((line, i) => {
    const y = textYStart + i * lineHeight;
    if (line.trim() !== "") {
      ctx.strokeText(line, canvas.width / 2, y);
      ctx.fillText(line, canvas.width / 2, y);
    }
  });

  // border on top
  ctx.drawImage(loaded.border, 0, 0, canvas.width, canvas.height);
}

function downloadCard() {
  const link = document.createElement("a");
  link.download = "card.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function attachLiveUpdates() {
  document.getElementById("cardName").addEventListener("input", drawCard);
  document.getElementById("power").addEventListener("input", drawCard);
  document.getElementById("bulk").addEventListener("input", drawCard);

  ["color1","color2","color3","color4"].forEach(id => {
    document.getElementById(id).addEventListener("change", drawCard);
  });

  ["line1","line2","line3"].forEach(id => {
    document.getElementById(id).addEventListener("input", drawCard);
  });
}

// init
window.onload = () => {
  populateDropdowns();
  attachLiveUpdates();
  
  document.fonts.ready.then(() => {
    drawCard(); // ensures the font is loaded before first render
  });
};

function isInsideArt(mx, my, padding = 10) {
  const left = Math.min(artX, artX + artW) - padding;
  const right = Math.max(artX, artX + artW) + padding;
  const top = Math.min(artY, artY + artH) - padding;
  const bottom = Math.max(artY, artY + artH) + padding;

  return mx >= left && mx <= right && my >= top && my <= bottom;
}

let userArt = null;
let artX = 150, artY = 200;      // default position
let artW = 450, artH = 450;      // default size (scaled to your template)
let isDragging = false;
let dragStart = {x:0, y:0};

// Upload image
document.getElementById("artUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    userArt = new Image();
    userArt.src = event.target.result;
    userArt.onload = () => {
    const aspect = userArt.width / userArt.height;
    const frameW = 450;
    const frameH = 450;
  
    if (aspect > 1) {
      // wider than tall → fit width
      artW = frameW;
      artH = frameW / aspect;
    } else {
      // taller than wide → fit height
      artH = frameH;
      artW = frameH * aspect;
    }
  
    // center inside your frame
    artX = 150 + (frameW - artW) / 2;
    artY = 200 + (frameH - artH) / 2;
  
    drawCard();
  };
  };
  reader.readAsDataURL(file);
});

// Dragging logic
canvas.addEventListener("mousedown", (e) => {
  if (!userArt) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (userArt && isInsideArt(mouseX, mouseY)) {
  isDragging = true;
  dragStart.x = mouseX - artX;
  dragStart.y = mouseY - artY;
}
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  artX = mouseX - dragStart.x;
  artY = mouseY - dragStart.y;
  drawCard();
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

// Zoom controls
document.addEventListener("keydown", (e) => {
  if (!userArt) return;
  if (e.key === "+") { // zoom in
    artW *= 1.1;
    artH *= 1.1;
  }
  if (e.key === "-") { // zoom out
    artW *= 0.9;
    artH *= 0.9;
  }
  drawCard();
});
