export default function LeaderZone({
  leader,
  setLeader,
  isDragging,
  highlight,
  onDropLeader,
}) {
  return (
    <div
      className={`drop-leader ${highlight ? "zone-highlight" : ""}`}
      style={{
        marginBottom: "16px",
        padding: "12px",
        borderRadius: "12px",
        textAlign: "center",
        border: highlight
          ? "2px solid rgba(212,175,55,0.9)"
          : "2px solid rgba(255,255,255,0.1)",
        boxShadow: highlight
          ? "0 0 12px rgba(212,175,55,0.8)"
          : "none",
        transition: "box-shadow 0.15s, border 0.15s",
      }}
    >
      <h3>Leader</h3>

      {leader ? (
        <div style={{ marginTop: "8px", opacity: 0.9 }}>
            {leader.Name}
        </div>
        ) : (
        <div style={{ opacity: 0.6, marginTop: "8px" }}>
            Drag a Leader here
        </div>
    )}
    </div>
  );
}
