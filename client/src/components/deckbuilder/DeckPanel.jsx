export default function DeckPanel({
  leader,
  setLeader,
  deckMain,
  deckExtra,
  removeFromMain,
  removeFromExtra,
  onExport,
  onImport
}) {
  return (
    <div style={{
      padding: "16px",
      borderRadius: "16px",
      background: "rgba(10, 15, 35, 0.9)",
      border: "1px solid rgba(212, 175, 55, 0.7)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
    }}>
      <h2>Deck</h2>

      {/* Export / Import */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={onExport} style={{
          flex: 1,
          padding: "6px 8px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #d4af37, rgba(212,175,55,0.7))",
          border: "none",
          fontWeight: 700,
          cursor: "pointer",
        }}>
          Copy Deck Code
        </button>

        <button onClick={onImport} style={{
          flex: 1,
          padding: "6px 8px",
          borderRadius: "8px",
          background: "transparent",
          border: "1px solid rgba(158,179,194,0.8)",
          color: "white",
          cursor: "pointer",
        }}>
          Import
        </button>
      </div>

      {/* Leader */}
      <div style={{
        padding: "10px",
        borderRadius: "12px",
        border: "1px solid rgba(212,175,55,0.7)",
        marginBottom: "16px",
      }}>
        <strong>Leader:</strong>
        {leader ? (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{leader.Name}</span>
            <button
              onClick={() => setLeader(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#d4af37",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        ) : (
          <div style={{ opacity: 0.7 }}>None selected</div>
        )}
      </div>

      {/* Main Deck */}
      <DeckList
        title="Main Deck"
        cards={deckMain}
        max={20}
        removeCard={removeFromMain}
      />

      {/* Extra Deck */}
      <DeckList
        title="Extra Deck"
        cards={deckExtra}
        max={5}
        removeCard={removeFromExtra}
      />
    </div>
  );
}

function DeckList({ title, cards, max, removeCard }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{title}</strong>
        <span>{cards.length} / {max}</span>
      </div>

      <div style={{
        maxHeight: "150px",
        overflowY: "auto",
        background: "rgba(0,0,0,0.4)",
        padding: "6px",
        borderRadius: "8px",
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 6px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "6px",
            marginBottom: "4px",
          }}>
            <span>{card.Name}</span>
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
    </div>
  );
}
