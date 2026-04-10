import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "../package.json"), "utf8"));
const external = Object.keys(pkg.dependencies || {});

await build({
  entryPoints: ["src/server.js"],
  outfile: "dist/server.js",
  bundle: true,
  platform: "node",
  format: "esm",
  sourcemap: true,
  target: "node18",
  // No empaquetar dependencias: dotenv/express usan require("fs") y rompen en ESM bundle.
  external,
});
