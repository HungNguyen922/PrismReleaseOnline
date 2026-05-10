import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useGameNetwork from "../../hooks/useGameNetwork";
import GameServer from "../../game/Game.Server";
import GameState from "../../game/Game.State";

export default function Matchmaking() {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const [deck, setDeck] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Hook: networking + server state sync
  const {
    roomFull,
    uploadDeck,
    readyUp
  } = useGameNetwork(gameId, GameServer.applyServerState);

  // ---------------------------------------
  // Transition to GameBoard when decks merge
  // ---------------------------------------
  useEffect(() => {
    const state = GameState.get();
    if (!state) return;

    if (state.decksMerged) {
      navigate(`/game/${gameId}`);
    }
  });

  // ---------------------------------------
  // Upload deck handler
  // ---------------------------------------
  function handleUploadDeck() {
    if (!deck) return;
    GameServer.uploadDeck(deck);
  }

  // ---------------------------------------
  // Ready up handler
  // ---------------------------------------
  function handleReady() {
    GameServer.readyUp();
    setIsReady(true);
  }

  // ---------------------------------------
  // UI
  // ---------------------------------------
  if (roomFull) {
    return (
      <div className="matchmaking">
        <h1>Room is full</h1>
      </div>
    );
  }

  const state = GameState.get();

  return (
    <div className="matchmaking">
      <h1>Matchmaking</h1>
      <p>Game ID: {gameId}</p>

      {/* Deck Upload */}
      <div className="deck-upload">
        <h2>Upload Deck</h2>

        <textarea
          placeholder="Paste your deck JSON here"
          value={deck || ""}
          onChange={(e) => setDeck(JSON.parse(e.target.value))}
        />

        <button onClick={handleUploadDeck}>
          Upload Deck
        </button>
      </div>

      {/* Ready Button */}
      <div className="ready-section">
        <button
          disabled={!deck || isReady}
          onClick={handleReady}
        >
          {isReady ? "Waiting for opponent..." : "Ready Up"}
        </button>
      </div>

      {/* Status */}
      {state && (
        <div className="status">
          <p>P1 Ready: {state.p1Ready ? "Yes" : "No"}</p>
          <p>P2 Ready: {state.p2Ready ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}
