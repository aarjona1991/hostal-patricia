import { build } from "esbuild";

await build({
  entryPoints: ["src/server.js"],
  outfile: "dist/server.js",
  bundle: true,
  platform: "node",
  format: "esm",
  sourcemap: true,
  target: "node18",
  external: ["better-sqlite3"],
});

