document.addEventListener("DOMContentLoaded", () => {
  const deckSlot = document.getElementById("deck-slot");
  const confirmDialog = document.getElementById("confirm-dialog");
  const confirmForm = document.getElementById("confirm-form");
  let isDragging = false;
  window.slotHistories = {};

  let draggedCardInfo = null;

  deckSlot.addEventListener("dragover", e => {
    e.preventDefault();
    slot.classList.add("hover");
  });

  deckSlot.addEventListener("drop", e => {
    e.preventDefault();
    slot.classList.remove("hover");
  
    draggedCardInfo = {
      from: e.dataTransfer.getData("from"),
      cardIndex: parseInt(e.dataTransfer.getData("cardIndex"), 10),
      slotId: e.dataTransfer.getData("slotId"),
      card: e.dataTransfer.getData("card")
    };
  
    console.log("drop: draggedCardInfo =", draggedCardInfo);
  
    if (!draggedCardInfo.from) {
      console.warn("No dragged info, can’t open confirm");
      return;
    }
  
    if (confirmDialog && typeof confirmDialog.showModal === "function") {
      confirmDialog.showModal();
    } else {
      const yes = window.confirm("Send this card to the bottom?");
      if (yes) sendCardToBottom(draggedCardInfo);
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
    /*
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
      window.gameState.drawPile.push(removed);
      console.log("Card pushed to drawPile:", removed);
      updateDeckUI && updateDeckUI();
    }
    */
  }

  // ==== End deck-slot integration ====
  
  // --- Setup field slots ---
  document.querySelectorAll(".field-slot").forEach(slot => {
    // Ensure each slot has a history array
    window.slotHistories[slot.id] ||= [];
  
    // Dragover / dragleave
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("dragleave", () => slot.classList.remove("hover"));
  
    // Drop handler (hand or slot source)
    slot.addEventListener("drop", e => {
      e.preventDefault();
      const destSlot = e.currentTarget;
      const from = e.dataTransfer.getData("from");
    
      let card = null;
    
      if (from === "hand") {
        const index = parseInt(e.dataTransfer.getData("cardIndex"), 10);
        if (!Number.isInteger(index)) return;
        card = hand.splice(index, 1)[0];
        renderHand();
      } 
      
      else if (from === "slot") {
        const sourceSlotId = e.dataTransfer.getData("slotId");
        const sourceSlot = document.getElementById(sourceSlotId);
        if (!sourceSlot) return;
    
        card = removeTopCardFromSlot(sourceSlot);
      }
    
      if (!card) return;
    
      const prev = destSlot.dataset.card;
      if (typeof prev === "string" && prev.trim()) {
        window.slotHistories[destSlot.id] ||= [];
        window.slotHistories[destSlot.id].push(prev);
      }
    
      placeCardInSlot(destSlot, card);
      placeCard(destSlot.id, card);
    });
  });
});
// Place card in slot (safe, preserves history)
function placeCardInSlot(slot, card) {
  if (!slot) return;

  slot.innerHTML = "";

  const cardEl = document.createElement("div");
  cardEl.className = "card";
  cardEl.setAttribute("draggable", "true");

  const img = document.createElement("img");
  img.src = "cardDatabase/" + formatCardName(card) + ".png";
  img.alt = card;
  img.classList.add("card-img");

  cardEl.appendChild(img);
  slot.appendChild(cardEl);

  // ✅ ONLY store card data on SLOT
  slot.dataset.card = card;
 

  cardEl.addEventListener("dragstart", ev => {
    ev.dataTransfer.setData("from", "slot");
    ev.dataTransfer.setData("slotId", slot.id);
    ev.dataTransfer.setData("card", card);
    isDragging = true;
  });

  cardEl.addEventListener("dragend", ev => {
    setTimeout(() => { isDragging = false; }, 0);
  });

  if (window.gameState) {
    window.gameState.slots ||= {};
    window.gameState.slots[slot.id] = card;
  }
}

// Remove the top card from slot (null-safe)
function removeTopCardFromSlot(slot) {
  if (!slot) return null;

  const card = slot.dataset.card;
  if (typeof card !== "string" || !card.trim()) return null;

  const history = window.slotHistories?.[slot.id];
  
  slot.innerHTML = "";
  delete slot.dataset.card;

  if (Array.isArray(history) && history.length > 0) {
    const prev = history.pop();
    placeCardInSlot(slot, prev); // 🔥 restore underneath card
    placeCard(slot.id, prev);
  } else {
    // fully empty
    removeCard(slot.id);
    if (window.gameState?.slots) {
      delete window.gameState.slots[slot.id];
    }
  }

  return card;
}

// Pop previous card from history manually (called by your drop handler if needed)
function popHistory(slot) {
  if (!slot) return null;

  const history = window.slotHistories?.[slot.id];
  if (!Array.isArray(history)) return null;

  while (history.length > 0) {
    const prev = history.pop();
    if (prev != null) return prev;
  }

  return null;
}

// Show slot viewer
function showSlotCards(slot) {
  if (!slot) return;

  slotViewerCards.innerHTML = "";

  const list = [];

  // Top card
  if (slot.dataset.card)
    list.push(slot.dataset.card);

  // ✅ Use stable global history
  const history = window.slotHistories[slot.id];
  if (history?.length) {
    list.push(...history.slice().reverse());
  }

  if (list.length === 0) {
    slotViewerCards.textContent = "No cards in this slot.";
  }

  list.forEach(card => {
    const img = document.createElement("img");
    img.src = "cardDatabase/" + formatCardName(card) + ".png";
    img.alt = card;
    slotViewerCards.appendChild(img);
  });

  slotViewerDialog.showModal();
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
    if (removed) {
      hand.push(removed);
      renderHand();
      removeCard(sourceSlotId);

    }
  }
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
      isDragging = true;
    });

    cardEl.addEventListener("dragend", e => {
      setTimeout(() => { isDragging = false; }, 0);
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
  if (!confirm("Are you sure you want to clear the board and all hands?"))
    return;

  // --- Clear all field slots (UI + history) ---
  window.slotHistories = {};
  document.querySelectorAll(".field-slot").forEach(slot => {
    slot.innerHTML = "";
    slot.removeAttribute("data-card");
    // Remove from persistent game state
    if (window.gameState?.slots) {
      delete window.gameState.slots[slot.id];
    }
    slot.classList.remove("hover");
  });

  // --- Reset gameState slots completely ---
  if (!window.gameState) window.gameState = {};
  window.gameState.slots = {};
  window.gameState.drawPile = [];
  window.gameState.decks = {};
  window.gameState.hands = {};

  // --- Clear local hand and force UI refresh ---
  window.hand = [];
  window.deck = [];
  renderHand();

  // --- Reset other UI state if any ---
  isDragging = false;       // reset dragging flag
  updateHealthUI();         // if health should reset (optional)

  // --- Optionally close any open modals ---
  slotViewerDialog?.close();

  // --- Emit the fully cleared state ---
  updateServerState?.({
    slots: window.gameState.slots,
    hands: window.gameState.hands,
    decks: window.gameState.decks,
    drawPile: window.gameState.drawPile
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
    if (!isDragging) showSlotCards(slot);
  });
});
