import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Enlaces a / (es) y /en (en). Respeta el basename de Vite/React Router.
 */
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en" || i18n.language.startsWith("en-");

  return (
    <div className="lang-switch" role="navigation" aria-label={t("nav.langSwitch")}>
      <Link
        to="/"
        className={`lang-switch__link${!isEn ? " is-active" : ""}`}
        hrefLang="es"
        lang="es"
      >
        {t("nav.langEs")}
      </Link>
      <span className="lang-switch__sep" aria-hidden="true">
        |
      </span>
      <Link
        to="/en"
        className={`lang-switch__link${isEn ? " is-active" : ""}`}
        hrefLang="en"
        lang="en"
      >
        {t("nav.langEn")}
      </Link>
    </div>
  );
}
