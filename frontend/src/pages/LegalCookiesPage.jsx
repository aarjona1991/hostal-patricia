import React from "react";
import InnerPageLayout from "../layouts/InnerPageLayout.jsx";
import { ProseArticle } from "../components/ProseArticle.jsx";

export default function LegalCookiesPage({ lang }) {
  return (
    <InnerPageLayout lang={lang} seoTitleKey="pages.cookies.seoTitle">
      <div className="container narrow static-page-wrap">
        <ProseArticle h1Key="pages.cookies.h1" blocksKey="pages.cookies.blocks" />
      </div>
    </InnerPageLayout>
  );
}
