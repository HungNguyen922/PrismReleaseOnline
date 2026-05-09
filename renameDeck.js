const deckTitle = document.getElementById("deck-title");

deckTitle.addEventListener("click", () => {
    // Prevent multiple inputs
    if (deckTitle.querySelector("input")) return;

    // Get current title text (excluding counter)
    const currentText = deckTitle.textContent;

    // Create input
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.style.fontSize = "1.5rem";
    input.style.width = "200px";

    // Replace title text with input, keep counter span
    deckTitle.prepend(input);

    input.focus();

    function saveTitle() {
        const newText = input.value.trim() || "Your Deck";
        deckTitle.innerHTML = newText + " ";
    }

    // Save on Enter
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            saveTitle();
        }
    });

    // Save on blur
    input.addEventListener("blur", () => {
        saveTitle();
    });
});
