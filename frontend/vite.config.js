import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Base pública del build: debe coincidir con la URL (ej. /app/ si la SPA está en /app/). */
function resolveBase(mode) {
  const repoRoot = path.resolve(__dirname, "..");
  const fileEnv = loadEnv(mode, repoRoot, "");

  const fromVite =
    (process.env.VITE_BASE || fileEnv.VITE_BASE || "").trim();
  if (fromVite) {
    if (fromVite === "/" || fromVite === "") return "/";
    return fromVite.endsWith("/") ? fromVite : `${fromVite}/`;
  }

  // Solo en build: lee HOSTINGER_STATIC_SUBDIR del .env del monorepo (evita romper `vite dev` si está en .env del VPS).
  if (mode === "production") {
    const sub = (
      fileEnv.HOSTINGER_STATIC_SUBDIR ||
      process.env.HOSTINGER_STATIC_SUBDIR ||
      ""
    )
      .trim()
      .replace(/^\/+|\/+$/g, "");
    if (sub) return `/${sub}/`;
  }

  return "/";
}

export default defineConfig(({ mode }) => ({
  base: resolveBase(mode),
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
}));
