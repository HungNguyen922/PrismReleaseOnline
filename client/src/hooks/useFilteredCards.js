import { useMemo } from "react";
import { getPalette } from "../components/deckbuilder/palette";

export default function useFilteredCards(allCards, search, colorFilter) {
  return useMemo(() => {
    const searchLower = search.toLowerCase();

    return allCards.filter((card) => {
      // ⭐ DB uses lowercase "name"
      const matchesSearch =
        card.name?.toLowerCase().includes(searchLower);

      const palette = getPalette(card);

      const matchesColor =
        colorFilter === "All" || palette.includes(colorFilter);

      return matchesSearch && matchesColor;
    });
  }, [allCards, search, colorFilter]);
}
