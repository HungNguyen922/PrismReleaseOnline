import GameState from "./Game.State";

const GameServer = {
  // This will be assigned by the networking hook
  network: null,

  // Called by useGameNetwork when the hook initializes
  attachNetwork(networkAPI) {
    this.network = networkAPI;
  },

  // Apply full authoritative state from server
  applyServerState(fullState) {
    GameState.set(fullState);

    // If you have a UI update system, call it here
    if (window.Game?.UI?.updateFromState) {
      window.Game.UI.updateFromState(fullState);
    }
  },

  // Send a patch to the server
  sync(patch) {
    if (!this.network) {
      console.warn("Game.Server.sync called before network attached");
      return;
    }
    this.network.sendPatch(patch);
  },

  // Upload deck during matchmaking
  uploadDeck(deck) {
    if (!this.network) return;
    this.network.uploadDeck(deck);
  },

  // Ready up during matchmaking
  readyUp() {
    if (!this.network) return;
    this.network.readyUp();
  }
};

export default GameServer;
