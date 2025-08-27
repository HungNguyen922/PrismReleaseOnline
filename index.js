require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

// Open or create SQLite DB file
const db = new Database(process.env.DATABASE_FILE || './database.sqlite');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Ensure users table exists
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`).run();
