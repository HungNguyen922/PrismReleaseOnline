module.exports = function createNewGameState() {
  return {
    players: {
      top: { id: null, name: null },
      bottom: { id: null, name: null }
    },

    hands: {
      top: [],
      bottom: []
    },

    sets: {
      top: [null, null, null],
      bottom: [null, null, null]
    },

    gates: {
      top: [[], [], []],
      bottom: [[], [], []]
    },

    leaders: {
      top: null,
      bottom: null
    },

    extraDecks: {
      top: [],
      bottom: []
    },

    drawPile: [],
    discard: [],

    turnPlayer: "bottom"
  };
}
