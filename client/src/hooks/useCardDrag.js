import { useState, useEffect, useCallback } from "react";

export default function useCardDrag({ addToMain, addToExtra, setLeader }) {
  const [dragCard, setDragCard] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = useCallback((card, e, element) => {
    e.preventDefault();

    if (element) {
      const rect = element.getBoundingClientRect();
      setOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else {
      setOrigin({ x: e.clientX, y: e.clientY });
    }

    setDragCard(card);
    setIsDragging(true);
    setDragPos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const move = (e) => {
      if (!isDragging) return;
      setDragPos({ x: e.clientX, y: e.clientY });
    };

    const up = (e) => {
      if (!isDragging) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);

      if (el?.closest(".drop-main")) addToMain(dragCard);
      else if (el?.closest(".drop-extra")) addToExtra(dragCard);
      else if (el?.closest(".drop-leader")) setLeader(dragCard);

      setIsDragging(false);
      setDragCard(null);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [isDragging, dragCard, addToMain, addToExtra, setLeader]);

  return {
    dragCard,
    dragPos,
    origin,
    isDragging,
    startDrag,
  };
}
