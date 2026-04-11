import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { useSession } from "../lib/SessionProvider.jsx";
import { SECTION_NAV, SectionForm, emptySectionDraft } from "../admin/SectionForm.jsx";
import { CONTENT_LOCALE_EN, CONTENT_LOCALE_ES } from "../lib/sectionI18n.js";
import "../styles/admin.css";

export default function AdminEditorPage() {
  const { features } = useSession();
  const showAdvertisingSection = features?.advertisingSection !== false;
  const sectionNav = useMemo(
    () => (showAdvertisingSection ? SECTION_NAV : SECTION_NAV.filter((n) => n.key !== "ads")),
    [showAdvertisingSection]
  );

  const [activeKey, setActiveKey] = useState("hero");
  const [sections, setSections] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [advRaw, setAdvRaw] = useState("");
  const [contentLang, setContentLang] = useState(CONTENT_LOCALE_ES);

  useEffect(() => {
    apiFetch("/api/sections")
      .then((s) => setSections(s))
      .catch((e) => setErr(e.message || String(e)));
  }, []);

  useEffect(() => {
    if (!sections) return;
    const raw = sections[activeKey];
    const fallback = emptySectionDraft(activeKey);
    if (raw != null) {
      setDraft(structuredClone(raw));
    } else if (fallback != null) {
      setDraft(structuredClone(fallback));
    } else {
      return;
    }
    setStatus("");
    setErr("");
    setAdvRaw("");
    setContentLang(CONTENT_LOCALE_ES);
  }, [activeKey, sections]);

  useEffect(() => {
    if (!showAdvertisingSection && activeKey === "ads") {
      setActiveKey("hero");
    }
  }, [showAdvertisingSection, activeKey]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setStatus("Guardando…");
    setErr("");
    try {
      const updated = await apiFetch(`/api/sections/${activeKey}`, {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      setSections((prev) => ({ ...prev, [activeKey]: updated.data }));
      setDraft(structuredClone(updated.data));
      setStatus("Cambios guardados");
      setTimeout(() => setStatus(""), 3500);
    } catch (e) {
      setErr(e.message || String(e));
      setStatus("");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(advRaw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setErr("El JSON debe ser un objeto.");
        return;
      }
      setDraft(parsed);
      setErr("");
      setStatus("Borrador actualizado desde JSON");
      setTimeout(() => setStatus(""), 2500);
    } catch {
      setErr("JSON no válido. Revisa comillas y comas.");
    }
  }

  const navMeta = SECTION_NAV.find((n) => n.key === activeKey);

  if (err && !sections) {
    return (
      <div className="adm-root adm-loading">
        <div>
          <p style={{ color: "#fca5a5", marginBottom: 8 }}>No se pudo cargar el contenido</p>
          <p className="adm-text-muted">{err}</p>
        </div>
      </div>
    );
  }

  if (!sections || draft === null) {
    return (
      <div className="adm-root adm-loading">
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(20,163,163,0.25)",
              borderTopColor: "#14a3a3",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "adm-spin 0.8s linear infinite",
            }}
          />
          <p>Cargando panel…</p>
        </div>
        <style>{`@keyframes adm-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="adm-root adm-dash">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-head">
          <strong>Panel</strong>
          <span>Casa Trinidad Viva</span>
        </div>
        <nav className="adm-nav" aria-label="Secciones">
          {sectionNav.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === activeKey ? "is-active" : ""}
              onClick={() => setActiveKey(item.key)}
            >
              <span className="adm-nav-icon" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <button type="button" className="adm-btn adm-btn-ghost" style={{ width: "100%" }} onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-main-inner">
          <div className="adm-toolbar">
            <div>
              <h2>{navMeta?.label || activeKey}</h2>
              <p>{navMeta?.hint || "Edita los campos y guarda para publicar en la web."}</p>
            </div>
            <div className="adm-toolbar-actions">
              {status ? <span className="adm-toast adm-toast-success">{status}</span> : null}
              {err ? <span className="adm-toast adm-toast-error">{err}</span> : null}
              <a className="adm-link-preview" href="/" target="_blank" rel="noreferrer">
                Ver sitio ↗
              </a>
              <button type="button" className="adm-btn adm-btn-ocean adm-btn-sm" disabled={saving} onClick={save}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>

          <div className="adm-panel">
            <div className="adm-panel-head">
              <p className="adm-panel-title">Contenido</p>
              <div className="adm-content-lang" role="group" aria-label="Idioma de los textos editables">
                <button
                  type="button"
                  className={contentLang === CONTENT_LOCALE_ES ? "is-active" : ""}
                  onClick={() => setContentLang(CONTENT_LOCALE_ES)}
                >
                  Español
                </button>
                <button
                  type="button"
                  className={contentLang === CONTENT_LOCALE_EN ? "is-active" : ""}
                  onClick={() => setContentLang(CONTENT_LOCALE_EN)}
                >
                  English
                </button>
              </div>
            </div>
            <SectionForm sectionKey={activeKey} draft={draft} setDraft={setDraft} contentLang={contentLang} />
          </div>

          <details
            key={activeKey}
            className="adm-advanced"
            onToggle={(e) => {
              if (e.target.open && draft) {
                setAdvRaw(JSON.stringify(draft, null, 2));
              }
            }}
          >
            <summary>Opciones avanzadas · JSON</summary>
            <textarea
              className="adm-input adm-textarea"
              spellCheck={false}
              value={advRaw}
              onChange={(e) => setAdvRaw(e.target.value)}
              aria-label="JSON de la sección"
            />
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" style={{ marginTop: 10 }} onClick={applyJson}>
              Aplicar JSON al borrador
            </button>
            <p className="adm-text-muted" style={{ marginTop: 12, marginBottom: 0 }}>
              Úsalo solo si necesitas pegar datos exportados. Luego pulsa «Guardar cambios».
            </p>
          </details>
        </div>
      </main>
    </div>
  );
}
