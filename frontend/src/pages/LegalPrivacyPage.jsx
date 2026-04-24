import React from "react";
import InnerPageLayout from "../layouts/InnerPageLayout.jsx";
import { ProseArticle } from "../components/ProseArticle.jsx";

export default function LegalPrivacyPage({ lang }) {
  return (
    <InnerPageLayout lang={lang} seoTitleKey="pages.privacy.seoTitle">
      <div className="container narrow static-page-wrap">
        <ProseArticle h1Key="pages.privacy.h1" blocksKey="pages.privacy.blocks" />
      </div>
    </InnerPageLayout>
  );
}
