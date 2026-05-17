// server/game/applyPatch.js
import drawCard from "./drawCard.js";

export default function applyPatch(state, patch) {
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

    // Who is acting?
    const isBottom = state.players.bottom?.id === playerId;
    const isTop = state.players.top?.id === playerId;
    if (!isBottom && !isTop) {
      console.log("Invalid PLAY_TO_GATE: unknown player");
      return state;
    }

    const handRow = isBottom ? "bottom" : "top";

    // Only allow the current player to act
    if (state.turnPlayer !== handRow) {
      console.log("Invalid PLAY_TO_GATE: not your turn");
      return state;
    }

    const hand = state.hands[handRow];
    const gates = state.gates[targetRow]; // targetRow is where the gate lives

    const card = hand.find(c => c.id === cardId);
    if (!card) return state;

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
    if (patch.row !== state.turnPlayer) {
      console.log("Invalid PLAY_TO_GATE: not your turn");
      return state;
    }

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
      if (patch.row !== state.turnPlayer) {
        console.log("Invalid PLAY_TO_GATE: not your turn");
        return state;
      }

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
      if (patch.row !== state.turnPlayer) {
        console.log("Invalid PLAY_TO_GATE: not your turn");
        return state;
      }

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
      if (patch.row !== state.turnPlayer) {
        console.log("Invalid PLAY_TO_GATE: not your turn");
        return state;
      }
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
      const { row } = patch;
      if (patch.row !== state.turnPlayer) {
        console.log("Invalid PLAY_TO_GATE: not your turn");
        return state;
      }
      
      // Only allow the current player to end their turn
      if (state.turnPlayer !== row) {
        console.log("Invalid END_TURN: not your turn");
        return state;
      }

      // Swap turn
      const next = row === "bottom" ? "top" : "bottom";

      return {
        ...state,
        turnPlayer: next
      };
    }

    default:
      console.log("Unknown patch type:", type);
  }
};
