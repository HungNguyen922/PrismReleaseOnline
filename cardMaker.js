const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

// Your 10 chosen colors (hex + label)
const colorOptions = [
  {name: "Red", value: "#FF0000"},
  {name: "Green", value: "#00FF00"},
  {name: "Blue", value: "#0000FF"},
  {name: "Yellow", value: "#FFFF00"},
  {name: "Purple", value: "#800080"},
  {name: "Orange", value: "#FFA500"},
  {name: "Cyan", value: "#00FFFF"},
  {name: "Magenta", value: "#FF00FF"},
  {name: "Gray", value: "#808080"},
  {name: "Black", value: "#000000"}
];

// Populate dropdowns
function populateDropdowns() {
  ["color1", "color2", "color3", "color4"].forEach(id => {
    const select = document.getElementById(id);
    colorOptions.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.name;
      select.appendChild(option);
    });
    select.value = colorOptions[0].value; // default
  });
}

function drawCard() {
  const power = document.getElementById("power").value;
  const bulk = document.getElementById("bulk").value;
  const colors = [
    document.getElementById("color1").value,
    document.getElementById("color2").value,
    document.getElementById("color3").value,
    document.getElementById("color4").value,
  ];
  
  // Background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Colored stripes
  const stripeHeight = canvas.height / colors.length;
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i * stripeHeight, canvas.width, stripeHeight);
  });
  
  // Overlay card border
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
  // Text
  ctx.fillStyle = "#000";
  ctx.font = "40px Arial";
  ctx.fillText("Power: " + power, 30, 80);
  ctx.fillText("Bulk: " + bulk, 30, 140);
}

function downloadCard() {
  const link = document.createElement("a");
  link.download = "card.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Initialize
populateDropdowns();
drawCard();
