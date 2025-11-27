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

  // Clear previous content
  if (!card) {
    // Empty top card but don't destroy history
    slot.innerHTML = "";
    slot.dataset.card = null;
    return;
  }

  // Set top card
  slot.innerHTML = "";
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

  // Set up drag from slot
  cardEl.addEventListener("dragstart", ev => {
    ev.dataTransfer.setData("from", "slot");
    ev.dataTransfer.setData("slotId", slot.id);
    ev.dataTransfer.setData("card", card);
  });
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

