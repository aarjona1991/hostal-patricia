import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Hostinger sin cambiar document root: en el VPS exporta VITE_BASE=/app/ y copia dist a public_html/app
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // 127.0.0.1 evita ECONNREFUSED por IPv6 (::1) en algunos Windows
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
});

