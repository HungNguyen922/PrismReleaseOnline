import { useCallback } from "react";
import { encodeDeck, decodeDeck } from "../game/DeckCode";

export default function useDeckValidation(
  deckMain,
  deckExtra,
  leader,
  allCards,
  setLeader,
  setDeckMain,
  setDeckExtra,
  deckName,
  setDeckName
) {
  // -----------------------------
  // VALIDATION
  // -----------------------------
  const validateDeck = useCallback(() => {
    if (!leader) return { valid: false, reason: "No leader selected" };
    if (deckMain.length !== 20)
      return { valid: false, reason: "Main deck must have 20 cards" };
    if (deckExtra.length !== 5)
      return { valid: false, reason: "Extra deck must have 5 cards" };

    return { valid: true };
  }, [leader, deckMain, deckExtra]);

  // -----------------------------
  // EXPORT
  // -----------------------------
  const handleExportDeck = useCallback(async () => {
    const { valid, reason } = validateDeck();
    if (!valid) {
      alert(`Cannot export deck:\n${reason}`);
      return;
    }

    try {
      const encoded = encodeDeck({
        leader,
        main: deckMain,
        extra: deckExtra,
      });

      const finalCode = `${deckName || "Untitled"}::${encoded}`;

      await navigator.clipboard.writeText(finalCode);

      console.log("Deck code copied:", finalCode);
    } catch (err) {
      console.error("Clipboard failed:", err);
      alert("Failed to export deck.");
    }
  }, [validateDeck, leader, deckMain, deckExtra, deckName]);


  // -----------------------------
  // IMPORT
  // -----------------------------
  const handleImportDeck = useCallback(() => {
    const code = window.prompt("Paste deck code:");
    if (!code) return;

    try {
      // Split into name + encoded deck
      const [name, encoded] = code.split("::");

      if (name) setDeckName(name);

      const { leader: L, main, extra } = decodeDeck(encoded.trim(), allCards);

      setLeader(L);
      setDeckMain(main);
      setDeckExtra(extra);
    } catch {
      alert("Invalid or unsupported deck code.");
    }
  }, [allCards, setLeader, setDeckMain, setDeckExtra, setDeckName]);

  return {
    validateDeck,
    handleExportDeck,
    handleImportDeck,
    isDeckValid: validateDeck().valid,
  };
}
