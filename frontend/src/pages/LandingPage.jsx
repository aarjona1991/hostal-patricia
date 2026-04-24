import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import GoogleAdSlot from "../components/GoogleAdSlot.jsx";
import { SiteHeader } from "../components/SiteHeader.jsx";
import { SiteFooter } from "../components/SiteFooter.jsx";
import { ContactFormBlock } from "../components/ContactFormBlock.jsx";
import { TrinidadLocationMap } from "../components/TrinidadLocationMap.jsx";
import { PhotoLightbox } from "../components/PhotoLightbox.jsx";
import { usePublicSections } from "../lib/usePublicSections.js";
import { applyHeroSeoMeta } from "../lib/seoHero.js";
import { localizeSectionsMap } from "../lib/sectionI18n.js";
import { normalizeMapPinLabel } from "../lib/mapPins.js";
import { pathForHomeReservation, pathForPage } from "../lib/publicRoutes.js";

function safeGet(obj, key, fallback) {
  return obj && obj[key] != null ? obj[key] : fallback;
}

/** Miniaturas en la página; el resto solo en lightbox (botón «Ver más»). */
const GALLERY_PREVIEW_MAX = 6;

/** Atractivo: string legacy o { text, imgUrl?, alt? } */
function normalizeLocationAttraction(raw) {
  if (raw == null) return { text: "", imgUrl: "", alt: "" };
  if (typeof raw === "string") return { text: raw, imgUrl: "", alt: "" };
  const text = raw.text != null ? String(raw.text) : raw.title != null ? String(raw.title) : "";
  return {
    text,
    imgUrl: raw.imgUrl != null ? String(raw.imgUrl) : "",
    alt: raw.alt != null ? String(raw.alt) : "",
  };
}

