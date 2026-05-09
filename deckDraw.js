document.addEventListener("DOMContentLoaded", () => {
  const deckArea = document.getElementById("deck-slot");

  // DRAW FROM PUBLIC
  deckArea.addEventListener("click", openDrawMenu);

  // LEADER DRAW
  document.getElementById("leader-slot").addEventListener("click", () => {
      const leader = Game.State.gameState.leader;

      // No leader available (already drawn)
      if (!leader) return;

      // Move leader to hand
      Game.State.hand.push(leader);
      Game.State.gameState.leader = null;

      // Update UI
      Game.UI.renderHand();
      Game.UI.clearSlot("leader-slot", { clearHistory: true });

      // Sync to server
      Game.Server.sync({
          leader: null,
          hands: { [window.socket.id]: Game.State.hand },
          slots: Game.State.gameState.slots
      });
  });

  // EXTRA DECK DRAW
  document.getElementById("extra-slot").addEventListener("click", openExtraDeckViewer);

});

function openDrawMenu() {
    document.getElementById("draw-menu").classList.remove("hidden");
}

function openExtraDeckViewer() {
    const extra = Game.State.gameState.extraDeck;

    if (!extra || extra.length === 0) {
        alert("Extra Deck is empty.");
        return;
    }

    Game.UI.openViewModal(extra, "Extra Deck");
}
