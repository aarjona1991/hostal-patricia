import React, { useEffect, useMemo, useRef, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { SocialNavIcon } from "../components/SocialNavIcon.jsx";
import GoogleAdSlot from "../components/GoogleAdSlot.jsx";
import { TrinidadLocationMap } from "../components/TrinidadLocationMap.jsx";
import { apiFetch } from "../lib/api.js";

function safeGet(obj, key, fallback) {
  return obj && obj[key] != null ? obj[key] : fallback;
}

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

function normalizeMapPinLabel(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

export default function LandingPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const heroRef = useRef(null);
  const locationSectionRef = useRef(null);
  const [whatsappFloatVisible, setWhatsappFloatVisible] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [contactState, setContactState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    apiFetch("/api/sections")
      .then(setData)
      .catch((e) => setErr(e));
  }, []);

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
        message: "Gracias. Hemos recibido tu consulta y te responderemos pronto.",
      });
      form.reset();
    } catch (err) {
      const hint =
        err.status === 400
          ? "Revisa nombre, email y mensaje."
          : "No se pudo enviar. Inténtalo de nuevo en unos minutos.";
      setContactState({ status: "error", message: err.message ? `${hint} (${err.message})` : hint });
    }
  }

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
    if (!data) return [];
    const t = safeGet(data, "testimonials", { items: [] });
    const raw = Array.isArray(t?.items) ? t.items : [];
    return raw.map((item) => String(item || "").trim()).filter(Boolean);
  }, [data]);

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

  if (err) return <div style={{ padding: 24 }}>Error cargando contenido: {String(err.message || err)}</div>;
  if (!data) return <div style={{ padding: 24 }}>Cargando…</div>;

  const hero = safeGet(data, "hero", {});
  const experiences = safeGet(data, "experiences", { list: [], cards: [] });
  const split = safeGet(data, "split", { amenities: [] });
  const rooms = safeGet(data, "rooms", { cards: [] });
  const location = safeGet(data, "location", { attractions: [] });
  const mapSection = data.map && typeof data.map === "object" ? data.map : null;
  const testimonials = safeGet(data, "testimonials", { items: [] });
  const cta = safeGet(data, "cta", {});
  const ads = data.ads && typeof data.ads === "object" ? data.ads : {};
  const site = safeGet(data, "site", {});

  return (
    <>
      <header className={`site-header${headerScrolled ? " is-scrolled" : ""}`} id="inicio">
        <nav className="nav" aria-label="Principal">
          <a className="logo" href="#inicio">
            {site?.brandName || "Casa Trinidad Viva"}
          </a>
          <div className="nav-end">
            <div className="nav-cluster">
              <ul className="nav-menu" id="nav-menu">
                <li>
                  <a href="#experiencia">Experiencia</a>
                </li>
                <li>
                  <a href="#habitaciones">Habitaciones</a>
                </li>
                <li>
                  <a href="#ubicacion">Ubicación</a>
                </li>
                <li>
                  <a href="#opiniones">Opiniones</a>
                </li>
                <li>
                  <a href="#contacto" className="nav-cta">
                    Reservar
                  </a>
                </li>
              </ul>
              <div className="nav-social" aria-label="Redes sociales">
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
              aria-expanded="false"
              aria-controls="nav-menu"
              aria-label="Abrir menú"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero" ref={heroRef}>
          <div
            className="hero-bg"
            role="img"
            aria-label={hero?.bgAlt || "Playa tropical y mar turquesa"}
            style={hero?.bgImageUrl ? { backgroundImage: `url("${hero.bgImageUrl}")` } : undefined}
          ></div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <p className="hero-tag">{hero?.tag || "Trinidad, Cuba · Patrimonio vivo"}</p>
            <h1>{hero?.title || "Vive la auténtica experiencia cubana en Trinidad"}</h1>
            <p className="hero-lead">{hero?.lead || ""}</p>
            <div className="hero-actions">
              <a href={hero?.whatsappUrl || "#"} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                Reservar por WhatsApp
              </a>
              <a href="#experiencia" className="btn btn-ghost">
                Descubrir más
              </a>
            </div>
          </div>
          <div className="hero-scroll" aria-hidden="true">
            <span>Desliza</span>
            <div className="hero-scroll-line"></div>
          </div>
        </section>

        <section className="section section-intro" id="experiencia">
          <div className="container narrow experience-block">
            <p className="section-eyebrow">Experiencias</p>
            <h2 className="section-title">{experiences?.title || "Vive Trinidad como un local"}</h2>
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
            <h2 className="section-title align-left">{split?.title || "Todo lo que necesitas"}</h2>
            <ul className="amenities-list">
              {(split?.amenities || []).map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
            <a href="#contacto" className="btn btn-secondary">
              Ir a reservas
            </a>
          </div>
        </section>

        <section className="section section-rooms" id="habitaciones">
          <div className="container">
            <h2 className="section-title">{rooms?.title || "Habitaciones cómodas y privadas"}</h2>
            <p className="section-subtitle narrow-text">{rooms?.subtitle || ""}</p>

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
              <h2 className="section-title align-left">{location?.title || "Ubicación privilegiada"}</h2>
              <p className="section-subtitle location-lead">{location?.lead || ""}</p>
              <ul className="location-attractions">
                {(location?.attractions || []).map((raw, idx) => {
                  const a = normalizeLocationAttraction(raw);
                  const hasImg = Boolean(a.imgUrl?.trim());
                  const pinMod = getAttractionPinModifier(raw, mapSection);
                  const liClass = ["location-attraction", hasImg ? "location-attraction--has-image" : "", pinMod].filter(Boolean).join(" ");
                  return (
                    <li key={idx} className={liClass}>
                      {hasImg ? (
                        <div className="location-attraction-thumb">
                          <img src={a.imgUrl} alt={a.alt || a.text || ""} loading="lazy" />
                        </div>
                      ) : null}
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
                  <TrinidadLocationMap className="location-map-canvas" config={mapSection || undefined} />
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
            <p className="section-eyebrow">Opiniones</p>
            <h2 className="section-title" id="opiniones-title">
              {testimonials?.title || "Lo que dicen nuestros huéspedes"}
            </h2>

            {testimonialItems.length === 0 ? (
              <p className="testimonials-empty">Pronto añadiremos opiniones de huéspedes.</p>
            ) : (
              <Splide
                className="testimonials-splide"
                options={testimonialsSplideOptions}
                aria-label="Opiniones de huéspedes"
              >
                {testimonialItems.map((t, idx) => (
                  <SplideSlide key={`${idx}-${t.slice(0, 24)}`}>
                    <blockquote className="testimonial-card">
                      <div className="testimonial-card__inner">
                        <div className="testimonial-card__stars" aria-hidden="true">
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                        </div>
                        <p className="testimonial-card__quote">{testimonialPlainText(t)}</p>
                        <footer className="testimonial-card__footer">
                          <span className="testimonial-card__mark" aria-hidden="true">
                            “
                          </span>
                          <span className="testimonial-card__badge">Huésped</span>
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
              <p className="section-eyebrow section-eyebrow--left">Reservas</p>
              <h2 className="section-title align-left">{cta?.title || "Reserva fácilmente"}</h2>
              <p>{cta?.lead || ""}</p>
              <form className="contact-form" noValidate onSubmit={handleContactSubmit}>
                <label>
                  <span>Nombre</span>
                  <input type="text" name="nombre" placeholder="Tu nombre" autoComplete="name" required />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" name="email" placeholder="correo@ejemplo.com" autoComplete="email" required />
                </label>
                <label>
                  <span>Mensaje</span>
                  <textarea name="mensaje" rows="4" placeholder="Fechas, tipo de habitación, dudas…" required></textarea>
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
                  {contactState.status === "sending" ? "Enviando…" : "Enviar consulta"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {ads.enabled && String(ads.adClient || "").trim() && String(ads.adSlot || "").trim() ? (
          <aside className="section section-ads" aria-label={ads.label || "Publicidad"}>
            <div className="container section-ads-inner">
              <p className="section-ads-eyebrow">{ads.label || "Publicidad"}</p>
              <div className="section-ads-slot">
                <GoogleAdSlot adClient={ads.adClient} adSlot={ads.adSlot} />
              </div>
            </div>
          </aside>
        ) : null}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <strong>{site?.brandName || "Casa Trinidad Viva"}</strong>
            <p>{site?.tagline || "Tu casa en el corazón de Trinidad, Cuba."}</p>
          </div>
          <div className="footer-links">
            <a href="#experiencia">Experiencia</a>
            <a href="#habitaciones">Habitaciones</a>
            <a href="#ubicacion">Ubicación</a>
            <a href="#opiniones">Opiniones</a>
            <a href="#contacto">Reservas</a>
          </div>
          <p className="footer-copy">
            © {year} {site?.brandName || "Casa Trinidad Viva"}.
          </p>
        </div>
      </footer>

      <a
        href={hero?.whatsappUrl || "#"}
        className={`whatsapp-float${whatsappFloatVisible ? " is-visible" : ""}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
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

