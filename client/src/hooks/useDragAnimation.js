import { useState, useEffect, useRef } from "react";

export default function useDragAnimation(isDragging, rawPos) {
  const [smoothPos, setSmoothPos] = useState(rawPos);

  const animRef = useRef(null);

  useEffect(() => {
    if (!isDragging) {
      setSmoothPos(rawPos);
      return;
    }

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      setSmoothPos((prev) => ({
        x: lerp(prev.x, rawPos.x, 0.25),
        y: lerp(prev.y, rawPos.y, 0.25),
      }));

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [isDragging, rawPos]);

  return smoothPos;
}
