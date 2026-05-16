import React from "react";
import "./visualdeckview.css";

function groupByName(cards = []) {
  const map = new Map();
  cards.forEach(card => {
    const key = card.name;   // ⭐ FIXED: lowercase field
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
              src={leader.image_url}     // ⭐ FIXED
              alt={leader.name}          // ⭐ FIXED
            />
          </div>
        )}

        {/* Extra Deck Fan */}
        <div className="extra-fan">
          {extraGroups.map(({ card, count }, i) => (
            <div
              key={card.name}            // ⭐ FIXED
              className="extra-card-wrapper"
              style={{ zIndex: i }}
            >
              <img
                src={card.image_url}     // ⭐ FIXED
                alt={card.name}          // ⭐ FIXED
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
          <div key={card.name} className="card-wrapper">
            <img
              src={card.image_url}       // ⭐ FIXED
              alt={card.name}            // ⭐ FIXED
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
