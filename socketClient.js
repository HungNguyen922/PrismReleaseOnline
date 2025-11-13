// socketClient.js
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io("https://prismserver-mejw.onrender.com");
const gameId = prompt("Enter Game ID:") || "sandbox";

// Store the shared game state
let gameState = {
  slots: {},  // field positions → card info
  hands: {},
  decks: {}
};

socket.emit("joinGame", gameId);

socket.on("gameState", (state) => {
  gameState = state;
  renderBoard(gameState);
});

// Example function: send new state to server
function updateServerState() {
  socket.emit("updateGame", { gameId, newState: gameState });
}

// ====== Hooks into your UI ======

// When a card is placed in a slot
function placeCard(slotId, cardId) {
  gameState.slots[slotId] = cardId;
  updateServerState();
}

// When a card is removed
function removeCard(slotId) {
  delete gameState.slots[slotId];
  updateServerState();
}

// Example rendering
function renderBoard(state) {
  if (!state || !state.slots) return; // <- safely ignore bad data

  for (const [slotId, cardId] of Object.entries(state.slots)) {
    const slot = document.getElementById(slotId);
    if (!slot) continue;
    slot.innerHTML = cardId ? `<div class="card">${cardId}</div>` : "";
  }
}


window.placeCard = placeCard; // expose for your existing scripts
window.removeCard = removeCard;
