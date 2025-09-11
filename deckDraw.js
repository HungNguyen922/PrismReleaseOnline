document.getElementById("deck-slot").addEventListener("click", drawCard);

function drawCard() {
  if (deck.length === 0) {
    alert("No more cards in the deck!");
    return;
  }

  const card = deck.pop();
  hand.push(card);

  renderHand();
  updateDeckUI();
}

document.getElementById("leader-slot").addEventListener("click", drawLeader);

function drawLeader() {
  if (!leader) {
    alert("No leader left to draw!");
    return;
  }

  hand.push(leader);
  leader = null; // can only be drawn once

  renderHand();
  updateLeaderUI();
}

// --- NEW: Extra deck draw ---
document.getElementById("extra-slot").addEventListener("click", drawExtra);

function drawExtra() {
  if (extraDeck.length === 0) {
    alert("No more cards in the extra deck!");
    return;
  }

  const card = extraDeck.pop(); // take the top (last) card
  hand.push(card);

  renderHand();
  updateExtraUI();
}

function formatCardName(str) {
  return str
    .trim()
    // Match a boundary: either start of string, or a separator (space, hyphen, underscore, etc.)
    .replace(/(?:^|[\s\-\_]+)(\S)/g, (_, char) =>
      char.toUpperCase()
    );
}
