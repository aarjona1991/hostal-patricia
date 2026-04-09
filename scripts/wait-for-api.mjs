/**
 * Espera a que GET /api/health responda 200 (Windows/macOS/Linux, sin wait-on).
 */
import http from "node:http";

const healthUrl = process.env.WAIT_API_URL || "http://127.0.0.1:8787/api/health";
const timeoutMs = Number(process.env.WAIT_API_TIMEOUT_MS || 120_000);
const intervalMs = Number(process.env.WAIT_API_INTERVAL_MS || 500);

const url = new URL(healthUrl);
const port = url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80;
const pathWithSearch = url.pathname + url.search;
const start = Date.now();

function tryOnce() {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: url.hostname,
        port,
        path: pathWithSearch,
        timeout: 2500,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  while (Date.now() - start < timeoutMs) {
    if (await tryOnce()) {
      console.log("[wait-for-api] OK:", healthUrl);
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.error("[wait-for-api] Timeout: el backend no respondió en", healthUrl);
  console.error("  ¿Ejecutaste `npm install` en la raíz? ¿El API arranca sin errores?");
  process.exit(1);
}

main();
