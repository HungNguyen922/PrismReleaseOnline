// game/Game.Server.js
import { io } from "socket.io-client";
import GameState from "./Game.State";

const SERVER_URL = "http://localhost:4000";

// Persistent player identity
if (!localStorage.getItem("playerId")) {
  localStorage.setItem("playerId", crypto.randomUUID());
}
const PLAYER_ID = localStorage.getItem("playerId");

// Persist socket across HMR reloads
if (!window.__GAME_SOCKET__) {
  window.__GAME_SOCKET__ = io(SERVER_URL, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    auth: { playerId: PLAYER_ID }
  });

  window.__GAME_SOCKET__.on("connect", () => {
    console.log("Connected to game server:", window.__GAME_SOCKET__.id);
  });

  window.__GAME_SOCKET__.on("disconnect", () => {
    console.log("Disconnected from game server");
  });

  window.__GAME_SOCKET__.on("gameState", (state) => {
    console.log("Received gameState", state);
    GameState.set(state);
  });
}

const GameServer = {
  socket: window.__GAME_SOCKET__,

  createLobby(callback) {
    this.socket.emit("createLobby");
    this.socket.once("lobbyCreated", (gameId) => callback(gameId));
  },

  attemptJoinLobby(gameId) {
    this.socket.emit("attemptJoinLobby", gameId);
  },

  quickJoin(callback) {
    this.createLobby(callback);
  },

  uploadDeck(deck, gameId) {
    this.socket.emit("uploadDeck", { gameId, deck });
  },

  playerReady(gameId) {
    this.socket.emit("playerReady", gameId);
  },

  sendPatch(gameId, patch) {
    this.socket.emit("patch", { gameId, patch });
  },

  requestGameState(gameId) {
    this.socket.emit("requestGameState", gameId);
  }
};

export default GameServer;
