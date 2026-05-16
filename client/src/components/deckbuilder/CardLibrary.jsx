export default function CardLibrary({
  cards,
  addToMain,
  addToExtra,
  setLeader,
  deckMain,
  deckExtra,
  leader,
  setSelectedCard,
  startDrag
}) {
  return (
    <div style={{
      padding: "16px",
      borderRadius: "16px",
      background: "rgba(10, 15, 35, 0.9)",
      border: "1px solid rgba(212, 175, 55, 0.4)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
    }}>
      <h2>Card Library</h2>

      <div style={{
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "16px",
        }}>
          {cards.map((card, index) => {
            return (
              <div
                key={card.id || index}
                className="card-container"
                onClick={() => setSelectedCard(card)}
                onMouseEnter={(e) => {
                  const btns = e.currentTarget.querySelector(".hover-action-buttons");
                  if (btns) btns.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                  const btns = e.currentTarget.querySelector(".hover-action-buttons");
                  if (btns) btns.style.opacity = 0;
                }}
                onMouseDown={(e) => startDrag(card, e, e.currentTarget)}
                style={{
                  cursor: "grab",
                  borderRadius: "12px",
                  padding: "4px",
                  background: "rgba(255,255,255,0.05)",
                  position: "relative",
                }}
              >
                {/* ⭐ DB now provides image_url directly */}
                <img
                  src={card.image_url}
                  alt={card.name}
                  style={{ width: "100%", borderRadius: "8px" }}
                />

                {/* ACTION BUTTONS */}
                <div
                  className="hover-action-buttons"
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    right: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    opacity: 0,
                    transition: "opacity 0.15s",
                    userSelect: "none",
                    pointerEvents: "auto",
                    zIndex: 5,
                    width: "fit-content",
                  }}
                >
                  {/* Add to Main */}
                  {deckMain.length < 20 && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToMain(card);
                      }}
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: "4px",
                        background: "rgba(212,175,55,0.75)",
                        color: "#1b1b1b",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        cursor: "pointer",
                        userSelect: "none",
                        boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                      }}
                    >
                      M
                    </div>
                  )}

                  {/* Add to Extra */}
                  {deckExtra.length < 5 && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToExtra(card);
                      }}
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: "4px",
                        background: "rgba(120,200,255,0.75)",
                        color: "#0b0b0b",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        cursor: "pointer",
                        userSelect: "none",
                        boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                      }}
                    >
                      E
                    </div>
                  )}

                  {/* Set Leader */}
                  {!leader && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLeader(card);
                      }}
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: "4px",
                        background: "rgba(255,120,120,0.75)",
                        color: "#0b0b0b",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        cursor: "pointer",
                        userSelect: "none",
                        boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                      }}
                    >
                      L
                    </div>
                  )}
                </div>

                {/* ⭐ DB uses card.name */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "4px",
                    fontSize: "0.85rem",
                  }}
                >
                  {card.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
