import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isMonorepoRoot(dir) {
  const pkgPath = path.join(dir, "package.json");
  const frontendDir = path.join(dir, "frontend");
  if (!fs.existsSync(pkgPath) || !fs.existsSync(frontendDir)) return false;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const ws = pkg.workspaces;
    return Array.isArray(ws) && ws.some((w) => String(w).includes("frontend"));
  } catch {
    return false;
  }
}

/**
 * Raíz del monorepo: backend/dist → ../.. (típico); Hostinger a veces añade un nivel → ../../..
 * MONOREPO_ROOT solo si es ruta absoluta (p. ej. /home/.../nodejs/app). Valores tipo domains/... se ignoran.
 */
function resolveMonorepoRoot(entryDir) {
  const raw = process.env.MONOREPO_ROOT?.trim();
  if (raw) {
    if (!path.isAbsolute(raw)) {
      console.warn(
        "[MONOREPO_ROOT] Valor ignorado (debe ser absoluta, p. ej. /home/usuario/.../nodejs/app): %s",
        raw
      );
    } else {
      const abs = path.normalize(raw);
      if (isMonorepoRoot(abs)) return abs;
      console.warn(
        "[MONOREPO_ROOT] %s no tiene package.json+workspaces+frontend/; se intenta autodetectar desde __dirname.",
        abs
      );
    }
  }

  const hops = [path.resolve(entryDir, "../.."), path.resolve(entryDir, "../../..")];
  for (const c of hops) {
    if (isMonorepoRoot(c)) return c;
  }

  let dir = path.resolve(entryDir);
  for (let i = 0; i < 12; i++) {
    if (isMonorepoRoot(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return path.resolve(entryDir, "../..");
}

const repoRoot = resolveMonorepoRoot(__dirname);
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

// Serve React build in production (repoRoot ya resuelve bien desde backend/dist en Hostinger).
if (process.env.SERVE_FRONTEND === "1") {
  const webDist = path.join(repoRoot, "frontend", "dist");
  if (!fs.existsSync(path.join(webDist, "index.html"))) {
    console.warn(
      "[SERVE_FRONTEND] Falta frontend/dist (index.html). repoRoot=%s — ejecuta en el monorepo: npm ci && npm run build",
      repoRoot
    );
  }
  // Si falta un .js/.css, express.static hace next() y el catch-all no debe devolver index.html
  // (MIME text/html en <script type="module">).
  const staticLike = /\.(?:js|mjs|cjs|css|map|json|ico|png|jpg|jpeg|gif|webp|svg|avif|woff2?|ttf|eot|webmanifest)$/i;
  app.use("/assets", express.static(path.join(webDist, "assets")));
  app.use(express.static(webDist));
  console.log("[SERVE_FRONTEND] repoRoot=%s webDist=%s", repoRoot, webDist);
  app.get("*", (req, res) => {
    const p = req.path;
    if (p === "/assets" || p.startsWith("/assets/") || staticLike.test(path.basename(p))) {
      return res.status(404).type("text/plain").send("Not found");
    }
    res.sendFile(path.join(webDist, "index.html"));
  });
}

const port = Number(process.env.PORT || 8787);
// Por defecto solo loopback IPv4: encaja con .htaccess → 127.0.0.1 y no expone el API a la red.
// En Docker o acceso LAN: BIND_HOST=0.0.0.0
const bindHost = process.env.BIND_HOST || "127.0.0.1";
app.listen(port, bindHost, () => {
  console.log(`listening ${bindHost} ${port} (repoRoot=${repoRoot})`);
  logContactMailStatus();
});

