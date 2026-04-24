import React from "react";
import { ImageUrlField } from "./ImageUrlField.jsx";
import { SocialNavIcon } from "../components/SocialNavIcon.jsx";
import { CONTENT_LOCALE_ES, deepMergeEn, readLocaleField } from "../lib/sectionI18n.js";

function moveItem(arr, index, delta) {
  const next = index + delta;
  if (next < 0 || next >= arr.length) return arr;
  const copy = [...arr];
  const t = copy[index];
  copy[index] = copy[next];
  copy[next] = t;
  return copy;
}

function preventDetailsToggle(e) {
  e.preventDefault();
  e.stopPropagation();
}

function actionBtn(handler, { enabled = true } = {}) {
  return (e) => {
    // Evita que el <summary> del <details> capture el gesto y haga toggle.
    e.preventDefault();
    e.stopPropagation();
    if (!enabled) return;
    handler?.();
  };
}

function StringListEditor({ label, items = [], onChange, addLabel = "Añadir", readOnlyStructure = false }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="adm-field">
      <label>{label}</label>
      {list.map((text, i) => (
        <div key={i} className="adm-list-row">
          <input
            type="text"
            className="adm-input"
            value={text}
            onChange={(e) => {
              const n = [...list];
              n[i] = e.target.value;
              onChange(n);
            }}
          />
          {readOnlyStructure ? null : (
            <>
              <button
                type="button"
                className="adm-icon-btn"
                title="Subir"
                disabled={i === 0}
                onClick={() => onChange(moveItem(list, i, -1))}
              >
                ↑
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                title="Bajar"
                disabled={i === list.length - 1}
                onClick={() => onChange(moveItem(list, i, 1))}
              >
                ↓
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                title="Eliminar"
                onClick={() => onChange(list.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </>
          )}
        </div>
      ))}
      {readOnlyStructure ? null : (
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" style={{ marginTop: 8 }} onClick={() => onChange([...list, ""])}>
          + {addLabel}
        </button>
      )}
    </div>
  );
}

/** Lista de párrafos largos (p. ej. página /servicios): un textarea por ítem. */
function TextBlockListEditor({ label, items = [], onChange, addLabel = "Añadir párrafo", readOnlyStructure = false }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="adm-field">
      <label>{label}</label>
      {list.map((text, i) => (
        <div key={i} className="adm-list-row" style={{ alignItems: "stretch", marginBottom: 10 }}>
          <textarea
            className="adm-textarea"
            rows={4}
            style={{ flex: 1, minWidth: 0 }}
            value={text}
            onChange={(e) => {
              const n = [...list];
              n[i] = e.target.value;
              onChange(n);
            }}
          />
          {readOnlyStructure ? null : (
            <>
              <button
                type="button"
                className="adm-icon-btn"
                title="Subir"
                disabled={i === 0}
                onClick={() => onChange(moveItem(list, i, -1))}
              >
                ↑
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                title="Bajar"
                disabled={i === list.length - 1}
                onClick={() => onChange(moveItem(list, i, 1))}
              >
                ↓
              </button>
              <button type="button" className="adm-icon-btn" title="Eliminar" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                ×
              </button>
            </>
          )}
        </div>
      ))}
      {readOnlyStructure ? null : (
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" style={{ marginTop: 8 }} onClick={() => onChange([...list, ""])}>
          + {addLabel}
        </button>
      )}
    </div>
  );
}

function ExperienceCardsEditor({ cards = [], onChange, localeMode = "es", onEnCardPatch }) {
  const list = Array.isArray(cards) ? cards : [];
  const isEs = localeMode === "es";
  return (
    <div className="adm-field">
      <label>Tarjetas (experiencias)</label>
      {list.map((c, i) => (
        <details key={i} className="adm-subpanel">
          <summary className="adm-subpanel-head">
            <span>Tarjeta {i + 1}</span>
            {isEs ? (
              <div className="adm-row-actions">
                <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={actionBtn(() => onChange(moveItem(list, i, -1)), { enabled: i !== 0 })}>
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-icon-btn"
                  disabled={i === list.length - 1}
                  onClick={actionBtn(() => onChange(moveItem(list, i, 1)), { enabled: i !== list.length - 1 })}
                >
                  ↓
                </button>
                <button type="button" className="adm-icon-btn" onClick={actionBtn(() => onChange(list.filter((_, j) => j !== i)))}>
                  ×
                </button>
              </div>
            ) : null}
          </summary>
          <div className="adm-subpanel-body">
          {isEs ? (
            <ImageUrlField
              label="Imagen"
              value={c.imgUrl || ""}
              onChange={(url) => {
                const n = [...list];
                n[i] = { ...n[i], imgUrl: url };
                onChange(n);
              }}
            />
          ) : (
            <p className="adm-text-muted" style={{ marginTop: 0 }}>
              Imagen (definida en Español): {(c.imgUrl || "").trim() || "—"}
            </p>
          )}
          <div className="adm-field">
            <label>Texto alternativo (alt)</label>
            <input
              type="text"
              className="adm-input"
              value={c.alt || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], alt: e.target.value };
                  onChange(n);
                } else {
                  onEnCardPatch?.(i, { alt: e.target.value });
                }
              }}
            />
          </div>
          <div className="adm-field">
            <label>Título</label>
            <input
              type="text"
              className="adm-input"
              value={c.title || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], title: e.target.value };
                  onChange(n);
                } else {
                  onEnCardPatch?.(i, { title: e.target.value });
                }
              }}
            />
          </div>
          <div className="adm-field">
            <label>Descripción</label>
            <textarea
              className="adm-textarea"
              rows={3}
              value={c.body || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], body: e.target.value };
                  onChange(n);
                } else {
                  onEnCardPatch?.(i, { body: e.target.value });
                }
              }}
            />
          </div>
          </div>
        </details>
      ))}
      {isEs ? (
        <button
          type="button"
          className="adm-btn adm-btn-ghost adm-btn-sm"
          onClick={() => onChange([...list, { imgUrl: "", alt: "", title: "", body: "" }])}
        >
          + Añadir tarjeta
        </button>
      ) : null}
    </div>
  );
}

function GalleryPhotosEditor({ photos = [], onChange, localeMode = "es", onEnPhotoPatch }) {
  const list = Array.isArray(photos) ? photos : [];
  const isEs = localeMode === "es";
  return (
    <div className="adm-field">
      <label>Fotos</label>
      <p className="adm-text-muted" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        Sube imágenes o pega URL. En la web se muestran en cuadrícula; al hacer clic se abren en grande (lightbox). La leyenda bajo la miniatura es opcional.
      </p>
      {list.map((p, i) => (
        <details key={i} className="adm-subpanel">
          <summary className="adm-subpanel-head">
            <span>Foto {i + 1}</span>
            {isEs ? (
              <div className="adm-row-actions">
                <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={actionBtn(() => onChange(moveItem(list, i, -1)), { enabled: i !== 0 })}>
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-icon-btn"
                  disabled={i === list.length - 1}
                  onClick={actionBtn(() => onChange(moveItem(list, i, 1)), { enabled: i !== list.length - 1 })}
                >
                  ↓
                </button>
                <button type="button" className="adm-icon-btn" onClick={actionBtn(() => onChange(list.filter((_, j) => j !== i)))}>
                  ×
                </button>
              </div>
            ) : null}
          </summary>
          <div className="adm-subpanel-body">
          {isEs ? (
            <ImageUrlField
              label="Imagen"
              value={p.imgUrl || ""}
              onChange={(url) => {
                const n = [...list];
                n[i] = { ...n[i], imgUrl: url };
                onChange(n);
              }}
            />
          ) : (
            <p className="adm-text-muted" style={{ marginTop: 0 }}>
              Imagen (definida en Español): {(p.imgUrl || "").trim() || "—"}
            </p>
          )}
          <div className="adm-field">
            <label>Texto alternativo (alt)</label>
            <input
              type="text"
              className="adm-input"
              value={p.alt || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], alt: e.target.value };
                  onChange(n);
                } else {
                  onEnPhotoPatch?.(i, { alt: e.target.value });
                }
              }}
            />
          </div>
          <div className="adm-field">
            <label>Leyenda visible (opcional)</label>
            <input
              type="text"
              className="adm-input"
              value={p.caption || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  const v = e.target.value;
                  const next = { ...n[i] };
                  if (v.trim()) next.caption = v;
                  else delete next.caption;
                  n[i] = next;
                  onChange(n);
                } else {
                  const v = e.target.value;
                  onEnPhotoPatch?.(i, v.trim() ? { caption: v } : { caption: "" });
                }
              }}
              placeholder="Ej. Patio, Desayuno, Playa…"
            />
          </div>
          </div>
        </details>
      ))}
      {isEs ? (
        <button
          type="button"
          className="adm-btn adm-btn-ghost adm-btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => onChange([...list, { imgUrl: "", alt: "", caption: "" }])}
        >
          + Añadir foto
        </button>
      ) : null}
    </div>
  );
}

