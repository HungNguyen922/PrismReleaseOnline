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

//Global card storage for filtering
let allCards = [];

function renderCards(cards) {
    cardPoolDiv.innerHTML = "<h2>Card Pool</h2>";
    cards.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");

        const img = document.createElement("img");
        const fileName = 'cardDatabase/' + formatCardName(card.Name) + '.png';
        img.src = fileName;
        img.alt = card.Name;
        img.draggable = false;

        const title = document.createElement("h3");
        title.textContent = card.Name;

        cardDiv.appendChild(img);
        cardDiv.appendChild(title);
        cardPoolDiv.appendChild(cardDiv);

        // Click → add to deck
        cardDiv.addEventListener("click", () => {
            if (deckMap[card.Name]) {
                const countSpan = deckMap[card.Name].querySelector(".card-count");
                countSpan.innerText = parseInt(countSpan.innerText, 10) + 1;
            } else {
                const deckCard = cardDiv.cloneNode(true);
                deckCard.classList.add("deck-card");

                const countSpan = document.createElement("span");
                countSpan.classList.add("card-count");
                countSpan.innerText = "1";
                deckCard.appendChild(countSpan);

                deckCards.appendChild(deckCard);
                deckMap[card.Name] = deckCard;

                deckCard.addEventListener("click", () => {
                    let count = parseInt(countSpan.innerText, 10);
                    if (count > 1) {
                        countSpan.innerText = count - 1;
                    } else {
                        deckCard.remove();
                        delete deckMap[card.Name];
                    }
                    updateDeckCount();
                });
            }
            updateDeckCount();
        });
    });
}

fetch("allCards.json")
.then(res => res.json())
.then(cardsData => {
    allCards = cardsData;
    renderCards(allCards);
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

function applyFilters() {
    const typeFilter = document.getElementById("typeFilter").value;
    const nameSearch = document.getElementById("nameSearch").value.toLowerCase();

    let filtered = allCards.filter(card => {
        const matchesType = typeFilter === "all" || card.Power.includes(typeFilter) || card.Bulk.includes(typeFilter);
        const matchesName = card.Name.toLowerCase().includes(nameSearch);
        return matchesType && matchesName;
    });

    renderCards(filtered);
}

document.getElementById("typeFilter").addEventListener("change", applyFilters);
document.getElementById("nameSearch").addEventListener("input", applyFilters);
