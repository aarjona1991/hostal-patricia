import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

function scriptIdForClient(client) {
  return `adsbygoogle-js-${client.replace(/[^a-z0-9-]/gi, "")}`;
}

function ensureAdSenseScript(client, onLoaded) {
  const id = scriptIdForClient(client);
  const existing = document.getElementById(id);
  if (existing) {
    if (existing.getAttribute("data-loaded") === "1") onLoaded();
    else existing.addEventListener("load", onLoaded, { once: true });
    return;
  }
  const el = document.createElement("script");
  el.id = id;
  el.async = true;
  el.crossOrigin = "anonymous";
  el.src = `${SCRIPT_SRC}?client=${encodeURIComponent(client)}`;
  el.addEventListener("load", () => {
    el.setAttribute("data-loaded", "1");
    onLoaded();
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

/** Unidad responsive de AdSense; rellena con datos del panel (cliente + slot). */
export default function GoogleAdSlot({ adClient, adSlot }) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    const client = normalizeClient(adClient);
    const slot = String(adSlot || "").trim();
    if (!client || !slot) return undefined;

    let cancelled = false;

    const tryPush = () => {
      if (cancelled || pushedRef.current || !insRef.current) return;
      pushedRef.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        pushedRef.current = false;
      }
    };

    ensureAdSenseScript(client, tryPush);
    if (window.adsbygoogle) queueMicrotask(tryPush);

    return () => {
      cancelled = true;
      pushedRef.current = false;
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
