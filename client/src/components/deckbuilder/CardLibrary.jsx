import { formatCardName } from "../../utils/formatCardName";

export default function CardLibrary({ cards, addToMain, setSelectedCard }) {
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
        height: "calc(100vh - 160px)",
        overflowY: "auto",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "16px",
        }}>
          {cards.map((card, index) => {
            const fileName = formatCardName(card.Name) + ".png";

            return (
              <div
                key={index}
                onClick={() => setSelectedCard(card)}
                style={{
                  cursor: "pointer",
                  borderRadius: "12px",
                  padding: "4px",
                  background: "rgba(255,255,255,0.05)",
                  position: "relative",
                }}
              >
                <img
                  src={`/cardDatabase/${fileName}`}
                  alt={card.Name}
                  style={{ width: "100%", borderRadius: "8px" }}
                />

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    addToMain(card);
                  }}
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    right: "6px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: "rgba(212,175,55,0.85)",
                    color: "#1b1b1b",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    opacity: 0,
                    transition: "opacity 0.15s",
                  }}
                  className="hover-add-button"
                >
                  + Add
                </div>

                <div style={{
                  textAlign: "center",
                  marginTop: "4px",
                  fontSize: "0.85rem",
                }}>
                  {card.Name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
