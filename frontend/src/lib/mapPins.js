/** Colores de marcadores del mapa (mantener alineados con `.section-location` en CSS). */
export const MAP_PIN_MAIN = "#b4533b";
export const MAP_PIN_NEAR = "#0d7377";

/** Misma clave que la lista de atractivos y los nombres en `map.main` / `map.nearby`. */
export function normalizeMapPinLabel(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Imagen para un pin del mapa: `imgUrl` explícito en JSON, o foto de la lista de ubicación.
 * `pinImages` debe mapear **claves ya normalizadas** (como en `LandingPage`).
 */
export function resolvePinImageUrl(pinImages, pinName, explicitImgUrl) {
  const ex = explicitImgUrl != null ? String(explicitImgUrl).trim() : "";
  if (ex) return ex;

  if (!pinImages || !pinName) return null;
  const pinKey = normalizeMapPinLabel(pinName);
  if (!pinKey) return null;

  if (pinImages instanceof Map) {
    const direct = pinImages.get(pinKey);
    if (direct) return direct;
  } else {
    const direct = pinImages[pinKey];
    if (direct) return direct;
  }

  const entries =
    pinImages instanceof Map ? [...pinImages.entries()] : Object.entries(pinImages);

  let bestUrl = "";
  let bestKeyLen = -1;
  for (const [attrKey, url] of entries) {
    const u = typeof url === "string" ? url.trim() : "";
    if (!u) continue;
    const ak = String(attrKey || "").trim();
    if (!ak) continue;
    const match =
      ak === pinKey || ak.startsWith(`${pinKey} `) || pinKey.startsWith(`${ak} `);
    if (match && ak.length > bestKeyLen) {
      bestUrl = u;
      bestKeyLen = ak.length;
    }
  }
  return bestUrl || null;
}
