import React from "react";
import { useTranslation } from "react-i18next";
import InnerPageLayout from "../layouts/InnerPageLayout.jsx";
import { ContactFormBlock } from "../components/ContactFormBlock.jsx";

export default function ContactPage({ lang }) {
  const { t } = useTranslation();

  return (
    <InnerPageLayout lang={lang} seoTitleKey="pages.contact.seoTitle">
      <div className="container narrow static-page-wrap">
        <article className="static-prose static-prose--contact">
          <h1>{t("pages.contact.h1")}</h1>
          <p className="static-prose__lead">{t("pages.contact.lead")}</p>
          <ContactFormBlock />
        </article>
      </div>
    </InnerPageLayout>
  );
}
