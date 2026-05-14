import { useEffect } from "react";
import { useParams } from "react-router-dom";

import "./gameboard.css";
import useGameNetwork from "../../hooks/useGameNetwork";
import GameState from "../../game/Game.State";
import GameServer from "../../game/Game.Server";

export default function GameBoard() {
  const { gameId } = useParams();

  // Subscribe to server updates
  useGameNetwork(gameId, GameServer.applyServerState);

  const state = GameState.get() || {};

  const {
    turnPlayer,
    playerId,          // assume you store which socket/player this client is
    players = {},
    gatesTop = [null, null, null],    // opponent gates
    gatesBottom = [null, null, null], // your gates
    setsTop = [null, null, null],     // opponent sets
    setsBottom = [null, null, null],  // your sets
    hand = [],                        // your hand
    deckCountTop = 0,
    deckCountBottom = 0,
    discardCountTop = 0,
    discardCountBottom = 0,
    lifeTop = 20,
    lifeBottom = 20,
  } = state;

  const isMyTurn = turnPlayer === playerId;

  // Example: play card from hand into a gate index
  function handlePlayToGate(index, row) {
    if (!isMyTurn) return;
    // row: "top" or "bottom" gates
    // send action to server
    GameServer.playCardToGate({ gameId, gateIndex: index, row });
  }

  // Example: set card into your set zone
  function handleSetToZone(index) {
    if (!isMyTurn) return;
    GameServer.setCardToZone({ gameId, zoneIndex: index });
  }

  function handleEndTurn() {
    if (!isMyTurn) return;
    GameServer.endTurn({ gameId });
  }

  function handlePlayFromHand(cardId) {
    // You can open a targeting UI or choose gate/set after this
    console.log("Clicked hand card:", cardId);
  }

  useEffect(() => {
    // You can add any on-mount logic here if needed
  }, []);

  return (
    <div className="gameboard">

      {/* OPPONENT HUD */}
      <div className="hud hud-opponent">
        <div className="hud-name">
          {players.top?.name || "Opponent"}
        </div>
        <div className="hud-stats">
          <span>Life: {lifeTop}</span>
          <span>Deck: {deckCountTop}</span>
          <span>Discard: {discardCountTop}</span>
          <span>Sets: {setsTop.filter(Boolean).length}</span>
        </div>
      </div>

      {/* OPPONENT SET ZONES (compact, hidden) */}
      <div className="row row-sets row-sets-opponent">
        {setsTop.map((card, i) => (
          <SetSlot key={i} card={card} isOpponent />
        ))}
      </div>

      {/* OPPONENT GATES (big, shared, visible) */}
      <div className="row row-gates row-gates-opponent">
        {gatesTop.map((card, i) => (
          <GateSlot
            key={i}
            card={card}
            onClick={() => handlePlayToGate(i, "top")}
          />
        ))}
      </div>

      {/* YOUR GATES (big, shared, visible) */}
      <div className="row row-gates row-gates-player">
        {gatesBottom.map((card, i) => (
          <GateSlot
            key={i}
            card={card}
            onClick={() => handlePlayToGate(i, "bottom")}
          />
        ))}
      </div>

      {/* YOUR SET ZONES (compact, private) */}
      <div className="row row-sets row-sets-player">
        {setsBottom.map((card, i) => (
          <SetSlot
            key={i}
            card={card}
            onClick={() => handleSetToZone(i)}
          />
        ))}
      </div>

      {/* YOUR HAND */}
      <div className="row row-hand">
        {hand.map((card) => (
          <HandCard
            key={card.id}
            card={card}
            onClick={() => handlePlayFromHand(card.id)}
          />
        ))}
      </div>

      {/* YOUR HUD */}
      <div className="hud hud-player">
        <div className="hud-name">
          {players.bottom?.name || "You"}
        </div>
        <div className="hud-stats">
          <span>Life: {lifeBottom}</span>
          <span>Deck: {deckCountBottom}</span>
          <span>Discard: {discardCountBottom}</span>
          <span>Sets: {setsBottom.filter(Boolean).length}</span>
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

/* -----------------------------
   GATE SLOT (big, card art)
------------------------------ */
function GateSlot({ card, onClick }) {
  return (
    <div className="slot slot-gate" onClick={onClick}>
      {card ? (
        <div className="card card-gate">
          <img src={card.image} alt={card.name} />
          <div className="card-label">{card.name}</div>
        </div>
      ) : (
        <div className="slot-placeholder">Gate</div>
      )}
    </div>
  );
}

/* -----------------------------
   SET SLOT (compact, hidden/private)
------------------------------ */
function SetSlot({ card, isOpponent, onClick }) {
  return (
    <div className="slot slot-set" onClick={onClick}>
      {card ? (
        <div className={`card card-set ${isOpponent ? "card-set-opponent" : ""}`}>
          {isOpponent ? (
            <div className="card-back">Set</div>
          ) : (
            <>
              <img src={card.image} alt={card.name} />
              <div className="card-label">{card.name}</div>
            </>
          )}
        </div>
      ) : (
        <div className="slot-placeholder">Set</div>
      )}
    </div>
  );
}

/* -----------------------------
   HAND CARD (big, interactive)
------------------------------ */
function HandCard({ card, onClick }) {
  return (
    <div className="card card-hand" onClick={onClick}>
      <img src={card.image} alt={card.name} />
      <div className="card-label">{card.name}</div>
    </div>
  );
}
