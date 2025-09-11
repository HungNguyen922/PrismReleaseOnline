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

    extraDeck = shuffle(extraDeck);
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
  slot.history = []; // optional if tracking history

  slot.addEventListener("dragover", e => e.preventDefault());
  slot.addEventListener("dragleave", () => slot.classList.remove("hover"));

  slot.addEventListener("drop", e => {
    e.preventDefault();
    slot.classList.remove("hover");

    const from = e.dataTransfer.getData("from");

    let card;

    // From hand
    if (from === "hand") {
      const index = e.dataTransfer.getData("cardIndex");
      card = hand.splice(index, 1)[0];
      renderHand();
    }

    // From another slot
    else if (from === "slot") {
      const sourceSlotId = e.dataTransfer.getData("slotId");
      const sourceSlot = document.getElementById(sourceSlotId);
      card = sourceSlot.dataset.card;
      sourceSlot.innerHTML = "";
      sourceSlot.removeAttribute("data-card");
    }

    if (!card) return;

    // Save previous card in history if needed
    if (slot.dataset.card) {
      slot.history.push(slot.dataset.card);
    }

    // Place new card
    const cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.setAttribute("draggable", "true");
    cardEl.dataset.card = card;

    const img = document.createElement("img");
    img.src = "cardDatabase/" + formatCardName(card) + ".png";
    img.alt = card;
    img.classList.add("card-img");

    cardEl.appendChild(img);
    slot.innerHTML = "";
    slot.appendChild(cardEl);

    slot.dataset.card = card;

    cardEl.addEventListener("dragstart", ev => {
      ev.dataTransfer.setData("from", "slot");
      ev.dataTransfer.setData("slotId", slot.id);
      ev.dataTransfer.setData("card", card);
    });
  });
});

// you can add cards to hand by dragging them

const handArea = document.getElementById("hand-area");

handArea.addEventListener("dragover", e => e.preventDefault());

handArea.addEventListener("drop", e => {
  e.preventDefault();
  const from = e.dataTransfer.getData("from");

  if (from === "slot") {
    const card = e.dataTransfer.getData("card");
    hand.push(card);
    renderHand();

    const sourceSlotId = e.dataTransfer.getData("slotId");
    const sourceSlot = document.getElementById(sourceSlotId);
    sourceSlot.innerHTML = "";
    sourceSlot.removeAttribute("data-card");
  }
});

// making a dynamic health tracker
let health = 15;

const healthSlot = document.getElementById("health-slot");
const healthValue = document.getElementById("health-value");

healthSlot.addEventListener("click", e => {
  const rect = healthSlot.getBoundingClientRect();
  const clickY = e.clientY - rect.top; // position relative to top of slot

  if (clickY < rect.height / 2) {
    // top half → increment
    health++;
  } else {
    // bottom half → decrement
    health--;
  }

  updateHealthUI();
});

function updateHealthUI() {
  healthValue.textContent = health;
}
