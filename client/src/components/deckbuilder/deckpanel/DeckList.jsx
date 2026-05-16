import { useState, useCallback } from "react";

export default function DeckList({
  cards,
  removeCard,
  isDragging,
  dragCard,
  onDrop,        // drop from outside
  onReorder,     // reorder inside list
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const handleMouseEnter = useCallback(
    (i) => {
      if (isDragging) setHoverIndex(i);
    },
    [isDragging]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragCard) return;

    if (hoverIndex !== null) {
      // If the card is already in this list, reorder
      const existingIndex = cards.indexOf(dragCard);

      if (existingIndex !== -1) {
        onReorder(existingIndex, hoverIndex);
      } else {
        // Dropping from outside (library)
        onDrop(dragCard, hoverIndex);
      }
    }
  }, [isDragging, dragCard, hoverIndex, cards, onDrop, onReorder]);

  return (
    <div
      style={{
        maxHeight: "150px",
        overflowY: "auto",
        marginTop: "6px",
      }}
      onMouseUp={handleMouseUp}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 6px",
            background:
              hoverIndex === i
                ? "rgba(212,175,55,0.25)"
                : "rgba(255,255,255,0.05)",
            borderRadius: "6px",
            marginBottom: "4px",
            transition: "background 0.15s",
            cursor: isDragging ? "pointer" : "default",
          }}
        >
          {/* ⭐ FIXED: DB uses card.name */}
          <span>{card.name}</span>

          <button
            onClick={() => removeCard(i)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ff6b6b",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