function RoomCardsEditor({ cards = [], onChange, localeMode = "es", onEnCardPatch }) {
  const list = Array.isArray(cards) ? cards : [];
  const isEs = localeMode === "es";
  const structureLocked = !isEs;
  return (
    <div className="adm-field">
      <label>Tarjetas (habitaciones)</label>
      {list.map((c, i) => (
        <details key={i} className="adm-subpanel">
          <summary className="adm-subpanel-head">
            <span>Habitación {i + 1}</span>
            <div className="adm-row-actions">
              <button
                type="button"
                className="adm-icon-btn"
                title={structureLocked ? "Para reordenar, cambia a Español" : "Subir"}
                disabled={structureLocked || i === 0}
                onClick={actionBtn(() => onChange(moveItem(list, i, -1)), { enabled: !structureLocked && i !== 0 })}
              >
                ↑
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                title={structureLocked ? "Para reordenar, cambia a Español" : "Bajar"}
                disabled={structureLocked || i === list.length - 1}
                onClick={actionBtn(() => onChange(moveItem(list, i, 1)), { enabled: !structureLocked && i !== list.length - 1 })}
              >
                ↓
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                title={structureLocked ? "Para eliminar, cambia a Español" : "Eliminar"}
                disabled={structureLocked}
                onClick={actionBtn(() => onChange(list.filter((_, j) => j !== i)), { enabled: !structureLocked })}
              >
                ×
              </button>
            </div>
          </summary>
          <div className="adm-subpanel-body">
          {isEs ? (
            <ImageUrlField
              label="Imagen"
              value={c.imgUrl || ""}
              onChange={(url) => {
                const n = [...list];
                n[i] = { ...n[i], imgUrl: url };
                onChange(n);
              }}
            />
          ) : (
            <p className="adm-text-muted" style={{ marginTop: 0 }}>
              Imagen (definida en Español): {(c.imgUrl || "").trim() || "—"}
            </p>
          )}
          <div className="adm-field">
            <label>Alt</label>
            <input
              type="text"
              className="adm-input"
              value={c.alt || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], alt: e.target.value };
                  onChange(n);
                } else {
                  onEnCardPatch?.(i, { alt: e.target.value });
                }
              }}
            />
          </div>
          <div className="adm-field">
            <label>Título</label>
            <input
              type="text"
              className="adm-input"
              value={c.title || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], title: e.target.value };
                  onChange(n);
                } else {
                  onEnCardPatch?.(i, { title: e.target.value });
                }
              }}
            />
          </div>
          <div className="adm-field">
            <label>Descripción</label>
            <textarea
              className="adm-textarea"
              rows={3}
              value={c.body || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], body: e.target.value };
                  onChange(n);
                } else {
                  onEnCardPatch?.(i, { body: e.target.value });
                }
              }}
            />
          </div>
          <div className="adm-field">
            <label>Etiqueta (opcional, ej. “Más solicitada”)</label>
            <input
              type="text"
              className="adm-input"
              value={c.badge || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  const v = e.target.value.trim();
                  const next = { ...n[i] };
                  if (v) next.badge = v;
                  else delete next.badge;
                  n[i] = next;
                  onChange(n);
                } else {
                  const v = e.target.value.trim();
                  onEnCardPatch?.(i, v ? { badge: v } : { badge: "" });
                }
              }}
              placeholder="Vacío = sin badge"
            />
          </div>
          </div>
        </details>
      ))}
      {isEs ? (
        <button
          type="button"
          className="adm-btn adm-btn-ghost adm-btn-sm"
          onClick={() => onChange([...list, { imgUrl: "", alt: "", title: "", body: "" }])}
        >
          + Añadir habitación
        </button>
      ) : null}
    </div>
  );
}

