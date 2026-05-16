export default function Card({ card }) {
  return (
    <div
      style={{
        textAlign: "center",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        padding: "8px",
        borderRadius: "12px",
        background: "var(--color-blue-steel)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
        e.currentTarget.style.background = "var(--color-teal-blue)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        e.currentTarget.style.background = "var(--color-blue-steel)";
      }}
    >
      <img
        src={card.image_url}
        alt={card.name}
        style={{
          width: "100%",
          borderRadius: "10px",
          marginBottom: "8px",
        }}
      />

      <p style={{ margin: 0, fontWeight: "600" }}>{card.name}</p>
    </div>
  );
}
