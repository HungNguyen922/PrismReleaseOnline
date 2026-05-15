/*
    HOVER PREVIEW LOGIC
*/
import { useState } from "react";

export default function useGameHover() {
  const [hoverCard, setHoverCard] = useState(null);

  function bindHover(card) {
    return {
      onMouseEnter: () => card && setHoverCard(card),
      onMouseLeave: () => setHoverCard(null)
    };
  }

  return { hoverCard, bindHover };
}
