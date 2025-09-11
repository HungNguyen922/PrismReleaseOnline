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
  const MAX_EXTRA = 4;

  function addToDeck(cardEl) {
  const cardName = cardEl.dataset.cardName;

  // Leader logic
  if (!leaderCard) {
    leaderCard = cardName;
    const leaderEl = createSpecialDeckCard(cardEl, cardName, "Leader");
    ensureDeckMapEntry(cardName);
    deckMap[cardName].leader = leaderEl;
    updateDeckCount();
    return;
  }

  // Extra deck logic
  const currentExtraCount = extraDeck.length;

  if (currentExtraCount < MAX_EXTRA) {
    // there is room to add another extra
    extraDeck.push(cardName);

    ensureDeckMapEntry(cardName);

    if (deckMap[cardName].extra) {
      // update existing extra-card UI
      const deckCard = deckMap[cardName].extra;
      const countSpan = deckCard.querySelector(".card-count");
      const newCount = extraDeck.filter(c => c === cardName).length;
      countSpan.innerText = newCount;
    } else {
      // create a new extra-card UI
      const extraEl = createSpecialDeckCard(cardEl, cardName, "Extra");
      deckMap[cardName].extra = extraEl;
    }
    updateDeckCount();
    return;
  }

  // If extra deck is full, overflow to main deck
  addToMainDeck(cardEl, cardName);
}
  
  // Extracted helper for adding into main deck (existing logic)
  function addToMainDeck(cardEl, cardName) {
    ensureDeckMapEntry(cardName);
  
    if (deckMap[cardName].main) {
      // already have main deck UI for this card
      const deckCard = deckMap[cardName].main;
      const countSpan = deckCard.querySelector(".card-count");
      countSpan.innerText = parseInt(countSpan.innerText, 10) + 1;
    } else {
      // create new main deck UI
      const deckCard = cardEl.cloneNode(true);
      deckCard.classList.add("deck-card");  // no "extra-card" or "leader-card"
      const countSpan = document.createElement("span");
      countSpan.classList.add("card-count");
      countSpan.innerText = "1";
      deckCard.appendChild(countSpan);
      deckCards.appendChild(deckCard);
  
      deckMap[cardName].main = deckCard;
  
      // attach removal via click if you have that behavior
      deckCard.addEventListener("click", () => {
        let count = parseInt(countSpan.innerText, 10);
        if (count > 1) {
          countSpan.innerText = count - 1;
        } else {
          deckCard.remove();
          deckMap[cardName].main = null;
          // If no extra or leader for that card either, you could delete the whole deckMap entry optionally
        }
        updateDeckCount();
      });
    }
    updateDeckCount();
  }

  // Utility to ensure deckMap entry structure exists
  function ensureDeckMapEntry(cardName) {
    if (!deckMap[cardName]) {
      deckMap[cardName] = { leader: null, extra: null, main: null };
    }
  }
  function createSpecialDeckCard(cardEl, name, role) {
    const deckCard = cardEl.cloneNode(true);
    deckCard.classList.add("deck-card", role.toLowerCase() + "-card");
  
    const countSpan = document.createElement("span");
    countSpan.classList.add("card-count");
    countSpan.innerText = extraDeck.filter(c => c === name).length; // shows duplicates
    deckCard.appendChild(countSpan);

    deckCards.appendChild(deckCard);
    deckMap[cardEl.dataset.cardName] = deckCard;
  }

fetch("allCards.json")
.then(res => res.json())
.then(cardsData => {
    allCards = cardsData;
    renderCards(allCards);
});

// Key handling for W = add, Q = remove
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "w" && hoveredCard) {
    addToDeck(hoveredCard);
  }

  if (e.key.toLowerCase() === "q" && hoveredDeckCard) {
    const cardName = hoveredDeckCard.dataset.cardName;

    // If leader
    if (hoveredDeckCard.classList.contains("leader-card")) {
      // remove leader
      leaderCard = null;
      hoveredDeckCard.remove();
      if (deckMap[cardName]) deckMap[cardName].leader = null;
      updateDeckCount();
      return;
    }

    if (hoveredDeckCard.classList.contains("extra-card")) {
      // remove one copy or full removal
      const countInExtra = extraDeck.filter(c => c === cardName).length;
      if (countInExtra > 1) {
        // remove one
        const idx = extraDeck.indexOf(cardName);
        if (idx > -1) extraDeck.splice(idx, 1);

        const countSpan = hoveredDeckCard.querySelector(".card-count");
        countSpan.innerText = countInExtra - 1;
      } else {
        // removing last extra copy
        extraDeck = extraDeck.filter(c => c !== cardName);
        hoveredDeckCard.remove();
        if (deckMap[cardName]) deckMap[cardName].extra = null;
      }
      updateDeckCount();
      return;
    }

    // main-deck removal
    if (hoveredDeckCard.classList.contains("deck-card")) {
      // assume it's main if not extra or leader
      const countSpan = hoveredDeckCard.querySelector(".card-count");
      if (!countSpan) return;
      let count = parseInt(countSpan.innerText, 10);
      if (count > 1) {
        countSpan.innerText = count - 1;
      } else {
        hoveredDeckCard.remove();
        if (deckMap[cardName]) deckMap[cardName].main = null;
      }
      updateDeckCount();
    }
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
