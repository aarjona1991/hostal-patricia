import React from "react";
import { useTranslation } from "react-i18next";

/**
 * @param {object} props
 * @param {string} props.h1Key — clave i18n del título principal
 * @param {string} props.blocksKey — clave de array de párrafos (returnObjects)
 */
export function ProseArticle({ h1Key, blocksKey }) {
  const { t } = useTranslation();
  const blocks = t(blocksKey, { returnObjects: true });
  const list = Array.isArray(blocks) ? blocks : [];

  return (
    <article className="static-prose">
      <h1>{t(h1Key)}</h1>
      {list.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </article>
  );
}
