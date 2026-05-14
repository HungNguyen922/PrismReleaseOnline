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
const lobbies = {}; 

// -------------------------------
//  Creates a GAME ID for a lobby
// -------------------------------
function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// -------------------------------
//  Socket.IO connection
// -------------------------------
io.on("connection", (socket) => {
  const playerId = socket.handshake.auth.playerId;
  console.log("Player connected:", socket.id, "as", playerId);
  // -------------------------------
  // Create Lobby
  // -------------------------------
  socket.on("createLobby", () => {
    const gameId = generateGameId();

    lobbies[gameId] = {
      players: [playerId],
      spectators: [],
      status: "waiting"
    };

    // host joins the lobby automatically
    socket.join(gameId);

    console.log(`Lobby ${gameId} created by ${playerId}`);

    socket.emit("lobbyCreated", gameId);

    // Broadcast initial lobby state
    io.to(gameId).emit("lobbyUpdate", {
      players: lobbies[gameId].players
    });
  });
  

  // -----------------------------------------
  // Attempt Join Lobby (safe for host + opponent)
  // -----------------------------------------
  socket.on("requestLobbyState", (gameId) => {
    const lobby = lobbies[gameId];
    if (lobby) {
      socket.emit("lobbyUpdate", { players: lobby.players });
    }
  });

  socket.on("attemptJoinLobby", (gameId) => {
    const lobby = lobbies[gameId];
    if (!lobby) {
      socket.emit("lobbyError", "Lobby does not exist");
      return;
    }

    // Prevent duplicate joins (host refreshing, StrictMode, reconnects)
    if (!lobby.players.includes(playerId)) {
      lobby.players.push(playerId);
      socket.join(gameId);
      console.log(`Player ${playerId} joined lobby ${gameId}`);
    } else {
      console.log(`Player ${playerId} attempted duplicate join for lobby ${gameId}`);
    }

    // Broadcast updated lobby state
    io.to(gameId).emit("lobbyUpdate", { players: lobby.players });

    // Start game when 2 unique players are present
    if (lobby.players.length === 2) {
      console.log(`Lobby ${gameId} full — creating game`);

      games[gameId] = {
        state: createNewGameState(),
        players: { p1: lobby.players[0], p2: lobby.players[1] }
      };

      io.to(gameId).emit("startGame", { gameId });
    }
  });

  // -------------------------------
  //  Allows user reconnection via localstorage
  // -------------------------------
  for (const gameId in games) {
    const game = games[gameId];

    if (game.players.p1 === playerId || game.players.p2 === playerId) {
      socket.join(gameId);
      socket.emit("gameState", game.state);
      console.log(`Player ${playerId} reconnected to game ${gameId}`);
    }
  }

  // -------------------------------
  //  Allows user to leave a lobby
  // -------------------------------
  socket.on("leaveLobby", (gameId) => {
    const lobby = lobbies[gameId];
    if (!lobby) return;

    lobby.players = lobby.players.filter(id => id !== playerId);
    lobby.spectators = lobby.spectators?.filter(id => id !== playerId);

    socket.leave(gameId);

    io.to(gameId).emit("lobbyUpdate", {
      players: lobby.players,
      spectators: lobby.spectators
    });

    if (lobby.players.length === 0) {
      delete lobbies[gameId];
      console.log(`Lobby ${gameId} deleted (empty)`);
    }
  });

  // -------------------------------
  //  Player uploads their deck
  // -------------------------------
  socket.on("uploadDeck", ({ gameId, deck }) => {
    const game = games[gameId];
    if (!game) return;

    const slot = (playerId === game.players.p1) ? "p1" : "p2";

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

    const slot = (playerId === game.players.p1) ? "p1" : "p2";

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
    console.log("Player disconnected:", playerId);

    for (const gameId in games) {
      const game = games[gameId];

      if (game.players.p1 === playerId) game.players.p1 = null;
      if (game.players.p2 === playerId) game.players.p2 = null;

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
