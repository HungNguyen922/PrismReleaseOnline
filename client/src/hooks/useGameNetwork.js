import { useEffect } from "react";

export default function useGameNetwork(gameId, applyState) {
  useEffect(() => {
    const socket = window.__GAME_SOCKET__ || null;
    if (!socket) return;

    const handlePatch = (patch) => {
      applyState(patch);
    };

    socket.on("patch", handlePatch);

    return () => {
      socket.off("patch", handlePatch);
    };
  }, [gameId, applyState]);
}
