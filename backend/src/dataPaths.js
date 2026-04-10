import path from "node:path";

/**
 * Rutas de persistencia: misma prioridad que SQLite.
 * 1) Variable explícita (ruta absoluta o relativa al cwd)
 * 2) DATA_DIR (app.db o uploads dentro de esa carpeta)
 * 3) {repoRoot}/data/… (monorepo; no depende del cwd del proceso)
 */

export function resolveDbPath(repoRoot) {
  const explicit = process.env.SQLITE_PATH?.trim();
  if (explicit) return path.resolve(explicit);
  const dataDir = process.env.DATA_DIR?.trim();
  if (dataDir) return path.join(path.resolve(dataDir), "app.db");
  return path.join(repoRoot, "data", "app.db");
}

export function resolveUploadDir(repoRoot) {
  const explicit = process.env.UPLOAD_DIR?.trim();
  if (explicit) return path.resolve(explicit);
  const dataDir = process.env.DATA_DIR?.trim();
  if (dataDir) return path.join(path.resolve(dataDir), "uploads");
  return path.join(repoRoot, "data", "uploads");
}
