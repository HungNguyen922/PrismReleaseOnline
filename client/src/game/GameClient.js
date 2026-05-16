// client/src/game/GameClient.js
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

// ------------------------------------------------------------
// Authenticated User Identity
// ------------------------------------------------------------
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

// ------------------------------------------------------------
// Internal State
// ------------------------------------------------------------
let currentState = null;
let playerSide = null;
const listeners = new Set();

// ------------------------------------------------------------
// Socket Setup (persistent across HMR reloads)
// ------------------------------------------------------------
if (!window.__GAME_SOCKET__) {
  window.__GAME_SOCKET__ = io(SERVER_URL, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    auth: { token }
  });

  window.__GAME_SOCKET__.on("connect", () => {
    console.log("Connected:", window.__GAME_SOCKET__.id);
  });

  window.__GAME_SOCKET__.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  window.__GAME_SOCKET__.on("gameState", (state) => {
    console.log("Received gameState", state);
    GameClient.setState(state);
  });
}

const socket = window.__GAME_SOCKET__;

// ------------------------------------------------------------
// GameClient Object
// ------------------------------------------------------------
const GameClient = {
  get user() {
    return user;
  },

  get state() {
    return {
      user,
      playerSide,
      gameState: currentState
    };
  },

  setPlayerSide(side) {
    playerSide = side;
  },

  setState(newState) {
    currentState = JSON.parse(JSON.stringify(newState));

    const myId = user.id;

    if (currentState.players?.bottom?.id === myId) {
      playerSide = "bottom";
    } else if (currentState.players?.top?.id === myId) {
      playerSide = "top";
    }

    listeners.forEach((fn) => fn(currentState));
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // ------------------------------------------------------------
  // Server API (Unified + Correct)
  // ------------------------------------------------------------
  server: {
    createLobby(callback) {
      socket.emit("createLobby");
      socket.once("lobbyCreated", (gameId) => callback(gameId));
    },

    attemptJoinLobby(gameId) {
      socket.emit("attemptJoinLobby", gameId);
    },

    // ⭐ REQUIRED for matchmaking to work
    requestLobbyState(gameId) {
      socket.emit("requestLobbyState", gameId);
    },

    uploadDeck(deck, gameId) {
      socket.emit("uploadDeck", { gameId, deck });
    },

    playerReady(gameId) {
      socket.emit("playerReady", gameId);
    },

    sendPatch(gameId, patch) {
      socket.emit("patch", { gameId, patch });
    },

    // Optional — some servers use this
    requestGameState(gameId) {
      socket.emit("requestGameState", gameId);
    },

    drawCard(gameId) {
      socket.emit("drawCard", { gameId });
    }
  },

  // UI hooks (wired externally in GameBoard.jsx)
  openDrawMenu: null,
  openExtraDeck: null
};

export default GameClient;
