const downloadBtn = document.getElementById("download-deck");
const deckExportWrapper = document.getElementById("deck-export-wrapper");
const deckTitle = document.getElementById("deck-title");

downloadBtn.addEventListener("click", () => {
    // Use html2canvas to capture the deck area
    html2canvas(deckExportWrapper, {
        backgroundColor: "#222", // optional: white background
        scale: 5 // optional: higher resolution
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = deck.Title + '.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
    }).catch(err => console.error("Error generating deck image:", err));
});
