// Publica las capturas que usa una pieza: `node scripts/trailer-shots-publish.mjs <pieza>`.
// Lee docs/trailer/<pieza>/capturas.json (ids como "tienda/ficha-galeria-1440-dark", sin extensión), convierte cada PNG de
// docs/trailer/capturas/ a JPEG calidad 88 (máx. 2880 px de ancho) en public/trailer/shots/ y avisa de los que falten.
import fs from "node:fs";
import path from "node:path";
import { root } from "./kit-lib.mjs";
import { ffmpegAvailable, run } from "./trailer-export-lib.mjs";

const pieza = process.argv[2];
if (!pieza) { console.error("Uso: node scripts/trailer-shots-publish.mjs <pieza>"); process.exit(1); }
if (!ffmpegAvailable()) { console.error("Falta ffmpeg en el PATH."); process.exit(1); }
const list = path.join(root, "docs/trailer", pieza, "capturas.json");
if (!fs.existsSync(list)) { console.error(`No existe ${path.relative(root, list)}`); process.exit(1); }

const outDir = path.join(root, "public/trailer/shots");
fs.mkdirSync(outDir, { recursive: true });
const missing = [];
let done = 0;
for (const id of JSON.parse(fs.readFileSync(list, "utf8"))) {
  const src = path.join(root, "docs/trailer/capturas", `${id}.png`);
  if (!fs.existsSync(src)) { missing.push(id); continue; }
  await run(["-i", src, "-vf", "scale='min(2880,iw)':-2", "-q:v", "3", path.join(outDir, `${id.split("/").pop()}.jpg`)]);
  done += 1;
}
console.log(`✓ ${done} capturas en public/trailer/shots/`);
if (missing.length) { console.error(`Faltan (corré trailer-capture.mjs): ${missing.join(", ")}`); process.exit(2); }
