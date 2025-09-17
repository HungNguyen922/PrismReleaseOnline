const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

// === Load your assets ===
const assets = {
  background: "cardAssets/cardBase.png",
  border: "cardAssets/cardGutter.png",
  powerIcon: "cardAssets/POW/1.png",
  bulkIcon: "cardAssets/BLK/1.png",
  colors: {
    Red: "cardAssets/Palette/R.png",
    Orange: "cardAssets/Palette/O.png",
    Yellow: "cardAssets/Palette/Y.png",
    
    Green: "cardAssets/Palette/G.png",
    Turquoise: "cardAssets/Palette/T.png",
    Cyan: "cardAssets/Palette/C.png",
    
    Blue: "cardAssets/Palette/B.png",
    Violet: "cardAssets/Palette/V.png",
    Magenta: "cardAssets/Palette/M.png",
    
    White: "cardAssets/Palette/W.png",
    Black: "cardAssets/Palette/B.png"
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
  const name = document.getElementById("cardName").value;
  const power = document.getElementById("power").value;
  const bulk = document.getElementById("bulk").value;
  const colors = [
    document.getElementById("color1").value,
    document.getElementById("color2").value,
    document.getElementById("color3").value,
    document.getElementById("color4").value
  ];

  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // background
  ctx.drawImage(loaded.background, 0,0, canvas.width, canvas.height);

  // name text
  ctx.fillStyle = "black";
  ctx.font = "56px Fjalla";
  ctx.textAlign = "center";
  const centerX = canvas.width / 2;
  ctx.fillText(name, centerX, 80);

  // power + bulk icons
  ctx.drawImage(loaded.powerIcon, 25, 25, 80, 80);
  ctx.drawImage(loaded.bulkIcon, 25, 100, 80, 80);

  // power & bulk text
  ctx.font = "bold 60px Fjalla";
  ctx.textAlign = "center";
  ctx.fillText(power, 100, 100);
  ctx.fillText(bulk, 100, 200);

  // color icons (right side stacked)
  const positions = [
    {x: 645, y: 25},
    {x: 645, y: 100},
    {x: 645, y: 175},
    {x: 645, y: 250}
  ];
  colors.forEach((c,i) => {
    if (!c) return;
    const img = loaded.colors[c];
    ctx.drawImage(img, positions[i].x, positions[i].y, 80, 80);
  });

  // border on top
  ctx.drawImage(loaded.border, 0,0, canvas.width, canvas.height);
}

function downloadCard() {
  const link = document.createElement("a");
  link.download = "card.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// init
window.onload = () => {
  populateDropdowns();
  drawCard();
};

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
    userArt.onload = () => drawCard();
  };
  reader.readAsDataURL(file);
});

// Draw card
function drawCard() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // background (example)
  ctx.fillStyle = "#ddd";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw art if loaded
  if (userArt) {
    ctx.drawImage(userArt, artX, artY, artW, artH);
  }

  // placeholder for border
  ctx.strokeStyle = "black";
  ctx.lineWidth = 8;
  ctx.strokeRect(0,0,canvas.width,canvas.height);
}

// Dragging logic
canvas.addEventListener("mousedown", (e) => {
  if (!userArt) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (mouseX > artX && mouseX < artX + artW &&
      mouseY > artY && mouseY < artY + artH) {
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
