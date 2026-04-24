import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../lib/api.js";

export function ContactFormBlock({ className = "" }) {
  const { t } = useTranslation();
  const [contactState, setContactState] = useState({ status: "idle", message: "" });

  async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      nombre: String(fd.get("nombre") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      mensaje: String(fd.get("mensaje") || "").trim(),
    };
    setContactState({ status: "sending", message: "" });
    try {
      await apiFetch("/api/contact", { method: "POST", body: JSON.stringify(payload) });
      setContactState({
        status: "success",
        message: t("contact.success"),
      });
      form.reset();
    } catch (err) {
      const hint = err.status === 400 ? t("contact.error400") : t("contact.errorGeneric");
      setContactState({ status: "error", message: err.message ? `${hint} (${err.message})` : hint });
    }
  }

  return (
    <form className={`contact-form ${className}`.trim()} noValidate onSubmit={handleContactSubmit}>
      <label>
        <span>{t("contact.name")}</span>
        <input type="text" name="nombre" placeholder={t("contact.placeholderName")} autoComplete="name" required />
      </label>
      <label>
        <span>{t("contact.email")}</span>
        <input type="email" name="email" placeholder={t("contact.placeholderEmail")} autoComplete="email" required />
      </label>
      <label>
        <span>{t("contact.message")}</span>
        <textarea name="mensaje" rows="4" placeholder={t("contact.placeholderMessage")} required></textarea>
      </label>
      {(contactState.status === "success" || contactState.status === "error") && (
        <p
          className={`contact-form-status contact-form-status--${contactState.status}`}
          role="status"
          aria-live="polite"
        >
          {contactState.message}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={contactState.status === "sending"}
        aria-busy={contactState.status === "sending"}
      >
        {contactState.status === "sending" ? t("contact.sending") : t("contact.submit")}
      </button>
    </form>
  );
}
