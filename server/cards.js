import express from "express";
import { db } from "./db.js";

export const cardsRouter = express.Router();

cardsRouter.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM cards ORDER BY name");
  res.json(result.rows);
});
