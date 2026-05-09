// socketClient.js
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io("https://prismserver-mejw.onrender.com");
const gameId = prompt("Enter Game ID:") || "sandbox";

// Expose socket + gameId globally
window.socket = socket;
window.gameId = gameId;

// Join the game
socket.emit("joinGame", gameId);

// Receive full authoritative state from server
socket.on("gameState", fullState => {
  Game.Server.applyServerState(fullState);
});

// Wrapper for sending patches to server
window.updateServerState = function(patch) {
  socket.emit("updateState", {
    gameId,
    patch
  });
};
