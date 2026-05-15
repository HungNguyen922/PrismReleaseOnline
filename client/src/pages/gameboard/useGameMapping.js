/*
    CANONICAL VISUAL MAPPING
    ------------------------
    - Bottom player sees the board normally
    - Top player sees the board mirrored horizontally
    - We must convert visualIndex → canonicalIndex for actions
*/

import { useMemo } from "react";
import GameClient from "../../game/GameClient";

export default function useGameMapping(playerId, state) {
  // ⭐ SAFE to compute now — state is guaranteed to exist
  const side = GameClient.state.playerSide; // "top" or "bottom"
  const iAmBottom = side === "bottom";

  // Bottom: row stays the same
  // Top: row is reversed
  const mirrorRow = useMemo(() => {
    return (row) => (iAmBottom ? row : [...row].reverse());
  }, [iAmBottom]);

  // "bottom" <-> "top"
  const mapSide = useMemo(() => {
    return (canonicalSide) =>
      canonicalSide === "bottom" ? "top" : "bottom";
  }, []);

  // If I'm bottom: visualIndex === canonicalIndex
  // If I'm top: canonicalIndex = (len - 1 - visualIndex)
  const toCanonicalIndex = useMemo(() => {
    return (visualIndex, rowLength) => {
      return iAmBottom
        ? visualIndex
        : rowLength - 1 - visualIndex;
    };
  }, [iAmBottom]);

  // ⭐ MUST be first — before ANY hook or variable that depends on state
  if (!state) {
    return {
      iAmBottom: true,
      mirrorRow: (x) => x ?? [],
      mapSide: (s) => s,
      toCanonicalIndex: (i) => i
    };
  }
  
  return {
    iAmBottom,
    mirrorRow,
    mapSide,
    toCanonicalIndex
  };
}
