export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px",
        background: "linear-gradient(180deg, var(--color-deep-navy), var(--color-blue-steel))",
        color: "var(--text-light)",
      }}
    >
      <h1
        style={{
          fontSize: "3.5rem",
          marginBottom: "20px",
          fontWeight: 800,
          letterSpacing: "2px",
        }}
      >
        Gate Break Online
      </h1>

      <p
        style={{
          fontSize: "1.3rem",
          maxWidth: "600px",
          marginBottom: "40px",
          opacity: 0.9,
        }}
      >
        A fast‑paced, color‑driven card game where combos, timing, and creativity decide the winner.
      </p>

      <div style={{ display: "flex", gap: "20px" }}>
        <a
          href="/gallery"
          style={{
            padding: "14px 28px",
            background: "var(--color-teal-blue)",
            color: "white",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: 600,
            textDecoration: "none",
            transition: "transform 0.2s ease, background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--color-cyan-blue)";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "var(--color-teal-blue)";
            e.target.style.transform = "scale(1)";
          }}
        >
          View Cards
        </a>

        <a
          href="/deckselect"
          style={{
            padding: "14px 28px",
            background: "transparent",
            border: "2px solid var(--color-blue-gray)",
            color: "var(--color-blue-gray)",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: 600,
            textDecoration: "none",
            transition: "transform 0.2s ease, background 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--color-blue-gray)";
            e.target.style.color = "var(--color-deep-navy)";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "var(--color-blue-gray)";
            e.target.style.transform = "scale(1)";
          }}
        >
          Play Now
        </a>
      </div>

      <p
        style={{
          marginTop: "60px",
          fontSize: "0.9rem",
          opacity: 0.6,
        }}
      >
        Build decks. Master combos. Release your palette.
      </p>
    </div>
  );
}
