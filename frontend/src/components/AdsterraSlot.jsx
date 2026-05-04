import { useEffect, useRef } from "react";

/**
 * Carga un bloque estándar AdsTerra (formato iframe) sin `document.write`.
 * El panel suele dar un snippet con `atOptions` + script `…/invoke.js`.
 */
export default function AdsterraSlot({ adKey, invokeUrl, width = 300, height = 250 }) {
  const hostRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    const key = String(adKey || "").trim();
    const src = String(invokeUrl || "").trim();
    if (!key || !src) return undefined;
    const el = hostRef.current;
    if (!el) return undefined;

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
    sc.src = src;
    el.appendChild(sc);
    scriptRef.current = sc;

    return () => {
      scriptRef.current = null;
      if (sc.parentNode) sc.parentNode.removeChild(sc);
    };
  }, [adKey, invokeUrl, width, height]);

  const key = String(adKey || "").trim();
  const src = String(invokeUrl || "").trim();
  if (!key || !src) return null;

  return <div className="adsterra-slot" ref={hostRef} />;
}
