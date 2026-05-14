module.exports = function mergeDecks(state) {
  // Shuffle helper
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Shuffle each player's deck
  shuffle(state.deckP1);
  shuffle(state.deckP2);

  // Draw starting hands (5 cards each)
  state.handBottom = state.deckP1.splice(0, 5);
  state.handTop = state.deckP2.splice(0, 5);

  // Initialize other zones
  state.gatesBottom = [[], [], []];
  state.gatesTop = [[], [], []];

  state.setsBottom = [null, null, null];
  state.setsTop = [null, null, null];

  state.deckCountBottom = state.deckP1.length;
  state.deckCountTop = state.deckP2.length;

  state.discardCountBottom = 0;
  state.discardCountTop = 0;

  state.lifeBottom = 20;
  state.lifeTop = 20;

  state.turnPlayer = "p1"; // or randomize
  state.decksMerged = true;
};
