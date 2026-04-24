import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "../components/SiteHeader.jsx";
import { SiteFooter } from "../components/SiteFooter.jsx";
import GoogleAdSlot from "../components/GoogleAdSlot.jsx";
import { usePublicSections } from "../lib/usePublicSections.js";
import { localizeSectionsMap } from "../lib/sectionI18n.js";
import { PublicViewContext } from "../lib/PublicViewContext.jsx";

function safeGet(obj, key, fallback) {
  return obj && obj[key] != null ? obj[key] : fallback;
}

/**
 * @param {object} props
 * @param {'es'|'en'} props.lang
 * @param {string | null} [props.seoTitleKey] — clave i18n para document.title; `null` para que la página lo gestione sola
 * @param {React.ReactNode} props.children
 */
export default function InnerPageLayout({ lang, seoTitleKey, children }) {
  const { t, i18n } = useTranslation();
  const { data, err } = usePublicSections();
  const [navOpen, setNavOpen] = useState(false);
  const year = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    const target = lang === "en" ? "en" : "es";
    if (i18n.language !== target) void i18n.changeLanguage(target);
    document.documentElement.lang = target;
  }, [lang, i18n]);

  useEffect(() => {
    if (seoTitleKey == null || seoTitleKey === "") return;
    document.title = t(seoTitleKey);
  }, [seoTitleKey, t, i18n.language]);

  const viewData = useMemo(() => (data ? localizeSectionsMap(data, lang) : null), [data, lang]);

  if (err) return <div style={{ padding: 24 }}>{t("errorLoad")} {String(err.message || err)}</div>;
  if (!viewData) return <div style={{ padding: 24 }}>{t("loading")}</div>;

  const site = safeGet(viewData, "site", {});
  const navL = site?.navLabels && typeof site.navLabels === "object" ? site.navLabels : {};
  const brandTitle = site?.brandName || t("brand.defaultName");
  const logoSrc = `${import.meta.env.BASE_URL}logo.svg`;
  const hero = safeGet(viewData, "hero", {});
  const ads = viewData.ads && typeof viewData.ads === "object" ? viewData.ads : {};

  return (
    <>
      <SiteHeader
        lang={lang}
        headerMode="solid"
        headerScrolled
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        site={site}
        brandTitle={brandTitle}
        logoSrc={logoSrc}
      />
      <PublicViewContext.Provider value={viewData}>
        <div className="main-inner">{children}</div>
      </PublicViewContext.Provider>
      {ads.enabled && String(ads.adClient || "").trim() && String(ads.adSlot || "").trim() ? (
        <aside className="section section-ads" aria-label={ads.label || t("section.adsDefault")}>
          <div className="container section-ads-inner">
            <p className="section-ads-eyebrow">{ads.label || t("section.adsDefault")}</p>
            <div className="section-ads-slot">
              <GoogleAdSlot
                key={`${String(ads.adClient || "").trim()}-${String(ads.adSlot || "").trim()}`}
                adClient={ads.adClient}
                adSlot={ads.adSlot}
              />
            </div>
          </div>
        </aside>
      ) : null}
      <SiteFooter lang={lang} year={year} site={site} navL={navL} />
      <a
        href={hero?.whatsappUrl || "#"}
        className="whatsapp-float is-visible"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsapp.floatLabel")}
      >
        <svg className="whatsapp-float-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
          />
        </svg>
      </a>
    </>
  );
}
