const cardPoolDiv = document.getElementById("card-pool");
const deckCards = document.getElementById("deck-cards");
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const closeBtn = document.querySelector('.close');
const cardGrid = document.querySelector('.card-grid');

// the card you are hovering in the card pool
let hoveredCard = null;
// the card you are hovering in the deck
let hoveredDeckCard = null;

// Keep a lookup so we know if a card is already in the deck
const deckMap = {};

// Keep track of the Leader and extra deck
let leaderCard = null;
let extraDeck = [];

// I'm using this so i can convert the incoming card names into the file name format
function formatCardName(str) {
  return str
    .trim()
    // Match a boundary: either start of string, or a separator (space, hyphen, underscore, etc.)
    .replace(/(?:^|[\s\-\_]+)(\S)/g, (_, char) =>
      char.toUpperCase()
    );
}

// this gives me access to hovered card in deck
deckCards.addEventListener("mousemove", (e) => {
  hoveredDeckCard = e.target.closest(".deck-card");
});

// this gives me access to hovered card in pool
cardPoolDiv.addEventListener("mousemove", (e) => {
  hoveredCard = e.target.closest(".card");
});

//Global card storage for filtering
let allCards = [];

function renderCards(cards) {
    cardPoolDiv.innerHTML = "<h2>Card Pool</h2>";
    cards.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");

        // Attach the raw card data for later
        cardDiv.dataset.cardName = card.Name;
        cardDiv.dataset.cardJson = JSON.stringify(card);

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
    });
  }

  cardPoolDiv.addEventListener("click", (e) => {
    const cardEl = e.target.closest(".card");
    if (!cardEl) return;
    console.log("clicked");
    console.log(cardEl);
    showActionMenu(cardEl, e);
  });
      
  function showActionMenu(cardEl, clickEvent) {
    const overlay = document.createElement("div");
    overlay.className = "card-action-menu";
    overlay.innerHTML = `
      <button class="view-btn">View Card</button>
      <button class="add-btn">Add to Deck</button>
    `;
    document.body.appendChild(overlay);
    
    const { x, y, width, height } = cardEl.getBoundingClientRect();
    overlay.style.left = `${x + width + 5}px`;
    overlay.style.top = `${y + 5}px`;
  
    overlay.querySelector(".view-btn").onclick = () => {
      openModalFor(cardEl);
      cleanup();
    };
    overlay.querySelector(".add-btn").onclick = () => {
      addToDeck(cardEl);
      cleanup();
    };

    // we need to set a timeout because the same click that triggers the event will bubble up to
    // the doc and immediately close the element
    setTimeout(() => {
      document.addEventListener("click", (evt) => {
        if (!overlay.contains(evt.target)) cleanup();
      }, { once: true });
    }, 0);
  
    function cleanup() {
      overlay.remove();
    }
  }  

  // Function to show card popup on screen
  function openModalFor(cardEl) {
    modal.style.display = 'flex';
    const name = card.dataset.name;
    const fileName = 'cardDatabase/' + formatCardName(name) + '.png';
    modalImg.src = fileName;
    modalTitle.textContent = name;
    modalDescription.textContent = card.dataset.description;
  }

  // Function to add a card to the deck
  function addToDeck(cardEl) {
    const cardName = cardEl.dataset.cardName;
    const cardData = JSON.parse(cardEl.dataset.cardJson);
  
    console.log(`Adding ${cardName} to deck`, cardData);

    // --- Leader & Extra Deck logic ---
    if (!leaderCard) {
      leaderCard = cardName;
      createSpecialDeckCard(cardEl, "Leader");
      updateDeckCount();
      return;
    } else if (extraDeck.length < 4) {
      extraDeck.push(cardName);
      createSpecialDeckCard(cardEl, "Extra");
      updateDeckCount();
      return;
    }
    // ---------------------------------
      
    if (deckMap[cardName]) {
      const countSpan = deckMap[cardName].querySelector(".card-count");
      countSpan.innerText = parseInt(countSpan.innerText, 10) + 1;
    } else {
      const deckCard = cardEl.cloneNode(true);
      deckCard.classList.add("deck-card");
  
      const countSpan = document.createElement("span");
      countSpan.classList.add("card-count");
      countSpan.innerText = "1";
      deckCard.appendChild(countSpan);
  
      deckCards.appendChild(deckCard);
      deckMap[cardName] = deckCard;
  
      deckCard.addEventListener("click", () => {
        let count = parseInt(countSpan.innerText, 10);
        if (count > 1) {
          countSpan.innerText = count - 1;
        } else {
          deckCard.remove();
          delete deckMap[cardName];
        }
        updateDeckCount();
      });
    }
    updateDeckCount();
  }

  function createSpecialDeckCard(cardEl, role) {
    const deckCard = cardEl.cloneNode(true);
    deckCard.classList.add("deck-card", role.toLowerCase() + "-card");
  
    const roleBadge = document.createElement("span");
    roleBadge.classList.add("card-role");
    roleBadge.innerText = role;
    deckCard.appendChild(roleBadge);
  
    deckCards.appendChild(deckCard);
    deckMap[cardEl.dataset.cardName] = deckCard;
  }

fetch("allCards.json")
.then(res => res.json())
.then(cardsData => {
    allCards = cardsData;
    renderCards(allCards);
});

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "w" && hoveredCard) {
    addToDeck(hoveredCard);
  }

  // Q = remove from deck
  if (e.key.toLowerCase() === "q" && hoveredDeckCard) {
    const cardName = hoveredDeckCard.dataset.cardName;

    if (hoveredDeckCard.classList.contains("leader-card")) {
      // removing Leader
      leaderCard = null;
      hoveredDeckCard.remove();
      delete deckMap[cardName];
      updateDeckCount();
      return;
    }

    if (hoveredDeckCard.classList.contains("extra-card")) {
      // removing Extra deck card
      extraDeck = extraDeck.filter(c => c !== cardName);
      hoveredDeckCard.remove();
      delete deckMap[cardName];
      updateDeckCount();
      return;
    }

    // normal main-deck card
    const countSpan = hoveredDeckCard.querySelector(".card-count");
    if (countSpan) {
      let count = parseInt(countSpan.innerText, 10);
      if (count > 1) {
        countSpan.innerText = count - 1;
      } else {
        hoveredDeckCard.remove();
        delete deckMap[cardName];
      }
    }
    updateDeckCount();
  }
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
  const typeFilter = document.getElementById("typeFilter")?.value;
  const nameSearch = (document.getElementById("nameSearch")?.value || "").toLowerCase();

  console.log("Type filter:", typeFilter, "Name search:", nameSearch);

  const filtered = allCards.filter(card => {
    const matchesType = typeFilter === "all"
      || ((card.Power || "").toString().includes(typeFilter))
      || ((card.Bulk || "").toString().includes(typeFilter));


    const concatenated = `
      ${(card.Name || "")}
      ${(card.Tags || "")}
      ${(card.Trait || "")}
      ${(card.Effect1 || "")}
      ${(card.Effect2 || "")}
    `.toLowerCase();
      
    const matchesName = concatenated.includes(nameSearch);

    return matchesType && matchesName;
  });

  console.log("Filtered count:", filtered.length, filtered);
  renderCards(filtered);
}

document.getElementById("typeFilter").addEventListener("change", applyFilters);
document.getElementById("nameSearch").addEventListener("input", applyFilters);
