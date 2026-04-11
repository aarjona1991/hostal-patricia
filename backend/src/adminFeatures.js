/**
 * Sección «Publicidad» (AdSense) en /admin.
 * Por defecto visible. Ocultar con ADMIN_SHOW_ADVERTISING=0|false|no|off
 */
export function isAdminAdvertisingSectionEnabled() {
  const raw = process.env.ADMIN_SHOW_ADVERTISING?.trim();
  if (raw === undefined || raw === "") return true;
  const v = raw.toLowerCase();
  if (["0", "false", "no", "off"].includes(v)) return false;
  return true;
}
