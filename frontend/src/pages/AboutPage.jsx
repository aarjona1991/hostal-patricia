import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import InnerPageLayout from "../layouts/InnerPageLayout.jsx";
import { ProseArticle } from "../components/ProseArticle.jsx";
import { PhotoLightbox } from "../components/PhotoLightbox.jsx";
import { usePublicView } from "../lib/PublicViewContext.jsx";

function AboutPageInner() {
  const { t, i18n } = useTranslation();
  const viewData = usePublicView();
  const about = viewData?.aboutPage && typeof viewData.aboutPage === "object" ? viewData.aboutPage : {};
  const ads = viewData?.ads && typeof viewData.ads === "object" ? viewData.ads : null;
  const blocks = Array.isArray(about.pageBlocks)
    ? about.pageBlocks.map((b) => String(b || "").trim()).filter(Boolean)
    : [];
  const h1 = (about.pageH1 || "").trim() || t("pages.about.h1");
  const pageLead = (about.pageLead || "").trim();
  const cover = about.cover && typeof about.cover === "object" ? about.cover : {};
  const photos = Array.isArray(about.photos) ? about.photos : [];
  const hasMedia =
    Boolean(String(cover?.imgUrl || "").trim()) || photos.some((p) => p && String(p.imgUrl || "").trim());
  const useCms = blocks.length > 0 || hasMedia;
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const lightboxItems = useMemo(() => {
    const out = [];
    if (String(cover?.imgUrl || "").trim()) {
      out.push({
        imgUrl: String(cover.imgUrl).trim(),
        alt: cover.alt != null ? String(cover.alt) : "",
        caption: cover.caption != null ? String(cover.caption) : "",
      });
    }
    for (const p of photos) {
      if (!p || !String(p.imgUrl || "").trim()) continue;
      out.push({
        imgUrl: String(p.imgUrl).trim(),
        alt: p.alt != null ? String(p.alt) : "",
        caption: p.caption != null ? String(p.caption) : "",
      });
    }
    return out;
  }, [cover?.imgUrl, cover?.alt, cover?.caption, photos]);

  useEffect(() => {
    const custom = (about.pageSeoTitle || "").trim();
    document.title = custom || t("pages.about.seoTitle");
  }, [about?.pageSeoTitle, t, i18n.language]);

  if (!useCms) {
    return (
      <div className="container narrow static-page-wrap">
        <ProseArticle h1Key="pages.about.h1" blocksKey="pages.about.blocks" />
      </div>
    );
  }

  return (
    <div className="container narrow static-page-wrap about-page-wrap">
      <article className="static-prose">
        <h1>{h1}</h1>
        {pageLead ? <p className="about-page-lead">{pageLead}</p> : null}
        {lightboxItems.length > 0 ? (
          <div className="cms-page-media">
            {String(cover?.imgUrl || "").trim() ? (
              <button
                type="button"
                className="cms-page-cover-btn"
                onClick={() => setLightboxIndex(0)}
                aria-label={t("gallery.dialogLabel")}
              >
                <figure className="cms-page-cover">
                  <img src={String(cover.imgUrl).trim()} alt={cover.alt || ""} loading="lazy" decoding="async" />
                  {String(cover.caption || "").trim() ? (
                    <figcaption className="cms-page-cover-cap">{String(cover.caption).trim()}</figcaption>
                  ) : null}
                </figure>
              </button>
            ) : null}
            {lightboxItems.length > (String(cover?.imgUrl || "").trim() ? 1 : 0) ? (
              <ul className="gallery-grid cms-page-gallery" role="list">
                {lightboxItems.slice(String(cover?.imgUrl || "").trim() ? 1 : 0).map((p, idx) => {
                  const absoluteIndex = (String(cover?.imgUrl || "").trim() ? 1 : 0) + idx;
                  return (
                    <li className="gallery-tile" key={`${absoluteIndex}-${p.imgUrl}`}>
                      <button type="button" className="gallery-tile-btn" onClick={() => setLightboxIndex(absoluteIndex)}>
                        <figure className="gallery-tile-figure">
                          <img src={p.imgUrl} alt={p.alt || ""} loading="lazy" decoding="async" />
                        </figure>
                        {p.caption?.trim() ? <span className="gallery-tile-cap">{p.caption.trim()}</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
        {blocks.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
      {lightboxIndex !== null && lightboxItems.length > 0 ? (
        <PhotoLightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
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
            ads && ads.enabled && String(ads.adClient || "").trim() && String(ads.adSlot || "").trim()
              ? { adClient: ads.adClient, adSlot: ads.adSlot, label: (ads.label || "").trim() }
              : null
          }
        />
      ) : null}
    </div>
  );
}

export default function AboutPage({ lang }) {
  return (
    <InnerPageLayout lang={lang} seoTitleKey={null}>
      <AboutPageInner />
    </InnerPageLayout>
  );
}
