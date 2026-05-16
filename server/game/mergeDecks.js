export default function mergeDecks(state) {
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
  state.hands.bottom = state.deckP1.splice(0, 5);
  state.hands.top = state.deckP2.splice(0, 5);

  // Initialize gates (3 empty stacks each)
  state.gates.bottom = [[], [], []];
  state.gates.top = [[], [], []];

  // Initialize sets (3 null slots each)
  state.sets.bottom = [null, null, null];
  state.sets.top = [null, null, null];

  // Leaders (if your deck format includes them)
  // state.leaders.bottom = state.deckP1Leader || null;
  // state.leaders.top = state.deckP2Leader || null;

  // Extra decks (if included)
  // state.extraDecks.bottom = state.deckP1Extra || [];
  // state.extraDecks.top = state.deckP2Extra || [];

  // Shared draw pile (combine remaining cards)
  state.drawPile = [...state.deckP1, ...state.deckP2];

  // Clear old deck fields
  delete state.deckP1;
  delete state.deckP2;

  state.decksMerged = true;
};
