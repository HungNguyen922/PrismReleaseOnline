import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import DeckBuilder from "./components/deckstuff/DeckBuilder";
import GameBoard from "./pages/GameBoard";

const linkStyle = ({ isActive }) => ({
  padding: "8px 14px",
  borderRadius: "4px",
  fontWeight: 600,
  fontSize: "1.1rem",
  textDecoration: "none",
  color: isActive ? "var(--color-cyan-blue)" : "var(--text-light)",
  borderBottom: isActive ? "2px solid var(--color-cyan-blue)" : "2px solid transparent",
  transition: "color 0.2s ease, border-bottom 0.2s ease",
});

function App() {
  return (
    <Router>
      <nav
        style={{
          display: "flex",
          gap: "24px",
          padding: "16px 32px",
          background: "var(--color-blue-steel)",
          borderBottom: "2px solid var(--color-teal-blue)",
          alignItems: "center",
          justifyContent: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/** HOME */}
        <NavLink
          to="/"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--color-teal-blue)";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "";
          }}
        >
          Home
        </NavLink>

        {/** GALLERY */}
        <NavLink
          to="/gallery"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--color-teal-blue)";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "";
          }}
        >
          Gallery
        </NavLink>

        {/** DECK BUILDER */}
        <NavLink
          to="/deck"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--color-teal-blue)";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "";
          }}
        >
          Deck Builder
        </NavLink>

        {/** GAME BOARD */}
        <NavLink
          to="/board"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--color-teal-blue)";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "";
          }}
        >
          Game Board
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/deck" element={<DeckBuilder />} />
        <Route path="/board" element={<GameBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
