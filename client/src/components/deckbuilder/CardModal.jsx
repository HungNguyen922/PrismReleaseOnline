import { getPalette } from "./palette";

export default function CardModal({
  card,
  onClose,
  onAddMain,
  onAddExtra,
  onSetLeader
}) {
  const palette = getPalette(card);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          gap: "24px",
          padding: "20px",
          borderRadius: "16px",
          background: "rgba(10,15,35,0.95)",
          border: "1px solid rgba(212,175,55,0.7)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.9)",
          maxWidth: "800px",
          width: "90%",
          position: "relative"
        }}
      >
        {/* Card Image */}
        <img
          src={card.image_url}
          alt={card.name}
          style={{
            width: "300px",
            borderRadius: "14px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.9)",
          }}
        />

        {/* Card Info */}
        <div style={{ flex: 1, color: "white" }}>
          <h2 style={{ marginTop: 0 }}>{card.name}</h2>

          <p><strong>Power:</strong> {card.power}</p>
          <p><strong>Bulk:</strong> {card.bulk}</p>

          <p>
            <strong>Palette:</strong>{" "}
            {palette.length ? palette.join(", ") : "—"}
          </p>

          <p><strong>Trait:</strong> {card.trait || "—"}</p>

          <p><strong>Effect 1:</strong> {card.effect1 || "—"}</p>
          <p><strong>Effect 2:</strong> {card.effect2 || "—"}</p>

          <p style={{ opacity: 0.7 }}>
            <strong>Release Set:</strong> {card.cardset || "—"}
          </p>

          {/* Buttons */}
          <div style={{ marginTop: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={onAddMain}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #d4af37, rgba(212,175,55,0.7))",
                color: "#1b1b1b",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Add to Main Deck
            </button>

            <button
              onClick={onAddExtra}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(158,179,194,0.8)",
                background: "transparent",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Add to Extra Deck
            </button>

            <button
              onClick={onSetLeader}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(212,175,55,0.8)",
                background: "transparent",
                color: "#d4af37",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Set as Leader
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "12px",
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "1.4rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
