import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SocialNavIcon } from "./SocialNavIcon.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { homePathForLang, pathForHomeReservation, pathForPage } from "../lib/publicRoutes.js";

/**
 * @param {object} props
 * @param {'es'|'en'} props.lang
 * @param {'overlay'|'solid'} props.headerMode
 * @param {boolean} props.headerScrolled — solo en modo overlay (landing con hero).
 * @param {boolean} props.navOpen
 * @param {(v: boolean | ((b: boolean) => boolean)) => void} props.setNavOpen
 * @param {object} props.site
 * @param {string} props.brandTitle
 * @param {string} props.logoSrc
 */
export function SiteHeader({
  lang,
  headerMode,
  headerScrolled,
  navOpen,
  setNavOpen,
  site,
  brandTitle,
  logoSrc,
}) {
  const { t } = useTranslation();
  const { pathname, hash } = useLocation();
  const homePath = homePathForLang(lang);
  const reservationActive = pathname === homePath && hash === "#contacto";
  const scrolled = headerMode === "solid" ? true : headerScrolled;

  const navLsafe = site?.navLabels && typeof site.navLabels === "object" ? site.navLabels : {};

  const label = (key, fallbackKey) => {
    const raw = (navLsafe[key] || "").trim();
    return raw || t(fallbackKey);
  };

  const closeNav = () => setNavOpen(false);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`} id="inicio">
      <nav className="nav" aria-label={t("nav.ariaMain")}>
        <Link className="logo" to={homePath} onClick={closeNav}>
          <img className="logo__mark" src={logoSrc} alt={brandTitle} width="32" height="32" decoding="async" />
          <span className="logo__title">{brandTitle}</span>
        </Link>
        <div className="nav-end">
          <div className="nav-cluster">
            <ul className={`nav-menu${navOpen ? " is-open" : ""}`} id="nav-menu">
              <li>
                <Link
                  to={pathForPage("rooms", lang)}
                  onClick={closeNav}
                  aria-current={pathname === pathForPage("rooms", lang) ? "page" : undefined}
                >
                  {label("habitaciones", "nav.habitaciones")}
                </Link>
              </li>
              <li>
                <Link
                  to={pathForPage("services", lang)}
                  onClick={closeNav}
                  aria-current={pathname === pathForPage("services", lang) ? "page" : undefined}
                >
                  {label("servicios", "nav.servicios")}
                </Link>
              </li>
              <li>
                <Link
                  to={pathForPage("guide", lang)}
                  onClick={closeNav}
                  aria-current={pathname === pathForPage("guide", lang) ? "page" : undefined}
                >
                  {label("guia", "nav.guia")}
                </Link>
              </li>
              <li>
                <Link
                  to={pathForPage("about", lang)}
                  onClick={closeNav}
                  aria-current={pathname === pathForPage("about", lang) ? "page" : undefined}
                >
                  {label("sobre", "nav.sobre")}
                </Link>
              </li>
              <li>
                <Link
                  to={pathForHomeReservation(lang)}
                  className="nav-cta"
                  onClick={closeNav}
                  aria-current={reservationActive ? "page" : undefined}
                >
                  {label("reservar", "nav.reservar")}
                </Link>
              </li>
            </ul>
            <LanguageSwitcher />
            <div className="nav-social" aria-label={t("nav.ariaSocial")}>
              {Array.isArray(site?.socialLinks) &&
                site.socialLinks
                  .filter((l) => l?.enabled !== false)
                  .map((l) => (
                    <a
                      key={l.key || l.href}
                      className="nav-social-link"
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={l.label}
                      title={l.label}
                    >
                      <span className="visually-hidden">{l.label}</span>
                      <SocialNavIcon linkKey={l.key} iconText={l.iconText} />
                    </a>
                  ))}
            </div>
          </div>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={navOpen}
            aria-controls="nav-menu"
            aria-label={navOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </header>
  );
}
