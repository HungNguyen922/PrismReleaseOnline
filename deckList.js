const listBtn = document.getElementById('list-button')
const deckName = document.getElementById('deck-title')

listBtn.addEventListener('click', async () => {
  // Build the plaintext deck list
  const lines = Array.from(document.querySelectorAll('#deck-cards .deck-card'))
    .map(card => {
      const name = card.getAttribute('data-card-name') || '';
      const countEl = card.querySelector('.card-count');
      const count = countEl?.textContent.trim() || '0';
      return `${count}, ${name}`;
    });

  const deckText = deckName.innerHTML + '\n' + lines.join('\n');

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(deckText);
    console.log('Deck list copied to clipboard!');
    alert("Deck list copied to clipboard!");
    // Optionally provide user feedback (e.g. visual toast)
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    alert("Clipboard copy failed");
    // Optionally fallback or notify user
  }
});
