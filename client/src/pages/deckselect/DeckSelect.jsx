import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./deckselect.css";
import { decodeDeck } from "../../game/DeckCode";
import allCards from "../../game/allCards";
import VisualDeckView from "../../components/deckview/VisualDeckView";
import GameState from "../../game/Game.State";
import GameServer from "../../game/Game.Server";

export default function DeckSelect() {
  const navigate = useNavigate();

  const [deckCode, setDeckCode] = useState("");
  const [decodedDeck, setDecodedDeck] = useState(null);
  const [error, setError] = useState("");

  const [joining, setJoining] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  function handleDeckCodeChange(e) {
    const code = e.target.value;
    setDeckCode(code);

    if (!code.trim()) {
      setDecodedDeck(null);
      setError("");
      return;
    }

    try {
      const [name, encoded] = code.split("::");
      const decoded = decodeDeck(encoded.trim(), allCards);
      decoded.name = name.trim();

      setDecodedDeck(decoded);
      setError("");

      GameState.set({ selectedDeck: decoded });
    } catch (err) {
      setDecodedDeck(null);
      setError("Invalid deck code");
    }
  }

  function handleCreateLobby() {
    GameServer.createLobby((id) => navigate(`/matchmaking/${id}`));
    }

  function handleQuickplay() {
    GameServer.quickJoin((id) => navigate(`/matchmaking/${id}`));
  }


  function handleJoinLobbyFinal() {
    if (!joinCode.trim() || !decodedDeck) return;
    navigate(`/matchmaking/${joinCode.trim()}`);
  }

  return (
    <div className="deckselect">
      <h1>Select Your Deck</h1>

      <input
        type="text"
        placeholder="Paste your deck code"
        value={deckCode}
        onChange={handleDeckCodeChange}
      />

      {error && <p className="error">{error}</p>}

      <div className="deck-preview-area">
        <VisualDeckView
          deckName={decodedDeck?.name}
          leader={decodedDeck?.leader}
          deckMain={decodedDeck?.main}
          deckExtra={decodedDeck?.extra}
        />
      </div>

      <div className="match-buttons">
        <button disabled={!decodedDeck} onClick={handleCreateLobby}>
          Create Lobby
        </button>

        {!joining && (
          <button disabled={!decodedDeck} onClick={() => setJoining(true)}>
            Join Lobby
          </button>
        )}

        {joining && (
          <div className="join-lobby-box">
            <input
              type="text"
              placeholder="Enter lobby code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button onClick={handleJoinLobbyFinal}>
              Join
            </button>
          </div>
        )}

        <button disabled={!decodedDeck} onClick={handleQuickplay}>
          Quickplay
        </button>
      </div>
    </div>
  );
}
