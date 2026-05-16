import { db } from "./db.js";

async function init() {
  try {
    await db.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS decks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        cards JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player1_id UUID REFERENCES users(id),
        player2_id UUID REFERENCES users(id),
        winner_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        name TEXT NOT NULL,
        power INTEGER,
        bulk INTEGER,

        color1 TEXT,
        color2 TEXT,
        color3 TEXT,
        color4 TEXT,

        trait TEXT,
        effect1 TEXT,
        effect2 TEXT,

        image_url TEXT,

        created_at TIMESTAMP DEFAULT NOW(),

        UNIQUE (name, power, bulk)
      );
    `);

    console.log("Database initialized");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    process.exit();
  }
}

init();
