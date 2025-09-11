function parseDeckText(text) {
  const lines = text.trim().split('\n');
  const deckName = lines[0].trim(); // first line is the deck name

  const cards = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip empty lines

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
    loadDeck(cards);
  };
  reader.readAsText(file);
});

let deck = [];   // cards left in the draw pile
let hand = [];   // cards the player has drawn

function loadDeck(cards) {
    deck = shuffle(cards); // initialize and shuffle
    hand = [];
    updateDeckUI();
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}
