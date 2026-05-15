// server/game/applyPatch.js
const drawCard = require("./drawCard");

module.exports = function applyPatch(state, patch) {
  const { type, playerId, row } = patch;

  // Canonical zones
  const hand = state.hands[row];
  const gates = state.gates[row];
  const sets = state.sets[row];

  switch (type) {

    // ============================================================
    // DRAW CARD
    // ============================================================
    case "DRAW_CARD": {
      drawCard(state, playerId);
      break;
    }

    // ============================================================
    // PLAY CARD TO GATE
    // ============================================================
    case "PLAY_TO_GATE": {
    const { gateIndex, cardId, row: targetRow } = patch;

    // hand row is determined by playerId (who is playing)
    const isBottom = state.players.bottom?.id === playerId;
    const handRow = isBottom ? "bottom" : "top";

    const hand = state.hands[handRow];
    const gates = state.gates[targetRow]; // ⭐ targetRow is where the gate lives

    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    gates[gateIndex].push(card);

    const idx = hand.findIndex(c => c.id === cardId);
    if (idx !== -1) hand.splice(idx, 1);

    break;
  }

  // ============================================================
  // PLAY SET CARD TO GATE
  // ============================================================
  case "PLAY_SET_TO_GATE": {
    const { zoneIndex, gateIndex, row: targetRow } = patch;

    const isBottom = state.players.bottom?.id === playerId;
    const setRow = isBottom ? "bottom" : "top";

    const sets = state.sets[setRow];
    const gates = state.gates[targetRow];

    const card = sets[zoneIndex];
    if (!card) return;

    gates[gateIndex].push(card);
    sets[zoneIndex] = null;

    break;
  }

    // ============================================================
    // PLAY COMBO TO GATE
    // ============================================================
    case "PLAY_COMBO_TO_GATE": {
      const { gateIndex, cardIds } = patch;

      for (const cardId of cardIds) {
        const card = hand.find(c => c.id === cardId);
        if (!card) continue;

        gates[gateIndex].push(card);

        const idx = hand.findIndex(c => c.id === cardId);
        if (idx !== -1) hand.splice(idx, 1);
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

      break;
    }

    // ============================================================
    // ANY CARD DRAW OUTSIDE FILL
    // ============================================================
    case "DRAW_CARDS": {
      const { count, row } = patch;
      const hand = state.hands[row];

      for (let i = 0; i < count; i++) {
        if (state.drawPile.length === 0) break;
        hand.push(state.drawPile.shift());
      }

      break;
    }


    // ============================================================
    // FILL PHASE
    // ============================================================
    case "FILL_PHASE": {
      while (hand.length < 4 && state.drawPile.length > 0) {
        drawCard(state, playerId);
      }

      if (state.playedCardsThisTurn >= 3) {
        if (patch.source === "EXTRA") {
          const extra = state.extraDecks[row];
          if (extra && extra.length > 0) {
            const bonus = extra.pop();
            hand.push(bonus);
          }
        } else {
          drawCard(state, playerId);
        }
      }

      break;
    }

    // ============================================================
    // END TURN
    // ============================================================
    case "END_TURN": {
      state.turnPlayer = row === "bottom" ? "top" : "bottom";
      break;
    }

    default:
      console.log("Unknown patch type:", type);
  }
};
