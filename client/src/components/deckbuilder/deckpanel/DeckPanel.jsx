import LeaderZone from "./LeaderZone";
import DeckZone from "./DeckZone";

export default function DeckPanel({
  deckName,
  setDeckName,
  leader,
  setLeader,
  deckMain,
  deckExtra,
  removeFromMain,
  removeFromExtra,
  onExport,
  onImport,
  isDragging,
  dragCard,
  highlightMain,
  highlightExtra,
  highlightLeader,
  onDropMain,
  onDropExtra,
  onDropLeader,
  onReorderMain,
  onReorderExtra,
}) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "16px",
        background: "rgba(10, 15, 35, 0.9)",
        border: "1px solid rgba(212, 175, 55, 0.7)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
      }}
    >
      <h2>Deck</h2>

      {/* Deck Name */}
      <input
        type="text"
        value={deckName}
        onChange={(e) => setDeckName(e.target.value)}
        placeholder="Deck Name"
        className="deck-name-input"
      />

      {/* Export / Import */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          onClick={onExport}
          style={{
            flex: 1,
            padding: "6px 8px",
            borderRadius: "8px",
            background:
              "linear-gradient(135deg, #d4af37, rgba(212,175,55,0.7))",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Copy Deck Code
        </button>

        <button
          onClick={onImport}
          style={{
            flex: 1,
            padding: "6px 8px",
            borderRadius: "8px",
            background: "transparent",
            border: "1px solid rgba(158,179,194,0.8)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Import
        </button>
      </div>

      {/* Leader */}
      <LeaderZone
        leader={leader}
        setLeader={setLeader}
        isDragging={isDragging}
        highlight={highlightLeader}
        onDropLeader={onDropLeader}
      />

      {/* Main Deck */}
      <DeckZone
        title="Main Deck"
        cards={deckMain}
        max={20}
        removeCard={removeFromMain}
        isDragging={isDragging}
        dragCard={dragCard}
        highlight={highlightMain}
        dropClass="drop-main"
        onDrop={onDropMain}
        onReorder={onReorderMain}
      />

      {/* Extra Deck */}
      <DeckZone
        title="Extra Deck"
        cards={deckExtra}
        max={5}
        removeCard={removeFromExtra}
        isDragging={isDragging}
        dragCard={dragCard}
        highlight={highlightExtra}
        dropClass="drop-extra"
        onDrop={onDropExtra}
        onReorder={onReorderExtra}
      />
    </div>
  );
}
