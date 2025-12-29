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

  // If already correct, do nothing
  if (slot.dataset.card === card) return;

  slot.innerHTML = "";
  delete slot.dataset.card;

  if (!card) return;

  const cardEl = document.createElement("div");
  cardEl.className = "card";
  cardEl.setAttribute("draggable", "true");

  const img = document.createElement("img");
  img.src = "cardDatabase/" + formatCardName(card) + ".png";
  img.alt = card;
  img.classList.add("card-img");

  cardEl.appendChild(img);
  slot.appendChild(cardEl);
  slot.dataset.card = card;

  // dragstart only (no server writes)
  cardEl.addEventListener("dragstart", ev => {
    ev.dataTransfer.setData("from", "slot");
    ev.dataTransfer.setData("slotId", slotId);
    ev.dataTransfer.setData("card", card);
  });
}

socket.on("gameState", state => {
  window.gameState = state;

  for (const slotId of Object.keys(state.slots || {})) {
    renderSlotFromState(slotId, state.slots[slotId], true); // fromServer = true
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
