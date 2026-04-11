/** Idioma canónico del CMS (campos en la raíz de cada sección). */
export const CONTENT_LOCALE_ES = "es";
/** Traducciones opcionales bajo `section.i18n.en`. */
export const CONTENT_LOCALE_EN = "en";

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Combina borrador EN sobre la sección en español (para guardar desde el admin).
 * @param {object|null|undefined} target
 * @param {object|null|undefined} source
 */
export function deepMergeEn(target, source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return target && typeof target === "object" && !Array.isArray(target) ? { ...target } : {};
  }
  const base = target && typeof target === "object" && !Array.isArray(target) ? { ...target } : {};
  for (const [k, v] of Object.entries(source)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      const prev = Array.isArray(base[k]) ? base[k] : [];
      base[k] = mergeEnArrays(prev, v);
    } else if (isPlainObject(v)) {
      base[k] = deepMergeEn(base[k] || {}, v);
    } else {
      base[k] = v;
    }
  }
  return base;
}

function mergeEnArrays(prev, next) {
  const out = [...prev];
  for (let i = 0; i < next.length; i++) {
    const n = next[i];
    if (n === undefined) continue;
    const p = prev[i];
    if (isPlainObject(n) && isPlainObject(p)) {
      out[i] = deepMergeEn(p, n);
    } else {
      out[i] = n;
    }
  }
  return out;
}

/**
 * Valor mostrado en el admin para el idioma secundario (vacío = se usará el español en la web).
 */
export function readLocaleField(draft, contentLang, ...path) {
  const root = contentLang === CONTENT_LOCALE_ES ? draft : draft?.i18n?.en;
  let cur = root;
  for (const k of path) {
    if (cur == null) return "";
    cur = cur[k];
  }
  if (cur == null) return "";
  return cur;
}

function mergeScalarOrString(base, patch) {
  if (patch === undefined || patch === null) return base;
  if (typeof base === "string" && typeof patch === "string") {
    return patch.trim() !== "" ? patch : base;
  }
  if (typeof patch === "string" && patch.trim() === "") return base;
  return patch;
}

/**
 * Aplica `section.i18n.en` sobre la sección sin `i18n` (vista pública).
 */
export function mergeSectionForLocale(section, lang) {
  if (!section || typeof section !== "object") return section;
  const { i18n, ...base } = section;
  if (lang !== CONTENT_LOCALE_EN) return { ...base };
  const patch = i18n?.en;
  if (!patch || typeof patch !== "object") return { ...base };
  return mergePatchOntoBase(base, patch);
}

function mergePatchOntoBase(base, patch) {
  if (patch === undefined || patch === null) return base;
  if (Array.isArray(base) && Array.isArray(patch)) {
    return base.map((b, i) => {
      const pi = patch[i];
      if (pi === undefined || pi === null) return b;
      if (typeof b === "string" && typeof pi === "string") return mergeScalarOrString(b, pi);
      if (isPlainObject(b) && isPlainObject(pi)) return mergePatchOntoBase(b, pi);
      return b;
    });
  }
  if (isPlainObject(base) && isPlainObject(patch)) {
    const out = { ...base };
    for (const [k, v] of Object.entries(patch)) {
      if (k === "i18n") continue;
      if (!(k in base)) {
        if (v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")) {
          out[k] = v;
        }
        continue;
      }
      const b = base[k];
      if (Array.isArray(b) && Array.isArray(v)) {
        out[k] = b.map((item, i) => {
          const pi = v[i];
          if (pi === undefined || pi === null) return item;
          if (typeof item === "string" && typeof pi === "string") {
            return mergeScalarOrString(item, pi);
          }
          if (isPlainObject(item) && isPlainObject(pi)) {
            return mergePatchOntoBase(item, pi);
          }
          return item;
        });
      } else if (isPlainObject(b) && isPlainObject(v)) {
        out[k] = mergePatchOntoBase(b, v);
      } else {
        out[k] = mergeScalarOrString(b, v);
      }
    }
    return out;
  }
  if (typeof base === "string" && typeof patch === "string") {
    return mergeScalarOrString(base, patch);
  }
  return base;
}

/**
 * @param {Record<string, object>} sections — respuesta de GET /api/sections
 * @param {string} lang — `es` | `en`
 */
export function localizeSectionsMap(sections, lang) {
  if (!sections || typeof sections !== "object") return sections;
  /** @type {Record<string, object>} */
  const out = {};
  for (const [key, sec] of Object.entries(sections)) {
    if (sec && typeof sec === "object") {
      out[key] = mergeSectionForLocale(sec, lang);
    } else {
      out[key] = sec;
    }
  }
  return out;
}
