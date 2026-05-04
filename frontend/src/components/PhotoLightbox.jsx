import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PublicAdSlot from "./PublicAdSlot.jsx";
import { decAdsterraOverlaySuppression, incAdsterraOverlaySuppression } from "../lib/adsterraOverlaySuppress.js";

/** Tras cada bloque de N fotos, una pantalla de anuncio antes de seguir (solo si hay bloque publicitario configurado). */
const PHOTOS_PER_AD_BREAK = 8;

/**
 * Lightbox fullscreen para una lista de fotos con navegación y teclado.
 * @param {{ adPlacement: { provider: string; adClient?: string; adSlot?: string; adsterraKey?: string; adsterraInvokeUrl?: string; adsterraWidth?: number; adsterraHeight?: number; label?: string } | null }} props
 */
export function PhotoLightbox({ items, index, onClose, onIndexChange, labels, adPlacement = null }) {
  const closeBtnRef = useRef(null);
  const prevFocusRef = useRef(null);
  const [inAdBreak, setInAdBreak] = useState(false);

  const n = items.length;
  const safeIndex = n ? Math.min(Math.max(0, index), n - 1) : 0;
  const current = items[safeIndex];

  const adsActive = Boolean(adPlacement);

  useEffect(() => {
    setInAdBreak(false);
  }, [index]);

  /** Misma unidad AdsTerra que el pie: un solo `#container-{key}` en el documento. */
  useEffect(() => {
    if (adPlacement?.provider !== "adsterra") return undefined;
    incAdsterraOverlaySuppression();
    return () => decAdsterraOverlaySuppression();
  }, [adPlacement]);

  const goPrev = useCallback(() => {
    if (inAdBreak) {
      setInAdBreak(false);
      return;
    }
    if (n < 2) return;
    onIndexChange((safeIndex - 1 + n) % n);
  }, [inAdBreak, n, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (inAdBreak) {
      setInAdBreak(false);
      onIndexChange((safeIndex + 1) % n);
      return;
    }
    if (n < 2) return;
    const next = (safeIndex + 1) % n;
    const showAdBeforeNextPhoto =
      adsActive && next > 0 && next % PHOTOS_PER_AD_BREAK === 0 && next < n;
    if (showAdBeforeNextPhoto) {
      setInAdBreak(true);
      return;
    }
    onIndexChange(next);
  }, [adsActive, inAdBreak, n, onIndexChange, safeIndex]);

  useEffect(() => {
    prevFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(t);
      try {
        prevFocusRef.current?.focus?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  if (!current?.imgUrl) return null;

  const adEyebrow = (adPlacement?.label || "").trim() || labels.adEyebrow;
  const adSlotKey = `lb-ad-${safeIndex + 1}`;

  return createPortal(
    <div
      className="photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={inAdBreak ? adEyebrow : labels.dialogLabel}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="photo-lightbox__inner">
        <div className="photo-lightbox__stage">
          {inAdBreak && adsActive ? (
            <div className="photo-lightbox__ad">
              <p className="photo-lightbox__ad-eyebrow">{adEyebrow}</p>
              <div className="photo-lightbox__ad-slot">
                <PublicAdSlot key={adSlotKey} placement={adPlacement} />
              </div>
              <p className="photo-lightbox__ad-hint">{labels.adContinueHint}</p>
            </div>
          ) : (
            <figure className="photo-lightbox__figure">
              <img className="photo-lightbox__img" src={current.imgUrl} alt={current.alt || ""} decoding="async" />
              {current.caption?.trim() ? <figcaption className="photo-lightbox__caption">{current.caption.trim()}</figcaption> : null}
            </figure>
          )}
          {n > 1 ? (
            <p className="photo-lightbox__counter" aria-live="polite">
              {inAdBreak ? labels.adCounter : `${safeIndex + 1} / ${n}`}
            </p>
          ) : null}
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          className="photo-lightbox__close"
          onClick={onClose}
          aria-label={labels.close}
        >
          <span aria-hidden="true">×</span>
        </button>
        {n > 1 ? (
          <>
            <button type="button" className="photo-lightbox__nav photo-lightbox__nav--prev" onClick={goPrev} aria-label={labels.prev}>
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="photo-lightbox__nav photo-lightbox__nav--next" onClick={goNext} aria-label={labels.next}>
              <span aria-hidden="true">›</span>
            </button>
          </>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
