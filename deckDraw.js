document.getElementById("draw-slot").addEventListener("click", drawCard);

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

function renderHand() {
  const handArea = document.getElementById("hand-area");
  handArea.innerHTML = ""; // clear old hand

  hand.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.textContent = card;
    handArea.appendChild(cardEl);
  });
}
