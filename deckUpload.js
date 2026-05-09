function parseDeckText(text) {
  const lines = text.trim().split('\n');
  const deckName = lines[0].trim();

  const cards = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [countStr, name] = line.split(',').map(s => s.trim());
    const count = parseInt(countStr, 10);

    for (let j = 0; j < count; j++) {
      cards.push(name);
    }
  }

  return { deckName, cards };
}

document.getElementById('upload-button').addEventListener('click', () => {
  const fileInput = document.getElementById('deck-upload');
  const file = fileInput.files[0];
  if (!file) return alert('Please select a file.');

  const reader = new FileReader();
  reader.onload = () => {
    const { deckName, cards } = parseDeckText(reader.result);

    console.log("Loaded deck:", deckName, "with", cards.length, "cards");

    // Reset state
    Game.State.gameState.leader = null;
    Game.State.gameState.extraDeck = [];
    const mainDeck = [];


    // Sort cards
    cards.forEach(card => {
      if (card.endsWith("(L)")) {
        Game.State.gameState.leader = card.replace("(L)", "").trim();
      } else if (card.endsWith("(E)")) {
        Game.State.gameState.extraDeck.push(card.replace("(E)", "").trim());
      } else {
        mainDeck.push(card.trim());
      }
    });

    loadDeck(mainDeck);
  };

  reader.readAsText(file);
});

function loadDeck(cards) {
    Game.Utils.shuffle(cards);
    Game.State.gameState.drawPile = cards.slice();

    Game.Utils.shuffle(Game.State.gameState.extraDeck);
    Game.State.hand = [];
    Game.State.gameState.drawPile = Game.State.gameState.drawPile.slice();

    updateDeckUI();
    updateLeaderUI();   // seeds leader-slot once
    updateExtraUI();

    Game.Server.sync({
      drawPile: Game.State.gameState.drawPile,
      extraDeck: Game.State.gameState.extraDeck,
      leader: Game.State.gameState.leader,
      hands: { [window.socket.id]: Game.State.hand }
    });
}


function updateDeckUI() {
  const slot = document.getElementById("deck-slot");
  if (slot) {
    slot.textContent = "Draw Pile (" + Game.State.gameState.drawPile.length + ")";
  }
}

function updateLeaderUI() {
    const leader = Game.State.gameState.leader;
    if (!leader) {
        Game.UI.clearSlot("leader-slot", { clearHistory: false });
        return;
    }

    // On deck load, we explicitly seed leader-slot in state + UI
    Game.State.setSlot("leader-slot", leader);
    Game.UI.setSlotCard("leader-slot", leader, { pushHistory: false });
}

function updateExtraUI() {
  const slot = document.getElementById("extra-slot");
  if (slot) {
    slot.textContent = "Extra Deck (" + Game.State.gameState.extraDeck.length + ")";
  }
}
