import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import GameClient from "../../game/GameClient";

export default function MatchMaking() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [lobby, setLobby] = useState(null);
  const hasUploaded = useRef(false);

  const playerId = GameClient.state.playerId;
  const socket = window.__GAME_SOCKET__;

  // ------------------------------------------------------------
  // 1. Join lobby immediately
  // ------------------------------------------------------------
  useEffect(() => {
    if (!gameId) return;

    console.log("Attempting to join lobby", gameId);
    GameClient.server.attemptJoinLobby(gameId);
  }, [gameId]);

  // ------------------------------------------------------------
  // 2. Stable startGame listener (never re-created)
  // ------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    const handleStart = ({ gameId }) => {
      console.log("startGame received → navigating", gameId);
      navigate(`/game/${gameId}`);
    };

    socket.on("startGame", handleStart);

    return () => {
      socket.off("startGame", handleStart);
    };
  }, [socket, navigate]);

  // ------------------------------------------------------------
  // 3. Lobby updates + deck upload + ready logic
  // ------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    const handleLobbyUpdate = (data) => {
      console.log("Lobby update:", data);
      setLobby(data);
    };

    const handleLobbyError = (msg) => {
      console.error("Lobby error:", msg);
    };

    const handleGameCreated = ({ gameId }) => {
      console.log("Game created event received for", gameId);

      const deck = GameClient.state.gameState?.selectedDeck;
      if (!deck) {
        console.warn("No deck selected — cannot upload");
        return;
      }

      if (!hasUploaded.current) {
        console.log("Uploading deck for game", gameId, "as", playerId);
        GameClient.server.uploadDeck(deck, gameId);

        setTimeout(() => {
          console.log("Sending playerReady for game", gameId, "as", playerId);
          GameClient.server.playerReady(gameId);
        }, 50);

        hasUploaded.current = true;
      }
    };

    socket.on("lobbyUpdate", handleLobbyUpdate);
    socket.on("lobbyError", handleLobbyError);
    socket.on("gameCreated", handleGameCreated);

    // Request lobby state after joining
    setTimeout(() => {
      GameClient.server.requestLobbyState(gameId);
    }, 50);

    return () => {
      socket.off("lobbyUpdate", handleLobbyUpdate);
      socket.off("lobbyError", handleLobbyError);
      socket.off("gameCreated", handleGameCreated);
    };
  }, [socket, gameId, playerId]);

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="matchmaking">
      <h1>Matchmaking</h1>
      <p>Lobby Code: {gameId}</p>

      <button
        onClick={() => navigator.clipboard.writeText(gameId)}
        className="copy-btn"
      >
        Copy Code
      </button>

      {!lobby && <p>Loading lobby…</p>}

      {lobby && (
        <>
          <h2>Players</h2>
          <ul>
            {lobby.players?.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <p>
            {lobby.players?.length === 2
              ? "Locking in decks…"
              : "Waiting for opponent…"}
          </p>
        </>
      )}
    </div>
  );
}
