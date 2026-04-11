import { useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function FlagEs({ className }) {
  return (
    <svg className={className} viewBox="0 0 3 2" aria-hidden="true" focusable="false">
      <rect width="3" height="2" fill="#c60b1e" />
      <rect width="3" height="1" y="0.5" fill="#ffc400" />
    </svg>
  );
}

function FlagGb({ className }) {
  const clipId = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId}>
          <path d="M30,15 h30 v15 z v15 H0 z H0 V0 z H30 V15 z" />
        </clipPath>
      </defs>
      <path fill="#012169" d="M0 0h60v30H0z" />
      <path stroke="#fff" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#c8102e" strokeWidth="4" d="M0 0l60 30M60 0L0 30" clipPath={`url(#${clipId})`} />
      <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" />
      <path stroke="#c8102e" strokeWidth="6" d="M30 0v30M0 15h60" />
    </svg>
  );
}

/**
 * Enlaces a / (es) y /en (en). Banderas visibles; etiquetas solo para lectores de pantalla.
 */
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en" || i18n.language.startsWith("en-");

  return (
    <div className="lang-switch" role="navigation" aria-label={t("nav.langSwitch")}>
      <Link
        to="/"
        className={`lang-switch__link lang-switch__link--flag${!isEn ? " is-active" : ""}`}
        hrefLang="es"
        lang="es"
        title={t("nav.langEs")}
      >
        <FlagEs className="lang-switch__flag lang-switch__flag--es" />
        <span className="visually-hidden">{t("nav.langEs")}</span>
      </Link>
      <Link
        to="/en"
        className={`lang-switch__link lang-switch__link--flag${isEn ? " is-active" : ""}`}
        hrefLang="en"
        lang="en"
        title={t("nav.langEn")}
      >
        <FlagGb className="lang-switch__flag lang-switch__flag--gb" />
        <span className="visually-hidden">{t("nav.langEn")}</span>
      </Link>
    </div>
  );
}
