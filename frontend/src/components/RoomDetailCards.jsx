import React, { useMemo, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useTranslation } from "react-i18next";
import { PhotoLightbox } from "./PhotoLightbox.jsx";

function normalizePhotos(raw) {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((p) => ({
      imgUrl: p && String(p.imgUrl || "").trim(),
      alt: p && p.alt != null ? String(p.alt) : "",
      caption: p && p.caption != null ? String(p.caption) : "",
    }))
    .filter((p) => p.imgUrl);
}

/**
 * @param {object} props
 * @param {{ title?: string; body?: string; images?: unknown[] }} props.item
 * @param {object | null} props.ads — sección ads (opcional, para lightbox)
 */
function RoomDetailCard({ item, ads }) {
  const { t } = useTranslation();
  const photos = useMemo(() => normalizePhotos(item?.images), [item?.images]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const adSense =
    ads?.enabled && String(ads.adClient || "").trim() && String(ads.adSlot || "").trim()
      ? {
          adClient: ads.adClient,
          adSlot: ads.adSlot,
          label: (ads.label || "").trim(),
        }
      : null;

  const splideOpts = useMemo(() => {
    const n = photos.length;
    return {
      type: n > 1 ? "slide" : "fade",
      rewind: n > 1,
      perPage: 1,
      arrows: n > 1,
      pagination: n > 1,
      drag: n > 1,
      speed: 400,
      easing: "cubic-bezier(0.25, 1, 0.45, 1)",
    };
  }, [photos.length]);

  const title = (item?.title || "").trim();
  const body = (item?.body || "").trim();

  return (
    <article className="room-detail-card">
      <div className="room-detail-card__media">
        {photos.length === 0 ? (
          <div className="room-detail-card__media-placeholder" aria-hidden="true" />
        ) : (
          <>
            <Splide className="room-detail-splide" options={splideOpts} aria-label={title || t("pages.rooms.sliderAria")}>
              {photos.map((p, idx) => (
                <SplideSlide key={`${p.imgUrl}-${idx}`}>
                  <button
                    type="button"
                    className="room-detail-slide-btn"
                    onClick={() => setLightboxIndex(idx)}
                    aria-haspopup="dialog"
                    aria-label={t("pages.rooms.openLightboxAria", { n: idx + 1, total: photos.length })}
                  >
                    <img src={p.imgUrl} alt={p.alt || ""} loading="lazy" decoding="async" />
                  </button>
                </SplideSlide>
              ))}
            </Splide>
            {photos.length > 1 ? (
              <p className="room-detail-slide-hint">{t("pages.rooms.slideHint")}</p>
            ) : null}
          </>
        )}
      </div>
      <div className="room-detail-card__body">
        {title ? <h2 className="room-detail-card__title">{title}</h2> : null}
        {body ? (
          <div className="room-detail-card__text">
            {body.split(/\n\n+/).map((para, i) => (
              <p key={i}>{para.trim()}</p>
            ))}
          </div>
        ) : null}
      </div>

      {lightboxIndex !== null && photos.length > 0 ? (
        <PhotoLightbox
          items={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
          labels={{
            close: t("gallery.close"),
            prev: t("gallery.prev"),
            next: t("gallery.next"),
            dialogLabel: t("pages.rooms.lightboxLabel"),
            adEyebrow: t("section.adsDefault"),
            adCounter: t("gallery.adCounter"),
            adContinueHint: t("gallery.adContinueHint"),
          }}
          adSense={adSense}
        />
      ) : null}
    </article>
  );
}

/**
 * Lista de habitaciones detalladas para /habitaciones.
 * @param {{ pageItems?: unknown[] }} props.rooms — sección `rooms` localizada
 * @param {object | null} props.ads
 */
export function RoomDetailCards({ rooms, ads }) {
  const items = Array.isArray(rooms?.pageItems) ? rooms.pageItems : [];
  const valid = items.filter((it) => it && (String(it.title || "").trim() || String(it.body || "").trim() || normalizePhotos(it.images).length > 0));

  if (valid.length === 0) return null;

  return (
    <div className="room-detail-cards">
      {valid.map((item, idx) => (
        <RoomDetailCard key={`${idx}-${item.title || ""}`} item={item} ads={ads} />
      ))}
    </div>
  );
}
