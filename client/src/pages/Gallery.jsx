import { useEffect, useState } from "react";
import Card from "../components/Card";
import CardModal from "../components/deckbuilder/CardModal";

export default function Gallery() {
  const [cards, setCards] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const openModal = (index) => setSelectedIndex(index);
  const closeModal = () => setSelectedIndex(null);

  const showPrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const showNext = () => {
    setSelectedIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    async function loadCards() {
      const res = await fetch("/api/cards");
      const data = await res.json();
      setCards(data);
    }
    loadCards();
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Card Gallery</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "24px",
        }}
      >
        {cards.map((card, index) => (
          <div key={index} onClick={() => openModal(index)}>
            <Card card={card} />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <CardModal
          card={cards[selectedIndex]}
          onClose={closeModal}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}
    </div>
  );
}
