// useGameActions.js
import GameClient from "../../game/GameClient";
import GameActions from "../../game/Game.Actions";

export default function useGameActions(gameId, playerId, state, mapping) {
  if (!state) {
    return {
      drawCards: () => {},
      drawFromExtraDeck: () => {},
      playHandToGate: () => {},
      playHandToSet: () => {},
      playSetToGate: () => {},
      endTurn: () => {}
    };
  }

  function drawCards(count, row) {
    GameClient.server.sendPatch(gameId, {
      type: "DRAW_CARDS",
      count,
      row,
      playerId
    });
  }

  function drawFromExtraDeck(index, rowFromSlot) {
    GameClient.server.sendPatch(gameId, {
      type: "DRAW_FROM_EXTRA",
      index,
      row: rowFromSlot
    });
  }

  function scanX(x, rowFromSlot) {
    const gs = GameClient.state.gameState;
    const topCards = gs.drawPile.slice(0, x);

    GameActions.openViewModal(topCards, "Scan", (index) => {
      GameClient.server.sendPatch(gameId, {
        type: "SCAN_DRAW",
        index,
        row: rowFromSlot
      });
    });
  }

  function playHandToGate(canonicalGateIndex, rowFromSlot, payload) {
    GameClient.server.sendPatch(gameId, {
      type: "PLAY_TO_GATE",
      gateIndex: canonicalGateIndex,
      cardId: payload.cards[0],
      row: rowFromSlot
    });
  }

  function playHandToSet(setIndex, cardId, rowFromSlot) {
    GameClient.server.sendPatch(gameId, {
      type: "SET_TO_ZONE",
      zoneIndex: setIndex,
      cardId,
      row: rowFromSlot
    });
  }

  function playSetToGate(canonicalGateIndex, rowFromSlot, payload) {
    GameClient.server.sendPatch(gameId, {
      type: "PLAY_SET_TO_GATE",
      zoneIndex: payload.zoneIndex,
      gateIndex: canonicalGateIndex,
      row: rowFromSlot
    });
  }

  function endTurn(rowFromSlot) {
    GameClient.server.sendPatch(gameId, {
      type: "END_TURN",
      row: rowFromSlot
    });
  }

  return {
    drawCards,
    drawFromExtraDeck,
    scanX,
    playHandToGate,
    playHandToSet,
    playSetToGate,
    endTurn,
  };
}
