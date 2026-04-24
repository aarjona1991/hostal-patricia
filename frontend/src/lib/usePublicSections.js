import { useEffect, useState } from "react";
import { apiFetch } from "./api.js";

/** Dedupe solo peticiones simultáneas; cada montaje vuelve a pedir datos (evita JSON obsoleto tras reinicios del API). */
let inflight = null;

function fetchSectionsOnce() {
  if (!inflight) {
    inflight = apiFetch("/api/sections", { cache: "no-store" }).finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export function usePublicSections() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSectionsOnce()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setErr(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setData(null);
          setErr(e);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, err };
}
