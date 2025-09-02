// this file puts all the cards onto the gallery site
// I'm using this so i can convert the incoming card names into the file name format
function formatCardName(str) {
  return str
    .trim()
    // Match a boundary: either start of string, or a separator (space, hyphen, underscore, etc.)
    .replace(/(?:^|[\s\-\_]+)(\S)/g, (_, char) =>
      char.toUpperCase()
    );
}

fetch("allCards.json")
.then(res => res.json())
.then(cardsData => {
    cardsData.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.dataset.name = card.Name;
        cardDiv.dataset.description = card.Flavor;
        fileName = 'cardDatabase/' + formatCardName(card.Name) + '.png';
        cardDiv.dataset.image = fileName;

        const img = document.createElement("img");
        img.src = fileName;
        img.alt = card.Name;
        img.draggable = false; // disable dragging

        cardDiv.appendChild(img);
        cardGrid.appendChild(cardDiv);
    });
});

