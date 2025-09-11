const clearBtn = document.getElementById("clear-deck");

clearBtn.addEventListener("click", () => {
    // Remove all deck cards from DOM
    deckCards.innerHTML = "";

    // Reset tracking map
    for (let key in deckMap) delete deckMap[key];
    leaderCard = null;
    extraDeck = [];

    // Reset deck counter
    deckCountSpan.innerText = "(0)";
});
