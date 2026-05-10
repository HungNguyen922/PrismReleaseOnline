module.exports = function applyPatch(state, patch) {
  // Shallow merge: update only the keys provided in the patch
  for (const key in patch) {
    state[key] = patch[key];
  }
};
