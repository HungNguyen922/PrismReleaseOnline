// client/src/game/GameClient.js
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

// ------------------------------------------------------------
// Persistent Player Identity
// ------------------------------------------------------------
if (!localStorage.getItem("playerId")) {
  localStorage.setItem("playerId", crypto.randomUUID());
}
const PLAYER_ID = localStorage.getItem("playerId");

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
    auth: { playerId: PLAYER_ID }
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
  get state() {
    return {
      playerId: PLAYER_ID,
      playerSide,
      gameState: currentState
    };
  },

  setPlayerSide(side) {
    playerSide = side;
  },

  setState(newState) {
    currentState = JSON.parse(JSON.stringify(newState));

    // Infer which side I am based on my PLAYER_ID
    const me = PLAYER_ID;

    if (currentState.players?.bottom?.id === me) {
        playerSide = "bottom";
    } else if (currentState.players?.top?.id === me) {
        playerSide = "top";
    }

    listeners.forEach((fn) => fn(currentState));
    },


  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  server: {
    createLobby(callback) {
      socket.emit("createLobby");
      socket.once("lobbyCreated", (gameId) => callback(gameId));
    },

    attemptJoinLobby(gameId) {
      socket.emit("attemptJoinLobby", gameId);
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

    requestGameState(gameId) {
      socket.emit("requestGameState", gameId);
    },

    drawCard(gameId) {
      socket.emit("drawCard", { gameId, playerId: PLAYER_ID });
    }
  },

  // UI hooks (wired externally in GameBoard.jsx)
  openDrawMenu: null,
  openExtraDeck: null
};

export default GameClient;
