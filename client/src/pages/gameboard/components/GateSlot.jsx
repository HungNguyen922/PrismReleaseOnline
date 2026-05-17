// GateSlot.jsx
export default function GateSlot({
  stack,
  row,
  visualIndex,
  canonicalIndex,
  playToGate,
  bindHover
}) {
  const topCard =
    stack && stack.length > 0 ? stack[stack.length - 1] : null;

  function handleDrop(e) {
    e.preventDefault();

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const payload = JSON.parse(raw);
    playToGate(canonicalIndex, row, payload);
  }

  return (
    <div
      className="slot slot-gate"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      {...bindHover(topCard)}
    >
      {(!stack || stack.length === 0) ? (
        <div className="slot-placeholder">Gate</div>
      ) : (
        <div className="gate-stack">
          {stack.map((card, i) =>
            card ? (
              <img
                key={card.id}
                src={card.image_url}        // ⭐ FIXED
                alt={card.name}
                className="gate-card"
                style={{ "--i": i }}
              />
            ) : (
              <div
                key={i}
                className="gate-card placeholder"
                style={{ "--i": i }}
              ></div>
            )
          )}
        </div>
      )}
    </div>
  );
}
