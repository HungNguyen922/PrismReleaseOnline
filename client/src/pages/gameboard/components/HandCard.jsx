export default function HandCard({ card, bindHover }) {
  function handleDragStart(e) {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "HAND_CARD",
        cards: [card.id]
      })
    );
  }

  return (
    <div
      className="card card-hand"
      draggable
      onDragStart={handleDragStart}
      {...bindHover(card)}
    >
      <img src={card.image_url} alt={card.name} />   {/* ⭐ FIXED */}
    </div>
  );
}
