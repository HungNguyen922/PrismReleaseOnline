let currentState = null;
const listeners = new Set();

const GameState = {
  // Get current state
  get() {
    return currentState ? JSON.parse(JSON.stringify(currentState)) : null;
  },

  // Set new state and notify subscribers
  set(newState) {
    currentState = JSON.parse(JSON.stringify(newState));
    listeners.forEach((fn) => fn(currentState));
  },

  // Subscribe to state changes
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};

export default GameState;
