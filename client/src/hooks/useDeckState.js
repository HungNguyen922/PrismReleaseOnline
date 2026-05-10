import { useState, useCallback } from "react";

export default function useDeckState() {
  const [deckMain, setDeckMain] = useState([]);
  const [deckExtra, setDeckExtra] = useState([]);
  const [leader, setLeader] = useState(null);

  const addToMain = useCallback((card) => {
    setDeckMain(prev => {
      if (prev.length >= 20) return prev;
      return [...prev, card];
    });
  }, []);

  const addToExtra = useCallback((card) => {
    setDeckExtra(prev => {
      if (prev.length >= 5) return prev;
      return [...prev, card];
    });
  }, []);

  const removeFromMain = useCallback((i) => {
    setDeckMain(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const removeFromExtra = useCallback((i) => {
    setDeckExtra(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  return {
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
  };
}
