document.addEventListener("DOMContentLoaded", () => {
  const deckSlot = document.getElementById("deck-slot");
  const deckPopup = document.getElementById("deck-popup");
  const sendBottomBtn = document.getElementById("send-bottom-btn");

  let draggedCardInfo = null;

  // allow drop
  deckSlot.addEventListener("dragover", e => {
    e.preventDefault();
    deckSlot.classList.add("hover");
  });

  deckSlot.addEventListener("dragenter", e => {
    e.preventDefault();
    deckSlot.classList.add("hover");

    // capture data from dataTransfer, might include:
    const from = e.dataTransfer.getData("from");         // "hand" or "slot"
    const cardIndex = e.dataTransfer.getData("cardIndex"); // valid if from hand
    const slotId = e.dataTransfer.getData("slotId");     // valid if from slot
    const card = e.dataTransfer.getData("card");         // the card ID/name maybe

    draggedCardInfo = { from, cardIndex, slotId, card };

    // position the popup — you can adjust offsets
    const rect = deckSlot.getBoundingClientRect();
    deckPopup.style.left = `${rect.right + 5}px`;
    deckPopup.style.top = `${rect.top}px`;
    deckPopup.style.display = "block";
  });

  deckSlot.addEventListener("dragleave", e => {
    deckSlot.classList.remove("hover");
    deckPopup.style.display = "none";
  });

  deckSlot.addEventListener("drop", e => {
    e.preventDefault();
    deckSlot.classList.remove("hover");
    deckPopup.style.display = "none";

    if (draggedCardInfo) {
      sendCardToBottom(draggedCardInfo);
      draggedCardInfo = null;
    }
  });

  sendBottomBtn.addEventListener("click", e => {
    e.preventDefault();
    if (draggedCardInfo) {
      sendCardToBottom(draggedCardInfo);
      deckPopup.style.display = "none";
      draggedCardInfo = null;
    }
  });

  // ==== sendCardToBottom function ====

  // make sure you have a drawPile array somewhere; e.g. at top:
  // let drawPile = []; Or whatever your code uses.

  function sendCardToBottom(info) {
    let removed = null;
    if (info.from === "hand") {
      // remove from hand
      removed = hand.splice(info.cardIndex, 1)[0];
      renderHand();
    } else if (info.from === "slot") {
      const sourceSlot = document.getElementById(info.slotId);
      removed = removeTopCardFromSlot(sourceSlot);
    }

    // If we didn't get removed by above but info.card exists:
    if (!removed && info.card) {
      removed = info.card;
    }

    if (!removed) {
      console.warn("No card to send to bottom:", info);
      return;
    }

    deck.push(removed);
    updateDeckUI();  // implement this to show count or top card, etc.
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
      sourceSlot.innerHTML = "";
      sourceSlot.removeAttribute("data-card");

      // Reveal previous card in source slot
      if (sourceSlot.history.length > 0) {
        const prevCard = sourceSlot.history.pop();
        placeCardInSlot(sourceSlot, prevCard);
      } else {
        sourceSlot.dataset.card = null;
      }

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
    });

    handArea.appendChild(cardEl);
  });
}

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
