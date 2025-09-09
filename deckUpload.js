function parseDeckText(text) {
  return text.trim().split('\n').map(line => {
    const [count, name] = line.split(',').map(s => s.trim());
    return { count: parseInt(count, 10), name };
  });
}

document.getElementById('upload-button').addEventListener('click', () => {
  const fileInput = document.getElementById('deck-upload');
  const file = fileInput.files[0];
  if (!file) return alert('Please select a file.');

  const reader = new FileReader();
  reader.onload = () => {
    const deckList = parseDeckText(reader.result);
    renderDeckToBoard(deckList);
  };
  reader.readAsText(file);
});
