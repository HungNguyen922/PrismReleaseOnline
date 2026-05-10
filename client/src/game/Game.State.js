const GameState = {
  // The full game state mirrored from the server
  gameState: null,

  // Replace the entire state with the server's authoritative version
  set(newState) {
    this.gameState = newState;
  },

  // Convenience getter so components can read state easily
  get() {
    return this.gameState;
  }
};

export default GameState;
