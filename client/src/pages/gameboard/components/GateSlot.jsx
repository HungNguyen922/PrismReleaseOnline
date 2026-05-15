// GateSlot.jsx
export default function GateSlot({
  stack,
  row,
  visualIndex,
  canonicalIndex,
  playToGate,
  bindHover
}) {
  // Top card for hover preview
  const topCard =
    stack && stack.length > 0 ? stack[stack.length - 1] : null;

  // ------------------------------------------------------------
  // DROP: Hand → Gate OR Set → Gate
  // ------------------------------------------------------------
  function handleDrop(e) {
    e.preventDefault();

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const payload = JSON.parse(raw);

    // ⭐ ALWAYS allow playing onto gates (even opponent gates)
    playToGate(canonicalIndex, row, payload);
  }

  return (
    <div
      className="slot slot-gate"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      {...bindHover(topCard)}
    >
      {/* Empty gate */}
      {(!stack || stack.length === 0) ? (
        <div className="slot-placeholder">Gate</div>
      ) : (
        <div className="gate-stack">
          {stack.map((card, i) =>
            card ? (
              <img
                key={card.id}
                src={card.image}
                alt=""
                className="gate-card"
                style={{ "--i": i }}
              />
            ) : (
              <div key={i} className="gate-card placeholder" style={{ "--i": i }}></div>
            )
          )}
        </div>
      )}
    </div>
  );
}
