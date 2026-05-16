import fs from "fs";
import csv from "csv-parser";
import { db } from "./db.js";

function formatCardName(str) {
  return str
    .trim()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

async function importCards() {
  const cards = [];

  fs.createReadStream("PRTCG - FractalSpectrum.csv")
    .pipe(csv())
    .on("data", (row) => cards.push(row))
    .on("end", async () => {
      console.log(`Loaded ${cards.length} cards from CSV`);

      for (const card of cards) {
        const formattedName = formatCardName(card.Name);
        const imageUrl = `/cardDatabase/${formattedName}.png`;

        await db.query(
          `INSERT INTO cards
            (name, power, bulk, color1, color2, color3, color4,
             trait, effect1, effect2, image_url)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (name, power, bulk) DO NOTHING`,
          [
            card.Name,
            parseInt(card.Power) || null,
            parseInt(card.Bulk) || null,

            card.Color1 || null,
            card.Color2 || null,
            card.Color3 || null,
            card.Color4 || null,

            card.Trait || null,
            card.Effect1 || null,
            card.Effect2 || null,

            imageUrl
          ]
        );
      }

      console.log("Card import complete");
      process.exit();
    });
}

importCards();
