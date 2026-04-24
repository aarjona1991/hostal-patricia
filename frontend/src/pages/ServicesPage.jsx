import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import InnerPageLayout from "../layouts/InnerPageLayout.jsx";
import { ProseArticle } from "../components/ProseArticle.jsx";
import { usePublicView } from "../lib/PublicViewContext.jsx";
import { pathForHomeReservation } from "../lib/publicRoutes.js";

function safeGet(obj, key, fallback) {
  return obj && obj[key] != null ? obj[key] : fallback;
}

function hasSplitServicesBody(split) {
  const amenities = Array.isArray(split?.amenities) ? split.amenities : [];
  const hasList = amenities.some((a) => String(a || "").trim());
  const hasImg = Boolean(split?.imgUrl && String(split.imgUrl).trim());
  return hasList || hasImg;
}

function ServicesPageInner({ lang }) {
  const { t, i18n } = useTranslation();
  const viewData = usePublicView();
  const split = viewData ? safeGet(viewData, "split", {}) : {};
  const h1 = (split.pageH1 || "").trim() || t("pages.services.h1");
  const pageLead = (split.pageLead || "").trim();
  const blocks = Array.isArray(split.pageBlocks) ? split.pageBlocks.map((b) => String(b || "").trim()).filter(Boolean) : [];
  const hasSplitBlock = hasSplitServicesBody(split);
  const fallbackProse = !hasSplitBlock && blocks.length === 0;

  useEffect(() => {
    const custom = (split.pageSeoTitle || "").trim();
    document.title = custom || t("pages.services.seoTitle");
  }, [split?.pageSeoTitle, t, i18n.language]);

  if (fallbackProse) {
    return (
      <div className="container narrow static-page-wrap">
        <ProseArticle h1Key="pages.services.h1" blocksKey="pages.services.blocks" />
      </div>
    );
  }

  const titleInSplit = (split.title || "").trim() || t("section.splitTitleDefault");
  const cta = (split.ctaLabel || "").trim() || t("section.splitCta");

  return (
    <div className="services-page-wrap">
      <header className="services-page-head container narrow">
        <h1 className="services-page-h1">{h1}</h1>
        {pageLead ? <p className="services-page-lead">{pageLead}</p> : null}
      </header>

      {hasSplitBlock ? (
        <section className="section section-split services-page-split" aria-label={titleInSplit}>
          <div className="split-visual">
            {split?.imgUrl ? <img src={split.imgUrl} alt={split.alt || ""} loading="lazy" /> : null}
          </div>
          <div className="split-content">
            <h2 className="section-title align-left">{titleInSplit}</h2>
            <ul className="amenities-list">
              {(Array.isArray(split.amenities) ? split.amenities : []).map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
            <Link to={pathForHomeReservation(lang)} className="btn btn-secondary">
              {cta}
            </Link>
          </div>
        </section>
      ) : null}

      {blocks.length > 0 ? (
        <div className="container narrow static-page-wrap services-page-prose">
          <article className="static-prose">
            {blocks.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </article>
        </div>
      ) : null}
    </div>
  );
}

export default function ServicesPage({ lang }) {
  return (
    <InnerPageLayout lang={lang} seoTitleKey={null}>
      <ServicesPageInner lang={lang} />
    </InnerPageLayout>
  );
}
