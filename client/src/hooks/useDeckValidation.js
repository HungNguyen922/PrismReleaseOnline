import { useCallback } from "react";
import { encodeDeck, decodeDeck } from "../components/deckbuilder/DeckCode";

export default function useDeckValidation(
  deckMain,
  deckExtra,
  leader,
  allCards,
  setLeader,
  setDeckMain,
  setDeckExtra
) {
  const validateDeck = useCallback(() => {
    if (!leader) return { valid: false, reason: "No leader selected" };
    if (deckMain.length !== 20) return { valid: false, reason: "Main deck must have 20 cards" };
    if (deckExtra.length !== 5) return { valid: false, reason: "Extra deck must have 5 cards" };
    return { valid: true };
  }, [leader, deckMain, deckExtra]);

  const handleExportDeck = useCallback(() => {
    const { valid, reason } = validateDeck();
    if (!valid) {
      alert(`Cannot export deck:\n${reason}`);
      return;
    }

    try {
      const code = encodeDeck({
        leader,
        main: deckMain,
        extra: deckExtra,
      });
      navigator.clipboard.writeText(code);
      alert(`Deck code copied:\n${code}`);
    } catch {
      alert("Failed to export deck.");
    }
  }, [validateDeck, leader, deckMain, deckExtra]);

  const handleImportDeck = useCallback(() => {
    const code = window.prompt("Paste deck code:");
    if (!code) return;

    try {
      const { leader: L, main, extra } = decodeDeck(code.trim(), allCards);
      setLeader(L);
      setDeckMain(main);
      setDeckExtra(extra);
    } catch {
      alert("Invalid or unsupported deck code.");
    }
  }, [allCards, setLeader, setDeckMain, setDeckExtra]);

  return {
    validateDeck,
    handleExportDeck,
    handleImportDeck,
    isDeckValid: validateDeck().valid,
  };
}
