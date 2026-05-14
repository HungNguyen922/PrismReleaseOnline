import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameServer from "../../game/Game.Server";
import "./matchmaking.css";

export default function MatchMaking() {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const [lobbyPlayers, setLobbyPlayers] = useState([]);

  useEffect(() => {
    const socket = GameServer.socket;
    if (!socket) return;

    // Ask server for current lobby state (important for refresh)
    socket.emit("requestLobbyState", gameId);

    // Only join if we are NOT already in the lobby
    socket.emit("attemptJoinLobby", gameId);

    return () => {
      socket.emit("leaveLobby", gameId);
    };
  }, [gameId]);

  useEffect(() => {
    const socket = GameServer.socket;
    if (!socket) return;

    const handleLobbyUpdate = (data) => {
      setLobbyPlayers(data.players);
    };

    const handleStartGame = ({ gameId: readyId }) => {
      navigate(`/game/${readyId}`);
    };

    socket.on("lobbyUpdate", handleLobbyUpdate);
    socket.on("startGame", handleStartGame);

    return () => {
      socket.off("lobbyUpdate", handleLobbyUpdate);
      socket.off("startGame", handleStartGame);
    };
  }, []);

  return (
    <div className="matchmaking">
      <h2>Lobby Code: {gameId}</h2>

      <div className="lobby-status">
        {lobbyPlayers.length === 1 && <p>Waiting for opponent…</p>}
        {lobbyPlayers.length === 2 && <p>Opponent joined! Starting game…</p>}
      </div>
      
      <button
        onClick={() => navigator.clipboard.writeText(gameId)}
        className="copy-btn"
      >
        Copy Code
      </button>
    </div>
  );
}
