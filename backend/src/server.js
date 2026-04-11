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
import {
  logContactMailStatus,
  sendContactFormNotification,
  verifyContactSmtpIfConfigured,
} from "./mail.js";
import { mountFileUploads } from "./uploads.js";
import { injectHeroSeo } from "./seoInject.js";
import { isAdminAdvertisingSectionEnabled } from "./adminFeatures.js";
import { localizeSectionsMap } from "./sectionI18n.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Dev helper
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const db = openDb(repoRoot);
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

// Galería: el seed solo rellena claves que faltan; si la BD ya tenía `gallery` con menos fotos,
// añadimos al final las del DEFAULT cuya imgUrl aún no exista (p. ej. nuevas fotos dummy en el repo).
{
  const row = getSection(db, "gallery");
  const def = DEFAULT_SECTIONS.gallery;
  if (row?.data && def?.photos?.length) {
    const data = row.data;
    const existing = Array.isArray(data.photos) ? data.photos : [];
    const urls = new Set(
      existing
        .map((p) => (p && typeof p.imgUrl === "string" ? p.imgUrl.trim() : ""))
        .filter(Boolean)
    );
    const toAdd = def.photos.filter((p) => {
      const u = p?.imgUrl != null ? String(p.imgUrl).trim() : "";
      return u && !urls.has(u);
    });
    if (toAdd.length > 0) {
      upsertSection(db, "gallery", {
        ...data,
        photos: [...existing, ...toAdd],
      });
      console.log("[sections] gallery: añadidas %d foto(s) desde seed (URLs nuevas)", toAdd.length);
    }
  }
}

// Siempre 200: { user: null } si no hay cookie o el JWT no vale (evita 401 en consola del navegador).
app.get("/api/auth/me", (req, res) => {
  const user = getOptionalAuthUser(req);
  const payload = { user };
  if (user) {
    payload.features = {
      advertisingSection: isAdminAdvertisingSectionEnabled(),
    };
  }
  res.json(payload);
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

// Cada sección puede incluir `i18n.en` (parche opcional de textos). Sin `?lang=en` se devuelve el JSON tal cual (admin / SPA).
app.get("/api/sections", (req, res) => {
  const all = getAllSections(db);
  const lang = String(req.query.lang || "").toLowerCase();
  if (lang === "en") return res.json(localizeSectionsMap(all, "en"));
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
    })
      .then((r) => {
        if (r?.skipped) {
          console.warn("[mail] aviso de contacto no enviado:", r.reason || "SMTP no configurado");
          return;
        }
        if (r?.sent) {
          console.log(
            "[mail] aviso de contacto enviado id=%s messageId=%s",
            row.id,
            r.messageId || "—"
          );
        }
      })
      .catch((err) => {
        console.error("[mail] contact notification failed:", err?.message || err);
        if (err?.code) console.error("[mail] código:", err.code);
        if (err?.responseCode != null)
          console.error("[mail] responseCode:", err.responseCode);
        if (err?.response) console.error("[mail] respuesta servidor:", err.response);
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
// Activo por defecto; deshabilitar con SERVE_FRONTEND=0 (p. ej. dev con Vite separado).
if (process.env.SERVE_FRONTEND !== "0") {
  const webDist = path.join(repoRoot, "frontend", "dist");
  if (!fs.existsSync(path.join(webDist, "index.html"))) {
    console.warn(
      "[SERVE_FRONTEND] Falta frontend/dist (index.html). repoRoot=%s — ejecuta en el monorepo: npm ci && npm run build",
      repoRoot
    );
  }

  const publicDir = path.join(repoRoot, "frontend", "public");
  function sendPublicOrDist(name, contentType) {
    return (_req, res) => {
      const fromDist = path.join(webDist, name);
      const fromPublic = path.join(publicDir, name);
      const file = fs.existsSync(fromDist) ? fromDist : fs.existsSync(fromPublic) ? fromPublic : null;
      if (!file) return res.status(404).type("text/plain").send("Not found");
      res.type(contentType).send(fs.readFileSync(file, "utf8"));
    };
  }
  // Antes del fallback SPA: ads.txt / robots / sitemap deben ser texto/XML, no index.html.
  app.get("/ads.txt", sendPublicOrDist("ads.txt", "text/plain; charset=utf-8"));
  app.get("/robots.txt", sendPublicOrDist("robots.txt", "text/plain; charset=utf-8"));
  app.get("/sitemap.xml", sendPublicOrDist("sitemap.xml", "application/xml; charset=utf-8"));

  // Si falta un .js/.css, express.static hace next() y el catch-all no debe devolver index.html
  // (MIME text/html en <script type="module">). Incluye txt/xml (ads.txt, etc.).
  const staticLike =
    /\.(?:js|mjs|cjs|css|map|json|ico|png|jpg|jpeg|gif|webp|svg|avif|woff2?|ttf|eot|webmanifest|txt|xml)$/i;
  app.use("/assets", express.static(path.join(webDist, "assets")));
  app.use(express.static(webDist));
  console.log("[SERVE_FRONTEND] repoRoot=%s webDist=%s", repoRoot, webDist);
  app.get("/*path", (req, res) => {
    const p = req.path;
    if (p === "/assets" || p.startsWith("/assets/") || staticLike.test(path.basename(p))) {
      return res.status(404).type("text/plain").send("Not found");
    }
    const indexPath = path.join(webDist, "index.html");
    if (!fs.existsSync(indexPath)) {
      return res.status(500).type("text/plain").send("Missing frontend/dist/index.html");
    }
    let html = fs.readFileSync(indexPath, "utf8");
    html = injectHeroSeo(html, req, db);
    res.type("html").send(html);
  });
}

const port = Number(process.env.PORT || 8787);
// Por defecto 0.0.0.0 para Hostinger hPanel (Node expuesto directamente sin proxy Nginx).
// En dev local con proxy: BIND_HOST=127.0.0.1
const bindHost = process.env.BIND_HOST || "0.0.0.0";
app.listen(port, bindHost, () => {
  console.log(`listening ${bindHost} ${port} (repoRoot=${repoRoot})`);
  logContactMailStatus();
  void verifyContactSmtpIfConfigured();
});

