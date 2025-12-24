// socketClient.js
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io("https://prismserver-mejw.onrender.com");
const gameId = prompt("Enter Game ID:") || "sandbox";

// Ensure a stable local gameState object
window.gameState = window.gameState || { slots: {}, hands: {}, decks: {} };

socket.emit("joinGame", gameId);

/**
 * Render a single slot from server state without destroying local history.
 * - Preserves slot.history array if present on the element.
 * - If card is falsy, clears the top card but DOES NOT touch slot.history.
 */
function renderSlotFromState(slotId, card) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  // Ensure the history array exists on the DOM element (client-only)
  if (!Array.isArray(slot.history)) slot.history = [];

  if (!card) {
    slot.innerHTML = "";
    delete slot.dataset.card; // 🔥 not null
    return;
  }

  // Build card element (same structure your UI expects)
  slot.innerHTML = ""; // preserve JS properties like slot.history (these remain)
  const cardEl = document.createElement("div");
  cardEl.classList.add("card");
  cardEl.setAttribute("draggable", "true");
  cardEl.dataset.card = card;

  const img = document.createElement("img");
  img.src = "cardDatabase/" + formatCardName(card) + ".png";
  img.alt = card;
  img.classList.add("card-img");

  cardEl.appendChild(img);
  slot.appendChild(cardEl);
  slot.dataset.card = card;

  // Drag from slot: set transfer data so drops work
  cardEl.addEventListener("dragstart", ev => {
    // console.log("socketClient render: dragstart", slotId, card);
    ev.dataTransfer.setData("from", "slot");
    ev.dataTransfer.setData("slotId", slotId);
    ev.dataTransfer.setData("card", card);
  });
}

socket.on("gameState", state => {
  // Merge incoming state into existing window.gameState safely.
  // We especially deep-merge the 'slots' object to avoid clobbering local pieces.
  window.gameState = window.gameState || { slots: {}, hands: {}, decks: {} };

  if (state.slots && typeof state.slots === "object") {
    window.gameState.slots = state.slots;
  }

  // Merge other top-level keys conservatively (replace arrays/primitives)
  for (const key of Object.keys(state)) {
    if (key === "slots") continue;
    window.gameState[key] = state[key];
  }

  // Render all slots from the merged state
  for (const slotId of Object.keys(window.gameState.slots)) {
    renderSlotFromState(slotId, window.gameState.slots[slotId]);
  }
});

// Sync state to server (small wrapper)
window.updateServerState = function(partialState) {
  socket.emit("updateGame", {
    gameId,
    newState: partialState
  });
};

// Authoritative placeCard/removeCard which update server
function placeCard(slotId, cardId) {
  if (!window.gameState) window.gameState = { slots: {}, hands: {}, decks: {} };
  window.gameState.slots = window.gameState.slots || {};
  window.gameState.slots[slotId] = cardId;
  // send only the slots map (server merges on its side)
  updateServerState({ slots: window.gameState.slots });
}

function removeCard(slotId) {
  if (!window.gameState?.slots) return;

  delete window.gameState.slots[slotId];
  updateServerState({ slots: window.gameState.slots });
}

// expose functions for other scripts
window.placeCard = placeCard;
window.removeCard = removeCard;
window.renderSlotFromState = renderSlotFromState;
window.socket = socket;
window.gameId = gameId;
