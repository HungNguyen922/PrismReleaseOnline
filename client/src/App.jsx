import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Gallery from "./pages/Gallery.jsx";
import DeckBuilder from "./components/deckbuilder/DeckBuilder.jsx";
import DeckSelect from "./pages/deckselect/DeckSelect.jsx";
import MatchMaking from "./pages/matchmaking/MatchMaking.jsx";
import GameBoard from "./pages/gameboard/GameBoard.jsx";
import Login from "./pages/LoginPage.jsx";
import GameClient from "./game/GameClient.js";

const linkStyle = ({ isActive }) => ({
  padding: "4px 10px",            // smaller buttons
  borderRadius: "4px",
  fontWeight: 600,
  fontSize: "0.9rem",             // smaller text
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
          position: "fixed",
          width: "100%",
          left: 0,
          right: 0,
          top: 0,
          zIndex: 10,
        }}
      >

        <NavLink to="/" style={linkStyle}>Home</NavLink>
        <NavLink to="/gallery" style={linkStyle}>Gallery</NavLink>
        <NavLink to="/deck" style={linkStyle}>Deck Builder</NavLink>
        <NavLink to="/deckselect" style={linkStyle}>Matchmaking</NavLink>
        <NavLink to="/login" style={linkStyle}>Login</NavLink>
      </nav>

      <div style={{ paddingTop: "80px" }}>
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

          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}
