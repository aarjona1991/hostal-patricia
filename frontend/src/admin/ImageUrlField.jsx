import React, { useId, useRef, useState } from "react";
import { uploadImageFile } from "../lib/api.js";

export function ImageUrlField({ label, value, onChange, previewTall }) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState("");
  const inputRef = useRef(null);

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setLocalErr("");
    try {
      const { url } = await uploadImageFile(file);
      if (url) onChange(url);
    } catch (err) {
      setLocalErr(err.message || "No se pudo subir la imagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-field">
      <label>{label}</label>
      {value ? (
        <div className={`adm-image-preview-wrap${previewTall ? " adm-image-preview-wrap--tall" : ""}`}>
          <img src={value} alt="" className="adm-image-preview" />
        </div>
      ) : null}
      <div className="adm-image-toolbar">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="adm-file-input-native"
          onChange={onPickFile}
          disabled={busy}
          aria-label={`Subir imagen: ${label}`}
        />
        <button
          type="button"
          className="adm-btn adm-btn-ghost adm-btn-sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Subiendo…" : "Elegir imagen"}
        </button>
        <span className="adm-text-muted adm-file-hint">JPG, PNG, WebP o GIF · máx. 5 MB</span>
      </div>
      {localErr ? <div className="adm-upload-err">{localErr}</div> : null}
      <div className="adm-field adm-field-nested">
        <label className="adm-label-secondary">O pegar URL externa</label>
        <input
          type="text"
          className="adm-input"
          placeholder="https://…"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