/** Quita comillas tipográficas envolventes para mostrar el texto con decoración propia. */
function testimonialPlainText(raw) {
  let s = String(raw || "").trim();
  if ((s.startsWith("«") && s.endsWith("»")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** Alinea ítems de la lista con `map.main` / `map.nearby` por nombre (mismo color que el pin). */
function getAttractionPinModifier(raw, mapSection) {
  if (!mapSection) return "";
  const a = normalizeLocationAttraction(raw);
  const label = normalizeMapPinLabel(a.text);
  if (!label) return "";
  if (mapSection.main && normalizeMapPinLabel(mapSection.main.name) === label) {
    return "location-attraction--pin-main";
  }
  for (const p of mapSection.nearby || []) {
    if (normalizeMapPinLabel(p.name) === label) return "location-attraction--pin-near";
  }
  return "";
}

/** Icono genérico cuando el atractivo no trae `imgUrl`. */
function LocationAttractionPlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
      />
    </svg>
  );
}

export default function LandingPage({ lang = "es" }) {
  const { t, i18n } = useTranslation();
  const routerLocation = useLocation();
  const { data, err } = usePublicSections();
  const heroRef = useRef(null);
  const locationSectionRef = useRef(null);
  const [whatsappFloatVisible, setWhatsappFloatVisible] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [galleryLightbox, setGalleryLightbox] = useState(null);

  useEffect(() => {
    const target = lang === "en" ? "en" : "es";
    if (i18n.language !== target) void i18n.changeLanguage(target);
    document.documentElement.lang = target;
  }, [lang, i18n]);

  /** OG/Twitter/JSON-LD: imagen del Hero (también inyecta el servidor en index.html al servir). */
  const viewData = useMemo(() => (data ? localizeSectionsMap(data, lang) : null), [data, lang]);

  useEffect(() => {
    if (!viewData) return;
    applyHeroSeoMeta(safeGet(viewData, "hero", {}));
  }, [viewData]);

  useEffect(() => {
    if (routerLocation.hash !== "#contacto") return;
    const tid = window.setTimeout(() => {
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(tid);
  }, [routerLocation.hash, routerLocation.pathname]);

  /** Imágenes de la lista de ubicación, por nombre normalizado (mismo criterio que los pines). */
  const pinImageMap = useMemo(() => {
    const loc = viewData && safeGet(viewData, "location", { attractions: [] });
    const m = new Map();
    for (const raw of loc?.attractions || []) {
      const a = normalizeLocationAttraction(raw);
      const key = normalizeMapPinLabel(a.text);
      const u = a.imgUrl?.trim();
      if (key && u) m.set(key, u);
    }
    return m;
  }, [viewData]);

  useEffect(() => {
    if (!data) return;
    const heroEl = heroRef.current;
    if (!heroEl) return;

    if (!("IntersectionObserver" in window)) {
      setWhatsappFloatVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setWhatsappFloatVisible(!entry.isIntersecting);
        }
      },
      { threshold: 0, rootMargin: "0px" }
    );
    obs.observe(heroEl);
    return () => obs.disconnect();
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const headerThreshold = 72;

    const updateHeaderScrolled = () => {
      setHeaderScrolled(heroEl.getBoundingClientRect().bottom < headerThreshold);
    };

    updateHeaderScrolled();
    window.addEventListener("scroll", updateHeaderScrolled, { passive: true });
    window.addEventListener("resize", updateHeaderScrolled);
    return () => {
      window.removeEventListener("scroll", updateHeaderScrolled);
      window.removeEventListener("resize", updateHeaderScrolled);
    };
  }, [data]);

  /* Parallax solo del fondo mar en la sección Ubicación (#ubicacion → .section-location::before) */
  useEffect(() => {
    if (!data) return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = locationSectionRef.current;
    if (!el) return;

    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > vh) {
        el.style.setProperty("--location-parallax-y", "0px");
        ticking = false;
        return;
      }
      const centerY = rect.top + rect.height * 0.35;
      const y = (centerY - vh * 0.5) * -0.45;
      el.style.setProperty("--location-parallax-y", `${Math.round(y * 10) / 10}px`);
      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [data]);

  const year = useMemo(() => new Date().getFullYear(), []);

  const testimonialItems = useMemo(() => {
    if (!viewData) return [];
    const t = safeGet(viewData, "testimonials", { items: [] });
    const raw = Array.isArray(t?.items) ? t.items : [];
    return raw.map((item) => String(item || "").trim()).filter(Boolean);
  }, [viewData]);

  const testimonialsSplideOptions = useMemo(() => {
    const n = testimonialItems.length;
    const multi = n > 1;
    const loop = n > 3;
    return {
      type: loop ? "loop" : "slide",
      rewind: multi && !loop,
      perPage: n >= 2 ? 2 : 1,
      perMove: 1,
      gap: "1.35rem",
      pagination: multi,
      arrows: multi,
      drag: multi,
      keyboard: multi,
      speed: 520,
      easing: "cubic-bezier(0.25, 1, 0.45, 1)",
      breakpoints: {
        900: {
          perPage: 1,
          gap: "1rem",
        },
      },
    };
  }, [testimonialItems.length]);

  if (err) return <div style={{ padding: 24 }}>{t("errorLoad")} {String(err.message || err)}</div>;
  if (!data || !viewData) return <div style={{ padding: 24 }}>{t("loading")}</div>;

  const hero = safeGet(viewData, "hero", {});
  const experiences = safeGet(viewData, "experiences", { list: [], cards: [] });
  const split = safeGet(viewData, "split", { amenities: [] });
  const rooms = safeGet(viewData, "rooms", { cards: [] });
  const location = safeGet(viewData, "location", { attractions: [] });
  const mapSection = viewData.map && typeof viewData.map === "object" ? viewData.map : null;
  const testimonials = safeGet(viewData, "testimonials", { items: [] });
  const cta = safeGet(viewData, "cta", {});
  const ads = viewData.ads && typeof viewData.ads === "object" ? viewData.ads : {};
  const site = safeGet(viewData, "site", {});
  const navL = site?.navLabels && typeof site.navLabels === "object" ? site.navLabels : {};
  const gallery = safeGet(viewData, "gallery", { photos: [] });
  const galleryPhotos = (gallery?.photos || [])
    .filter((p) => p && String(p.imgUrl || "").trim())
    .map((p) => ({
      imgUrl: String(p.imgUrl).trim(),
      alt: p.alt != null ? String(p.alt) : "",
      caption: p.caption != null ? String(p.caption) : "",
    }));
  const galleryPreviewPhotos = galleryPhotos.slice(0, GALLERY_PREVIEW_MAX);
  const galleryExtraCount = Math.max(0, galleryPhotos.length - GALLERY_PREVIEW_MAX);

  const brandTitle = site?.brandName || t("brand.defaultName");
  const logoSrc = `${import.meta.env.BASE_URL}logo.svg`;

  const homeIntro = safeGet(viewData, "homeIntro", {});
  const introEnabled = homeIntro.enabled !== false;
  const i18nSummaryFallback = (() => {
    const s = t("home.richIntro.summary", { returnObjects: true });
    return Array.isArray(s) ? s.map((p) => String(p || "").trim()).filter(Boolean) : [];
  })();
  const cmsSummary = Array.isArray(homeIntro.summary)
    ? homeIntro.summary.map((p) => String(p || "").trim()).filter(Boolean)
    : [];
  const introSummary = cmsSummary.length > 0 ? cmsSummary : i18nSummaryFallback;
  const introTitle = (homeIntro.title || "").trim() || t("home.richIntro.title");
  const introGuideCta = (homeIntro.guideCtaLabel || "").trim() || t("home.richIntro.guideLink");
  const cmsIntroImg = (homeIntro.imgUrl || "").trim();

  const richIntroImageUrl =
    cmsIntroImg ||
    (split?.imgUrl && String(split.imgUrl).trim()) ||
    (Array.isArray(experiences?.cards) && experiences.cards[0]?.imgUrl
      ? String(experiences.cards[0].imgUrl).trim()
      : "") ||
    (galleryPhotos[0]?.imgUrl ? String(galleryPhotos[0].imgUrl).trim() : "") ||
    "";

  const richIntroImageAlt = cmsIntroImg
    ? (homeIntro.alt || "").trim() || t("home.richIntro.imageAlt")
    : (split?.imgUrl && String(split.alt || "").trim()) ||
      (Array.isArray(experiences?.cards) && experiences.cards[0]?.imgUrl
        ? String(experiences.cards[0].alt || "").trim()
        : "") ||
      (galleryPhotos[0]?.alt ? String(galleryPhotos[0].alt).trim() : "") ||
      t("home.richIntro.imageAlt");

  const showHomeIntroSection = introEnabled && (Boolean(introTitle) || introSummary.length > 0);

  return (
    <>
      <SiteHeader
        lang={lang}
        headerMode="overlay"
        headerScrolled={headerScrolled}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        site={site}
        brandTitle={brandTitle}
        logoSrc={logoSrc}
      />

      <main>
        <section className="hero" ref={heroRef}>
          <div
            className="hero-bg"
            role="img"
            aria-label={hero?.bgAlt || t("hero.bgAltDefault")}
            style={hero?.bgImageUrl ? { backgroundImage: `url("${hero.bgImageUrl}")` } : undefined}
          ></div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <p className="hero-tag">{hero?.tag || t("hero.tagDefault")}</p>
            <h1>{hero?.title || t("hero.titleDefault")}</h1>
            <p className="hero-lead">{hero?.lead || ""}</p>
            <div className="hero-actions">
              <Link to={pathForHomeReservation(lang)} className="btn btn-primary">
                {(hero?.primaryCta || "").trim() || t("hero.whatsappCta")}
              </Link>
              <a href="#experiencia" className="btn btn-ghost">
                {(hero?.secondaryCta || "").trim() || t("hero.discoverMore")}
              </a>
            </div>
          </div>
          <div className="hero-scroll" aria-hidden="true">
            <span>{(hero?.scrollHint || "").trim() || t("hero.scrollHint")}</span>
            <div className="hero-scroll-line"></div>
          </div>
        </section>

        {showHomeIntroSection ? (
          <section
            className={`section section-rich-intro${richIntroImageUrl ? "" : " section-rich-intro--no-image"}`}
            id="informacion"
            aria-labelledby="rich-intro-title"
          >
            <div className="container rich-intro-grid">
              {richIntroImageUrl ? (
                <div className="rich-intro-media">
                  <figure className="rich-intro-figure">
                    <img src={richIntroImageUrl} alt={richIntroImageAlt} loading="lazy" decoding="async" />
                  </figure>
                </div>
              ) : null}
              <div className="rich-intro-copy">
                <h2 id="rich-intro-title" className="section-title rich-intro-title align-left">
                  {introTitle}
                </h2>
                {introSummary.map((para, i) => (
                  <p key={i} className="rich-intro-lead">
                    {para}
                  </p>
                ))}
                <p className="rich-intro-guide">
                  <Link to={pathForPage("guide", lang)} className="btn btn-secondary rich-intro-guide-btn">
                    {introGuideCta}
                  </Link>
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="section section-intro" id="experiencia">
          <div className="container narrow experience-block">
            <p className="section-eyebrow">{(experiences?.eyebrow || "").trim() || t("section.experiencesEyebrow")}</p>
            <h2 className="section-title">{experiences?.title || t("section.experiencesTitleDefault")}</h2>
            <p className="experience-lead">{experiences?.lead || ""}</p>
          </div>
          <div className="container experience-list-outer">
            <ul className="experience-list experience-list--tiles" role="list">
              {(experiences?.list || []).map((item, idx) => (
                <li key={idx} className="experience-tile">
                  <span className="experience-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="experience-tile-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="container narrow experience-block">
            <p className="experience-tagline">{experiences?.tagline || ""}</p>
          </div>

          <div
            className={`container container--experiences experience-gallery${(experiences?.cards || []).length >= 4 ? " experience-gallery--featured" : ""}`}
          >
            {(experiences?.cards || []).map((c, idx) => (
              <article className="feature-card" key={c?.title || idx}>
                <div className="feature-media">
                  <img src={c.imgUrl} alt={c.alt} loading="lazy" />
                </div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-split">
          <div className="split-visual">
            {split?.imgUrl ? <img src={split.imgUrl} alt={split.alt || ""} loading="lazy" /> : null}
          </div>
          <div className="split-content">
            <h2 className="section-title align-left">{split?.title || t("section.splitTitleDefault")}</h2>
            <ul className="amenities-list">
              {(split?.amenities || []).map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
            <Link to={pathForHomeReservation(lang)} className="btn btn-secondary">
              {(split?.ctaLabel || "").trim() || t("section.splitCta")}
            </Link>
          </div>
        </section>

        <section className="section section-rooms" id="habitaciones">
          <div className="container">
            <h2 className="section-title">{rooms?.title || t("section.roomsTitleDefault")}</h2>
            <p className="section-subtitle narrow-text">{rooms?.subtitle || ""}</p>
            <p className="section-subtitle narrow-text rooms-page-teaser">
              {t("home.roomsTeaser.text")}{" "}
              <Link to={pathForPage("rooms", lang)}>{t("home.roomsTeaser.link")}</Link>
            </p>

            <div className="rooms-grid">
              {(rooms?.cards || []).map((r, idx) => (
                <article className="room-card" key={r?.title || idx}>
                  <div className="room-image">
                    <img src={r.imgUrl} alt={r.alt} loading="lazy" />
                  </div>
                  <div className="room-body">
                    <h3>{r.title}</h3>
                    <p>{r.body}</p>
                    {r.badge ? <span className="room-badge">{r.badge}</span> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-gallery" id="galeria" aria-labelledby="galeria-title">
          <div className="container">
            <p className="section-eyebrow">{(gallery?.eyebrow || "").trim() || t("section.galleryEyebrow")}</p>
            <h2 className="section-title" id="galeria-title">
              {gallery?.title || t("section.galleryTitleDefault")}
            </h2>
            {(gallery?.lead || "").trim() ? (
              <p className="section-subtitle narrow-text">{gallery.lead.trim()}</p>
            ) : null}

            {galleryPhotos.length === 0 ? (
              <p className="gallery-empty">{t("section.galleryEmpty")}</p>
            ) : (
              <>
                <ul className="gallery-grid">
                  {galleryPreviewPhotos.map((photo, idx) => (
                    <li key={`${photo.imgUrl}-${idx}`} className="gallery-tile">
                      <button
                        type="button"
                        className="gallery-tile-btn"
                        onClick={() => setGalleryLightbox(idx)}
                        aria-haspopup="dialog"
                        aria-label={t("gallery.openAria", { n: idx + 1, total: galleryPhotos.length })}
                      >
                        <figure className="gallery-tile-figure">
                          <img src={photo.imgUrl} alt={photo.alt || ""} loading="lazy" decoding="async" />
                          {photo.caption?.trim() ? (
                            <figcaption className="gallery-tile-cap">{photo.caption.trim()}</figcaption>
                          ) : null}
                        </figure>
                      </button>
                    </li>
                  ))}
                </ul>
                {galleryExtraCount > 0 ? (
                  <div className="gallery-more">
                    <button
                      type="button"
                      className="btn btn-secondary gallery-more__btn"
                      onClick={() => setGalleryLightbox(GALLERY_PREVIEW_MAX)}
                      aria-label={t("gallery.showMoreAria", {
                        total: galleryPhotos.length,
                        more: galleryExtraCount,
                      })}
                    >
                      {t("gallery.showMore", { count: galleryExtraCount })}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>

        {galleryLightbox !== null && galleryPhotos.length > 0 ? (
          <PhotoLightbox
            items={galleryPhotos}
            index={galleryLightbox}
            onClose={() => setGalleryLightbox(null)}
            onIndexChange={setGalleryLightbox}
            labels={{
              close: t("gallery.close"),
              prev: t("gallery.prev"),
              next: t("gallery.next"),
              dialogLabel: t("gallery.dialogLabel"),
              adEyebrow: t("section.adsDefault"),
              adCounter: t("gallery.adCounter"),
              adContinueHint: t("gallery.adContinueHint"),
            }}
            adSense={
              ads.enabled && String(ads.adClient || "").trim() && String(ads.adSlot || "").trim()
                ? {
                    adClient: ads.adClient,
                    adSlot: ads.adSlot,
                    label: (ads.label || "").trim(),
                  }
                : null
            }
          />
        ) : null}

        <section
          ref={locationSectionRef}
          className="section section-location"
          id="ubicacion"
          style={{
            ...(location?.bgImageUrl ? { "--location-sea-image": `url("${location.bgImageUrl}")` } : {}),
          }}
        >
          <div className="location-layout">
            <div className="location-copy">
              <h2 className="section-title align-left">{location?.title || t("section.locationTitleDefault")}</h2>
              <p className="section-subtitle location-lead">{location?.lead || ""}</p>
              <ul className="location-attractions">
                {(location?.attractions || []).map((raw, idx) => {
                  const a = normalizeLocationAttraction(raw);
                  const hasImg = Boolean(a.imgUrl?.trim());
                  const pinMod = getAttractionPinModifier(raw, mapSection);
                  const liClass = ["location-attraction", hasImg ? "location-attraction--has-thumb" : "", pinMod]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <li key={idx} className={liClass}>
                      {hasImg ? (
                        <span className="location-attraction-thumb-wrap">
                          <img
                            className="location-attraction-thumb-img"
                            src={a.imgUrl}
                            alt={a.alt || a.text || ""}
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                      ) : (
                        <span className="location-attraction-icon">
                          <LocationAttractionPlaceholderIcon />
                        </span>
                      )}
                      <span className="location-attraction-label">{a.text}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="location-closing">{location?.closing || ""}</p>
            </div>
            <div className="location-map-column">
              <div className="location-map-panel">
                <div className="location-map-canvas-wrap">
                  <TrinidadLocationMap
                    className="location-map-canvas"
                    config={mapSection || undefined}
                    pinImages={pinImageMap}
                    mapAriaLabel={t("map.ariaLabel")}
                    markerFallbackLabel={t("map.markerFallback")}
                  />
                </div>
                <p className="location-map-osm-credit">
                  <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
                    © OpenStreetMap
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-testimonials" id="opiniones" aria-labelledby="opiniones-title">
          <div className="container">
            <p className="section-eyebrow">{(testimonials?.eyebrow || "").trim() || t("section.testimonialsEyebrow")}</p>
            <h2 className="section-title" id="opiniones-title">
              {testimonials?.title || t("section.testimonialsTitleDefault")}
            </h2>

            {testimonialItems.length === 0 ? (
              <p className="testimonials-empty">{t("section.testimonialsEmpty")}</p>
            ) : (
              <Splide
                className="testimonials-splide"
                options={testimonialsSplideOptions}
                aria-label={(testimonials?.carouselLabel || "").trim() || t("section.testimonialsSplideAria")}
              >
                {testimonialItems.map((quoteText, idx) => (
                  <SplideSlide key={`${idx}-${quoteText.slice(0, 24)}`}>
                    <blockquote className="testimonial-card">
                      <div className="testimonial-card__inner">
                        <div className="testimonial-card__stars" aria-hidden="true">
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                        </div>
                        <p className="testimonial-card__quote">{testimonialPlainText(quoteText)}</p>
                        <footer className="testimonial-card__footer">
                          <span className="testimonial-card__mark" aria-hidden="true">
                            “
                          </span>
                          <span className="testimonial-card__badge">
                            {(testimonials?.guestBadge || "").trim() || t("section.guestBadge")}
                          </span>
                        </footer>
                      </div>
                    </blockquote>
                  </SplideSlide>
                ))}
              </Splide>
            )}
          </div>
        </section>

        <section className="section section-cta" id="contacto">
          <div className="container cta-box">
            <div className="cta-visual">
              {cta?.imgUrl ? <img src={cta.imgUrl} alt={cta.alt || ""} loading="lazy" /> : null}
            </div>
            <div className="cta-content">
              <p className="section-eyebrow section-eyebrow--left">
                {(cta?.eyebrow || "").trim() || t("section.ctaEyebrow")}
              </p>
              <h2 className="section-title align-left">{cta?.title || t("section.ctaTitleDefault")}</h2>
              <p>{cta?.lead || ""}</p>
              <ContactFormBlock />
            </div>
          </div>
        </section>

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
      </main>

      <SiteFooter lang={lang} year={year} site={site} navL={navL} />

      <a
        href={hero?.whatsappUrl || "#"}
        className={`whatsapp-float${whatsappFloatVisible ? " is-visible" : ""}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsapp.floatLabel")}
        aria-hidden={!whatsappFloatVisible}
        tabIndex={whatsappFloatVisible ? undefined : -1}
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

