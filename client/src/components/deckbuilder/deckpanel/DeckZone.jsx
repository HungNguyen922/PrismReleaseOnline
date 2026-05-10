import DeckList from "./DeckList";

export default function DeckZone({
  title,
  cards,
  max,
  removeCard,
  isDragging,
  dragCard,
  highlight,
  dropClass,
  onDrop,
  onReorder,
}) {
  return (
    <div
      className={`${dropClass} ${highlight ? "zone-highlight" : ""}`}
      style={{
        marginBottom: "12px",
        padding: "8px",
        borderRadius: "10px",
        transition: "box-shadow 0.15s, border 0.15s",
        border: highlight
          ? "2px solid rgba(212,175,55,0.9)"
          : "2px solid rgba(255,255,255,0.1)",
        boxShadow: highlight
          ? "0 0 12px rgba(212,175,55,0.8)"
          : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{title}</strong>
        <span>{cards.length} / {max}</span>
      </div>

      <DeckList
        cards={cards}
        removeCard={removeCard}
        isDragging={isDragging}
        dragCard={dragCard}
        onDrop={onDrop}
        onReorder={onReorder}
      />
    </div>
  );
}
