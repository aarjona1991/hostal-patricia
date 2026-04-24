import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import InnerPageLayout from "../layouts/InnerPageLayout.jsx";
import { ProseArticle } from "../components/ProseArticle.jsx";
import { RoomDetailCards } from "../components/RoomDetailCards.jsx";
import { usePublicView } from "../lib/PublicViewContext.jsx";

function safeGet(obj, key, fallback) {
  return obj && obj[key] != null ? obj[key] : fallback;
}

function hasRoomPageItemsGrid(rooms) {
  const items = Array.isArray(rooms?.pageItems) ? rooms.pageItems : [];
  return items.some((it) => {
    if (!it || typeof it !== "object") return false;
    const hasImg = Array.isArray(it.images) && it.images.some((x) => x && String(x.imgUrl || "").trim());
    return Boolean(hasImg || String(it.title || "").trim() || String(it.body || "").trim());
  });
}

function RoomsPageInner() {
  const { t, i18n } = useTranslation();
  const viewData = usePublicView();
  const rooms = viewData ? safeGet(viewData, "rooms", {}) : {};
  const ads = viewData?.ads && typeof viewData.ads === "object" ? viewData.ads : null;
  const showGrid = hasRoomPageItemsGrid(rooms);
  const h1 = (rooms.pageH1 || "").trim() || t("pages.rooms.h1");
  const pageLead = (rooms.pageLead || "").trim();

  useEffect(() => {
    const custom = (rooms.pageSeoTitle || "").trim();
    document.title = custom || t("pages.rooms.seoTitle");
  }, [rooms?.pageSeoTitle, t, i18n.language]);

  return (
    <>
      {showGrid ? (
        <div className="container room-detail-page-wrap">
          <header className="room-detail-page-head">
            <h1 className="room-detail-page-h1">{h1}</h1>
            {pageLead ? (
              <p className="room-detail-page-lead">{pageLead}</p>
            ) : null}
          </header>
          <RoomDetailCards rooms={rooms} ads={ads} />
        </div>
      ) : (
        <div className="container narrow static-page-wrap">
          <ProseArticle h1Key="pages.rooms.h1" blocksKey="pages.rooms.blocks" />
        </div>
      )}
    </>
  );
}

export default function RoomsPage({ lang }) {
  return (
    <InnerPageLayout lang={lang} seoTitleKey={null}>
      <RoomsPageInner />
    </InnerPageLayout>
  );
}
