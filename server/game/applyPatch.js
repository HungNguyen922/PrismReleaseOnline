// server/game/applyPatch.js
const drawCard = require("./drawCard");

module.exports = function applyPatch(state, patch) {
  const { type, playerId } = patch;

  // Determine if this player is bottom or top in canonical state
  const isBottom = state.players.bottom?.id === playerId;
  const isTop = state.players.top?.id === playerId;

  if (!isBottom && !isTop) {
    console.log("Patch rejected: unknown player", playerId);
    return;
  }

  // Canonical zones (Player 1 = bottom, Player 2 = top)
  const hand = isBottom ? state.handBottom : state.handTop;
  const gates = isBottom ? state.gatesBottom : state.gatesTop;
  const sets = isBottom ? state.setsBottom : state.setsTop;

  // Opponent zones (canonical)
  const oppGates = isBottom ? state.gatesTop : state.gatesBottom;
  const oppSets = isBottom ? state.setsTop : state.setsBottom;

  switch (type) {

    // ============================================================
    // START TURN → enters INSTANT PHASE
    // ============================================================
    case "START_TURN": {
      const isTurnPlayer =
        (state.turnPlayer === "p1" && isBottom) ||
        (state.turnPlayer === "p2" && isTop);

      if (!isTurnPlayer) return;

      state.turnPhase = "INSTANT";
      state.playedCardsThisTurn = 0;
      break;
    }

    // ============================================================
    // DRAW CARD (manual draw)
    // ============================================================
    case "DRAW_CARD": {
      drawCard(state, playerId);
      break;
    }

    // ============================================================
    // PLAY CARD TO GATE (supports row: "bottom" | "top")
    // ============================================================
    case "PLAY_TO_GATE": {
      const { gateIndex, cardId, row } = patch;

      const card = hand.find(c => c.id === cardId);
      if (!card) return;

      // Choose correct gate row based on patch.row
      const targetGates =
        row === "bottom" ? gates :
        row === "top"    ? oppGates :
        null;

      if (!targetGates) return;

      targetGates[gateIndex].push(card);

      // Remove from hand
      const idx = hand.findIndex(c => c.id === cardId);
      if (idx !== -1) hand.splice(idx, 1);

      state.playedCardsThisTurn++;
      break;
    }

    // ============================================================
    // PLAY COMBO TO GATE
    // ============================================================
    case "PLAY_COMBO_TO_GATE": {
      const { gateIndex, cardIds, row } = patch;

      const targetGates =
        row === "bottom" ? gates :
        row === "top"    ? oppGates :
        null;

      if (!targetGates) return;

      for (const cardId of cardIds) {
        const card = hand.find(c => c.id === cardId);
        if (!card) continue;

        targetGates[gateIndex].push(card);

        const idx = hand.findIndex(c => c.id === cardId);
        if (idx !== -1) hand.splice(idx, 1);

        state.playedCardsThisTurn++;
      }

      break;
    }

    // ============================================================
    // SET CARD TO SET ZONE
    // ============================================================
    case "SET_TO_ZONE": {
      const { zoneIndex, cardId } = patch;

      const card = hand.find(c => c.id === cardId);
      if (!card) return;

      sets[zoneIndex] = card;

      const idx = hand.findIndex(c => c.id === cardId);
      if (idx !== -1) hand.splice(idx, 1);

      state.playedCardsThisTurn++;
      break;
    }

    // ============================================================
    // FILL PHASE → draw to 4 + bonus draw
    // ============================================================
    case "FILL_PHASE": {
      while (hand.length < 4 && state.drawPile.length > 0) {
        drawCard(state, playerId);
      }

      if (state.playedCardsThisTurn >= 3) {
        if (patch.source === "EXTRA") {
          const extra = isBottom ? state.extraDeckBottom : state.extraDeckTop;
          if (extra && extra.length > 0) {
            const bonus = extra.pop();
            hand.push(bonus);
          }
        } else {
          drawCard(state, playerId);
        }
      }

      state.turnPhase = "END";
      break;
    }

    // ============================================================
    // END TURN → pass to opponent
    // ============================================================
    case "END_TURN": {
      state.turnPlayer = state.turnPlayer === "p1" ? "p2" : "p1";
      state.turnPhase = "INSTANT";
      state.playedCardsThisTurn = 0;
      break;
    }

    default:
      console.log("Unknown patch type:", type);
  }
};
