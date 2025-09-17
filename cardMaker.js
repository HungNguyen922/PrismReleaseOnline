const canvas = document.getElementById("cardCanvas");

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

function downloadCard() {
  const link = document.createElement("a");
  link.download = "card.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Initialize
populateDropdowns();
drawCard();