/** Ítems de la página /habitaciones: varias imágenes + texto por habitación. */
function RoomPageItemsEditor({ draft, setDraft, patch, patchEnItem, localeMode, localeHint, rf, isEs }) {
  const list = Array.isArray(draft.pageItems) ? draft.pageItems : [];
  const pageItemsForForm = isEs
    ? list
    : list.map((it, i) => ({
        ...it,
        title: draft.i18n?.en?.pageItems?.[i]?.title ?? "",
        body: draft.i18n?.en?.pageItems?.[i]?.body ?? "",
        images: (Array.isArray(it.images) ? it.images : []).map((img, j) => ({
          imgUrl: img.imgUrl,
          alt: draft.i18n?.en?.pageItems?.[i]?.images?.[j]?.alt ?? img.alt ?? "",
        })),
      }));

  const patchEnImageAlt = (itemIndex, imageIndex, alt) => {
    setDraft((d) => {
      const en = { ...(d.i18n?.en || {}) };
      const pi = Array.isArray(en.pageItems) ? [...en.pageItems] : [];
      while (pi.length <= itemIndex) pi.push({});
      const row = { ...(pi[itemIndex] || {}) };
      const imgs = Array.isArray(row.images) ? [...row.images] : [];
      while (imgs.length <= imageIndex) imgs.push({});
      imgs[imageIndex] = { ...(imgs[imageIndex] || {}), alt };
      row.images = imgs;
      pi[itemIndex] = row;
      return { ...d, i18n: { ...d.i18n, en: deepMergeEn(en, { pageItems: pi }) } };
    });
  };

  return (
    <div className="adm-field" style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(148,163,184,0.35)" }}>
      <label style={{ fontWeight: 700 }}>Página «Habitaciones» (/habitaciones)</label>
      <p className="adm-text-muted" style={{ marginTop: "0.35rem", marginBottom: "1rem" }}>
        Cada ítem es una tarjeta: mini carrusel de fotos a la izquierda y descripción a la derecha. En la web, al pulsar una foto se abre el visor ampliado (lightbox).
      </p>
      {localeHint}
      <div className="adm-field">
        <label>Título principal (H1) de la página</label>
        <input type="text" className="adm-input" value={rf("pageH1") || ""} onChange={(e) => patch({ pageH1: e.target.value })} />
      </div>
      <div className="adm-field">
        <label>Texto bajo el título (opcional, una o dos líneas)</label>
        <textarea className="adm-textarea" rows={2} value={rf("pageLead") || ""} onChange={(e) => patch({ pageLead: e.target.value })} />
      </div>
      <div className="adm-field">
        <label>Título del navegador (SEO, pestaña del navegador)</label>
        <input type="text" className="adm-input" value={rf("pageSeoTitle") || ""} onChange={(e) => patch({ pageSeoTitle: e.target.value })} />
      </div>

      {pageItemsForForm.map((it, itemIdx) => (
        <details key={itemIdx} className="adm-subpanel" style={{ marginTop: "1rem" }}>
          <summary className="adm-subpanel-head">
            <span>Habitación (página detalle) {itemIdx + 1}</span>
            <div className="adm-row-actions">
              <button
                type="button"
                className="adm-icon-btn"
                title={!isEs ? "Para reordenar, cambia a Español" : "Subir"}
                disabled={!isEs || itemIdx === 0}
                onClick={actionBtn(() => patch({ pageItems: moveItem(list, itemIdx, -1) }), { enabled: isEs && itemIdx !== 0 })}
              >
                ↑
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                title={!isEs ? "Para reordenar, cambia a Español" : "Bajar"}
                disabled={!isEs || itemIdx === list.length - 1}
                onClick={actionBtn(() => patch({ pageItems: moveItem(list, itemIdx, 1) }), { enabled: isEs && itemIdx !== list.length - 1 })}
              >
                ↓
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                title={!isEs ? "Para eliminar, cambia a Español" : "Eliminar"}
                disabled={!isEs}
                onClick={actionBtn(() => patch({ pageItems: list.filter((_, j) => j !== itemIdx) }), { enabled: isEs })}
              >
                ×
              </button>
            </div>
          </summary>
          <div className="adm-subpanel-body">
          <div className="adm-field">
            <label>Título del ítem</label>
            <input
              type="text"
              className="adm-input"
              value={it.title || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[itemIdx] = { ...n[itemIdx], title: e.target.value };
                  patch({ pageItems: n });
                } else {
                  patchEnItem("pageItems", itemIdx, { title: e.target.value });
                }
              }}
            />
          </div>
          <div className="adm-field">
            <label>Descripción (puedes usar párrafos separados con línea en blanco)</label>
            <textarea
              className="adm-textarea"
              rows={5}
              value={it.body || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[itemIdx] = { ...n[itemIdx], body: e.target.value };
                  patch({ pageItems: n });
                } else {
                  patchEnItem("pageItems", itemIdx, { body: e.target.value });
                }
              }}
            />
          </div>
          <div className="adm-field">
            <label>Fotos del carrusel</label>
            {(Array.isArray(it.images) ? it.images : []).map((img, j) => (
              <details key={j} className="adm-subpanel" style={{ marginTop: "0.65rem" }}>
                <summary className="adm-subpanel-head">
                  <span>Foto {j + 1}</span>
                  <div className="adm-row-actions">
                    <button
                      type="button"
                      className="adm-icon-btn"
                      title={!isEs ? "Para reordenar, cambia a Español" : "Subir"}
                      disabled={!isEs || j === 0}
                      onClick={actionBtn(() => {
                        const n = [...list];
                        const imgs = [...(Array.isArray(n[itemIdx].images) ? n[itemIdx].images : [])];
                        n[itemIdx] = { ...n[itemIdx], images: moveItem(imgs, j, -1) };
                        patch({ pageItems: n });
                      }, { enabled: isEs && j !== 0 })}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn"
                      title={!isEs ? "Para reordenar, cambia a Español" : "Bajar"}
                      disabled={!isEs || j === (it.images || []).length - 1}
                      onClick={actionBtn(() => {
                        const n = [...list];
                        const imgs = [...(Array.isArray(n[itemIdx].images) ? n[itemIdx].images : [])];
                        n[itemIdx] = { ...n[itemIdx], images: moveItem(imgs, j, 1) };
                        patch({ pageItems: n });
                      }, { enabled: isEs && j !== (it.images || []).length - 1 })}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn"
                      title={!isEs ? "Para eliminar, cambia a Español" : "Eliminar"}
                      disabled={!isEs}
                      onClick={actionBtn(() => {
                        const n = [...list];
                        const imgs = (Array.isArray(n[itemIdx].images) ? n[itemIdx].images : []).filter((_, k) => k !== j);
                        n[itemIdx] = { ...n[itemIdx], images: imgs };
                        patch({ pageItems: n });
                      }, { enabled: isEs })}
                    >
                      ×
                    </button>
                  </div>
                </summary>
                <div className="adm-subpanel-body">
                {isEs ? (
                  <ImageUrlField
                    label="URL imagen"
                    value={img.imgUrl || ""}
                    onChange={(url) => {
                      const n = [...list];
                      const imgs = [...(Array.isArray(n[itemIdx].images) ? n[itemIdx].images : [])];
                      imgs[j] = { ...imgs[j], imgUrl: url };
                      n[itemIdx] = { ...n[itemIdx], images: imgs };
                      patch({ pageItems: n });
                    }}
                  />
                ) : (
                  <p className="adm-text-muted" style={{ marginTop: 0 }}>
                    Imagen (definida en Español): {(img.imgUrl || "").trim() || "—"}
                  </p>
                )}
                <div className="adm-field">
                  <label>Texto alternativo (alt)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={img.alt || ""}
                    onChange={(e) => {
                      if (isEs) {
                        const n = [...list];
                        const imgs = [...(Array.isArray(n[itemIdx].images) ? n[itemIdx].images : [])];
                        imgs[j] = { ...imgs[j], alt: e.target.value };
                        n[itemIdx] = { ...n[itemIdx], images: imgs };
                        patch({ pageItems: n });
                      } else {
                        patchEnImageAlt(itemIdx, j, e.target.value);
                      }
                    }}
                  />
                </div>
                </div>
              </details>
            ))}
            {isEs ? (
              <button
                type="button"
                className="adm-btn adm-btn-ghost adm-btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => {
                  const n = [...list];
                  const imgs = [...(Array.isArray(n[itemIdx].images) ? n[itemIdx].images : [])];
                  imgs.push({ imgUrl: "", alt: "" });
                  n[itemIdx] = { ...n[itemIdx], images: imgs };
                  patch({ pageItems: n });
                }}
              >
                + Añadir foto a este ítem
              </button>
            ) : null}
          </div>
          </div>
        </details>
      ))}
      {isEs ? (
        <button
          type="button"
          className="adm-btn adm-btn-ghost adm-btn-sm"
          style={{ marginTop: 12 }}
          onClick={() =>
            patch({
              pageItems: [...list, { title: "", body: "", images: [{ imgUrl: "", alt: "" }] }],
            })
          }
        >
          + Añadir habitación a la página detalle
        </button>
      ) : null}
    </div>
  );
}

function normalizeAttractionDraft(raw) {
  if (raw == null) return { text: "", imgUrl: "", alt: "" };
  if (typeof raw === "string") return { text: raw, imgUrl: "", alt: "" };
  return {
    text: raw.text != null ? String(raw.text) : raw.title != null ? String(raw.title) : "",
    imgUrl: raw.imgUrl != null ? String(raw.imgUrl) : "",
    alt: raw.alt != null ? String(raw.alt) : "",
  };
}

function LocationAttractionsEditor({ items = [], onChange, localeMode = "es", onEnAttrPatch }) {
  const list = Array.isArray(items) ? items.map(normalizeAttractionDraft) : [];
  const isEs = localeMode === "es";
  return (
    <div className="adm-field">
      <label>Atractivos turísticos</label>
      <p className="adm-text-muted" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        Cada ítem puede llevar foto opcional (subida o URL). Los datos antiguos solo con texto siguen funcionando. Si el nombre coincide con un punto de la sección «Mapa», la viñeta usa el mismo color que el pin (principal o cercano).
        {!isEs ? (
          <>
            {" "}
            En inglés, si cambias el nombre respecto al español, puede dejar de coincidir con el pin del mapa hasta que traduzcas también los nombres en «Mapa».
          </>
        ) : null}
      </p>
      {list.map((row, i) => (
        <div key={i} className="adm-subpanel">
          <div className="adm-subpanel-head">
            <span>Atractivo {i + 1}</span>
            {isEs ? (
              <div className="adm-row-actions">
                <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => onChange(moveItem(list, i, -1))}>
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-icon-btn"
                  disabled={i === list.length - 1}
                  onClick={() => onChange(moveItem(list, i, 1))}
                >
                  ↓
                </button>
                <button type="button" className="adm-icon-btn" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                  ×
                </button>
              </div>
            ) : null}
          </div>
          <div className="adm-field">
            <label>Nombre</label>
            <input
              type="text"
              className="adm-input"
              value={row.text}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], text: e.target.value };
                  onChange(n);
                } else {
                  onEnAttrPatch?.(i, { text: e.target.value });
                }
              }}
            />
          </div>
          {isEs ? (
            <ImageUrlField
              label="Imagen (opcional)"
              value={row.imgUrl}
              onChange={(url) => {
                const n = [...list];
                n[i] = { ...n[i], imgUrl: url };
                onChange(n);
              }}
            />
          ) : (
            <p className="adm-text-muted" style={{ marginTop: 0 }}>
              Imagen (definida en Español): {(row.imgUrl || "").trim() || "—"}
            </p>
          )}
          <div className="adm-field">
            <label>Texto alternativo de la imagen</label>
            <input
              type="text"
              className="adm-input"
              value={row.alt}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], alt: e.target.value };
                  onChange(n);
                } else {
                  onEnAttrPatch?.(i, { alt: e.target.value });
                }
              }}
              placeholder="Describe la foto para accesibilidad"
            />
          </div>
        </div>
      ))}
      {isEs ? (
        <button
          type="button"
          className="adm-btn adm-btn-ghost adm-btn-sm"
          onClick={() => onChange([...list, { text: "", imgUrl: "", alt: "" }])}
        >
          + Añadir atractivo
        </button>
      ) : null}
    </div>
  );
}

