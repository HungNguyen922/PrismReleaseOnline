document.addEventListener("DOMContentLoaded", () => {
  const deckSlot = document.getElementById("deck-slot");
  const confirmDialog = document.getElementById("confirm-dialog");
  const confirmForm = document.getElementById("confirm-form");

  let draggedCardInfo = null;

  deckSlot.addEventListener("dragenter", e => {
    e.preventDefault();
    // store card info globally (or in draggedCardInfo)
    const from = e.dataTransfer.getData("from");
    const cardIndex = e.dataTransfer.getData("cardIndex");
    const slotId = e.dataTransfer.getData("slotId");
    const card = e.dataTransfer.getData("card");
    console.log("dragenter: ", { from, cardIndex, slotId, card });
    draggedCardInfo = { from, cardIndex: parseInt(cardIndex,10), slotId, card };
  });

  deckSlot.addEventListener("dragover", e => {
    e.preventDefault();
  });

  deckSlot.addEventListener("drop", e => {
    e.preventDefault();
    console.log("drop: draggedCardInfo =", draggedCardInfo);
    if (!draggedCardInfo) {
      console.warn("No dragged info, can’t open confirm");
      return;
    }
    if (confirmDialog && typeof confirmDialog.showModal === "function") {
      confirmDialog.showModal();
    } else {
      // fallback
      const yes = window.confirm("Send this card to the bottom?");
      if (yes) {
        sendCardToBottom(draggedCardInfo);
      }
      draggedCardInfo = null;
    }
  });

  confirmForm.addEventListener("close", e => {
    console.log("dialog closed, returnValue =", confirmDialog.returnValue);
    console.log("draggedCardInfo at close =", draggedCardInfo);

    if (confirmDialog.returnValue === "ok") {
      sendCardToBottom(draggedCardInfo);
    }

    draggedCardInfo = null;
  });

  function sendCardToBottom(info) {
    console.log("sendCardToBottom called with:", info);
    let removed = null;

    if (info.from === "hand") {
      const idx = info.cardIndex;
      if (Number.isInteger(idx) && idx >= 0 && idx < hand.length) {
        removed = hand.splice(idx, 1)[0];
        console.log("Removed from hand:", removed);
        renderHand();
      } else {
        console.warn("Invalid cardIndex:", idx);
      }
    } else if (info.from === "slot") {
      if (info.slotId) {
        const sourceSlot = document.getElementById(info.slotId);
        if (sourceSlot) {
          removed = removeTopCardFromSlot(sourceSlot);
          console.log("Removed from slot:", removed);
        } else {
          console.warn("sourceSlot not found:", info.slotId);
        }
      }
    }

    // fallback if above didn’t remove
    if (!removed && info.card) {
      removed = info.card;
      console.log("Fallback: using info.card:", removed);
    }

    if (!removed) {
      console.warn("Nothing removed, nothing to push");
      return;
    }

    // push to bottom
    if (!Array.isArray(deck)) {
      console.error("drawPile not defined or not array");
    } else {
      deck.push(removed);
      console.log("Card pushed to drawPile:", removed);
      updateDeckUI && updateDeckUI();
    }
  }

  // ==== End deck-slot integration ====
  
  // --- Setup field slots ---
  document.querySelectorAll(".field-slot").forEach(slot => {
    slot.history = []; // tracking gate history
    
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("dragleave", () => slot.classList.remove("hover"));

    slot.addEventListener("drop", e => {
      e.preventDefault();
      slot.classList.remove("hover");
    
      const from = e.dataTransfer.getData("from");
      let card;
    
      // Handle from hand
      if (from === "hand") {
        const index = e.dataTransfer.getData("cardIndex");
        card = hand.splice(index, 1)[0];
        renderHand();
        const slotId = e.target.id;
        placeCard(slotId, card); // shared across all players now
      } 
      // from another slot
      else if (from === "slot") {
        const sourceSlotId = e.dataTransfer.getData("slotId");
        const sourceSlot = document.getElementById(sourceSlotId);
        card = removeTopCardFromSlot(sourceSlot);
      }
    
      if (!card) return;
    
      // Push current top card to this slot's history
      if (slot.dataset.card) {
        slot.history.push(slot.dataset.card);
      }
    
      // Set new top card
      placeCardInSlot(slot, card);
    });
  });

  function placeCardInSlot(slot, card) {
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
  
    // Drag from slot
    cardEl.addEventListener("dragstart", ev => {
      ev.dataTransfer.setData("from", "slot");
      ev.dataTransfer.setData("slotId", slot.id);
      ev.dataTransfer.setData("card", card);
    });

    // 🔁 Update local + server state
    if (window.gameState && window.socket) {
      window.gameState.slots[slot.id] = card;
      updateServerState({ slots: window.gameState.slots });
    }
  }

  function removeTopCardFromSlot(slot) {
    const topCard = slot.dataset.card;
    slot.innerHTML = "";
    slot.removeAttribute("data-card");
  
    let prevCard = null;
    if (slot.history.length > 0) {
      prevCard = slot.history.pop();
      placeCardInSlot(slot, prevCard);
    }

    if (window.gameState && window.socket) {
      window.gameState.slots[slot.id] = slot.dataset.card || null;
    }
  
    return topCard;
  }

  // --- Setup hand drop (from slot back to hand) ---
  const handArea = document.getElementById("hand-area");

  handArea.addEventListener("dragover", e => e.preventDefault());

  handArea.addEventListener("drop", e => {
    e.preventDefault();
    const from = e.dataTransfer.getData("from");

    if (from === "slot") {
      const card = e.dataTransfer.getData("card");
      const sourceSlotId = e.dataTransfer.getData("slotId");
      const sourceSlot = document.getElementById(sourceSlotId);

      if (!card || !sourceSlot) return;

      // Remove from slot
      const removed = removeTopCardFromSlot(sourceSlot);
      hand.push(removed);
      renderHand();

      // Add back to hand
      hand.push(card);
      renderHand();
    }
  });
});

