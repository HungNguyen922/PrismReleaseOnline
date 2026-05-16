// server/index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import crypto from "crypto";

import { authRouter, verifySocketToken } from "./auth.js";
import { cardsRouter } from "./cards.js";

import createNewGameState from "./game/createNewGameState.js";
import mergeDecks from "./game/mergeDecks.js";
import applyPatch from "./game/applyPatch.js";

const app = express();
app.use(cors());
app.use(express.json());

// HTTP auth + API routes
app.use("/api", authRouter);
app.use("/api/cards", cardsRouter);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// In-memory storage
const games = {};
const lobbies = {};

function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function buildStateForPlayer(gameState, playerId) {
  const isBottom = gameState.players.bottom.id === playerId;

  return {
    ...gameState,

    hands: {
      top: isBottom
        ? gameState.hands.top.map(() => null)
        : gameState.hands.top,

      bottom: isBottom
        ? gameState.hands.bottom
        : gameState.hands.bottom.map(() => null)
    },

    sets: {
      top: isBottom
        ? gameState.sets.top.map(card => (card ? { ...card, hidden: true } : null))
        : gameState.sets.top,

      bottom: isBottom
        ? gameState.sets.bottom
        : gameState.sets.bottom.map(card => (card ? { ...card, hidden: true } : null))
    },

    gates: {
      top: gameState.gates.top,
      bottom: gameState.gates.bottom
    }
  };
}

function fillToFour(state, playerSide) {
  const hand = state.hands[playerSide];
  while (hand.length < 4 && state.drawPile.length > 0) {
    hand.push(state.drawPile.shift());
  }
}

// 🔐 authenticate sockets with JWT (from auth.js)
io.use(verifySocketToken);

io.on("connection", (socket) => {
  const userId = socket.user.id;
  const username = socket.user.username;

  console.log("Player connected:", socket.id, "user:", username, userId);

  // join a personal room for targeted emits
  socket.join(userId);

  // --- CREATE LOBBY ---
  socket.on("createLobby", () => {
    const gameId = generateGameId();

    lobbies[gameId] = {
      players: [userId],
      spectators: [],
      status: "waiting"
    };

    socket.join(gameId);
    console.log(`Lobby ${gameId} created by ${userId}`);

    socket.emit("lobbyCreated", gameId);
    io.to(gameId).emit("lobbyUpdate", { players: lobbies[gameId].players });
  });

  // --- ATTEMPT JOIN LOBBY ---
  socket.on("attemptJoinLobby", (gameId) => {
    const lobby = lobbies[gameId];
    if (!lobby) {
      socket.emit("lobbyError", "Lobby does not exist");
      return;
    }

    if (!lobby.players.includes(userId)) {
      lobby.players.push(userId);
      socket.join(gameId);
      console.log(`Player ${userId} joined lobby ${gameId}`);
    }

    io.to(gameId).emit("lobbyUpdate", { players: lobby.players });

    // When lobby fills, create game object
    if (lobby.players.length === 2 && !games[gameId]) {
      console.log(`Lobby ${gameId} full — creating game`);

      games[gameId] = {
        state: createNewGameState(),
        players: { p1: lobby.players[0], p2: lobby.players[1] }
      };

      const state = games[gameId].state;
      state.players.bottom = { id: lobby.players[0], name: "Player 1" };
      state.players.top = { id: lobby.players[1], name: "Player 2" };

      io.to(gameId).emit("gameCreated", { gameId });
    }
  });

  // --- REQUEST LOBBY STATE ---
  socket.on("requestLobbyState", (gameId) => {
    const lobby = lobbies[gameId];
    if (!lobby) {
      socket.emit("lobbyError", "Lobby does not exist");
      return;
    }
    socket.emit("lobbyUpdate", {
      players: lobby.players,
      spectators: lobby.spectators || []
    });
  });

  // --- UPLOAD DECK (UPDATED WITH UNIQUE IDs) ---
  socket.on("uploadDeck", ({ gameId, deck }) => {
    const game = games[gameId];
    if (!game) {
      console.log("uploadDeck: game not found", gameId);
      return;
    }

    const slot = userId === game.players.p1 ? "p1" : "p2";

    const rawDeck = deck.main || deck;
    if (!Array.isArray(rawDeck)) {
      console.log("uploadDeck: mainDeck is not array", rawDeck);
      return;
    }

    const mainDeck = rawDeck.map(card => ({
      ...card,
      id: crypto.randomUUID()
    }));

    if (slot === "p1") game.state.deckP1 = mainDeck;
    if (slot === "p2") game.state.deckP2 = mainDeck;

    console.log(`Deck uploaded for ${slot} in game ${gameId}`);
  });

  // --- PLAYER READY ---
  socket.on("playerReady", (gameId) => {
    const game = games[gameId];
    if (!game) {
      console.log("playerReady: game not found", gameId);
      return;
    }

    const slot = userId === game.players.p1 ? "p1" : "p2";

    if (slot === "p1") game.state.p1Ready = true;
    if (slot === "p2") game.state.p2Ready = true;

    console.log(`${slot} is ready in game ${gameId}`);

    if (!Array.isArray(game.state.deckP1) || !Array.isArray(game.state.deckP2)) {
      console.log("Decks not uploaded yet — waiting");
      return;
    }

    if (game.state.p1Ready && game.state.p2Ready && !game.state.decksMerged) {
      mergeDecks(game.state);
      console.log(`Decks merged for game ${gameId}`);

      io.to(gameId).emit("startGame", { gameId });

      const p1Id = game.players.p1;
      const p2Id = game.players.p2;

      const cloned = JSON.parse(JSON.stringify(game.state));
      io.to(p1Id).emit("gameState", buildStateForPlayer(cloned, p1Id));
      io.to(p2Id).emit("gameState", buildStateForPlayer(cloned, p2Id));
    }
  });

  // --- REQUEST GAME STATE ---
  socket.on("requestGameState", (gameId) => {
    const game = games[gameId];
    if (!game) return;

    socket.join(gameId);

    const cloned = JSON.parse(JSON.stringify(game.state));
    socket.emit("gameState", buildStateForPlayer(cloned, userId));
  });

  // --- PATCH ---
  socket.on("patch", ({ gameId, patch }) => {
    const game = games[gameId];
    if (!game) return;

    applyPatch(game.state, {
      ...patch,
      playerId: userId
    });

    const p1Id = game.players.p1;
    const p2Id = game.players.p2;

    const cloned = JSON.parse(JSON.stringify(game.state));
    io.to(p1Id).emit("gameState", buildStateForPlayer(cloned, p1Id));
    io.to(p2Id).emit("gameState", buildStateForPlayer(cloned, p2Id));
  });

  // --- DISCONNECT ---
  socket.on("disconnect", () => {
    console.log("Player disconnected:", userId);

    setTimeout(() => {
      const stillConnected = [...io.sockets.sockets.values()]
        .some(s => s.user && s.user.id === userId);

      if (stillConnected) return;

      for (const gameId in games) {
        const game = games[gameId];
        if (!game) continue;

        if (game.players.p1 === userId) game.players.p1 = null;
        if (game.players.p2 === userId) game.players.p2 = null;

        if (!game.players.p1 && !game.players.p2) {
          delete games[gameId];
          console.log(`Game ${gameId} deleted (empty)`);
        }
      }
    }, 300);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});
