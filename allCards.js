const fs = require("fs");
const { parse } = require("csv-parse");

fs.readFile("PRTCG - FractalSpectrum.csv", "utf8", (err, data) => {
  if (err) throw err;

  parse(data, { columns: true, skip_empty_lines: true }, (err, records) => {
    if (err) throw err;

    // write JSON version so browser can fetch it
    fs.writeFileSync("allCards.json", JSON.stringify(records, null, 2));
  });
});
