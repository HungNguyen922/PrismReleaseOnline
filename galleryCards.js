const cardGrid = document.querySelector('.card-grid');

// I'm using this so i can convert the incoming card names into the file name format
function formatCardName(str) {
    return str
        .trim()                           // Remove leading/trailing whitespace
        .split(/\s+/)                  // Split by spaces or hyphens
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");                        // Join words without spaces
}

fetch("allCards.json")
.then(res => res.json())
.then(cardsData => {
    cardsData.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.dataset.Name = card.Name;
        cardDiv.dataset.description = card.Flavor;
        fileName = 'cardDatabase/' + formatCardName(card.Name) + '.png';
        cardDiv.dataset.image = fileName;

        const img = document.createElement("img");
        img.src = fileName;
        img.alt = card.Name;
        img.draggable = false; // disable dragging

        cardDiv.appendChild(img);
        cardGrid.appendChild(cardDiv);

        cardDiv.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImg.src = fileName;
            modalTitle.textContent = cardDiv.dataset.Name;
            modalDescription.textContent = cardDiv.dataset.Flavor;
        });
    });
});

