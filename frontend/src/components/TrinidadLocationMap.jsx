import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_PIN_MAIN, MAP_PIN_NEAR } from "../lib/mapPins.js";

/** Vista por defecto: Trinidad + península y Playa Ancón. */
const REGION_SW = [-80.02, 21.7];
const REGION_NE = [-79.91, 21.83];
const DEFAULT_CENTER = [-79.965, 21.758];
const DEFAULT_ZOOM = 11.25;

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toLngLat(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
  return [ln, la];
}

/**
 * Mapa (OpenFreeMap + MapLibre). Si `config` trae `main` y/o `nearby`, dibuja marcadores
 * y encuadra la vista; el punto principal usa color distintivo.
 */
export function TrinidadLocationMap({ className = "", config }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const main = config?.main;
    const mainLL = main ? toLngLat(main.lat, main.lng) : null;
    const nearbyList = Array.isArray(config?.nearby) ? config.nearby : [];
    const nearbyValid = nearbyList
      .map((p) => ({ p, ll: toLngLat(p.lat, p.lng) }))
      .filter((x) => x.ll);

    const z = Number(config?.defaultZoom);
    const initialZoom = Number.isFinite(z) ? z : DEFAULT_ZOOM;
    const hasAnyMarker = Boolean(mainLL) || nearbyValid.length > 0;

    const regionBounds = new maplibregl.LngLatBounds(REGION_SW, REGION_NE);

    const map = new maplibregl.Map({
      container: el,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: mainLL || nearbyValid[0]?.ll || DEFAULT_CENTER,
      zoom: hasAnyMarker ? initialZoom : DEFAULT_ZOOM,
      maxBounds: [
        [-80.06, 21.66],
        [-79.86, 21.88],
      ],
      attributionControl: false,
    });

    const markers = [];

    if (mainLL) {
      const m = new maplibregl.Marker({ color: MAP_PIN_MAIN }).setLngLat(mainLL).addTo(map);
      const html = [`<strong>${escapeHtml(main.name)}</strong>`];
      if (main.description) html.push(escapeHtml(main.description));
      m.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(html.join("<br>")));
      markers.push(m);
    }

    for (const { p, ll } of nearbyValid) {
      const m = new maplibregl.Marker({ color: MAP_PIN_NEAR }).setLngLat(ll).addTo(map);
      const html = [`<strong>${escapeHtml(p.name)}</strong>`];
      if (p.note) html.push(escapeHtml(p.note));
      m.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(html.join("<br>")));
      markers.push(m);
    }

    const fit = () => {
      const coords = [];
      if (mainLL) coords.push(mainLL);
      for (const { ll } of nearbyValid) coords.push(ll);

      if (coords.length === 0) {
        map.fitBounds(regionBounds, { padding: 52, duration: 0, maxZoom: 12 });
        return;
      }

      const b = new maplibregl.LngLatBounds(coords[0], coords[0]);
      for (let i = 1; i < coords.length; i++) b.extend(coords[i]);
      b.extend(REGION_SW);
      b.extend(REGION_NE);
      map.fitBounds(b, { padding: 56, maxZoom: 12.5, duration: 0 });
    };

    if (map.loaded()) fit();
    else map.once("load", fit);

    return () => {
      for (const m of markers) m.remove();
      map.remove();
    };
  }, [config]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Mapa de Trinidad, la península y Playa Ancón"
    />
  );
}
