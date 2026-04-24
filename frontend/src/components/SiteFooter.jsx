import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { homePathForLang, pathForHomeReservation, pathForPage } from "../lib/publicRoutes.js";

/**
 * @param {object} props
 * @param {'es'|'en'} props.lang
 * @param {number} props.year
 * @param {object} props.site
 * @param {object} props.navL — navLabels desde CMS (opcional)
 */
export function SiteFooter({ lang, year, site, navL: navLProp }) {
  const { t } = useTranslation();
  const { pathname, hash } = useLocation();
  const homePath = homePathForLang(lang);
  const navL = navLProp && typeof navLProp === "object" ? navLProp : site?.navLabels && typeof site.navLabels === "object" ? site.navLabels : {};

  const label = (key, fallbackKey) => {
    const raw = (navL[key] || "").trim();
    return raw || t(fallbackKey);
  };

  /** Mismas entradas y orden que `SiteHeader` (menú principal). */
  const mainNavLinks = [
    { page: "rooms", labelKey: "habitaciones", fallbackKey: "nav.habitaciones" },
    { page: "services", labelKey: "servicios", fallbackKey: "nav.servicios" },
    { page: "guide", labelKey: "guia", fallbackKey: "nav.guia" },
    { page: "about", labelKey: "sobre", fallbackKey: "nav.sobre" },
    { page: "contact", labelKey: "reservar", fallbackKey: "nav.reservar", className: "footer-nav-cta", homeReservation: true },
  ];

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <strong>{site?.brandName || t("brand.defaultName")}</strong>
          <p>{site?.tagline || t("brand.defaultTagline")}</p>
        </div>
        <div className="footer-links" aria-label={t("footer.exploreLabel")}>
          {mainNavLinks.map(({ page, labelKey, fallbackKey, className, homeReservation }) => {
            const to = homeReservation ? pathForHomeReservation(lang) : pathForPage(page, lang);
            const current = homeReservation ? pathname === homePath && hash === "#contacto" : pathname === to;
            return (
              <Link
                key={page}
                to={to}
                className={className || undefined}
                aria-current={current ? "page" : undefined}
              >
                {label(labelKey, fallbackKey)}
              </Link>
            );
          })}
        </div>
        <div className="footer-legal" role="navigation" aria-label={t("footer.legalNavLabel")}>
          <Link to={pathForPage("privacy", lang)}>{t("footer.privacy")}</Link>
          <Link to={pathForPage("terms", lang)}>{t("footer.terms")}</Link>
          <Link to={pathForPage("cookies", lang)}>{t("footer.cookies")}</Link>
        </div>
        <p className="footer-copy">
          {t("footer.copyPrefix")} {year} {site?.brandName || t("brand.defaultName")}.
        </p>
      </div>
    </footer>
  );
}
