import { useEffect, useState } from "react";

import FiltersPanel from "./FiltersPanel";
import CardLibrary from "./CardLibrary";
import DeckPanel from "./deckpanel/DeckPanel";
import CardModal from "./CardModal";
import allCards from "../../game/allCards";

import { formatCardName } from "../../utils/formatCardName";

// Hooks
import useDeckState from "../../hooks/useDeckState";
import useCardDrag from "../../hooks/useCardDrag";
import useFilteredCards from "../../hooks/useFilteredCards";
import useDeckValidation from "../../hooks/useDeckValidation";
import useDragAnimation from "../../hooks/useDragAnimation";

export default function DeckBuilder() {
  const [deckName, setDeckName] = useState("");
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [colorFilter, setColorFilter] = useState("All");
  const [selectedCard, setSelectedCard] = useState(null);

  // ⭐ Deck state
  const {
    deckMain,
    deckExtra,
    leader,
    setLeader,
    setDeckMain,
    setDeckExtra,
    addToMain,
    addToExtra,
    removeFromMain,
    removeFromExtra,
  } = useDeckState();

  // ⭐ Highlight states
  const [highlightMain, setHighlightMain] = useState(false);
  const [highlightExtra, setHighlightExtra] = useState(false);
  const [highlightLeader, setHighlightLeader] = useState(false);

  // ⭐ Drag system
  const {
    dragCard,
    dragPos,
    isDragging,
    startDrag,
  } = useCardDrag({
    addToMain,
    addToExtra,
    setLeader,
  });

  // ⭐ Smooth drag animation
  const smoothPos = useDragAnimation(isDragging, dragPos);

  // ⭐ Filtering
  const filteredCards = useFilteredCards(cards, search, colorFilter);

  // ⭐ Validation + import/export
  const { handleExportDeck, handleImportDeck } = useDeckValidation(
    deckMain,
    deckExtra,
    leader,
    cards,
    setLeader,
    setDeckMain,
    setDeckExtra,
    deckName,
    setDeckName
  );

  useEffect(() => {
    setCards(allCards);
  }, []);

  // ⭐ Reset scroll when entering DeckBuilder
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ⭐ Disable page scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ⭐ Enable drag slot highlighting
  useEffect(() => {
    if (isDragging && dragCard) {
      if (deckMain.length < 20) setHighlightMain(true);
      if (deckExtra.length < 5) setHighlightExtra(true);
      if (!leader) setHighlightLeader(true);
    } else {
      setHighlightMain(false);
      setHighlightExtra(false);
      setHighlightLeader(false);
    }
  }, [isDragging, dragCard, deckMain.length, deckExtra.length, leader]);

  return (
    <div
      style={{
        height: "100vh",               // ⭐ full viewport height
        display: "grid",
        gridTemplateRows: "1fr",       // ⭐ force row to stay inside viewport
        gridTemplateColumns: "260px 1.6fr 1.1fr",
        gap: "20px",
        padding: "24px",
        background:
          "radial-gradient(circle at top, #1b3b6f 0, #21295c 40%, #0b1025 100%)",
        color: "white",
        overflow: "hidden",            // ⭐ prevent page scroll
      }}
    >

      {/* ⭐ FILTERS PANEL — scrolls internally */}
      <div style={{ height: "100%", minHeight: 0, overflowY: "auto" }}>
        <FiltersPanel
          search={search}
          setSearch={setSearch}
          colorFilter={colorFilter}
          setColorFilter={setColorFilter}
          deckMain={deckMain}
          deckExtra={deckExtra}
        />
      </div>

      {/* ⭐ CARD LIBRARY — scrolls internally */}
      <div style={{ height: "100%", minHeight: 0, overflowY: "auto" }}>
        <CardLibrary
          cards={filteredCards}
          addToMain={addToMain}
          addToExtra={addToExtra}
          setLeader={setLeader}
          deckMain={deckMain}
          deckExtra={deckExtra}
          leader={leader}
          setSelectedCard={setSelectedCard}
          startDrag={startDrag}
        />
      </div>

      {/* ⭐ DECK PANEL — scrolls internally */}
      <div style={{ height: "100%", minHeight: 0, overflowY: "auto" }}>
        <DeckPanel
          deckName={deckName}
          setDeckName={setDeckName}
          leader={leader}
          setLeader={setLeader}
          deckMain={deckMain}
          deckExtra={deckExtra}
          removeFromMain={removeFromMain}
          removeFromExtra={removeFromExtra}
          onExport={handleExportDeck}
          onImport={handleImportDeck}
          isDragging={isDragging}
          dragCard={dragCard}
          highlightMain={highlightMain}
          highlightExtra={highlightExtra}
          highlightLeader={highlightLeader}
          onDropMain={addToMain}
          onDropExtra={addToExtra}
          onDropLeader={setLeader}
          onReorderMain={(from, to) =>
            setDeckMain((prev) => {
              const arr = [...prev];
              const [moved] = arr.splice(from, 1);
              arr.splice(to, 0, moved);
              return arr;
            })
          }
          onReorderExtra={(from, to) =>
            setDeckExtra((prev) => {
              const arr = [...prev];
              const [moved] = arr.splice(from, 1);
              arr.splice(to, 0, moved);
              return arr;
            })
          }
        />
      </div>

      {/* ⭐ Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAddMain={() => addToMain(selectedCard)}
          onAddExtra={() => addToExtra(selectedCard)}
          onSetLeader={() => setLeader(selectedCard)}
        />
      )}

      {/* ⭐ Ghost Card */}
      {isDragging && dragCard && (
        <div
          style={{
            position: "fixed",
            left: smoothPos.x,
            top: smoothPos.y,
            pointerEvents: "none",
            zIndex: 9999,
            width: "120px",
            opacity: 0.9,
            transform: "translate(-50%, -50%)",
          }}
        >
          <img
            src={`/cardDatabase/${formatCardName(dragCard.Name)}.png`}
            alt=""
            style={{ width: "100%", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}
