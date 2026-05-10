import { useMemo } from "react";
import { getPalette } from "../components/deckbuilder/palette";

export default function useFilteredCards(allCards, search, colorFilter) {
  return useMemo(() => {
    return allCards.filter((card) => {
      const matchesSearch = card.Name.toLowerCase().includes(search.toLowerCase());
      const palette = getPalette(card);
      const matchesColor =
        colorFilter === "All" || palette.includes(colorFilter);

      return matchesSearch && matchesColor;
    });
  }, [allCards, search, colorFilter]);
}
