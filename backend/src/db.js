import Database from "better-sqlite3";
import fs from "node:fs";
import { resolveDbPath } from "./dataPaths.js";

export function getDbPath(repoRoot) {
  return resolveDbPath(repoRoot);
}

/** @param {string} repoRoot — raíz del monorepo (misma que usa uploads). */
export function openDb(repoRoot) {
  const dbPath = resolveDbPath(repoRoot);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  console.log("[db] %s", dbPath);
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  return db;
}

export function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sections (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      ip TEXT
    );
  `);
}

export function getSection(db, key) {
  const row = db.prepare("SELECT key, data, updatedAt FROM sections WHERE key = ?").get(key);
  if (!row) return null;
  return { key: row.key, data: JSON.parse(row.data), updatedAt: row.updatedAt };
}

export function getAllSections(db) {
  const rows = db.prepare("SELECT key, data, updatedAt FROM sections").all();
  const out = {};
  for (const r of rows) out[r.key] = JSON.parse(r.data);
  return out;
}

export function upsertSection(db, key, data) {
  const now = Date.now();
  db.prepare(
    `INSERT INTO sections(key, data, updatedAt)
     VALUES(?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET data=excluded.data, updatedAt=excluded.updatedAt`
  ).run(key, JSON.stringify(data), now);
  return { key, data, updatedAt: now };
}

export function insertContactMessage(db, { nombre, email, mensaje, ip }) {
  const now = Date.now();
  const info = db
    .prepare(
      `INSERT INTO contact_messages (nombre, email, mensaje, createdAt, ip)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(nombre, email, mensaje, now, ip || null);
  return { id: Number(info.lastInsertRowid), createdAt: now };
}

export function listContactMessages(db, limit = 100) {
  const n = Math.min(Math.max(1, Number(limit) || 100), 200);
  return db
    .prepare(
      `SELECT id, nombre, email, mensaje, createdAt, ip
       FROM contact_messages
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(n);
}