function renderHand() {
  const handArea = document.getElementById("hand-area");
  handArea.innerHTML = "";

  hand.forEach((card, index) => {
    const cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.setAttribute("draggable", "true");
    cardEl.dataset.index = index; // track card in hand
    cardEl.dataset.from = "hand";

    const img = document.createElement("img");
    img.src = "cardDatabase/" + formatCardName(card) + ".png";
    img.alt = card;
    img.classList.add("card-img");

    cardEl.appendChild(img);

    cardEl.addEventListener("dragstart", e => {
      e.dataTransfer.setData("from", "hand");
      e.dataTransfer.setData("cardIndex", index);
      e.dataTransfer.setData("card", card);
    });

    handArea.appendChild(cardEl);
  });
}

// making a dynamic health tracker
let health = 20;

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

// functionality to clear the board after use
const clearBoardBtn = document.getElementById("clear-board-btn");

clearBoardBtn.addEventListener("click", () => {
  if (!window.gameState || !window.socket) return;

  if (!confirm("Are you sure you want to clear the board and all hands?")) return;

  // --- Clear all field slots ---
  document.querySelectorAll(".field-slot").forEach(slot => {
    slot.innerHTML = "";
    slot.dataset.card = null;
    slot.history = [];
  });

  // --- Reset gameState slots ---
  for (const slotId in window.gameState.slots) {
    window.gameState.slots[slotId] = null;
  }

  // --- Clear local hand ---
  if (!window.hand) window.hand = []; // ensure hand exists
  window.hand.length = 0;
  renderHand(); // refresh UI

  // --- Clear hands for all players in gameState ---
  if (!window.gameState.hands) window.gameState.hands = {};
  for (const playerId in window.gameState.hands) {
    window.gameState.hands[playerId] = [];
  }

  // --- Reset other decks if needed ---
  if (window.gameState.decks) {
    for (const playerId in window.gameState.decks) {
      window.gameState.decks[playerId] = [];
    }
  }

  // --- Emit full cleared state ---
  updateServerState({ 
    slots: window.gameState.slots,
    hands: window.gameState.hands,
    decks: window.gameState.decks
  });
});

const shuffleDecksBtn = document.getElementById("shuffle-decks-btn");

shuffleDecksBtn.addEventListener("click", () => {
  if (!window.gameState || !window.socket) return;

  if (!confirm("Shuffle all players' decks into a single draw pile?")) return;

  let combinedDeck = [];

  // Combine all players' decks
  if (window.gameState.decks) {
    for (const playerId in window.gameState.decks) {
      combinedDeck = combinedDeck.concat(window.gameState.decks[playerId]);
      window.gameState.decks[playerId] = []; // clear each player's deck
    }
  }

  // Shuffle combined deck (Fisher–Yates)
  for (let i = combinedDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinedDeck[i], combinedDeck[j]] = [combinedDeck[j], combinedDeck[i]];
  }

  // Set shared draw pile
  window.gameState.drawPile = combinedDeck;

  // Optionally update local deck if needed
  window.deck = combinedDeck;

  // Emit updated state to server for all players
  updateServerState({
    drawPile: window.gameState.drawPile,
    decks: window.gameState.decks
  });

  alert("All decks shuffled together into a single draw pile!");
});

// === SLOT VIEWER MODAL ===
const slotViewerDialog = document.getElementById("slot-viewer-dialog");
const slotViewerCards = document.getElementById("slot-viewer-cards");
const slotViewerClose = document.getElementById("slot-viewer-close");

// Close when clicking the X button
slotViewerClose.addEventListener("click", () => slotViewerDialog.close());

// Close when clicking outside the modal box
slotViewerDialog.addEventListener("click", e => {
  const rect = slotViewerDialog.firstElementChild.getBoundingClientRect();
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) {
    slotViewerDialog.close();
  }
});

// Attach click-to-view behavior to all field slots
document.querySelectorAll(".field-slot").forEach(slot => {
  slot.addEventListener("click", () => {
    showSlotCards(slot);
  });
});

function showSlotCards(slot) {
  slotViewerCards.innerHTML = "";

  // Build card list: current top + history
  const cards = [];

  if (slot.dataset.card) cards.push(slot.dataset.card);
  if (slot.history && slot.history.length > 0) {
    cards.push(...slot.history);
  }

  // No cards?
  if (cards.length === 0) {
    slotViewerCards.innerHTML = "<p>No cards in this slot.</p>";
  } else {
    cards.forEach(card => {
      const img = document.createElement("img");
      img.src = "cardDatabase/" + formatCardName(card) + ".png";
      img.alt = card;
      slotViewerCards.appendChild(img);
    });
  }

  slotViewerDialog.showModal();
}

