import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./gameboard.css";
import GameState from "../../game/Game.State";
import GameServer from "../../game/Game.Server";

export default function GameBoard() {
  const { gameId } = useParams();
  const [state, setState] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [hoverCard, setHoverCard] = useState(null);

  const playerId = GameServer.socket.auth.playerId;

  // Subscribe + request state
  useEffect(() => {
    const unsub = GameState.subscribe(setState);
    if (gameId) GameServer.requestGameState(gameId);
    return () => unsub();
  }, [gameId]);

  if (!state || !state.players) {
    return <div className="loading">Waiting for game state…</div>;
  }

  // Canonical seating (server)
  const bottomId = state.players.bottom?.id;
  const topId = state.players.top?.id;

  const iAmBottom = playerId === bottomId;
  const iAmTop = playerId === topId;

  // -------------------------------
  // VISUAL MIRRORING (Player 2 sees reversed lanes)
  // -------------------------------
  const myGates = iAmBottom
    ? state.gatesBottom || [[], [], []]
    : [...(state.gatesTop || [[], [], []])].reverse();

  const oppGates = iAmBottom
    ? state.gatesTop || [[], [], []]
    : [...(state.gatesBottom || [[], [], []])].reverse();

  const mySets = iAmBottom
    ? state.setsBottom || [null, null, null]
    : [...(state.setsTop || [null, null, null])].reverse();

  const oppSets = iAmBottom
    ? state.setsTop || [null, null, null]
    : [...(state.setsBottom || [null, null, null])].reverse();

  const myHand = iAmBottom ? state.handBottom : state.handTop;
  const oppHand = iAmBottom ? state.handTop : state.handBottom;

  const myLife = iAmBottom ? state.lifeBottom : state.lifeTop;
  const oppLife = iAmBottom ? state.lifeTop : state.lifeBottom;

  const myDeckCount = iAmBottom ? state.deckCountBottom : state.deckCountTop;
  const oppDeckCount = iAmBottom ? state.deckCountTop : state.deckCountBottom;

  const myDiscardCount = iAmBottom ? state.discardCountBottom : state.discardCountTop;
  const oppDiscardCount = iAmBottom ? state.discardCountTop : state.discardCountBottom;

  const isMyTurn =
    (state.turnPlayer === "p1" && iAmBottom) ||
    (state.turnPlayer === "p2" && iAmTop);

  // -------------------------------
  // VISUAL → CANONICAL LANE MAPPING
  // -------------------------------
  function toCanonicalLaneIndex(visualIndex) {
    return iAmBottom ? visualIndex : 2 - visualIndex;
  }

  // -------------------------------
  // CARD ACTIONS
  // -------------------------------
  function toggleSelect(cardId) {
    setSelectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  }

  function handlePlayToGate(canonicalGateIndex, row, payload) {
    if (!isMyTurn) return;

    const cards = payload?.cards || [];
    const isCombo = payload?.type === "COMBO" && cards.length > 1;

    if (isCombo) {
      GameServer.sendPatch(gameId, {
        type: "PLAY_COMBO_TO_GATE",
        playerId,
        row,
        gateIndex: canonicalGateIndex,
        cardIds: cards
      });
    } else {
      const cardId = cards[0];
      GameServer.sendPatch(gameId, {
        type: "PLAY_TO_GATE",
        playerId,
        row,
        gateIndex: canonicalGateIndex,
        cardId
      });
    }

    setSelectedCards([]);
  }

  function handleSetToZone(visualIndex, cardId) {
    if (!isMyTurn) return;

    const canonicalIndex = toCanonicalLaneIndex(visualIndex);

    GameServer.sendPatch(gameId, {
      type: "SET_TO_ZONE",
      playerId,
      zoneIndex: canonicalIndex,
      cardId
    });

    setSelectedCards(prev => prev.filter(id => id !== cardId));
  }

  function handleEndTurn() {
    if (!isMyTurn) return;

    GameServer.sendPatch(gameId, {
      type: "END_TURN",
      playerId
    });
  }

  function handleHandDragStart(e, cardId) {
    const isPartOfCombo = selectedCards.includes(cardId);
    const cards = isPartOfCombo && selectedCards.length > 0
      ? selectedCards
      : [cardId];

    const payload = {
      type: cards.length > 1 ? "COMBO" : "BURN",
      cards
    };

    e.dataTransfer.setData("application/json", JSON.stringify(payload));
  }

  function handleGateDrop(e, visualIndex, row) {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const payload = JSON.parse(raw);
    const canonicalIndex = toCanonicalLaneIndex(visualIndex);

    handlePlayToGate(canonicalIndex, row, payload);
  }

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div className="gameboard">

      {/* OPPONENT HUD */}
      <div className="hud hud-opponent">
        <div className="hud-name">
          {iAmBottom ? state.players.top?.name : state.players.bottom?.name}
        </div>
        <div className="hud-stats">
          <span>Life: {oppLife}</span>
          <span>Deck: {oppDeckCount}</span>
          <span>Discard: {oppDiscardCount}</span>
          <span>Sets: {oppSets.filter(Boolean).length}</span>
        </div>
      </div>

      {/* OPPONENT SETS */}
      <div className="row row-sets row-sets-opponent">
        {oppSets.map((card, i) => (
          <SetSlot
            key={`opp-set-${i}`}
            card={card}
            isOpponent={true}
            setHoverCard={setHoverCard}
          />
        ))}
      </div>

      {/* OPPONENT GATES */}
      <div className="row row-gates row-gates-opponent">
        {oppGates.map((stack, i) => (
          <GateSlot
            key={`opp-gate-${i}`}
            stack={stack}
            onDrop={(e) => handleGateDrop(e, i, "top")}
            setHoverCard={setHoverCard}
          />
        ))}
      </div>

      {/* MY GATES */}
      <div className="row row-gates row-gates-player">
        {myGates.map((stack, i) => (
          <GateSlot
            key={`my-gate-${i}`}
            stack={stack}
            onDrop={(e) => handleGateDrop(e, i, "bottom")}
            setHoverCard={setHoverCard}
          />
        ))}
      </div>

          
      {/* MY SETS */}
      <div className="row row-sets row-sets-player">
        {mySets.map((card, i) => (
          <SetSlot
            key={`my-set-${i}`}
            card={card}
            isOpponent={false}
            setHoverCard={setHoverCard}
            onClick={() => {
              const first = selectedCards[0];
              if (first) handleSetToZone(i, first);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const raw = e.dataTransfer.getData("application/json");
              if (!raw) return;
              const payload = JSON.parse(raw);

              const cards = payload.cards;
              const cardId = cards[0];

              handleSetToZone(i, cardId);
            }}
          />
        ))}
      </div>

      {/* HOVER PREVIEW */}
      {hoverCard && (
        <div className="hover-preview">
          <img src={hoverCard.image} alt={hoverCard.name} />
        </div>
      )}

      {/* MY HAND */}
      <div className="row row-hand">
        {myHand.map((card) => (
          <HandCard
            key={card.id}
            card={card}
            selected={selectedCards.includes(card.id)}
            onClick={() => toggleSelect(card.id)}
            onDragStart={(e) => handleHandDragStart(e, card.id)}
            setHoverCard={setHoverCard}
          />
        ))}
      </div>

      {/* MY HUD */}
      <div className="hud hud-player">
        <div className="hud-name">
          {iAmBottom ? state.players.bottom?.name : state.players.top?.name}
        </div>
        <div className="hud-stats">
          <span>Life: {myLife}</span>
          <span>Deck: {myDeckCount}</span>
          <span>Discard: {myDiscardCount}</span>
          <span>Sets: {mySets.filter(Boolean).length}</span>
        </div>
        <div className="hud-turn">
          <span className={isMyTurn ? "turn-indicator active" : "turn-indicator"}>
            {isMyTurn ? "Your Turn" : "Opponent's Turn"}
          </span>
          <button
            className="end-turn-button"
            onClick={handleEndTurn}
            disabled={!isMyTurn}
          >
            End Turn
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------
// COMPONENTS
// -------------------------------
function GateSlot({ stack, onDrop, setHoverCard }) {
  const safeStack = Array.isArray(stack) ? stack : [];
  const topCard = safeStack[safeStack.length - 1] || null;

  return (
    <div
      className="slot slot-gate"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onMouseEnter={() => topCard && setHoverCard(topCard)}
      onMouseLeave={() => setHoverCard(null)}
    >
      {safeStack.length === 0 ? (
        <div className="slot-placeholder">Gate</div>
      ) : (
        <div className="gate-stack">
          {safeStack.filter(Boolean).map((card, i) => (
            <img
              key={card.id}
              src={card.image}
              alt={card.name}
              className="gate-card"
              style={{ "--i": i }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SetSlot({ card, isOpponent, onClick, onDrop, setHoverCard }) {
  return (
    <div
      className="slot slot-set"
      onClick={onClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onMouseEnter={() => !isOpponent && card && setHoverCard(card)}
      onMouseLeave={() => setHoverCard(null)}
    >
      {card ? (
        <div className={`card card-set ${isOpponent ? "card-set-opponent" : ""}`}>
          {isOpponent ? (
            <div className="card-back">Set</div>
          ) : (
            <img src={card.image} alt={card.name} />
          )}
        </div>
      ) : (
        <div className="slot-placeholder">Set</div>
      )}
    </div>
  );
}

function HandCard({ card, onClick, onDragStart, selected, setHoverCard }) {
  return (
    <div
      className={`card card-hand ${selected ? "selected" : ""}`}
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onMouseEnter={() => setHoverCard(card)}
      onMouseLeave={() => setHoverCard(null)}
    >
      <img src={card.image} alt={card.name} />
    </div>
  );
}
