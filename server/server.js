// server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Game logic modules
const createNewGameState = require("./game/createNewGameState");
const mergeDecks = require("./game/mergeDecks");
const applyPatch = require("./game/applyPatch");

// -------------------------------
//  Express + HTTP server
// -------------------------------
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// -------------------------------
//  Socket.IO server
// -------------------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// -------------------------------
//  In-memory game storage
// -------------------------------
const games = {};
// Structure:
// games[gameId] = {
//   state: { ... },
//   players: { p1: socketId, p2: socketId }
// }

// -------------------------------
//  Assign player slot (P1 or P2)
// -------------------------------
function assignPlayer(game, socketId) {
  if (!game.players.p1) {
    game.players.p1 = socketId;
    return "p1";
  }
  if (!game.players.p2) {
    game.players.p2 = socketId;
    return "p2";
  }
  return null; // room full
}

// -------------------------------
//  Socket.IO connection
// -------------------------------
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // -------------------------------
  //  Player joins a game room
  // -------------------------------
  socket.on("joinGame", (gameId) => {
    socket.join(gameId);

    // Create game if needed
    if (!games[gameId]) {
      games[gameId] = {
        state: createNewGameState(),
        players: { p1: null, p2: null }
      };
    }

    const game = games[gameId];

    // Assign player slot
    const slot = assignPlayer(game, socket.id);
    if (!slot) {
      socket.emit("roomFull");
      return;
    }

    console.log(`Player ${socket.id} joined ${gameId} as ${slot}`);

    // Send full state to the joining player
    socket.emit("gameState", game.state);
  });

  // -------------------------------
  //  Player uploads their deck
  // -------------------------------
  socket.on("uploadDeck", ({ gameId, deck }) => {
    const game = games[gameId];
    if (!game) return;

    const slot = (socket.id === game.players.p1) ? "p1" : "p2";

    if (slot === "p1") game.state.deckP1 = deck;
    if (slot === "p2") game.state.deckP2 = deck;

    console.log(`Deck uploaded for ${slot} in game ${gameId}`);
  });

  // -------------------------------
  //  Player marks themselves ready
  // -------------------------------
  socket.on("playerReady", (gameId) => {
    const game = games[gameId];
    if (!game) return;

    const slot = (socket.id === game.players.p1) ? "p1" : "p2";

    if (slot === "p1") game.state.p1Ready = true;
    if (slot === "p2") game.state.p2Ready = true;

    console.log(`${slot} is ready in game ${gameId}`);

    // If both players ready → merge decks
    if (game.state.p1Ready && game.state.p2Ready && !game.state.decksMerged) {
      mergeDecks(game.state);
      console.log(`Decks merged for game ${gameId}`);
    }

    // Broadcast updated state
    io.to(gameId).emit("gameState", game.state);
  });

  // -------------------------------
  //  Player sends a patch
  // -------------------------------
  socket.on("patch", ({ gameId, patch }) => {
    const game = games[gameId];
    if (!game) return;

    applyPatch(game.state, patch);

    // Broadcast updated state
    io.to(gameId).emit("gameState", game.state);
  });

  // -------------------------------
  //  Player disconnects
  // -------------------------------
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    for (const gameId in games) {
      const game = games[gameId];

      if (game.players.p1 === socket.id) game.players.p1 = null;
      if (game.players.p2 === socket.id) game.players.p2 = null;

      // Delete empty games
      if (!game.players.p1 && !game.players.p2) {
        delete games[gameId];
        console.log(`Game ${gameId} deleted (empty)`);
      }
    }
  });
});

// -------------------------------
//  Start server
// -------------------------------
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});
