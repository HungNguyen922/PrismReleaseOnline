import React from "react";
import { formatCardName } from "../../utils/formatCardName";
import "./visualdeckview.css";

function groupByName(cards = []) {
  const map = new Map();
  cards.forEach(card => {
    const key = card.Name;
    if (!map.has(key)) {
      map.set(key, { card, count: 1 });
    } else {
      map.get(key).count += 1;
    }
  });
  return Array.from(map.values());
}

export default function VisualDeckView({
  deckName,
  leader,
  deckMain = [],
  deckExtra = [],
  className = ""
}) {
  const mainGroups = groupByName(deckMain);
  const extraGroups = groupByName(deckExtra);

  return (
    <div className={`visual-deck-view ${className}`}>
      {deckName && (
        <div className="deck-name">
          {deckName}
        </div>
      )}

      {/* Leader + Extra Deck in the same row */}
      <div className="leader-extra-row">

        {/* Leader */}
        {leader && (
          <div className="leader-art">
            <img
              src={`/cardDatabase/${formatCardName(leader.Name)}.png`}
              alt={leader.Name}
            />
          </div>
        )}

        {/* Extra Deck Fan */}
        <div className="extra-fan">
          {extraGroups.map(({ card, count }, i) => (
            <div key={card.Name} className="extra-card-wrapper" style={{ zIndex: i }}>
              <img
                src={`/cardDatabase/${formatCardName(card.Name)}.png`}
                alt={card.Name}
              />
              {count > 1 && (
                <div className="copy-marker">{count}</div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Main Deck Grid */}
      <div className="main-grid">
        {mainGroups.map(({ card, count }) => (
          <div key={card.Name} className="card-wrapper">
            <img
              src={`/cardDatabase/${formatCardName(card.Name)}.png`}
              alt={card.Name}
            />
            {count > 1 && (
              <div className="copy-marker">{count}</div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
