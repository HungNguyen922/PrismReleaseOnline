export function formatCardName(name) {
  return name
    .replace(/\(L\)|\(E\)/gi, "")   // remove (L) and (E)
    .trim()
    .split(/\s+/)                  // split on spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");                     // join into PascalCase
}
