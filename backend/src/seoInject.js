import { getSection } from "./db.js";

export const DEFAULT_SEO_HERO_IMAGE =
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&h=630&fit=crop&q=85";

const DEFAULT_SEO_HERO_ALT = "Entorno tropical y mar cerca de Trinidad, Cuba";

function escapeHtmlAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function absoluteUrl(req, raw) {
  const t = String(raw || "").trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const envBase = process.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  const host = req.get("x-forwarded-host") || req.get("host") || "";
  const proto =
    req.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" && process.env.FORCE_HTTPS !== "0" ? "https" : req.protocol) ||
    "https";
  const origin = envBase || (host ? `${proto}://${host}` : "");
  if (!origin) return t.startsWith("/") ? t : `/${t}`;
  if (t.startsWith("/")) return `${origin}${t}`;
  return `${origin}/${t}`;
}

/**
 * Sustituye placeholders en index.html por la imagen/alt del Hero (API sections).
 */
export function injectHeroSeo(html, req, db) {
  let imageUrl = DEFAULT_SEO_HERO_IMAGE;
  let alt = DEFAULT_SEO_HERO_ALT;
  try {
    const row = getSection(db, "hero");
    const hero = row?.data && typeof row.data === "object" ? row.data : {};
    const raw = hero.bgImageUrl != null ? String(hero.bgImageUrl).trim() : "";
    if (raw) {
      const abs = absoluteUrl(req, raw);
      if (abs) imageUrl = abs;
    }
    if (hero.bgAlt != null && String(hero.bgAlt).trim()) {
      alt = String(hero.bgAlt).trim();
    }
  } catch {
    /* BD no lista: fallback */
  }
  const imgEsc = escapeHtmlAttr(imageUrl);
  const altEsc = escapeHtmlAttr(alt);
  let out = html
    .replace(/__SEO_HERO_IMAGE__/g, imgEsc)
    .replace(/__SEO_HERO_IMAGE_ALT__/g, altEsc);
  if (imageUrl !== DEFAULT_SEO_HERO_IMAGE) {
    out = out.split(DEFAULT_SEO_HERO_IMAGE).join(imageUrl);
  }
  return out;
}
