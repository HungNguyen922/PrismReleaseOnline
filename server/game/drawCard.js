module.exports = function drawCard(state, playerId) {
  const isTop = state.players.top.id === playerId;
  const isBottom = state.players.bottom.id === playerId;

  const hand = isBottom ? state.handBottom : state.handTop;

  if (state.drawPile.length === 0) return null;

  const card = state.drawPile.shift();
  hand.push(card);

  return card;
};
