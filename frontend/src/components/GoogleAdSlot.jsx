import { useEffect, useRef } from "react";

/**
 * Misma URL que el snippet oficial de AdSense:
 * <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-…" crossorigin="anonymous"></script>
 */
const SCRIPT_BASE = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

function scriptIdForClient(client) {
  return `adsbygoogle-js-${client.replace(/[^a-z0-9-]/gi, "")}`;
}

/** Deja que el navegador pinte el <ins> antes del push (recomendado en SPAs). */
function afterLayout(run) {
  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}

function ensureAdSenseScript(client, onReady) {
  const id = scriptIdForClient(client);
  const existing = document.getElementById(id);
  if (existing) {
    if (existing.getAttribute("data-loaded") === "1") afterLayout(onReady);
    else existing.addEventListener("load", () => afterLayout(onReady), { once: true });
    return;
  }
  const el = document.createElement("script");
  el.id = id;
  el.async = true;
  el.setAttribute("crossorigin", "anonymous");
  el.src = `${SCRIPT_BASE}?client=${encodeURIComponent(client)}`;
  el.addEventListener("load", () => {
    el.setAttribute("data-loaded", "1");
    afterLayout(onReady);
  });
  el.addEventListener("error", () => {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[AdSense] Error cargando adsbygoogle.js (comprueba red y CSP).");
    }
  });
  document.head.appendChild(el);
}

function normalizeClient(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (/^ca-pub-\d+$/i.test(s)) return s.toLowerCase();
  if (/^\d{6,}$/.test(s)) return `ca-pub-${s}`;
  return s;
}

/**
 * Unidad display responsive (data-ad-format="auto").
 * El script global equivale al snippet de Google; el slot viene de la unidad «En pantalla» en AdSense.
 */
export default function GoogleAdSlot({ adClient, adSlot }) {
  const insRef = useRef(null);
  const filledRef = useRef(false);

  useEffect(() => {
    const client = normalizeClient(adClient);
    const slot = String(adSlot || "").trim();
    if (!client || !slot) return undefined;

    filledRef.current = false;

    const tryFill = () => {
      if (filledRef.current) return;
      const ins = insRef.current;
      if (!ins || !document.contains(ins)) return;
      filledRef.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        filledRef.current = false;
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[AdSense] adsbygoogle.push falló:", e);
        }
      }
    };

    ensureAdSenseScript(client, tryFill);

    return () => {
      filledRef.current = false;
    };
  }, [adClient, adSlot]);

  const client = normalizeClient(adClient);
  const slot = String(adSlot || "").trim();
  if (!client || !slot) return null;

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
