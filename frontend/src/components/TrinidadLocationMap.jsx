import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_PIN_MAIN, MAP_PIN_NEAR, resolvePinImageUrl } from "../lib/mapPins.js";

/** Vista por defecto: Trinidad + península y Playa Ancón. */
const REGION_SW = [-80.02, 21.7];
const REGION_NE = [-79.91, 21.83];
const DEFAULT_CENTER = [-79.965, 21.758];
/** Sin marcadores: vista regional. */
const DEFAULT_REGIONAL_ZOOM = 11.25;
/** Con hostal: zoom cercano si no viene `config.defaultZoom`. */
const DEFAULT_FOCUS_ZOOM = 15;

/**
 * Límite de paneo: debe cubrir Trinidad, la costa este (p. ej. Ancón ~-79.857) y margen por si añades puntos en admin.
 * El recuadro anterior cortaba lng > -79.86 y dejaba fuera del encuadre a Ancón.
 */
const MAP_MAX_BOUNDS = [
  [-80.15, 21.58],
  [-79.72, 21.95],
];

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

function createImagePinElement(imgUrl, variant, title) {
  const wrap = document.createElement("div");
  wrap.className = `maplibregl-custom-pin maplibregl-custom-pin--${variant}`;
  wrap.setAttribute("aria-label", title || "Marcador");
  const img = document.createElement("img");
  img.src = imgUrl;
  img.alt = "";
  img.decoding = "async";
  img.addEventListener("error", () => {
    img.remove();
    wrap.style.backgroundColor = variant === "main" ? MAP_PIN_MAIN : MAP_PIN_NEAR;
  });
  wrap.appendChild(img);
  return wrap;
}

function addMarker(map, ll, opts) {
  const { imgUrl, variant, title, color, popupHtml } = opts;
  let m;
  if (imgUrl) {
    const el = createImagePinElement(imgUrl, variant, title);
    m = new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(ll).addTo(map);
  } else {
    m = new maplibregl.Marker({ color }).setLngLat(ll).addTo(map);
  }
  m.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml));
  return m;
}

/**
 * Mapa (OpenFreeMap + MapLibre). Marcadores en `main` y `nearby`; la vista inicial se centra
 * en el hostal (`main`) con `defaultZoom` (p. ej. 15 = barrio). Los demás puntos se ven al desplazar el mapa.
 */
export function TrinidadLocationMap({ className = "", config, pinImages }) {
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
    const focusZoom = Number.isFinite(z) && z > 0 ? z : DEFAULT_FOCUS_ZOOM;
    const hasAnyMarker = Boolean(mainLL) || nearbyValid.length > 0;

    const regionBounds = new maplibregl.LngLatBounds(REGION_SW, REGION_NE);

    const map = new maplibregl.Map({
      container: el,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: mainLL || nearbyValid[0]?.ll || DEFAULT_CENTER,
      zoom: hasAnyMarker ? focusZoom : DEFAULT_REGIONAL_ZOOM,
      maxBounds: MAP_MAX_BOUNDS,
      attributionControl: false,
    });

    const markers = [];

    if (mainLL) {
      const html = [`<strong>${escapeHtml(main.name)}</strong>`];
      if (main.description) html.push(escapeHtml(main.description));
      const imgUrl = resolvePinImageUrl(pinImages, main.name, main.imgUrl);
      markers.push(
        addMarker(map, mainLL, {
          imgUrl,
          variant: "main",
          title: main.name,
          color: MAP_PIN_MAIN,
          popupHtml: html.join("<br>"),
        })
      );
    }

    for (const { p, ll } of nearbyValid) {
      const html = [`<strong>${escapeHtml(p.name)}</strong>`];
      if (p.note) html.push(escapeHtml(p.note));
      const imgUrl = resolvePinImageUrl(pinImages, p.name, p.imgUrl);
      markers.push(
        addMarker(map, ll, {
          imgUrl,
          variant: "near",
          title: p.name,
          color: MAP_PIN_NEAR,
          popupHtml: html.join("<br>"),
        })
      );
    }

    const applyInitialView = () => {
      if (mainLL) {
        map.jumpTo({ center: mainLL, zoom: focusZoom });
        return;
      }
      const coords = nearbyValid.map((x) => x.ll);
      if (coords.length === 0) {
        map.fitBounds(regionBounds, { padding: 52, duration: 0, maxZoom: 12 });
        return;
      }
      if (coords.length === 1) {
        map.jumpTo({ center: coords[0], zoom: focusZoom });
        return;
      }
      const b = new maplibregl.LngLatBounds(coords[0], coords[0]);
      for (let i = 1; i < coords.length; i++) b.extend(coords[i]);
      map.fitBounds(b, {
        padding: { top: 48, right: 48, bottom: 72, left: 48 },
        maxZoom: 16,
        duration: 0,
      });
    };

    if (map.loaded()) applyInitialView();
    else map.once("load", applyInitialView);

    return () => {
      for (const m of markers) m.remove();
      map.remove();
    };
  }, [config, pinImages]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Mapa de Trinidad, la península y Playa Ancón"
    />
  );
}
