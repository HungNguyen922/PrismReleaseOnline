import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import GameServer from "../game/Game.Server";

export default function useGameNetwork(gameId, onServerState) {
  const socketRef = useRef(null);

  const [playerSlot, setPlayerSlot] = useState(null);
  const [roomFull, setRoomFull] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);

  // ---------------------------------------
  // Connect to server + join room
  // ---------------------------------------
  useEffect(() => {
    const socket = io("http://localhost:4000"); // change for production
    socketRef.current = socket;

    // Attach networking API to Game.Server
    GameServer.attachNetwork({
      sendPatch,
      uploadDeck,
      readyUp
    });

    // Join game room
    socket.emit("joinGame", gameId);

    // Receive full game state
    socket.on("gameState", (state) => {
      const filtered = filterHiddenHands(state, playerSlot);
      onServerState(filtered);
    });

    // Room is full
    socket.on("roomFull", () => {
      setRoomFull(true);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [gameId, onServerState, playerSlot]);

  // ---------------------------------------
  // Hide opponent's hand
  // ---------------------------------------
  function filterHiddenHands(state, slot) {
    if (!slot) return state;

    const clone = structuredClone(state);

    if (slot === "p1") clone.handP2 = clone.handP2.map(() => null);
    if (slot === "p2") clone.handP1 = clone.handP1.map(() => null);

    return clone;
  }

  // ---------------------------------------
  // Upload deck during matchmaking
  // ---------------------------------------
  function uploadDeck(deck) {
    socketRef.current.emit("uploadDeck", { gameId, deck });
  }

  // ---------------------------------------
  // Ready up during matchmaking
  // ---------------------------------------
  function readyUp() {
    socketRef.current.emit("playerReady", gameId);
  }

  // ---------------------------------------
  // Send patch during gameplay
  // ---------------------------------------
  function sendPatch(patch) {
    socketRef.current.emit("patch", { gameId, patch });
  }

  return {
    playerSlot,
    roomFull,
    opponentConnected,
    uploadDeck,
    readyUp,
    sendPatch
  };
}
