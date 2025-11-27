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

function renderSlotFromState(slotId, card) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  // ensure history property survives
  if (!Array.isArray(slot.history)) slot.history = [];

  if (!card) {
    slot.innerHTML = "";
    slot.dataset.card = null;
    return;
  }

  // only replace top card markup (history preserved)
  slot.innerHTML = "";
  // ... create cardEl as before
}

socket.on("gameState", state => {
  window.gameState = state;

  for (const slotId in state.slots) {
    renderSlotFromState(slotId, state.slots[slotId]);
  }
});

// Sync state to server
window.updateServerState = function(partialState) {
  socket.emit("updateGame", {
    gameId,
    newState: partialState
  });
};

function placeCard(slotId, cardId) {
  gameState.slots[slotId] = cardId;
  updateServerState({ slots: gameState.slots });
}

// When a card is removed
function removeCard(slotId) {
  gameState.slots[slotId] = null;
  updateServerState({ slots: gameState.slots }); // pass the updated slots
}

window.placeCard = placeCard;
window.removeCard = removeCard;
window.socket = socket;
window.gameId = gameId;
window.gameState = { slots: {}, hands: {}, decks: {} };

