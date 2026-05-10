import { useState, useCallback } from "react";

export default function useDropZoneGlow() {
  const [isOver, setIsOver] = useState(false);

  const onEnter = useCallback(() => setIsOver(true), []);
  const onLeave = useCallback(() => setIsOver(false), []);

  return {
    isOver,
    onEnter,
    onLeave,
  };
}
