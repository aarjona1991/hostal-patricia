import { useSyncExternalStore } from "react";

/**
 * Mientras un overlay (p. ej. lightbox de galería) muestra un bloque AdsTerra,
 * el pie de página no debe montar el mismo `id="container-{key}"` (id duplicado + atOptions global).
 * Recuento: varios lightboxes anidados / Strict Mode.
 */
let refCount = 0;
const listeners = new Set();

function emit() {
  for (const l of listeners) l();
}

export function subscribeAdsterraOverlaySuppression(onStoreChange) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getAdsterraOverlaySuppressionSnapshot() {
  return refCount > 0;
}

export function getAdsterraOverlaySuppressionServerSnapshot() {
  return false;
}

export function incAdsterraOverlaySuppression() {
  refCount += 1;
  emit();
}

export function decAdsterraOverlaySuppression() {
  refCount = Math.max(0, refCount - 1);
  emit();
}

/** `true` mientras un overlay está mostrando AdsTerra (ocultar el bloque del pie con la misma unidad). */
export function useAdsterraOverlayCoversFooter() {
  return useSyncExternalStore(
    subscribeAdsterraOverlaySuppression,
    getAdsterraOverlaySuppressionSnapshot,
    getAdsterraOverlaySuppressionServerSnapshot
  );
}
