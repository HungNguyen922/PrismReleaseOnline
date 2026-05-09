export const getPalette = (card) =>
  [card.Color1, card.Color2, card.Color3, card.Color4].filter(
    (c) => c && c.trim() !== ""
  );
