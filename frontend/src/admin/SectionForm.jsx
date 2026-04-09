import React from "react";
import { ImageUrlField } from "./ImageUrlField.jsx";

function moveItem(arr, index, delta) {
  const next = index + delta;
  if (next < 0 || next >= arr.length) return arr;
  const copy = [...arr];
  const t = copy[index];
  copy[index] = copy[next];
  copy[next] = t;
  return copy;
}

function StringListEditor({ label, items = [], onChange, addLabel = "Añadir" }) {
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
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" style={{ marginTop: 8 }} onClick={() => onChange([...list, ""])}>
        + {addLabel}
      </button>
    </div>
  );
}

function ExperienceCardsEditor({ cards = [], onChange }) {
  const list = Array.isArray(cards) ? cards : [];
  return (
    <div className="adm-field">
      <label>Tarjetas (experiencias)</label>
      {list.map((c, i) => (
        <div key={i} className="adm-subpanel">
          <div className="adm-subpanel-head">
            <span>Tarjeta {i + 1}</span>
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
          </div>
          <ImageUrlField
            label="Imagen"
            value={c.imgUrl || ""}
            onChange={(url) => {
              const n = [...list];
              n[i] = { ...n[i], imgUrl: url };
              onChange(n);
            }}
          />
          <div className="adm-field">
            <label>Texto alternativo (alt)</label>
            <input
              type="text"
              className="adm-input"
              value={c.alt || ""}
              onChange={(e) => {
                const n = [...list];
                n[i] = { ...n[i], alt: e.target.value };
                onChange(n);
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
                const n = [...list];
                n[i] = { ...n[i], title: e.target.value };
                onChange(n);
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
                const n = [...list];
                n[i] = { ...n[i], body: e.target.value };
                onChange(n);
              }}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="adm-btn adm-btn-ghost adm-btn-sm"
        onClick={() => onChange([...list, { imgUrl: "", alt: "", title: "", body: "" }])}
      >
        + Añadir tarjeta
      </button>
    </div>
  );
}

function RoomCardsEditor({ cards = [], onChange }) {
  const list = Array.isArray(cards) ? cards : [];
  return (
    <div className="adm-field">
      <label>Tarjetas (habitaciones)</label>
      {list.map((c, i) => (
        <div key={i} className="adm-subpanel">
          <div className="adm-subpanel-head">
            <span>Habitación {i + 1}</span>
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
          </div>
          <ImageUrlField
            label="Imagen"
            value={c.imgUrl || ""}
            onChange={(url) => {
              const n = [...list];
              n[i] = { ...n[i], imgUrl: url };
              onChange(n);
            }}
          />
          <div className="adm-field">
            <label>Alt</label>
            <input
              type="text"
              className="adm-input"
              value={c.alt || ""}
              onChange={(e) => {
                const n = [...list];
                n[i] = { ...n[i], alt: e.target.value };
                onChange(n);
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
                const n = [...list];
                n[i] = { ...n[i], title: e.target.value };
                onChange(n);
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
                const n = [...list];
                n[i] = { ...n[i], body: e.target.value };
                onChange(n);
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
                const n = [...list];
                const v = e.target.value.trim();
                const next = { ...n[i] };
                if (v) next.badge = v;
                else delete next.badge;
                n[i] = next;
                onChange(n);
              }}
              placeholder="Vacío = sin badge"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="adm-btn adm-btn-ghost adm-btn-sm"
        onClick={() => onChange([...list, { imgUrl: "", alt: "", title: "", body: "" }])}
      >
        + Añadir habitación
      </button>
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

function LocationAttractionsEditor({ items = [], onChange }) {
  const list = Array.isArray(items) ? items.map(normalizeAttractionDraft) : [];
  return (
    <div className="adm-field">
      <label>Atractivos turísticos</label>
      <p className="adm-text-muted" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        Cada ítem puede llevar foto opcional (subida o URL). Los datos antiguos solo con texto siguen funcionando. Si el nombre coincide con un punto de la sección «Mapa», la viñeta usa el mismo color que el pin (principal o cercano).
      </p>
      {list.map((row, i) => (
        <div key={i} className="adm-subpanel">
          <div className="adm-subpanel-head">
            <span>Atractivo {i + 1}</span>
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
          </div>
          <div className="adm-field">
            <label>Nombre</label>
            <input
              type="text"
              className="adm-input"
              value={row.text}
              onChange={(e) => {
                const n = [...list];
                n[i] = { ...n[i], text: e.target.value };
                onChange(n);
              }}
            />
          </div>
          <ImageUrlField
            label="Imagen (opcional)"
            value={row.imgUrl}
            onChange={(url) => {
              const n = [...list];
              n[i] = { ...n[i], imgUrl: url };
              onChange(n);
            }}
          />
          <div className="adm-field">
            <label>Texto alternativo de la imagen</label>
            <input
              type="text"
              className="adm-input"
              value={row.alt}
              onChange={(e) => {
                const n = [...list];
                n[i] = { ...n[i], alt: e.target.value };
                onChange(n);
              }}
              placeholder="Describe la foto para accesibilidad"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="adm-btn adm-btn-ghost adm-btn-sm"
        onClick={() => onChange([...list, { text: "", imgUrl: "", alt: "" }])}
      >
        + Añadir atractivo
      </button>
    </div>
  );
}

function MapNearbyEditor({ items = [], onChange }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="adm-field" style={{ marginTop: 16 }}>
      <label>Lugares cercanos (lista ampliable)</label>
      <p className="adm-text-muted" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        Cada punto aparece en el mapa con un marcador distinto al del hostal. Coordenadas en grados decimales (como en Google Maps).
      </p>
      {list.map((row, i) => (
        <div key={i} className="adm-subpanel">
          <div className="adm-subpanel-head">
            <span>Lugar {i + 1}</span>
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
          </div>
          <div className="adm-field">
            <label>Nombre</label>
            <input
              type="text"
              className="adm-input"
              value={row.name || ""}
              onChange={(e) => {
                const n = [...list];
                n[i] = { ...n[i], name: e.target.value };
                onChange(n);
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
                const n = [...list];
                n[i] = { ...n[i], note: e.target.value };
                onChange(n);
              }}
            />
          </div>
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
        </div>
      ))}
      <button
        type="button"
        className="adm-btn adm-btn-ghost adm-btn-sm"
        style={{ marginTop: 8 }}
        onClick={() => onChange([...list, { name: "", note: "", lat: "", lng: "" }])}
      >
        + Añadir lugar
      </button>
    </div>
  );
}

function SocialLinksEditor({ links = [], onChange }) {
  const list = Array.isArray(links) ? links : [];
  return (
    <div className="adm-field">
      <label>Redes sociales (barra superior)</label>
      {list.map((l, i) => (
        <div key={i} className="adm-subpanel">
          <div className="adm-subpanel-head">
            <span>Enlace {i + 1}</span>
            <button type="button" className="adm-icon-btn" onClick={() => onChange(list.filter((_, j) => j !== i))}>
              ×
            </button>
          </div>
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
          </div>
          <div className="adm-field">
            <label>Etiqueta (accesibilidad)</label>
            <input
              type="text"
              className="adm-input"
              value={l.label || ""}
              onChange={(e) => {
                const n = [...list];
                n[i] = { ...n[i], label: e.target.value };
                onChange(n);
              }}
            />
          </div>
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
          <div className="adm-field">
            <label>Texto icono (2 letras)</label>
            <input
              type="text"
              className="adm-input"
              maxLength={4}
              value={l.iconText || ""}
              onChange={(e) => {
                const n = [...list];
                n[i] = { ...n[i], iconText: e.target.value };
                onChange(n);
              }}
            />
          </div>
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
        </div>
      ))}
      <button
        type="button"
        className="adm-btn adm-btn-ghost adm-btn-sm"
        onClick={() => onChange([...list, { key: "", label: "", href: "", iconText: "↗", enabled: true }])}
      >
        + Añadir red
      </button>
    </div>
  );
}

/** Borrador inicial si la API aún no tiene la fila (p. ej. antes de reiniciar el servidor). */
export function emptySectionDraft(key) {
  if (key === "map") {
    return {
      title: "Mapa del entorno",
      lead: "",
      defaultZoom: 14,
      main: { lat: "", lng: "", name: "", description: "" },
      nearby: [],
    };
  }
  if (key === "ads") {
    return { enabled: false, label: "Publicidad", adClient: "", adSlot: "" };
  }
  return null;
}

export const SECTION_NAV = [
  { key: "hero", label: "Hero", icon: "✦", hint: "Portada, imagen y WhatsApp" },
  { key: "experiences", label: "Experiencias", icon: "◎", hint: "Lista y tarjetas" },
  { key: "split", label: "Servicios", icon: "✧", hint: "Imagen + comodidades" },
  { key: "rooms", label: "Habitaciones", icon: "◇", hint: "Título y tarjetas" },
  { key: "location", label: "Ubicación", icon: "⌖", hint: "Fondo, lista de atractivos (con foto opcional)" },
  { key: "map", label: "Mapa", icon: "◉", hint: "Punto principal (hostal) y lugares cercanos en el mapa" },
  { key: "testimonials", label: "Opiniones", icon: "❝", hint: "Carrusel de citas" },
  { key: "cta", label: "Reservas / CTA", icon: "✉", hint: "Bloque de contacto" },
  { key: "ads", label: "Publicidad", icon: "▣", hint: "Google AdSense (tras reservas, antes del pie)" },
  { key: "site", label: "Marca y redes", icon: "⚙", hint: "Nombre y enlaces" },
];

export function SectionForm({ sectionKey, draft, setDraft }) {
  if (!draft || typeof draft !== "object") return null;

  const patch = (partial) => setDraft((d) => ({ ...d, ...partial }));

  switch (sectionKey) {
    case "hero":
      return (
        <>
          <div className="adm-field">
            <label>Subtítulo (tag)</label>
            <input type="text" className="adm-input" value={draft.tag || ""} onChange={(e) => patch({ tag: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Título principal</label>
            <input type="text" className="adm-input" value={draft.title || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto introductorio</label>
            <textarea className="adm-textarea" rows={4} value={draft.lead || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>URL WhatsApp (enlace completo)</label>
            <input type="url" className="adm-input" value={draft.whatsappUrl || ""} onChange={(e) => patch({ whatsappUrl: e.target.value })} />
          </div>
          <ImageUrlField
            label="Imagen de fondo"
            previewTall
            value={draft.bgImageUrl || ""}
            onChange={(url) => patch({ bgImageUrl: url })}
          />
          <div className="adm-field">
            <label>Descripción de la imagen (accesibilidad)</label>
            <input type="text" className="adm-input" value={draft.bgAlt || ""} onChange={(e) => patch({ bgAlt: e.target.value })} />
          </div>
        </>
      );

    case "experiences":
      return (
        <>
          <div className="adm-field">
            <label>Título de sección</label>
            <input type="text" className="adm-input" value={draft.title || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto bajo el título</label>
            <textarea className="adm-textarea" rows={2} value={draft.lead || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          <StringListEditor label="Lista con viñetas" items={draft.list} onChange={(list) => patch({ list })} />
          <div className="adm-field">
            <label>Frase de cierre</label>
            <input type="text" className="adm-input" value={draft.tagline || ""} onChange={(e) => patch({ tagline: e.target.value })} />
          </div>
          <ExperienceCardsEditor cards={draft.cards} onChange={(cards) => patch({ cards })} />
        </>
      );

    case "split":
      return (
        <>
          <div className="adm-field">
            <label>Título</label>
            <input type="text" className="adm-input" value={draft.title || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <ImageUrlField label="Imagen" value={draft.imgUrl || ""} onChange={(url) => patch({ imgUrl: url })} />
          <div className="adm-field">
            <label>Alt imagen</label>
            <input type="text" className="adm-input" value={draft.alt || ""} onChange={(e) => patch({ alt: e.target.value })} />
          </div>
          <StringListEditor label="Comodidades (lista)" items={draft.amenities} onChange={(amenities) => patch({ amenities })} />
        </>
      );

    case "rooms":
      return (
        <>
          <div className="adm-field">
            <label>Título de sección</label>
            <input type="text" className="adm-input" value={draft.title || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Subtítulo</label>
            <textarea className="adm-textarea" rows={2} value={draft.subtitle || ""} onChange={(e) => patch({ subtitle: e.target.value })} />
          </div>
          <RoomCardsEditor cards={draft.cards} onChange={(cards) => patch({ cards })} />
        </>
      );

    case "location":
      return (
        <>
          <div className="adm-field">
            <label>Título</label>
            <input type="text" className="adm-input" value={draft.title || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto introductorio</label>
            <textarea className="adm-textarea" rows={2} value={draft.lead || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          <LocationAttractionsEditor items={draft.attractions} onChange={(attractions) => patch({ attractions })} />
          <div className="adm-field">
            <label>Texto de cierre</label>
            <textarea className="adm-textarea" rows={2} value={draft.closing || ""} onChange={(e) => patch({ closing: e.target.value })} />
          </div>
          <ImageUrlField
            label="Imagen de fondo"
            previewTall
            value={draft.bgImageUrl || ""}
            onChange={(url) => patch({ bgImageUrl: url })}
          />
        </>
      );

    case "map":
      return (
        <>
          <p className="adm-text-muted" style={{ marginTop: 0 }}>
            En la página pública el mapa no muestra título ni pie de leyenda; solo el lienzo y la atribución OpenStreetMap debajo. Los colores de la lista en «Ubicación» se alinean por nombre con el punto principal y los cercanos.
          </p>
          <div className="adm-field">
            <label>Título (reservado / no visible en la web)</label>
            <input type="text" className="adm-input" value={draft.title || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto introductorio (reservado / no visible en la web)</label>
            <textarea className="adm-textarea" rows={2} value={draft.lead || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Zoom inicial (aprox. 12–16)</label>
            <input
              type="number"
              className="adm-input"
              step="0.1"
              value={draft.defaultZoom != null ? draft.defaultZoom : ""}
              onChange={(e) => patch({ defaultZoom: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          </div>
          <div className="adm-subpanel" style={{ marginTop: 16 }}>
            <div className="adm-subpanel-head">
              <span>Punto principal (hostal)</span>
            </div>
            <div className="adm-field">
              <label>Nombre</label>
              <input
                type="text"
                className="adm-input"
                value={draft.main?.name || ""}
                onChange={(e) => patch({ main: { ...(draft.main || {}), name: e.target.value } })}
              />
            </div>
            <div className="adm-field">
              <label>Descripción corta (tooltip / leyenda)</label>
              <input
                type="text"
                className="adm-input"
                value={draft.main?.description || ""}
                onChange={(e) => patch({ main: { ...(draft.main || {}), description: e.target.value } })}
              />
            </div>
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
          </div>
          <MapNearbyEditor
            items={draft.nearby}
            onChange={(nearby) => patch({ nearby })}
          />
        </>
      );

    case "testimonials":
      return (
        <>
          <div className="adm-field">
            <label>Título de sección</label>
            <input type="text" className="adm-input" value={draft.title || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <StringListEditor label="Opiniones (una por línea)" items={draft.items} onChange={(items) => patch({ items })} addLabel="Añadir opinión" />
        </>
      );

    case "cta":
      return (
        <>
          <div className="adm-field">
            <label>Título</label>
            <input type="text" className="adm-input" value={draft.title || ""} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Texto</label>
            <textarea className="adm-textarea" rows={3} value={draft.lead || ""} onChange={(e) => patch({ lead: e.target.value })} />
          </div>
          <ImageUrlField label="Imagen lateral" value={draft.imgUrl || ""} onChange={(url) => patch({ imgUrl: url })} />
          <div className="adm-field">
            <label>Alt imagen</label>
            <input type="text" className="adm-input" value={draft.alt || ""} onChange={(e) => patch({ alt: e.target.value })} />
          </div>
        </>
      );

    case "ads":
      return (
        <>
          <div className="adm-field adm-checkbox-row">
            <input
              type="checkbox"
              id="ads-enabled"
              checked={Boolean(draft.enabled)}
              onChange={(e) => patch({ enabled: e.target.checked })}
            />
            <label htmlFor="ads-enabled">Mostrar bloque de anuncios en la web</label>
          </div>
          <div className="adm-field">
            <label>Etiqueta visible (p. ej. «Publicidad»)</label>
            <input type="text" className="adm-input" value={draft.label || ""} onChange={(e) => patch({ label: e.target.value })} />
          </div>
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
          <p className="adm-text-muted" style={{ marginTop: 8 }}>
            El bloque aparece justo después de reservas/contacto y antes del pie. Crea una unidad <strong>Display</strong> responsive en AdSense y copia cliente y slot.
          </p>
        </>
      );

    case "site":
      return (
        <>
          <div className="adm-field">
            <label>Nombre del sitio / marca</label>
            <input type="text" className="adm-input" value={draft.brandName || ""} onChange={(e) => patch({ brandName: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Eslogan (footer)</label>
            <input type="text" className="adm-input" value={draft.tagline || ""} onChange={(e) => patch({ tagline: e.target.value })} />
          </div>
          <SocialLinksEditor links={draft.socialLinks} onChange={(socialLinks) => patch({ socialLinks })} />
        </>
      );

    default:
      return <p className="adm-text-muted">Sección sin formulario dedicado.</p>;
  }
}
