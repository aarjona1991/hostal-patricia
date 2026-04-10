import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, "backend", ".env") });
dotenv.config();
import { clearAuthCookie, getOptionalAuthUser, issueAuthCookie, requireAuth, verifyLogin } from "./auth.js";
import { DEFAULT_SECTIONS } from "./seed.js";
import { parseContactPayload } from "./contact.js";
import {
  ensureSchema,
  getAllSections,
  getSection,
  insertContactMessage,
  listContactMessages,
  openDb,
  upsertSection,
} from "./db.js";
import { logContactMailStatus, sendContactFormNotification } from "./mail.js";
import { mountFileUploads } from "./uploads.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Dev helper
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const db = openDb();
ensureSchema(db);

// Inserta secciones por defecto si faltan (BD vacía o nuevas claves como `map`).
{
  const insert = db.prepare("INSERT INTO sections(key, data, updatedAt) VALUES(?, ?, ?)");
  const hasKey = db.prepare("SELECT 1 FROM sections WHERE key = ?");
  const now = Date.now();
  const tx = db.transaction(() => {
    for (const [key, data] of Object.entries(DEFAULT_SECTIONS)) {
      if (!hasKey.get(key)) insert.run(key, JSON.stringify(data), now);
    }
  });
  tx();
}

// Siempre 200: { user: null } si no hay cookie o el JWT no vale (evita 401 en consola del navegador).
app.get("/api/auth/me", (req, res) => {
  const user = getOptionalAuthUser(req);
  res.json({ user });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "invalid_request" });
  }
  try {
    const ok = await verifyLogin({ username, password });
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });
    issueAuthCookie(res, { sub: username, role: "admin" }, req);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "server_error" });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get("/api/sections", (_req, res) => {
  const all = getAllSections(db);
  res.json(all);
});

app.get("/api/sections/:key", (req, res) => {
  const key = req.params.key;
  const section = getSection(db, key);
  if (!section) return res.status(404).json({ error: "not_found" });
  res.json(section);
});

app.put("/api/sections/:key", requireAuth, (req, res) => {
  const key = req.params.key;
  const data = req.body;
  if (!data || typeof data !== "object") return res.status(400).json({ error: "invalid_body" });
  const updated = upsertSection(db, key, data);
  res.json(updated);
});

app.post("/api/contact", (req, res) => {
  const parsed = parseContactPayload(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const ip = req.ip || req.socket?.remoteAddress || "";
  try {
    const row = insertContactMessage(db, { ...parsed, ip });
    void sendContactFormNotification({
      id: row.id,
      nombre: parsed.nombre,
      email: parsed.email,
      mensaje: parsed.mensaje,
      ip,
    }).catch((err) => {
      console.error("[mail] contact notification failed:", err?.message || err);
    });
    return res.status(201).json({ ok: true, id: row.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || "server_error" });
  }
});

app.get("/api/contact", requireAuth, (req, res) => {
  const limit = req.query.limit != null ? Number(req.query.limit) : 100;
  const messages = listContactMessages(db, limit);
  res.json({ messages });
});

mountFileUploads(app, { repoRoot, requireAuth });

// Serve React build in production
if (process.env.SERVE_FRONTEND === "1") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const webRoot = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(webRoot));
  app.get("*", (_req, res) => res.sendFile(path.join(webRoot, "index.html")));
}

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
  logContactMailStatus();
});

