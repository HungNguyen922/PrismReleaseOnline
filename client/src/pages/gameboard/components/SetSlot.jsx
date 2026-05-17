// SetSlot.jsx
export default function SetSlot({
  card,
  isOpponent,
  visualIndex,
  canonicalIndex,
  playToSet,
  bindHover
}) {
  // ------------------------------------------------------------
  // DROP: Hand → Set Zone (only allowed on *your* set zones)
  // ------------------------------------------------------------
  function handleDrop(e) {
    e.preventDefault();
    if (isOpponent) return; // ❗ Opponent sets cannot be played onto

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const payload = JSON.parse(raw);

    if (payload.type === "HAND_CARD") {
      // ⭐ Use canonicalIndex, not visualIndex
      playToSet(canonicalIndex, payload.cards[0]);
    }
  }

  // ------------------------------------------------------------
  // DRAG: Set → Gate (only allowed for *your* sets)
  // ------------------------------------------------------------
  function handleDragStart(e) {
    if (isOpponent || !card) return;

    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "SET_CARD",
        zoneIndex: canonicalIndex,   // ⭐ canonical index
        cardId: card.id
      })
    );
  }

  return (
    <div
      className="slot slot-set"
      onDragOver={(e) => !isOpponent && e.preventDefault()}
      onDrop={handleDrop}
      draggable={!isOpponent && !!card}
      onDragStart={!isOpponent ? handleDragStart : undefined}
      {...(!isOpponent && bindHover(card))}
    >
      {card ? (
        isOpponent ? (
          // ⭐ Opponent set cards are hidden
          <div className="card-back" aria-label="Opponent set card">Set</div>
        ) : (
          <img src={card.image_url} alt={card.name} />
        )
      ) : (
        <div className="slot-placeholder">Set</div>
      )}
    </div>
  );
}
