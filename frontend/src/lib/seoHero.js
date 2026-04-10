/** Coincide con el fallback en index.html y backend/src/seoInject.js */
export const DEFAULT_SEO_HERO_IMAGE =
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&h=630&fit=crop&q=85";

const DEFAULT_SEO_HERO_ALT = "Entorno tropical y mar cerca de Trinidad, Cuba";

function setMetaProperty(prop, content) {
  let el = document.head.querySelector(`meta[property="${prop}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaName(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * URL absoluta para og:image: hero.bgImageUrl o el fallback Unsplash.
 * @param {object} hero — sección hero (bgImageUrl, bgAlt)
 * @param {string} origin — ej. window.location.origin
 */
export function resolveShareImageUrl(hero, origin) {
  const raw = hero?.bgImageUrl != null ? String(hero.bgImageUrl).trim() : "";
  if (!raw) return DEFAULT_SEO_HERO_IMAGE;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(origin || "").replace(/\/$/, "");
  if (raw.startsWith("/")) return `${base}${raw}`;
  return `${base}/${raw}`;
}

export function resolveShareImageAlt(hero) {
  const a = hero?.bgAlt != null ? String(hero.bgAlt).trim() : "";
  return a || DEFAULT_SEO_HERO_ALT;
}

/**
 * Actualiza Open Graph, Twitter Card y JSON-LD con la imagen del Hero (SPA).
 */
export function applyHeroSeoMeta(hero) {
  if (typeof document === "undefined") return;
  const url = resolveShareImageUrl(hero, window.location.origin);
  const alt = resolveShareImageAlt(hero);

  setMetaProperty("og:image", url);
  setMetaProperty("og:image:secure_url", url);
  setMetaName("twitter:image", url);
  setMetaProperty("og:image:alt", alt);
  setMetaName("twitter:image:alt", alt);

  const ld = document.getElementById("seo-jsonld");
  if (!ld?.textContent) return;
  try {
    const data = JSON.parse(ld.textContent);
    const graph = data?.["@graph"];
    if (!Array.isArray(graph)) return;
    for (const node of graph) {
      if (node?.["@type"] === "WebPage" && node.primaryImageOfPage?.["@type"] === "ImageObject") {
        node.primaryImageOfPage.url = url;
      }
      if (node?.["@type"] === "LodgingBusiness" && typeof node.image === "string") {
        node.image = url;
      }
    }
    ld.textContent = JSON.stringify(data);
  } catch {
    /* ignore */
  }
}
