const PREFIX = "GBR-";
const VERSION = 1;

// 16‑bit hash
export function hashCardName(name) {
  let hash = 0x1234;
  for (let i = 0; i < name.length; i++) {
    hash = (hash ^ name.charCodeAt(i)) * 0x5bd1e995;
    hash &= 0xffff;
  }
  return hash;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(str) {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ⭐ Updated to use card.name (lowercase)
function groupByName(cards) {
  const map = new Map();
  cards.forEach((card) => {
    if (!map.has(card.name)) map.set(card.name, { card, count: 0 });
    map.get(card.name).count++;
  });
  return Array.from(map.values());
}

export function encodeDeck({ leader, main, extra }) {
  const bytes = [];

  bytes.push(VERSION);

  // ⭐ leader.name instead of leader.Name
  const leaderHash = leader ? hashCardName(leader.name) : 0xffff;
  bytes.push((leaderHash >> 8) & 0xff, leaderHash & 0xff);

  const mainGroups = groupByName(main);
  bytes.push(mainGroups.length);
  mainGroups.forEach(({ card, count }) => {
    const h = hashCardName(card.name);
    bytes.push((h >> 8) & 0xff, h & 0xff, count);
  });

  const extraGroups = groupByName(extra);
  bytes.push(extraGroups.length);
  extraGroups.forEach(({ card, count }) => {
    const h = hashCardName(card.name);
    bytes.push((h >> 8) & 0xff, h & 0xff, count);
  });

  return PREFIX + bytesToBase64Url(Uint8Array.from(bytes));
}

export function decodeDeck(code, allCards) {
  if (!code.startsWith(PREFIX)) throw new Error("Invalid prefix");

  const payload = code.slice(PREFIX.length);
  const bytes = base64UrlToBytes(payload);

  let i = 0;
  const version = bytes[i++];
  if (version !== VERSION) throw new Error("Unsupported version");

  const readU16 = () => {
    const v = (bytes[i] << 8) | bytes[i + 1];
    i += 2;
    return v;
  };

  const leaderHash = readU16();

  // ⭐ Updated to use card.name
  const findByHash = (h) =>
    allCards.find((c) => hashCardName(c.name) === h) || null;

  const leader =
    leaderHash === 0xffff ? null : findByHash(leaderHash);

  const main = [];
  const mainGroups = bytes[i++];
  for (let g = 0; g < mainGroups; g++) {
    const h = readU16();
    const count = bytes[i++];
    const card = findByHash(h);
    if (card) for (let k = 0; k < count; k++) main.push(card);
  }

  const extra = [];
  const extraGroups = bytes[i++];
  for (let g = 0; g < extraGroups; g++) {
    const h = readU16();
    const count = bytes[i++];
    const card = findByHash(h);
    if (card) for (let k = 0; k < count; k++) extra.push(card);
  }

  return { leader, main, extra };
}
