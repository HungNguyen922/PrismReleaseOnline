const copyBtn = document.getElementById("copy-deck"); // or reuse download button

copyBtn.addEventListener("click", () => {
    html2canvas(deckExportWrapper, {
        backgroundColor: "#222",
        scale: 5
    }).then(canvas => {
        canvas.toBlob(blob => {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item])
                .then(() => {
                    alert("Deck copied to clipboard!");
                })
                .catch(err => {
                    console.error("Failed to copy deck:", err);
                });
        });
    });
});