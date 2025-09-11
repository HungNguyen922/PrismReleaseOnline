let deck = [];   // cards left in the draw pile
let leader = null;
let extraDeck = [];
let hand = [];   // cards the player has drawn

function parseDeckText(text) {
  const lines = text.trim().split('\n');
  const deckName = lines[0].trim(); // first line is the deck name

  const cards = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip empty lines

    const [countStr, name] = line.split(',').map(s => s.trim());
    const count = parseInt(countStr, 10);

    for (let j = 0; j < count; j++) {
      cards.push(name);
    }
  }

  return { deckName, cards };
}

document.getElementById('upload-button').addEventListener('click', () => {
  const fileInput = document.getElementById('deck-upload');
  const file = fileInput.files[0];
  if (!file) return alert('Please select a file.');

  const reader = new FileReader();
  reader.onload = () => {
    const { deckName, cards } = parseDeckText(reader.result);

    console.log("Loaded deck:", deckName, "with", cards.length, "cards");

    // Sort cards into leader, extra, and main deck
    leader = null;
    extraDeck = [];
    const mainDeck = [];

    cards.forEach(card => {
      if (card.endsWith("(L)")) {
        leader = card.replace("(L)", "").trim();
      } else if (card.endsWith("(E)")) {
        extraDeck.push(card.replace("(E)", "").trim());
      } else {
        mainDeck.push(card.trim());
      }
    });

    loadDeck(mainDeck);
  };
  reader.readAsText(file);
});

function loadDeck(cards) {
    deck = shuffle(cards); // initialize and shuffle
    hand = [];
    updateDeckUI();
    updateLeaderUI();
    updateExtraUI();
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// --- UI updates ---
function updateDeckUI() {
  const slot = document.getElementById("deck-slot");
  if (slot) {
    slot.textContent = "Draw Pile (" + deck.length + ")";
  }
}

function updateLeaderUI() {
  const slot = document.getElementById("leader-slot");
  if (slot) {
    slot.textContent = leader ? "Leader Ready" : "Leader (drawn)";
  }
}

function updateExtraUI() {
  const slot = document.getElementById("extra-slot");
  if (slot) {
    slot.textContent = "Extra Deck (" + extraDeck.length + ")";
  }
}

// I don't know where to put this

document.querySelectorAll(".field-slot").forEach(slot => {
  // Allow dropping
  slot.addEventListener("dragover", e => {
    e.preventDefault(); // required
    slot.classList.add("hover"); // optional: add highlight
  });

  slot.addEventListener("dragleave", () => {
    slot.classList.remove("hover");
  });

  // Handle drop
  slot.addEventListener("drop", e => {
    e.preventDefault();
    slot.classList.remove("hover");

    const cardIndex = e.dataTransfer.getData("cardIndex");
    if (cardIndex === "") return;

    const card = hand.splice(cardIndex, 1)[0]; // remove from hand
    renderHand(); // re-render hand

    // render into slot
    const cardEl = document.createElement("div");
    cardEl.classList.add("card");

    const fileName = formatCardName(card);
    const img = document.createElement("img");
    img.src = "cardDatabase/" + fileName + ".png";
    img.alt = card;
    img.classList.add("card-img");

    cardEl.appendChild(img);
    slot.innerHTML = ""; // only 1 card per slot (optional)
    slot.appendChild(cardEl);
  });
});
