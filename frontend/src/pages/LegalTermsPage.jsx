import React from "react";
import InnerPageLayout from "../layouts/InnerPageLayout.jsx";
import { ProseArticle } from "../components/ProseArticle.jsx";

export default function LegalTermsPage({ lang }) {
  return (
    <InnerPageLayout lang={lang} seoTitleKey="pages.terms.seoTitle">
      <div className="container narrow static-page-wrap">
        <ProseArticle h1Key="pages.terms.h1" blocksKey="pages.terms.blocks" />
      </div>
    </InnerPageLayout>
  );
}
