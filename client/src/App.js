import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import DeckBuilder from "./components/deckbuilder/DeckBuilder";
import DeckSelect from "./pages/deckselect/DeckSelect";
import MatchMaking from "./pages/matchmaking/MatchMaking";
import GameBoard from "./pages/gameboard/GameBoard";
import GameServer from "./game/Game.Server.js";

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

export default function App() {
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
        <NavLink to="/" style={linkStyle}>Home</NavLink>
        <NavLink to="/gallery" style={linkStyle}>Gallery</NavLink>
        <NavLink to="/deck" style={linkStyle}>Deck Builder</NavLink>
        <NavLink to="/deckselect" style={linkStyle}>Matchmaking</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/deck" element={<DeckBuilder />} />

        {/* Phase 1 */}
        <Route path="/deckselect" element={<DeckSelect />} />

        {/* Phase 2 */}
        <Route path="/matchmaking/:gameId" element={<MatchMaking />} />

        {/* Phase 3 */}
        <Route path="/game/:gameId" element={<GameBoard />} />
      </Routes>
    </Router>
  );
}
