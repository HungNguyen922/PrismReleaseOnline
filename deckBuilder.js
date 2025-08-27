const cardPoolDiv = document.getElementById("card-pool");
const deckCards = document.getElementById("deck-cards");

// Keep a lookup so we know if a card is already in the deck
const deckMap = {};

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
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");

        const img = document.createElement("img");
        fileName = 'cardDatabase/' + formatCardName(card.Name) + '.png'; 
        img.src = fileName 
        img.alt = card.Name;
        img.draggable = false;

        const title = document.createElement("h3");
        title.textContent = card.Name;

        cardDiv.appendChild(img);
        cardDiv.appendChild(title);

        // Add card to pool
        cardPoolDiv.appendChild(cardDiv);

        // Click to add card to deck
        cardDiv.addEventListener("click", () => {
            if (deckMap[card.Name]) {
                // Already in deck → increment counter
                const countSpan = deckMap[card.Name].querySelector(".card-count");
                let count = parseInt(countSpan.innerText, 10);
                count++;
                countSpan.innerText = count;
                updateDeckCount();
            } else {
                // Not in deck yet → create card with counter
                const deckCard = cardDiv.cloneNode(true);
                deckCard.classList.add("deck-card");

                // Add counter badge
                const countSpan = document.createElement("span");
                countSpan.classList.add("card-count");
                countSpan.innerText = "1";

                deckCard.appendChild(countSpan);
                deckCards.appendChild(deckCard);

                // Store reference
                deckMap[card.Name] = deckCard;

                // Optionally: allow removing
                deckCard.addEventListener("click", () => {
                    let count = parseInt(countSpan.innerText, 10);
                    if (count > 1) {
                        count--;
                        countSpan.innerText = count;
                    } else {
                        deckCard.remove();
                        delete deckMap[card.Name];
                    }
                    updateDeckCount();
                });
                updateDeckCount();
            }
        });
    });
});



const deckCountSpan = document.getElementById("deck-count");

function updateDeckCount() {
    let total = 0;
    const deckCardElements = document.querySelectorAll(".deck-card");
    deckCardElements.forEach(card => {
        const count = parseInt(card.querySelector(".card-count").innerText, 10);
        total += count;
    });
    deckCountSpan.innerText = `(${total})`;
}
