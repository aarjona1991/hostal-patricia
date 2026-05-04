/**
 * Decide qué anuncio mostrar según la sección `ads` del CMS.
 * - `adProvider` ausente o `"adsense"`: requiere `adClient` + `adSlot`.
 * - `"adsterra"`: requiere `adsterraKey` + `adsterraInvokeUrl` (URL del `invoke.js` del panel de AdsTerra).
 *
 * @param {Record<string, unknown> | null | undefined} ads
 */
export function buildPublicAdPlacement(ads) {
  if (!ads || typeof ads !== "object" || ads.enabled === false) return null;

  const label = typeof ads.label === "string" ? ads.label.trim() : "";
  const prov = String(ads.adProvider || "adsense")
    .trim()
    .toLowerCase();

  if (prov === "adsterra") {
    const adsterraKey = String(ads.adsterraKey || "").trim();
    const invokeUrl = normalizeHttpUrl(String(ads.adsterraInvokeUrl || "").trim());
    if (!adsterraKey || !invokeUrl) return null;
    const w = Number(ads.adsterraWidth);
    const h = Number(ads.adsterraHeight);
    return {
      provider: "adsterra",
      adsterraKey,
      adsterraInvokeUrl: invokeUrl,
      adsterraWidth: Number.isFinite(w) && w > 0 ? w : 300,
      adsterraHeight: Number.isFinite(h) && h > 0 ? h : 250,
      label,
    };
  }

  const adClient = String(ads.adClient || "").trim();
  const adSlot = String(ads.adSlot || "").trim();
  if (!adClient || !adSlot) return null;
  return { provider: "adsense", adClient, adSlot, label };
}

/** Acepta `https://…/invoke.js` o `//host/…/invoke.js`. */
function normalizeHttpUrl(raw) {
  if (!raw) return "";
  try {
    const u = new URL(raw.startsWith("//") ? `https:${raw}` : raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.toString();
  } catch {
    return "";
  }
}

/** Clave estable para `key` en React cuando cambia la configuración del anuncio. */
export function placementStableKey(p) {
  if (!p) return "";
  if (p.provider === "adsterra") {
    return `adsterra:${p.adsterraKey}:${p.adsterraInvokeUrl}:${p.adsterraWidth}:${p.adsterraHeight}`;
  }
  return `adsense:${p.adClient}:${p.adSlot}`;
}

/**
 * Anuncio en lightboxes de galería.
 * - AdSense: misma unidad que el bloque principal (comportamiento anterior).
 * - AdsTerra: hace falta una **segunda** unidad (`adsterraKeyGallery` + URL); si falta, no hay anuncio en la galería
 *   (la principal sigue solo debajo del formulario). Si la clave coincide con la principal, se ignora.
 *
 * @param {Record<string, unknown> | null | undefined} ads
 */
export function buildLightboxAdPlacement(ads) {
  if (!ads || typeof ads !== "object" || ads.enabled === false) return null;

  const label = typeof ads.label === "string" ? ads.label.trim() : "";
  const prov = String(ads.adProvider || "adsense")
    .trim()
    .toLowerCase();

  if (prov === "adsense") {
    return buildPublicAdPlacement(ads);
  }

  if (prov !== "adsterra") return null;

  const mainKey = String(ads.adsterraKey || "").trim();
  const gk = String(ads.adsterraKeyGallery || "").trim();
  const gu = normalizeHttpUrl(String(ads.adsterraInvokeUrlGallery || "").trim());
  if (!gk || !gu) return null;
  if (gk === mainKey) return null;

  const w = Number(ads.adsterraWidthGallery);
  const h = Number(ads.adsterraHeightGallery);
  return {
    provider: "adsterra",
    adsterraKey: gk,
    adsterraInvokeUrl: gu,
    adsterraWidth: Number.isFinite(w) && w > 0 ? w : 300,
    adsterraHeight: Number.isFinite(h) && h > 0 ? h : 250,
    label,
  };
}
