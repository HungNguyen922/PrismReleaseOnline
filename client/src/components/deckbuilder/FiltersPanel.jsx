import { useMemo } from "react";
import { getPalette } from "./palette";

export default function FiltersPanel({
  search,
  setSearch,
  colorFilter,
  setColorFilter,
  deckMain,
}) {
  const total = deckMain.length || 1;

  // ⭐ Compute color distribution
  const colorCounts = useMemo(() => {
    const counts = {};
    deckMain.forEach((card) => {
      const palette = getPalette(card);
      palette.forEach((c) => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return counts;
  }, [deckMain]);

  // ⭐ Compute power curve (DB uses lowercase: power)
  const powerCounts = useMemo(() => {
    const counts = {};
    deckMain.forEach((card) => {
      const p = Number(card.power);   // FIXED
      if (!isNaN(p)) counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [deckMain]);

  // ⭐ Compute bulk curve (DB uses lowercase: bulk)
  const bulkCounts = useMemo(() => {
    const counts = {};
    deckMain.forEach((card) => {
      const b = Number(card.bulk);   // FIXED
      if (!isNaN(b)) counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [deckMain]);

  // ⭐ Compact bar row
  const barRow = (label, count, color) => (
    <div style={{ marginBottom: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.8rem" }}>{label}</span>
        <span style={{ fontSize: "0.8rem" }}>{count}</span>
      </div>

      <div
        style={{
          height: "6px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(count / total) * 100}%`,
            height: "100%",
            background: color,
            transition: "width 0.2s",
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "12px",
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.1)",
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      <h2 style={{ marginBottom: "12px" }}>Filters</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search cards..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "6px 8px",
          borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.2)",
          marginBottom: "12px",
        }}
      />

      {/* Color Filter */}
      <select
        value={colorFilter}
        onChange={(e) => setColorFilter(e.target.value)}
        style={{
          width: "100%",
          padding: "6px 8px",
          borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.2)",
          marginBottom: "16px",
        }}
      >
        <option value="All">All Colors</option>
        <option value="Red">Red</option>
        <option value="Orange">Orange</option>
        <option value="Yellow">Yellow</option>
        <option value="Green">Green</option>
        <option value="Cyan">Cyan</option>
        <option value="Blue">Blue</option>
        <option value="Violet">Violet</option>
        <option value="Magenta">Magenta</option>
        <option value="Pink">Pink</option>
      </select>

      {/* ⭐ COLOR CURVE */}
      <h3 style={{ marginBottom: "6px" }}>Color Curve</h3>
      {Object.entries(colorCounts).map(([color, count]) =>
        barRow(color, count, color.toLowerCase())
      )}

      {/* ⭐ POWER CURVE */}
      <h3 style={{ margin: "12px 0 6px" }}>Power Curve</h3>
      {Object.entries(powerCounts)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([p, count]) => barRow(`P${p}`, count, "dodgerblue"))}

      {/* ⭐ BULK CURVE */}
      <h3 style={{ margin: "12px 0 6px" }}>Bulk Curve</h3>
      {Object.entries(bulkCounts)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([b, count]) => barRow(`B${b}`, count, "mediumseagreen"))}
    </div>
  );
}
