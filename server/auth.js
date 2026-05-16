// server/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db.js";

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// -----------------------------------------------------
// Helper: create a JWT for a user
// -----------------------------------------------------
function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// -----------------------------------------------------
// POST /api/register
// -----------------------------------------------------
authRouter.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username, created_at`,
      [username, hash]
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// POST /api/login
// -----------------------------------------------------
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      "SELECT id, username, password_hash, created_at FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// HTTP middleware: requireAuth
// -----------------------------------------------------
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// -----------------------------------------------------
// WebSocket middleware: verifySocketToken
// -----------------------------------------------------
export function verifySocketToken(socket, next) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Missing auth token"));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    socket.user = {
      id: payload.id,
      username: payload.username
    };

    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
}
