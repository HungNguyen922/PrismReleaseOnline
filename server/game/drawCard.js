// server/game/drawCard.js
module.exports = function drawCard(state, playerId) {
  // Determine which side this player is on
  const isBottom = state.players.bottom?.id === playerId;
  const isTop = state.players.top?.id === playerId;

  if (!isBottom && !isTop) {
    console.log("drawCard: unknown player", playerId);
    return null;
  }

  // Draw pile lives directly on state
  if (!state.drawPile || state.drawPile.length === 0) {
    return null;
  }

  // Take top card
  const card = state.drawPile.shift();

  // Push into correct hand
  if (isBottom) {
    state.hands.bottom.push(card);
  } else {
    state.hands.top.push(card);
  }

  return card;
};
