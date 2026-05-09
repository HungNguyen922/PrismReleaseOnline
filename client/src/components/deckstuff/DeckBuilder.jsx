// src/components/deckbuilder/DeckBuilder.jsx
import { useEffect, useMemo, useState } from "react";

import FiltersPanel from "./FiltersPanel";
import CardLibrary from "./CardLibrary";
import DeckPanel from "./DeckPanel";
import CardModal from "./CardModal";

import { getPalette } from "./palette";
import { encodeDeck, decodeDeck } from "../DeckCode";

export default function DeckBuilder() {
  const [allCards, setAllCards] = useState([]);
  const [deckMain, setDeckMain] = useState([]);
  const [deckExtra, setDeckExtra] = useState([]);
  const [leader, setLeader] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const [search, setSearch] = useState("");
  const [colorFilter, setColorFilter] = useState("All");

  // Load card database
  useEffect(() => {
    fetch("/allCards.json")
      .then((res) => res.json())
      .then((data) => setAllCards(data));
  }, []);

  // Filtered card list
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      const matchesSearch = card.Name.toLowerCase().includes(search.toLowerCase());
      const palette = getPalette(card);
      const matchesColor =
        colorFilter === "All" || palette.includes(colorFilter);

      return matchesSearch && matchesColor;
    });
  }, [allCards, search, colorFilter]);

  // Color distribution
  const colorCounts = useMemo(() => {
    const counts = {};
    deckMain.forEach((card) => {
      const palette = getPalette(card);
      palette.forEach((c) => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return counts;
  }, [deckMain]);

  // Power curve
  const powerCounts = useMemo(() => {
    const counts = {};
    deckMain.forEach((card) => {
      const p = Number(card.Power);
      if (!isNaN(p)) counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [deckMain]);

  // Bulk curve
  const bulkCounts = useMemo(() => {
    const counts = {};
    deckMain.forEach((card) => {
      const b = Number(card.Bulk);
      if (!isNaN(b)) counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [deckMain]);

  // Deck actions
  const addToMain = (card) => {
    if (deckMain.length < 20) setDeckMain((prev) => [...prev, card]);
  };

  const addToExtra = (card) => {
    if (deckExtra.length < 5) setDeckExtra((prev) => [...prev, card]);
  };

  const removeFromMain = (i) => {
    setDeckMain((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeFromExtra = (i) => {
    setDeckExtra((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Export deck code
  const handleExportDeck = () => {
    try {
      const code = encodeDeck({
        leader,
        main: deckMain,
        extra: deckExtra,
      });
      navigator.clipboard.writeText(code);
      alert(`Deck code copied:\n${code}`);
    } catch (e) {
      alert("Failed to export deck.");
    }
  };

  // Import deck code
  const handleImportDeck = () => {
    const code = window.prompt("Paste deck code:");
    if (!code) return;

    try {
      const { leader: L, main, extra } = decodeDeck(code.trim(), allCards);
      setLeader(L);
      setDeckMain(main);
      setDeckExtra(extra);
    } catch (e) {
      alert("Invalid or unsupported deck code.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "radial-gradient(circle at top, #1b3b6f 0, #21295c 40%, #0b1025 100%)",
        color: "white",
        display: "grid",
        gridTemplateColumns: "260px 1.6fr 1.1fr",
        gap: "20px",
      }}
    >
      <FiltersPanel
        search={search}
        setSearch={setSearch}
        colorFilter={colorFilter}
        setColorFilter={setColorFilter}
        deckMain={deckMain}
        deckExtra={deckExtra}
        colorCounts={colorCounts}
        powerCounts={powerCounts}
        bulkCounts={bulkCounts}
      />

      <CardLibrary
        cards={filteredCards}
        addToMain={addToMain}
        setSelectedCard={setSelectedCard}
      />

      <DeckPanel
        leader={leader}
        setLeader={setLeader}
        deckMain={deckMain}
        deckExtra={deckExtra}
        removeFromMain={removeFromMain}
        removeFromExtra={removeFromExtra}
        onExport={handleExportDeck}
        onImport={handleImportDeck}
      />

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAddMain={() => addToMain(selectedCard)}
          onAddExtra={() => addToExtra(selectedCard)}
          onSetLeader={() => setLeader(selectedCard)}
        />
      )}
    </div>
  );
}