function MapNearbyEditor({ items = [], onChange, localeMode = "es", onEnNearbyPatch }) {
  const list = Array.isArray(items) ? items : [];
  const isEs = localeMode === "es";
  return (
    <div className="adm-field" style={{ marginTop: 16 }}>
      <label>Lugares cercanos (lista ampliable)</label>
      <p className="adm-text-muted" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        Cada punto aparece en el mapa con un marcador distinto al del hostal. Coordenadas en grados decimales (como en Google Maps). Opcionalmente sube una imagen para el pin circular.
      </p>
      {list.map((row, i) => (
        <div key={i} className="adm-subpanel">
          <div className="adm-subpanel-head">
            <span>Lugar {i + 1}</span>
            {isEs ? (
              <div className="adm-row-actions">
                <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => onChange(moveItem(list, i, -1))}>
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-icon-btn"
                  disabled={i === list.length - 1}
                  onClick={() => onChange(moveItem(list, i, 1))}
                >
                  ↓
                </button>
                <button type="button" className="adm-icon-btn" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                  ×
                </button>
              </div>
            ) : null}
          </div>
          <div className="adm-field">
            <label>Nombre</label>
            <input
              type="text"
              className="adm-input"
              value={row.name || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], name: e.target.value };
                  onChange(n);
                } else {
                  onEnNearbyPatch?.(i, { name: e.target.value });
                }
              }}
            />
          </div>
          <div className="adm-field">
            <label>Nota (opcional, p. ej. distancia o cómo llegar)</label>
            <input
              type="text"
              className="adm-input"
              value={row.note || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], note: e.target.value };
                  onChange(n);
                } else {
                  onEnNearbyPatch?.(i, { note: e.target.value });
                }
              }}
            />
          </div>
          {isEs ? (
            <ImageUrlField
              label="Imagen del pin en el mapa"
              value={row.imgUrl || ""}
              onChange={(url) => {
                const n = [...list];
                n[i] = { ...n[i], imgUrl: url };
                onChange(n);
              }}
            />
          ) : (
            <p className="adm-text-muted" style={{ marginTop: 0 }}>
              Imagen y coordenadas (definidas en Español).
            </p>
          )}
          {isEs ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="adm-field" style={{ marginBottom: 0 }}>
                <label>Latitud</label>
                <input
                  type="number"
                  className="adm-input"
                  step="any"
                  value={row.lat != null && row.lat !== "" ? row.lat : ""}
                  onChange={(e) => {
                    const n = [...list];
                    n[i] = { ...n[i], lat: e.target.value === "" ? "" : Number(e.target.value) };
                    onChange(n);
                  }}
                />
              </div>
              <div className="adm-field" style={{ marginBottom: 0 }}>
                <label>Longitud</label>
                <input
                  type="number"
                  className="adm-input"
                  step="any"
                  value={row.lng != null && row.lng !== "" ? row.lng : ""}
                  onChange={(e) => {
                    const n = [...list];
                    n[i] = { ...n[i], lng: e.target.value === "" ? "" : Number(e.target.value) };
                    onChange(n);
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      ))}
      {isEs ? (
        <button
          type="button"
          className="adm-btn adm-btn-ghost adm-btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => onChange([...list, { name: "", note: "", lat: "", lng: "", imgUrl: "" }])}
        >
          + Añadir lugar
        </button>
      ) : null}
    </div>
  );
}

function SocialLinksEditor({ links = [], onChange, localeMode = "es", onEnSocialPatch }) {
  const list = Array.isArray(links) ? links : [];
  const isEs = localeMode === "es";
  return (
    <div className="adm-field">
      <label>Redes sociales (barra superior)</label>
      {list.map((l, i) => (
        <div key={i} className="adm-subpanel">
          <div className="adm-subpanel-head">
            <div className="adm-subpanel-head-left">
              <span>Enlace {i + 1}</span>
              <div
                className="adm-social-icon-preview"
                title="Vista previa del icono en la barra superior de la web"
              >
                <SocialNavIcon linkKey={l.key} iconText={l.iconText} />
              </div>
            </div>
            {isEs ? (
              <button type="button" className="adm-icon-btn" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                ×
              </button>
            ) : null}
          </div>
          {isEs ? (
            <div className="adm-field">
              <label>Clave (id interno)</label>
              <input
                type="text"
                className="adm-input"
                value={l.key || ""}
                onChange={(e) => {
                  const n = [...list];
                  n[i] = { ...n[i], key: e.target.value };
                  onChange(n);
                }}
              />
              <p className="adm-text-muted" style={{ marginTop: 6, marginBottom: 0, fontSize: "0.8rem" }}>
                El icono depende de la clave (p. ej. <code>instagram</code>, <code>booking</code>,{" "}
                <code>tripadvisor</code>, <code>airbnb</code>). Si no coincide ninguna red conocida, se usa «Texto icono».
              </p>
            </div>
          ) : (
            <p className="adm-text-muted" style={{ marginTop: 0 }}>
              URL y clave (definidas en Español): {(l.href || "").trim() || "—"}
            </p>
          )}
          <div className="adm-field">
            <label>Etiqueta (accesibilidad)</label>
            <input
              type="text"
              className="adm-input"
              value={l.label || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], label: e.target.value };
                  onChange(n);
                } else {
                  onEnSocialPatch?.(i, { label: e.target.value });
                }
              }}
            />
          </div>
          {isEs ? (
            <div className="adm-field">
              <label>URL</label>
              <input
                type="url"
                className="adm-input"
                value={l.href || ""}
                onChange={(e) => {
                  const n = [...list];
                  n[i] = { ...n[i], href: e.target.value };
                  onChange(n);
                }}
              />
            </div>
          ) : null}
          <div className="adm-field">
            <label>Texto icono (2 letras)</label>
            <input
              type="text"
              className="adm-input"
              maxLength={4}
              value={l.iconText || ""}
              onChange={(e) => {
                if (isEs) {
                  const n = [...list];
                  n[i] = { ...n[i], iconText: e.target.value };
                  onChange(n);
                } else {
                  onEnSocialPatch?.(i, { iconText: e.target.value });
                }
              }}
            />
          </div>
          {isEs ? (
            <div className="adm-checkbox-row">
              <input
                type="checkbox"
                id={`soc-vis-${i}`}
                checked={l.enabled !== false}
                onChange={(e) => {
                  const n = [...list];
                  n[i] = { ...n[i], enabled: e.target.checked };
                  onChange(n);
                }}
              />
              <label htmlFor={`soc-vis-${i}`}>Visible en la web</label>
            </div>
          ) : null}
        </div>
      ))}
      {isEs ? (
        <button
          type="button"
          className="adm-btn adm-btn-ghost adm-btn-sm"
          onClick={() => onChange([...list, { key: "", label: "", href: "", iconText: "↗", enabled: true }])}
        >
          + Añadir red
        </button>
      ) : null}
    </div>
  );
}

/** Borrador inicial si la API aún no tiene la fila (p. ej. antes de reiniciar el servidor). */
export function emptySectionDraft(key) {
  if (key === "map") {
    return {
      title: "Mapa del entorno",
      lead: "",
      defaultZoom: 15,
      main: { lat: "", lng: "", name: "", description: "", imgUrl: "" },
      nearby: [],
    };
  }
  if (key === "ads") {
    return { enabled: false, label: "Publicidad", adClient: "", adSlot: "" };
  }
  if (key === "gallery") {
    return { eyebrow: "", title: "", lead: "", photos: [] };
  }
  if (key === "homeIntro") {
    return {
      enabled: true,
      title: "",
      summary: ["", ""],
      guideCtaLabel: "",
      imgUrl: "",
      alt: "",
    };
  }
  if (key === "travelGuide") {
    return {
      pageH1: "",
      pageLead: "",
      pageSeoTitle: "",
      cover: { imgUrl: "", alt: "", caption: "" },
      photos: [],
      pageBlocks: [],
    };
  }
  if (key === "aboutPage") {
    return {
      pageH1: "",
      pageLead: "",
      pageSeoTitle: "",
      cover: { imgUrl: "", alt: "", caption: "" },
      photos: [],
      pageBlocks: [],
    };
  }
  return null;
}

