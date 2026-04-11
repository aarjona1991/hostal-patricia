/** @typedef {Record<string, object>} SectionsMap */

const CONTENT_LOCALE_EN = "en";

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function mergeScalarOrString(base, patch) {
  if (patch === undefined || patch === null) return base;
  if (typeof base === "string" && typeof patch === "string") {
    return patch.trim() !== "" ? patch : base;
  }
  if (typeof patch === "string" && patch.trim() === "") return base;
  return patch;
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
 * Igual que en `frontend/src/lib/sectionI18n.js`: aplica `i18n.en` y omite la clave `i18n` en el resultado.
 * @param {object} section
 * @param {string} lang
 */
export function mergeSectionForLocale(section, lang) {
  if (!section || typeof section !== "object") return section;
  const { i18n, ...base } = section;
  if (lang !== CONTENT_LOCALE_EN) return { ...base };
  const patch = i18n?.en;
  if (!patch || typeof patch !== "object") return { ...base };
  return mergePatchOntoBase(base, patch);
}

/**
 * @param {SectionsMap} sections
 * @param {string} lang
 */
export function localizeSectionsMap(sections, lang) {
  if (!sections || typeof sections !== "object") return sections;
  /** @type {SectionsMap} */
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
