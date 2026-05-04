import { useEffect, useRef } from "react";

/**
 * Carga `invoke.js` sin `document.write`.
 * Muchas redes (AdsTerra y clones tipo profitablecpm…) esperan un contenedor
 * `#container-{key}` además de `atOptions` opcional.
 */
export default function AdsterraSlot({ adKey, invokeUrl, width = 300, height = 250 }) {
  const wrapRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    const key = String(adKey || "").trim();
    const src = String(invokeUrl || "").trim();
    if (!key || !src) return undefined;
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const w = window;
    w.atOptions = {
      key,
      format: "iframe",
      height,
      width,
      params: {},
    };

    const sc = document.createElement("script");
    sc.async = true;
    sc.type = "text/javascript";
    sc.setAttribute("data-cfasync", "false");
    sc.src = src;
    wrap.appendChild(sc);
    scriptRef.current = sc;

    return () => {
      scriptRef.current = null;
      if (sc.parentNode) sc.parentNode.removeChild(sc);
    };
  }, [adKey, invokeUrl, width, height]);

  const key = String(adKey || "").trim();
  const src = String(invokeUrl || "").trim();
  if (!key || !src) return null;

  return (
    <div className="adsterra-slot" ref={wrapRef}>
      <div id={`container-${key}`} />
    </div>
  );
}
