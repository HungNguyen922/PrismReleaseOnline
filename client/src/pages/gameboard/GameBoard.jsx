import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import GameClient from "../../game/GameClient";
import GameActions from "../../game/Game.Actions";

import useGameMapping from "./useGameMapping";
import useGameActions from "./useGameActions";
import useGameHover from "./useGameHover";

import GateSlot from "./components/GateSlot";
import SetSlot from "./components/SetSlot";
import HandCard from "./components/HandCard";

import "./gameboard.css";

// Wire UI actions into GameClient
GameClient.openDrawMenu = GameActions.openDrawMenu;
GameClient.openExtraDeck = GameActions.openExtraDeck;

export default function GameBoard() {
  const { gameId } = useParams();
  const [state, setState] = useState(null);

  // Subscribe to game state
  useEffect(() => {
    const unsub = GameClient.subscribe(setState);
    if (gameId) GameClient.server.requestGameState(gameId);
    return () => unsub();
  }, [gameId]);

  // state IS the gameState now
  const gs = state;

  const side = GameClient.state.playerSide; // "top" or "bottom"
  const playerId = GameClient.state.playerId;

  // Hooks must run BEFORE any early return
  const mapping = useGameMapping(playerId, state);
  const hover = useGameHover();
  const actions = useGameActions(gameId, playerId, state, mapping);

  const myCanonicalSide = side;
  const oppCanonicalSide = mapping.mapSide(side);

  // Register draw callback
  useEffect(() => {
    if (!actions) return;
    GameActions.setDrawCallback((count) => {
      actions.drawCards(count, myCanonicalSide);
    });
  }, [actions, myCanonicalSide]);

  // Early return AFTER hooks
  if (!gs) {
    return <div className="loading">Loading…</div>;
  }

  const { mirrorRow, toCanonicalIndex } = mapping;
  const { hoverCard, bindHover } = hover;

  const {
    drawCards,
    drawFromExtraDeck,
    playHandToGate,
    playHandToSet,
    playSetToGate,
    endTurn
  } = actions;

  // Canonical → Visual mapping
  const myHand = gs.hands[myCanonicalSide];

  const myGates = mirrorRow(gs.gates[myCanonicalSide]);
  const oppGates = mirrorRow(gs.gates[oppCanonicalSide]);

  const mySets = mirrorRow(gs.sets[myCanonicalSide]);
  const oppSets = mirrorRow(gs.sets[oppCanonicalSide]);

  const drawPile = gs.drawPile;
  const discardPile = gs.discard;
  const leader = gs.leaders[myCanonicalSide];
  const extraDeck = gs.extraDecks[myCanonicalSide];

  const isMyTurn = gs.turnPlayer === myCanonicalSide;

  // Drag routing
  function handlePlayToGate(gateIndex, row, payload) {
    if (payload.type === "HAND_CARD") {
      playHandToGate(gateIndex, row, payload);
    }
    if (payload.type === "SET_CARD") {
      playSetToGate(gateIndex, row, payload);
    }
  }

  function handlePlayToSet(canonicalIndex, cardId) {
    playHandToSet(canonicalIndex, cardId, myCanonicalSide);
  }

  return (
    <div className="gameboard">

      {/* Opponent HUD */}
      <div className="hud hud-opponent">
        <span className="hud-name">{gs.players[oppCanonicalSide].name}</span>
      </div>

      {/* Opponent Sets */}
      <div className="row row-sets row-sets-opponent">
        {oppSets.map((card, i) => (
          <SetSlot
            key={i}
            card={card}
            isOpponent={true}
            visualIndex={i}
            canonicalIndex={toCanonicalIndex(i, oppSets.length)}
            playToSet={handlePlayToSet}
            bindHover={bindHover}
          />
        ))}
      </div>

      {/* Opponent Gates */}
      <div className="row row-gates row-gates-opponent">
        {oppGates.map((stack, i) => (
          <GateSlot
            key={i}
            stack={stack}
            row={oppCanonicalSide}
            visualIndex={i}
            canonicalIndex={toCanonicalIndex(i, gs.gates[oppCanonicalSide].length)}
            playToGate={handlePlayToGate}
            bindHover={bindHover}
          />
        ))}
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="pile draw-pile" onClick={() => drawCards(1, myCanonicalSide)}>
          <div className="pile-card"></div>
          <div className="pile-count">{drawPile.length}</div>
        </div>

        <div className="pile discard-pile">
          <div className="pile-card"></div>
          <div className="pile-count">{discardPile.length}</div>
        </div>
      </div>

      {/* My Gates */}
      <div className="row row-gates row-gates-player">
        {myGates.map((stack, i) => (
          <GateSlot
            key={i}
            stack={stack}
            row={myCanonicalSide}
            visualIndex={i}
            canonicalIndex={toCanonicalIndex(i, gs.gates[myCanonicalSide].length)}
            playToGate={handlePlayToGate}
            bindHover={bindHover}
          />
        ))}
      </div>

      {/* My Sets */}
      <div className="row row-sets row-sets-player">
        {mySets.map((card, i) => (
          <SetSlot
            key={i}
            card={card}
            isOpponent={false}
            visualIndex={i}
            canonicalIndex={toCanonicalIndex(i, mySets.length)}
            playToSet={handlePlayToSet}
            bindHover={bindHover}
          />
        ))}
      </div>

      {/* Hand */}
      <div className="row row-hand">
        {myHand.map((card) => (
          <HandCard key={card.id} card={card} bindHover={bindHover} />
        ))}
      </div>

      {/* Bottom Right */}
      <div className="bottom-right-panel">
        <div className="leader-slot">
          {leader && <img src={leader.image} alt="Leader" />}
        </div>

        <div className="extra-slot" onClick={() => drawCards(1, myCanonicalSide)}>
          <div className="extra-preview">
            {extraDeck.slice(0, 3).map((card, i) => (
              <img
                key={card.id}
                src={card.image}
                style={{ "--i": i }}
                className="extra-card"
              />
            ))}
          </div>
          <div className="extra-count">{extraDeck.length}</div>
        </div>

      </div>

      {/* Hover Preview */}
      {hoverCard && (
        <div className="hover-preview">
          <img src={hoverCard.image} alt={hoverCard.name} />
        </div>
      )}

      {/* HUD */}
      <div className="hud hud-player">
        <span className={isMyTurn ? "turn-indicator active" : "turn-indicator"}>
          {isMyTurn ? "Your Turn" : "Opponent's Turn"}
        </span>
        <button onClick={() => endTurn(myCanonicalSide)} disabled={!isMyTurn}>
          End Turn
        </button>
      </div>
    </div>
  );
}
