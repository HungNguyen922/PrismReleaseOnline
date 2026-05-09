import { getPalette } from "./palette";

export default function FiltersPanel({
  search,
  setSearch,
  colorFilter,
  setColorFilter,
  deckMain,
  deckExtra,
  colorCounts,
  powerCounts,
  bulkCounts
}) {
  return (
    <div style={{
      padding: "16px",
      borderRadius: "16px",
      background: "rgba(10, 15, 35, 0.85)",
      border: "1px solid rgba(212, 175, 55, 0.5)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
      backdropFilter: "blur(10px)",
    }}>
      <h2 style={{ marginTop: 0 }}>Filters</h2>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        style={{
          width: "100%",
          marginBottom: "12px",
          padding: "6px 8px",
          borderRadius: "8px",
          border: "1px solid rgba(158,179,194,0.6)",
          background: "rgba(5,10,25,0.9)",
          color: "white",
        }}
      />

      {/* Color Filter */}
      <select
        value={colorFilter}
        onChange={(e) => setColorFilter(e.target.value)}
        style={{
          width: "100%",
          marginBottom: "16px",
          padding: "6px 8px",
          borderRadius: "8px",
          border: "1px solid rgba(158,179,194,0.6)",
          background: "rgba(5,10,25,0.9)",
          color: "white",
        }}
      >
        <option>All</option>
        <option>Red</option>
        <option>Blue</option>
        <option>Green</option>
        <option>Yellow</option>
        <option>Purple</option>
      </select>

      {/* Deck Stats */}
      <h3>Deck Stats</h3>
      <p>Main: {deckMain.length} / 20</p>
      <p>Extra: {deckExtra.length} / 5</p>

      {/* Color Distribution */}
      {Object.entries(colorCounts).map(([color, count]) => (
        <div key={color} style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: "70px" }}>{color}</span>
          <div style={{
            flex: 1,
            height: "6px",
            background: "rgba(158,179,194,0.2)",
            borderRadius: "999px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${(count / deckMain.length) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #d4af37, rgba(212,175,55,0.2))",
            }} />
          </div>
          <span style={{ marginLeft: "6px" }}>{count}</span>
        </div>
      ))}

      {/* Power Curve */}
      <h3 style={{ marginTop: "20px" }}>Power Curve</h3>
      {Object.entries(powerCounts).map(([p, count]) => (
        <div key={p} style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: "50px" }}>P{p}</span>
          <div style={{
            flex: 1,
            height: "6px",
            background: "rgba(158,179,194,0.2)",
            borderRadius: "999px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${(count / deckMain.length) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #d4af37, rgba(212,175,55,0.2))",
            }} />
          </div>
          <span style={{ marginLeft: "6px" }}>{count}</span>
        </div>
      ))}

      {/* Bulk Curve */}
      <h3 style={{ marginTop: "20px" }}>Bulk Curve</h3>
      {Object.entries(bulkCounts).map(([b, count]) => (
        <div key={b} style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: "50px" }}>B{b}</span>
          <div style={{
            flex: 1,
            height: "6px",
            background: "rgba(158,179,194,0.2)",
            borderRadius: "999px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${(count / deckMain.length) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #d4af37, rgba(212,175,55,0.2))",
            }} />
          </div>
          <span style={{ marginLeft: "6px" }}>{count}</span>
        </div>
      ))}
    </div>
  );
}
