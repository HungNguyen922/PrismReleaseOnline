import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useGameNetwork from "../../hooks/useGameNetwork";
import GameServer from "../../game/Game.Server";
import GameState from "../../game/Game.State";
import Actions from "../../game/Game.Actions";

export default function GameBoard() {
  const { gameId } = useParams();

  // Hook: networking + server state sync
  const { sendPatch } = useGameNetwork(gameId, GameServer.applyServerState);

  // Local render trigger
  const [tick, setTick] = useState(0);

  //
  // This Ensures the Board isn't scrollable
  //
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
// Re-render whenever GameState updates
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  const state = GameState.get();

  // ---------------------------------------
  // Loading state
  // ---------------------------------------
  if (!state) {
    return (
      <div className="gameboard">
        <h1>Loading game...</h1>
      </div>
    );
  }

  // ---------------------------------------
  // UI Handlers (these will call Actions)
  // ---------------------------------------
  function handleDraw() {
    Actions.drawCard();
  }

  function handleEndTurn() {
    Actions.endTurn();
  }

  // ---------------------------------------
  // Render helpers
  // ---------------------------------------
  function renderHand(hand) {
    return (
      <div className="hand">
        {hand.map((card, i) => (
          <div key={i} className="card">
            {card ? card.name : "???"}
          </div>
        ))}
      </div>
    );
  }

  function renderBoard(board) {
    return (
      <div className="board">
        {board.map((slot, i) => (
          <div key={i} className="slot">
            {slot.card ? slot.card.name : "Empty"}
          </div>
        ))}
      </div>
    );
  }

  // ---------------------------------------
  // Main UI
  // ---------------------------------------
  return (
    <div className="gameboard">
      <h1>Game Board</h1>
      <p>Turn: {state.turn}</p>
      <p>Turn Player: {state.turnPlayer}</p>

      {/* Board */}
      <h2>Board</h2>
      {renderBoard(state.board)}

      {/* Hand */}
      <h2>Your Hand</h2>
      {renderHand(
        state.turnPlayer === "p1" ? state.handP1 : state.handP2
      )}

      {/* Controls */}
      <div className="controls">
        <button onClick={handleDraw}>Draw</button>
        <button onClick={handleEndTurn}>End Turn</button>
      </div>

      {/* Shared Piles */}
      <div className="piles">
        <p>Draw Pile: {state.drawPile.length} cards</p>
        <p>Graveyard: {state.gap.length} cards</p>
      </div>
    </div>
  );
}