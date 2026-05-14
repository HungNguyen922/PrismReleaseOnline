module.exports = function createNewGameState() {
  return {
    players: {
      top: null,
      bottom: null
    },

    // Deck upload slots
    deckP1: [],
    deckP2: [],

    // Hands
    handTop: [],
    handBottom: [],

    // Gates (3 each)
    gatesTop: [[], [], []],
    gatesBottom: [[], [], []],

    // Set zones (3 each)
    setsTop: [null, null, null],
    setsBottom: [null, null, null],

    // Extra decks
    extraDeckTop: [],
    extraDeckBottom: [],

    // Leader cards
    leaderTop: null,
    leaderBottom: null,

    // Shared draw pile
    drawPile: [],

    // Deck counts
    deckCountTop: 0,
    deckCountBottom: 0,

    // Turn system
    turnPlayer: "p1",
    turnPhase: "INSTANT",
    playedCardsThisTurn: 0,

    // Ready flags
    p1Ready: false,
    p2Ready: false,

    // Merge flag
    decksMerged: false
  };
};
