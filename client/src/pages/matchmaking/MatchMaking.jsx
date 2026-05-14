import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import GameState from "../../game/Game.State";
import GameServer from "../../game/Game.Server";

export default function MatchMaking() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [lobby, setLobby] = useState(null);
  const hasUploaded = useRef(false);
  const playerId = GameServer.socket.auth.playerId;

  // 1. Join the lobby as soon as we land on this page
  useEffect(() => {
    if (!gameId) return;
    console.log("Attempting to join lobby", gameId);
    GameServer.attemptJoinLobby(gameId);
  }, [gameId]);

  // 2. Listen for lobby updates, gameCreated, startGame
  useEffect(() => {
    const socket = GameServer.socket;

    socket.on("lobbyUpdate", (data) => {
      console.log("Lobby update:", data);
      setLobby(data);
    });

    socket.on("lobbyError", (msg) => {
      console.error("Lobby error:", msg);
    });

    socket.on("gameCreated", ({ gameId }) => {
      console.log("Game created event received for", gameId);

      const deck = GameState.get()?.selectedDeck;
      if (!deck) {
        console.warn("No deck selected — cannot upload");
        return;
      }

      if (!hasUploaded.current) {
        console.log("Uploading deck for game", gameId, "as", playerId);
        GameServer.uploadDeck(deck, gameId);

        setTimeout(() => {
          console.log("Sending playerReady for game", gameId, "as", playerId);
          GameServer.playerReady(gameId);
        }, 50);

        hasUploaded.current = true;
      }
    });

    socket.on("startGame", ({ gameId }) => {
      console.log("Starting game", gameId);
      navigate(`/game/${gameId}`);
    });

    // Request lobby state after joining
    setTimeout(() => {
      socket.emit("requestLobbyState", gameId);
    }, 50);

    return () => {
      socket.off("lobbyUpdate");
      socket.off("lobbyError");
      socket.off("gameCreated");
      socket.off("startGame");
    };
  }, [gameId, navigate, playerId]);

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
