// socketClient.js
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io("https://prismserver-mejw.onrender.com"); // replace with your server or Render URL
const gameId = prompt("Enter game ID to join:") || "test";

socket.emit("joinGame", gameId);

socket.on("gameState", (state) => {
  console.log("Updated game state:", state);
  // TODO: render this on the board
});

let gameState = {
  players: {
    p1: { deck: [], hand: [] },
    p2: { deck: [], hand: [] },
  },
};

// Example: when you draw a card
export function drawCard(playerId) {
  const player = gameState.players[playerId];
  if (!player || player.deck.length === 0) return;

  // Draw top card from deck into hand
  player.hand.push(player.deck.pop());

  // Sync with server
  socket.emit("updateGame", { gameId, newState: gameState });
}
