// socketClient.js
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io("https://prismserver-mejw.onrender.com");
const gameId = prompt("Enter Game ID:") || "sandbox";

// Local copy of the game state
let gameState = { board: {}, hands: {}, decks: {} };

socket.emit("joinGame", gameId);

socket.on("gameState", (state) => {
  gameState = state;
  console.log("Updated game state:", gameState);
  renderBoard(gameState); // TODO: draw this in your UI
});

// Example: when you move a card
function updateBoard(newBoard) {
  gameState.board = newBoard;
  socket.emit("updateGame", {
    gameId,
    newState: { board: updatedBoard },
  });
}

