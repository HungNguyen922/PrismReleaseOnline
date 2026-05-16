import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./deckselect.css";
import { decodeDeck } from "../../game/DeckCode";
import VisualDeckView from "../../components/deckview/VisualDeckView";
import GameClient from "../../game/GameClient";

export default function DeckSelect() {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);          // NEW: DB cards
  const [loadingCards, setLoadingCards] = useState(true);

  const [deckCode, setDeckCode] = useState("");
  const [decodedDeck, setDecodedDeck] = useState(null);
  const [error, setError] = useState("");

  const [joining, setJoining] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // -----------------------------
  // Load cards from database
  // -----------------------------
  useEffect(() => {
    async function loadCards() {
      const res = await fetch("/api/cards");
      const data = await res.json();
      setCards(data);
      setLoadingCards(false);
    }
    loadCards();
  }, []);

  // -----------------------------
  // Decode deck code
  // -----------------------------
  function handleDeckCodeChange(e) {
    const code = e.target.value;
    setDeckCode(code);

    if (!code.trim()) {
      setDecodedDeck(null);
      setError("");
      return;
    }

    if (loadingCards) {
      setError("Loading card database...");
      return;
    }

    try {
      const [name, encoded] = code.split("::");
      const decoded = decodeDeck(encoded.trim(), cards);   // FIXED
      decoded.name = name.trim();

      setDecodedDeck(decoded);
      setError("");

      GameClient.setState({ selectedDeck: decoded });
    } catch (err) {
      setDecodedDeck(null);
      setError("Invalid deck code");
    }
  }

  function handleCreateLobby() {
    GameClient.server.createLobby((id) => navigate(`/matchmaking/${id}`));
  }

  function handleQuickplay() {
    GameClient.server.createLobby((id) => navigate(`/matchmaking/${id}`));
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
