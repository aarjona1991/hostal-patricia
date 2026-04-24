/** Rutas públicas ES ↔ EN (pathname sin basename; el Router aplica basename). */

export const ES_PATHS = {
  home: "/",
  rooms: "/habitaciones",
  services: "/servicios",
  about: "/sobre-nosotros",
  guide: "/guia-del-viajero",
  contact: "/contacto",
  privacy: "/privacidad",
  terms: "/terminos",
  cookies: "/cookies",
};

export const EN_PATHS = {
  home: "/en",
  rooms: "/en/rooms",
  services: "/en/services",
  about: "/en/about",
  guide: "/en/travel-guide",
  contact: "/en/contact",
  privacy: "/en/privacy",
  terms: "/en/terms",
  cookies: "/en/cookies",
};

const ES_TO_EN = new Map(
  Object.keys(ES_PATHS).map((k) => [ES_PATHS[k], EN_PATHS[k]])
);
const EN_TO_ES = new Map(
  Object.keys(EN_PATHS).map((k) => [EN_PATHS[k], ES_PATHS[k]])
);

export function langFromPathname(pathname) {
  const p = pathname || "/";
  if (p === "/en" || p.startsWith("/en/")) return "en";
  return "es";
}

export function homePathForLang(lang) {
  return lang === "en" ? EN_PATHS.home : ES_PATHS.home;
}

/** Formulario de reserva del Home (`#contacto`). Usar en nav, CTAs y botones «Reservar». */
export function pathForHomeReservation(lang) {
  return {
    pathname: homePathForLang(lang),
    hash: "#contacto",
  };
}

export function pathForPage(pageKey, lang) {
  const t = lang === "en" ? EN_PATHS : ES_PATHS;
  return t[pageKey] ?? (lang === "en" ? EN_PATHS.home : ES_PATHS.home);
}

/** Enlace al otro idioma conservando la página (y hash si aplica). */
export function alternateLanguageLocation(pathname, hash) {
  const p = pathname || "/";
  const normalized = p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p;
  const h = hash && hash.startsWith("#") ? hash : hash ? `#${hash}` : "";

  /** La página de contacto dedicada se alinea con el formulario en portada. */
  if (normalized === ES_PATHS.contact) {
    return { pathname: EN_PATHS.home, hash: "#contacto" };
  }
  if (normalized === EN_PATHS.contact) {
    return { pathname: ES_PATHS.home, hash: "#contacto" };
  }

  if (langFromPathname(normalized) === "es") {
    const target = ES_TO_EN.get(normalized);
    if (target) return { pathname: target, hash: h || undefined };
    if (normalized === ES_PATHS.home) return { pathname: EN_PATHS.home, hash: h || undefined };
    return { pathname: EN_PATHS.home, hash: h || undefined };
  }

  const target = EN_TO_ES.get(normalized);
  if (target) return { pathname: target, hash: h || undefined };
  if (normalized === EN_PATHS.home) return { pathname: ES_PATHS.home, hash: h || undefined };
  return { pathname: ES_PATHS.home, hash: h || undefined };
}
