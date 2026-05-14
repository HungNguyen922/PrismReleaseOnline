module.exports = function createNewGameState() {
  return {
    // Turn system
    turn: 1,
    turnPlayer: "p1",

    // Player identity (socket IDs assigned in index.js)
    players: {
      p1: null,
      p2: null
    },

    // Leaders (private)
    leaderP1: null,
    leaderP2: null,

    // Hands (private)
    handP1: [],
    handP2: [],

    // Temporary decks BEFORE merging
    deckP1: [],
    deckP2: [],

    // Shared resources AFTER merging
    drawPile: [],   // shared deck
    gap: [],        // shared graveyard
    board: [],      // shared slots

    // Ready flags
    p1Ready: false,
    p2Ready: false,

    // Has the server merged the decks yet?
    decksMerged: false
  };
};