export const SECTION_NAV = [
  { key: "hero", label: "Hero", icon: "✦", hint: "Portada, imagen y WhatsApp" },
  { key: "homeIntro", label: "Bienvenida", icon: "⌂", hint: "Bloque bajo el hero: imagen + texto y botón a la guía" },
  { key: "travelGuide", label: "Guía del viajero", icon: "✎", hint: "Página /guia-del-viajero (/en/travel-guide)" },
  { key: "aboutPage", label: "Sobre nosotros", icon: "❜", hint: "Página /sobre-nosotros (/en/about)" },
  { key: "experiences", label: "Experiencias", icon: "◎", hint: "Lista y tarjetas" },
  { key: "split", label: "Servicios", icon: "✧", hint: "Imagen + comodidades + página /servicios" },
  { key: "rooms", label: "Habitaciones", icon: "◇", hint: "Tarjetas en inicio + página detalle (/habitaciones)" },
  { key: "gallery", label: "Galería", icon: "▦", hint: "Fotos con vista ampliada (lightbox)" },
  { key: "location", label: "Ubicación", icon: "⌖", hint: "Fondo, lista de atractivos (con foto opcional)" },
  { key: "map", label: "Mapa", icon: "◉", hint: "Hostal, lugares cercanos e imagen de cada pin" },
  { key: "testimonials", label: "Opiniones", icon: "❝", hint: "Carrusel de citas" },
  { key: "cta", label: "Reservas / CTA", icon: "✉", hint: "Bloque de contacto" },
  { key: "ads", label: "Publicidad", icon: "▣", hint: "Google AdSense (tras reservas, antes del pie)" },
  { key: "site", label: "Marca y redes", icon: "⚙", hint: "Marca, textos del menú/pie y redes" },
];

