// server/game/mergeDecks.js

module.exports = function mergeDecks(state) {
  // -------------------------------
  // 1. Draw starting hands
  // -------------------------------
  // You can change 5 → any starting hand size you want
  const STARTING_HAND_SIZE = 5;

  state.handP1 = state.deckP1.splice(0, STARTING_HAND_SIZE);
  state.handP2 = state.deckP2.splice(0, STARTING_HAND_SIZE);

  // -------------------------------
  // 2. Merge remaining cards
  // -------------------------------
  const merged = [...state.deckP1, ...state.deckP2];

  // -------------------------------
  // 3. Shuffle merged deck
  // -------------------------------
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }

  // -------------------------------
  // 4. Assign shared draw pile
  // -------------------------------
  state.drawPile = merged;

  // -------------------------------
  // 5. Clear temporary decks
  // -------------------------------
  state.deckP1 = [];
  state.deckP2 = [];

  // -------------------------------
  // 6. Mark decks as merged
  // -------------------------------
  state.decksMerged = true;
};