export function SectionForm({ sectionKey, draft, setDraft, contentLang = CONTENT_LOCALE_ES }) {
  if (!draft || typeof draft !== "object") return null;

  const isEs = contentLang === CONTENT_LOCALE_ES;
  const localeMode = isEs ? "es" : "en";

  const patch = (partial) => {
    if (isEs) setDraft((d) => ({ ...d, ...partial }));
    else setDraft((d) => ({ ...d, i18n: { ...(d.i18n || {}), en: deepMergeEn(d.i18n?.en || {}, partial) } }));
  };

  const rf = (...path) => readLocaleField(draft, contentLang, ...path);

  const patchEnItem = (arrayKey, i, partial) => {
    setDraft((d) => {
      const en = d.i18n?.en || {};
      const prev = Array.isArray(en[arrayKey]) ? [...en[arrayKey]] : [];
      while (prev.length <= i) prev.push({});
      const cur = prev[i];
      const baseObj = cur != null && typeof cur === "object" && !Array.isArray(cur) ? cur : {};
      prev[i] = { ...baseObj, ...partial };
      return { ...d, i18n: { ...d.i18n, en: deepMergeEn(en, { [arrayKey]: prev }) } };
    });
  };

  const localeHint = !isEs ? (
    <p className="adm-text-muted" style={{ marginTop: 0, marginBottom: "1rem" }}>
      Editando traducción al inglés. Los campos vacíos usan el texto en español en la web. Orden, imágenes y enlaces se gestionan en «Español».
    </p>
  ) : null;

  switch (sectionKey) {
    case "hero":
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Subtítulo (tag)</label>
            <input type="text" className="adm-input" value={rf("tag") || ""} onChange={(e) => patch({ tag: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Título principal</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto introductorio</label>
            <textarea className="adm-textarea" rows={4} value={rf("lead") || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          {isEs ? (
            <div className="adm-field">
              <label>URL WhatsApp (enlace completo)</label>
              <input type="url" className="adm-input" value={draft.whatsappUrl || ""} onChange={(e) => patch({ whatsappUrl: e.target.value })} />
            </div>
          ) : (
            <p className="adm-text-muted">WhatsApp URL (definida en Español): {(draft.whatsappUrl || "").trim() || "—"}</p>
          )}
          <div className="adm-field">
            <label>Texto botón principal (enlace al formulario #contacto en portada)</label>
            <input type="text" className="adm-input" value={rf("primaryCta") || ""} onChange={(e) => patch({ primaryCta: e.target.value })} />
            <p className="adm-text-muted" style={{ marginTop: 6, marginBottom: 0 }}>
              WhatsApp sigue en el botón flotante; el CTA del hero ya no abre WhatsApp.
            </p>
          </div>
          <div className="adm-field">
            <label>Texto botón secundario (ancla a experiencias)</label>
            <input type="text" className="adm-input" value={rf("secondaryCta") || ""} onChange={(e) => patch({ secondaryCta: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Indicador de scroll (hero)</label>
            <input type="text" className="adm-input" value={rf("scrollHint") || ""} onChange={(e) => patch({ scrollHint: e.target.value })} />
          </div>
          {isEs ? (
            <ImageUrlField
              label="Imagen de fondo"
              previewTall
              value={draft.bgImageUrl || ""}
              onChange={(url) => patch({ bgImageUrl: url })}
            />
          ) : (
            <p className="adm-text-muted">Imagen de fondo (definida en Español).</p>
          )}
          <div className="adm-field">
            <label>Descripción de la imagen (accesibilidad)</label>
            <input type="text" className="adm-input" value={rf("bgAlt") || ""} onChange={(e) => patch({ bgAlt: e.target.value })} />
          </div>
        </>
      );

    case "homeIntro": {
      const baseSummary = Array.isArray(draft.summary) ? draft.summary : [];
      const enSummary = isEs ? baseSummary : baseSummary.map((_, i) => (draft.i18n?.en?.summary || [])[i] ?? "");
      return (
        <>
          {localeHint}
          {isEs ? (
            <div className="adm-field">
              <div className="adm-checkbox-row">
                <input
                  type="checkbox"
                  id="homeIntro-enabled"
                  checked={draft.enabled !== false}
                  onChange={(e) => patch({ enabled: e.target.checked })}
                />
                <label htmlFor="homeIntro-enabled">Mostrar sección «Bienvenida» en la página de inicio</label>
              </div>
            </div>
          ) : (
            <p className="adm-text-muted">La sección activa/inactiva se configura en «Español».</p>
          )}
          <div className="adm-field">
            <label>Título de la sección</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <StringListEditor
            label="Párrafos del resumen (orden en la web)"
            items={enSummary}
            readOnlyStructure={!isEs}
            onChange={(list) => patch({ summary: list })}
          />
          <div className="adm-field">
            <label>Texto del botón (enlace a la guía del viajero)</label>
            <input
              type="text"
              className="adm-input"
              value={rf("guideCtaLabel") || ""}
              onChange={(e) => patch({ guideCtaLabel: e.target.value })}
            />
          </div>
          {isEs ? (
            <ImageUrlField label="Imagen (columna izquierda)" value={draft.imgUrl || ""} onChange={(url) => patch({ imgUrl: url })} />
          ) : (
            <p className="adm-text-muted">URL de imagen (definida en Español): {(draft.imgUrl || "").trim() || "—"}</p>
          )}
          <div className="adm-field">
            <label>Descripción de la imagen (accesibilidad)</label>
            <input type="text" className="adm-input" value={rf("alt") || ""} onChange={(e) => patch({ alt: e.target.value })} />
          </div>
          <p className="adm-text-muted" style={{ marginTop: "0.5rem" }}>
            Si dejas la imagen vacía en Español, la web intentará usar la imagen del bloque «Servicios», la primera tarjeta de «Experiencias» o la primera foto de la galería.
          </p>
        </>
      );
    }

    case "experiences": {
      const baseList = Array.isArray(draft.list) ? draft.list : [];
      const enList = isEs ? baseList : baseList.map((_, i) => (draft.i18n?.en?.list || [])[i] ?? "");
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Antetítulo (eyebrow, pequeño encima del título)</label>
            <input type="text" className="adm-input" value={rf("eyebrow") || ""} onChange={(e) => patch({ eyebrow: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Título de sección</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto bajo el título</label>
            <textarea className="adm-textarea" rows={2} value={rf("lead") || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          <StringListEditor label="Lista con viñetas" items={enList} readOnlyStructure={!isEs} onChange={(list) => patch({ list })} />
          <div className="adm-field">
            <label>Frase de cierre</label>
            <input type="text" className="adm-input" value={rf("tagline") || ""} onChange={(e) => patch({ tagline: e.target.value })} />
          </div>
          <ExperienceCardsEditor
            localeMode={localeMode}
            cards={
              isEs
                ? draft.cards
                : (draft.cards || []).map((c, i) => ({
                    imgUrl: c.imgUrl,
                    alt: draft.i18n?.en?.cards?.[i]?.alt ?? "",
                    title: draft.i18n?.en?.cards?.[i]?.title ?? "",
                    body: draft.i18n?.en?.cards?.[i]?.body ?? "",
                  }))
            }
            onChange={(cards) => patch({ cards })}
            onEnCardPatch={(i, partial) => patchEnItem("cards", i, partial)}
          />
        </>
      );
    }

    case "split": {
      const baseAmenities = Array.isArray(draft.amenities) ? draft.amenities : [];
      const enAmenities = isEs ? baseAmenities : baseAmenities.map((_, i) => (draft.i18n?.en?.amenities || [])[i] ?? "");
      const basePageBlocks = Array.isArray(draft.pageBlocks) ? draft.pageBlocks : [];
      const pbForForm = isEs ? basePageBlocks : basePageBlocks.map((_, i) => (draft.i18n?.en?.pageBlocks || [])[i] ?? "");
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Título (bloque imagen + lista en inicio y en /servicios)</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto del botón (formulario de reserva en portada, #contacto)</label>
            <input type="text" className="adm-input" value={rf("ctaLabel") || ""} onChange={(e) => patch({ ctaLabel: e.target.value })} />
          </div>
          {isEs ? <ImageUrlField label="Imagen" value={draft.imgUrl || ""} onChange={(url) => patch({ imgUrl: url })} /> : null}
          {!isEs ? <p className="adm-text-muted">Imagen (definida en Español).</p> : null}
          <div className="adm-field">
            <label>Alt imagen</label>
            <input type="text" className="adm-input" value={rf("alt") || ""} onChange={(e) => patch({ alt: e.target.value })} />
          </div>
          <StringListEditor
            label="Comodidades (lista)"
            items={enAmenities}
            readOnlyStructure={!isEs}
            onChange={(amenities) => patch({ amenities })}
          />

          <div className="adm-field" style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(148,163,184,0.35)" }}>
            <label style={{ fontWeight: 700 }}>Página «Servicios» (/servicios)</label>
            <p className="adm-text-muted" style={{ marginTop: "0.35rem", marginBottom: "1rem" }}>
              Título principal (H1) puede diferenciarse del título del bloque verde. Los párrafos largos aparecen debajo del bloque imagen + lista.
            </p>
            <div className="adm-field">
              <label>Título principal de la página (H1)</label>
              <input type="text" className="adm-input" value={rf("pageH1") || ""} onChange={(e) => patch({ pageH1: e.target.value })} />
            </div>
            <div className="adm-field">
              <label>Texto bajo el H1 (opcional)</label>
              <textarea className="adm-textarea" rows={2} value={rf("pageLead") || ""} onChange={(e) => patch({ pageLead: e.target.value })} />
            </div>
            <div className="adm-field">
              <label>Título del navegador (SEO)</label>
              <input type="text" className="adm-input" value={rf("pageSeoTitle") || ""} onChange={(e) => patch({ pageSeoTitle: e.target.value })} />
            </div>
            <TextBlockListEditor
              label="Párrafos (debajo del bloque destacado)"
              items={pbForForm}
              readOnlyStructure={!isEs}
              onChange={(pageBlocks) => patch({ pageBlocks })}
            />
          </div>
        </>
      );
    }

    case "rooms":
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Título de sección</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Subtítulo</label>
            <textarea className="adm-textarea" rows={2} value={rf("subtitle") || ""} onChange={(e) => patch({ subtitle: e.target.value })} />
          </div>
          <RoomCardsEditor
            localeMode={localeMode}
            cards={
              isEs
                ? draft.cards
                : (draft.cards || []).map((c, i) => ({
                    imgUrl: c.imgUrl,
                    alt: draft.i18n?.en?.cards?.[i]?.alt ?? "",
                    title: draft.i18n?.en?.cards?.[i]?.title ?? "",
                    body: draft.i18n?.en?.cards?.[i]?.body ?? "",
                    badge: draft.i18n?.en?.cards?.[i]?.badge ?? "",
                  }))
            }
            onChange={(cards) => patch({ cards })}
            onEnCardPatch={(i, partial) => patchEnItem("cards", i, partial)}
          />
          <RoomPageItemsEditor
            draft={draft}
            setDraft={setDraft}
            patch={patch}
            patchEnItem={patchEnItem}
            localeMode={localeMode}
            localeHint={localeHint}
            rf={rf}
            isEs={isEs}
          />
        </>
      );

    case "gallery":
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Antetítulo (eyebrow)</label>
            <input type="text" className="adm-input" value={rf("eyebrow") || ""} onChange={(e) => patch({ eyebrow: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Título de sección</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto introductorio</label>
            <textarea className="adm-textarea" rows={2} value={rf("lead") || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          <GalleryPhotosEditor
            localeMode={localeMode}
            photos={
              isEs
                ? draft.photos
                : (draft.photos || []).map((p, i) => ({
                    imgUrl: p.imgUrl,
                    alt: draft.i18n?.en?.photos?.[i]?.alt ?? "",
                    caption: draft.i18n?.en?.photos?.[i]?.caption ?? "",
                  }))
            }
            onChange={(photos) => patch({ photos })}
            onEnPhotoPatch={(i, partial) => patchEnItem("photos", i, partial)}
          />
        </>
      );

    case "location":
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Título</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto introductorio</label>
            <textarea className="adm-textarea" rows={2} value={rf("lead") || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          <LocationAttractionsEditor
            localeMode={localeMode}
            items={
              isEs
                ? draft.attractions
                : (draft.attractions || []).map((raw, i) => {
                    const row = normalizeAttractionDraft(raw);
                    return {
                      text: draft.i18n?.en?.attractions?.[i]?.text ?? "",
                      imgUrl: row.imgUrl,
                      alt: draft.i18n?.en?.attractions?.[i]?.alt ?? "",
                    };
                  })
            }
            onChange={(attractions) => patch({ attractions })}
            onEnAttrPatch={(i, partial) => patchEnItem("attractions", i, partial)}
          />
          <div className="adm-field">
            <label>Texto de cierre</label>
            <textarea className="adm-textarea" rows={2} value={rf("closing") || ""} onChange={(e) => patch({ closing: e.target.value })} />
          </div>
          {isEs ? (
            <ImageUrlField
              label="Imagen de fondo"
              previewTall
              value={draft.bgImageUrl || ""}
              onChange={(url) => patch({ bgImageUrl: url })}
            />
          ) : (
            <p className="adm-text-muted">Imagen de fondo (definida en Español).</p>
          )}
        </>
      );

    case "map":
      return (
        <>
          {localeHint}
          <p className="adm-text-muted" style={{ marginTop: 0 }}>
            En la página pública el mapa no muestra título ni pie de leyenda; solo el lienzo y la atribución OpenStreetMap debajo. Los colores de la lista en «Ubicación» se alinean por nombre con el punto principal y los cercanos. Puedes subir una imagen por pin (circular en el mapa); si la dejas vacía, se intenta usar la foto del mismo nombre en «Ubicación».
          </p>
          <div className="adm-field">
            <label>Título (reservado / no visible en la web)</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto introductorio (reservado / no visible en la web)</label>
            <textarea className="adm-textarea" rows={2} value={rf("lead") || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          {isEs ? (
            <div className="adm-field">
              <label>Zoom inicial (centrado en el hostal; p. ej. 14–16 = barrio)</label>
              <input
                type="number"
                className="adm-input"
                step="0.1"
                value={draft.defaultZoom != null ? draft.defaultZoom : ""}
                onChange={(e) => patch({ defaultZoom: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </div>
          ) : null}
          <div className="adm-subpanel" style={{ marginTop: 16 }}>
            <div className="adm-subpanel-head">
              <span>Punto principal (hostal)</span>
            </div>
            <div className="adm-field">
              <label>Nombre</label>
              <input
                type="text"
                className="adm-input"
                value={rf("main", "name") || ""}
                onChange={(e) =>
                  patch(
                    isEs
                      ? { main: { ...(draft.main || {}), name: e.target.value } }
                      : { main: { name: e.target.value } }
                  )
                }
              />
            </div>
            <div className="adm-field">
              <label>Descripción corta (tooltip / leyenda)</label>
              <input
                type="text"
                className="adm-input"
                value={rf("main", "description") || ""}
                onChange={(e) =>
                  patch(
                    isEs
                      ? { main: { ...(draft.main || {}), description: e.target.value } }
                      : { main: { description: e.target.value } }
                  )
                }
              />
            </div>
            {isEs ? (
              <ImageUrlField
                label="Imagen del pin en el mapa"
                value={draft.main?.imgUrl || ""}
                onChange={(url) => patch({ main: { ...(draft.main || {}), imgUrl: url } })}
              />
            ) : null}
            {!isEs ? <p className="adm-text-muted">Imagen y coordenadas del hostal (definidas en Español).</p> : null}
            {isEs ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="adm-field" style={{ marginBottom: 0 }}>
                  <label>Latitud</label>
                  <input
                    type="number"
                    className="adm-input"
                    step="any"
                    value={draft.main?.lat != null && draft.main.lat !== "" ? draft.main.lat : ""}
                    onChange={(e) =>
                      patch({ main: { ...(draft.main || {}), lat: e.target.value === "" ? "" : Number(e.target.value) } })
                    }
                  />
                </div>
                <div className="adm-field" style={{ marginBottom: 0 }}>
                  <label>Longitud</label>
                  <input
                    type="number"
                    className="adm-input"
                    step="any"
                    value={draft.main?.lng != null && draft.main.lng !== "" ? draft.main.lng : ""}
                    onChange={(e) =>
                      patch({ main: { ...(draft.main || {}), lng: e.target.value === "" ? "" : Number(e.target.value) } })
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
          <MapNearbyEditor
            localeMode={localeMode}
            items={
              isEs
                ? draft.nearby
                : (draft.nearby || []).map((row, i) => ({
                    ...row,
                    name: draft.i18n?.en?.nearby?.[i]?.name ?? "",
                    note: draft.i18n?.en?.nearby?.[i]?.note ?? "",
                  }))
            }
            onChange={(nearby) => patch({ nearby })}
            onEnNearbyPatch={(i, partial) => patchEnItem("nearby", i, partial)}
          />
        </>
      );

    case "testimonials": {
      const baseItems = Array.isArray(draft.items) ? draft.items : [];
      const enItems = isEs ? baseItems : baseItems.map((_, i) => (draft.i18n?.en?.items || [])[i] ?? "");
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Antetítulo (eyebrow)</label>
            <input type="text" className="adm-input" value={rf("eyebrow") || ""} onChange={(e) => patch({ eyebrow: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Título de sección</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Etiqueta bajo la cita (p. ej. «Huésped»)</label>
            <input type="text" className="adm-input" value={rf("guestBadge") || ""} onChange={(e) => patch({ guestBadge: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Accesibilidad · descripción del carrusel</label>
            <input type="text" className="adm-input" value={rf("carouselLabel") || ""} onChange={(e) => patch({ carouselLabel: e.target.value })} />
          </div>
          <StringListEditor
            label="Opiniones (una por línea)"
            items={enItems}
            readOnlyStructure={!isEs}
            onChange={(items) => patch({ items })}
            addLabel="Añadir opinión"
          />
        </>
      );
    }

    case "cta":
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Antetítulo (eyebrow)</label>
            <input type="text" className="adm-input" value={rf("eyebrow") || ""} onChange={(e) => patch({ eyebrow: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Título</label>
            <input type="text" className="adm-input" value={rf("title") || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto</label>
            <textarea className="adm-textarea" rows={3} value={rf("lead") || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          {isEs ? <ImageUrlField label="Imagen lateral" value={draft.imgUrl || ""} onChange={(url) => patch({ imgUrl: url })} /> : null}
          {!isEs ? <p className="adm-text-muted">Imagen lateral (definida en Español).</p> : null}
          <div className="adm-field">
            <label>Alt imagen</label>
            <input type="text" className="adm-input" value={rf("alt") || ""} onChange={(e) => patch({ alt: e.target.value })} />
          </div>
        </>
      );

    case "ads":
      return (
        <>
          {localeHint}
          {isEs ? (
            <div className="adm-field adm-checkbox-row">
              <input
                type="checkbox"
                id="ads-enabled"
                checked={Boolean(draft.enabled)}
                onChange={(e) => patch({ enabled: e.target.checked })}
              />
              <label htmlFor="ads-enabled">Mostrar bloque de anuncios en la web</label>
            </div>
          ) : (
            <p className="adm-text-muted">Activación e IDs de AdSense (definidos en Español).</p>
          )}
          <div className="adm-field">
            <label>Etiqueta visible (p. ej. «Publicidad»)</label>
            <input type="text" className="adm-input" value={rf("label") || ""} onChange={(e) => patch({ label: e.target.value })} />
          </div>
          {isEs ? (
            <>
              <div className="adm-field">
                <label>ID de cliente AdSense (ca-pub-…)</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                  value={draft.adClient || ""}
                  onChange={(e) => patch({ adClient: e.target.value })}
                />
              </div>
              <div className="adm-field">
                <label>ID del anuncio (data-ad-slot)</label>
                <input
                  type="text"
                  className="adm-input"
                  inputMode="numeric"
                  placeholder="1234567890"
                  value={draft.adSlot || ""}
                  onChange={(e) => patch({ adSlot: e.target.value })}
                />
              </div>
            </>
          ) : null}
          {isEs ? (
            <p className="adm-text-muted" style={{ marginTop: 8 }}>
              El bloque va justo después de reservas/contacto y antes del pie. En AdSense, el snippet que te dan solo incluye la etiqueta{" "}
              <code style={{ fontSize: "0.85em" }}>{"<script async … adsbygoogle.js?client=ca-pub-…>"}</code>: esa carga la hace la web
              automáticamente cuando guardas el <strong>ID de cliente</strong> de abajo. Además crea una unidad <strong>Display</strong> en pantalla
              (responsive) y pega aquí también el <strong>ID del anuncio</strong> (<code style={{ fontSize: "0.85em" }}>data-ad-slot</code>).
            </p>
          ) : null}
        </>
      );

    case "travelGuide": {
      const baseBlocks = Array.isArray(draft.pageBlocks) ? draft.pageBlocks : [];
      const pbForForm = isEs ? baseBlocks : baseBlocks.map((_, i) => (draft.i18n?.en?.pageBlocks || [])[i] ?? "");
      const baseCover = draft.cover && typeof draft.cover === "object" ? draft.cover : { imgUrl: "", alt: "", caption: "" };
      const basePhotos = Array.isArray(draft.photos) ? draft.photos : [];
      const photosForForm = isEs
        ? basePhotos
        : basePhotos.map((p, i) => ({
            imgUrl: p.imgUrl,
            alt: draft.i18n?.en?.photos?.[i]?.alt ?? "",
            caption: draft.i18n?.en?.photos?.[i]?.caption ?? "",
          }));
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Título principal (H1)</label>
            <input type="text" className="adm-input" value={rf("pageH1") || ""} onChange={(e) => patch({ pageH1: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto bajo el título (opcional)</label>
            <textarea className="adm-textarea" rows={2} value={rf("pageLead") || ""} onChange={(e) => patch({ pageLead: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Título del navegador (SEO)</label>
            <input type="text" className="adm-input" value={rf("pageSeoTitle") || ""} onChange={(e) => patch({ pageSeoTitle: e.target.value })} />
          </div>
          <div className="adm-field" style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(148,163,184,0.35)" }}>
            <label style={{ fontWeight: 700 }}>Imágenes (opcional)</label>
            {isEs ? (
              <ImageUrlField
                label="Imagen principal (cover)"
                previewTall
                value={baseCover.imgUrl || ""}
                onChange={(url) => patch({ cover: { ...baseCover, imgUrl: url } })}
              />
            ) : (
              <p className="adm-text-muted" style={{ marginTop: 0 }}>
                Imagen principal (definida en Español): {(baseCover.imgUrl || "").trim() || "—"}
              </p>
            )}
            <div className="adm-field">
              <label>Alt (imagen principal)</label>
              <input
                type="text"
                className="adm-input"
                value={rf("cover", "alt") || ""}
                onChange={(e) => patch({ cover: { ...(isEs ? baseCover : (draft.i18n?.en?.cover || {})), alt: e.target.value } })}
              />
            </div>
            <div className="adm-field">
              <label>Leyenda (opcional, imagen principal)</label>
              <input
                type="text"
                className="adm-input"
                value={rf("cover", "caption") || ""}
                onChange={(e) => patch({ cover: { ...(isEs ? baseCover : (draft.i18n?.en?.cover || {})), caption: e.target.value } })}
              />
            </div>
            <GalleryPhotosEditor
              localeMode={localeMode}
              photos={photosForForm}
              onChange={(photos) => patch({ photos })}
              onEnPhotoPatch={(i, partial) => patchEnItem("photos", i, partial)}
            />
          </div>
          <TextBlockListEditor
            label="Párrafos de la guía"
            items={pbForForm}
            readOnlyStructure={!isEs}
            onChange={(pageBlocks) => patch({ pageBlocks })}
          />
        </>
      );
    }

    case "aboutPage": {
      const baseBlocks = Array.isArray(draft.pageBlocks) ? draft.pageBlocks : [];
      const pbForForm = isEs ? baseBlocks : baseBlocks.map((_, i) => (draft.i18n?.en?.pageBlocks || [])[i] ?? "");
      const baseCover = draft.cover && typeof draft.cover === "object" ? draft.cover : { imgUrl: "", alt: "", caption: "" };
      const basePhotos = Array.isArray(draft.photos) ? draft.photos : [];
      const photosForForm = isEs
        ? basePhotos
        : basePhotos.map((p, i) => ({
            imgUrl: p.imgUrl,
            alt: draft.i18n?.en?.photos?.[i]?.alt ?? "",
            caption: draft.i18n?.en?.photos?.[i]?.caption ?? "",
          }));
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Título principal (H1)</label>
            <input type="text" className="adm-input" value={rf("pageH1") || ""} onChange={(e) => patch({ pageH1: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto bajo el título (opcional)</label>
            <textarea className="adm-textarea" rows={2} value={rf("pageLead") || ""} onChange={(e) => patch({ pageLead: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Título del navegador (SEO)</label>
            <input type="text" className="adm-input" value={rf("pageSeoTitle") || ""} onChange={(e) => patch({ pageSeoTitle: e.target.value })} />
          </div>
          <div className="adm-field" style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(148,163,184,0.35)" }}>
            <label style={{ fontWeight: 700 }}>Imágenes (opcional)</label>
            {isEs ? (
              <ImageUrlField
                label="Imagen principal (cover)"
                previewTall
                value={baseCover.imgUrl || ""}
                onChange={(url) => patch({ cover: { ...baseCover, imgUrl: url } })}
              />
            ) : (
              <p className="adm-text-muted" style={{ marginTop: 0 }}>
                Imagen principal (definida en Español): {(baseCover.imgUrl || "").trim() || "—"}
              </p>
            )}
            <div className="adm-field">
              <label>Alt (imagen principal)</label>
              <input
                type="text"
                className="adm-input"
                value={rf("cover", "alt") || ""}
                onChange={(e) => patch({ cover: { ...(isEs ? baseCover : (draft.i18n?.en?.cover || {})), alt: e.target.value } })}
              />
            </div>
            <div className="adm-field">
              <label>Leyenda (opcional, imagen principal)</label>
              <input
                type="text"
                className="adm-input"
                value={rf("cover", "caption") || ""}
                onChange={(e) => patch({ cover: { ...(isEs ? baseCover : (draft.i18n?.en?.cover || {})), caption: e.target.value } })}
              />
            </div>
            <GalleryPhotosEditor
              localeMode={localeMode}
              photos={photosForForm}
              onChange={(photos) => patch({ photos })}
              onEnPhotoPatch={(i, partial) => patchEnItem("photos", i, partial)}
            />
          </div>
          <TextBlockListEditor
            label="Párrafos"
            items={pbForForm}
            readOnlyStructure={!isEs}
            onChange={(pageBlocks) => patch({ pageBlocks })}
          />
        </>
      );
    }

    case "site":
      return (
        <>
          {localeHint}
          <div className="adm-field">
            <label>Nombre del sitio / marca</label>
            <input type="text" className="adm-input" value={rf("brandName") || ""} onChange={(e) => patch({ brandName: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Eslogan (footer)</label>
            <input type="text" className="adm-input" value={rf("tagline") || ""} onChange={(e) => patch({ tagline: e.target.value })} />
          </div>
          <p className="adm-text-muted" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
            Menú superior y pie: si dejas un campo vacío, la web usa el texto según el idioma (ES/EN) de la ruta.
          </p>
          <div className="adm-field">
            <label>Menú · ancla #experiencia</label>
            <input
              type="text"
              className="adm-input"
              value={readLocaleField(draft, contentLang, "navLabels", "experiencia") || ""}
              onChange={(e) =>
                patch({
                  navLabels: {
                    ...((isEs ? draft.navLabels : draft.i18n?.en?.navLabels) || {}),
                    experiencia: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="adm-field">
            <label>Menú · ancla #habitaciones</label>
            <input
              type="text"
              className="adm-input"
              value={readLocaleField(draft, contentLang, "navLabels", "habitaciones") || ""}
              onChange={(e) =>
                patch({
                  navLabels: {
                    ...((isEs ? draft.navLabels : draft.i18n?.en?.navLabels) || {}),
                    habitaciones: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="adm-field">
            <label>Menú · ancla #galeria</label>
            <input
              type="text"
              className="adm-input"
              value={readLocaleField(draft, contentLang, "navLabels", "galeria") || ""}
              onChange={(e) =>
                patch({
                  navLabels: {
                    ...((isEs ? draft.navLabels : draft.i18n?.en?.navLabels) || {}),
                    galeria: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="adm-field">
            <label>Menú · ancla #ubicacion</label>
            <input
              type="text"
              className="adm-input"
              value={readLocaleField(draft, contentLang, "navLabels", "ubicacion") || ""}
              onChange={(e) =>
                patch({
                  navLabels: {
                    ...((isEs ? draft.navLabels : draft.i18n?.en?.navLabels) || {}),
                    ubicacion: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="adm-field">
            <label>Menú · ancla #opiniones</label>
            <input
              type="text"
              className="adm-input"
              value={readLocaleField(draft, contentLang, "navLabels", "opiniones") || ""}
              onChange={(e) =>
                patch({
                  navLabels: {
                    ...((isEs ? draft.navLabels : draft.i18n?.en?.navLabels) || {}),
                    opiniones: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="adm-field">
            <label>Menú · botón reservas (#contacto)</label>
            <input
              type="text"
              className="adm-input"
              value={readLocaleField(draft, contentLang, "navLabels", "reservar") || ""}
              onChange={(e) =>
                patch({
                  navLabels: {
                    ...((isEs ? draft.navLabels : draft.i18n?.en?.navLabels) || {}),
                    reservar: e.target.value,
                  },
                })
              }
            />
          </div>
          <SocialLinksEditor
            localeMode={localeMode}
            links={
              isEs
                ? draft.socialLinks
                : (draft.socialLinks || []).map((l, i) => ({
                    ...l,
                    label: draft.i18n?.en?.socialLinks?.[i]?.label ?? "",
                    iconText: draft.i18n?.en?.socialLinks?.[i]?.iconText ?? "",
                  }))
            }
            onChange={(socialLinks) => patch({ socialLinks })}
            onEnSocialPatch={(i, partial) => patchEnItem("socialLinks", i, partial)}
          />
        </>
      );

    default:
      return <p className="adm-text-muted">Sección sin formulario dedicado.</p>;
  }
}
