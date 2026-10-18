// Render previo del sonido de una pieza (T1.2): música + cue sheet de la pieza, sin recetas ni escenas.
// Uso: node scripts/trailer-music.mjs <pieza> [salida.m4a]   (la pieza vive en src/trailer/pieces/<pieza>.ts)
// Empaqueta el audio con Vite, lo renderiza en Chromium (OfflineAudioContext) y lo normaliza a −14 LUFS / −2 dBTP (≈ −1 tras el AAC).
import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build } from "vite";
import { root } from "./kit-lib.mjs";
import { ffmpegAvailable, LOUDNORM, run } from "./trailer-export-lib.mjs";

const pieza = process.argv[2];
if (!pieza) { console.error("Uso: node scripts/trailer-music.mjs <pieza> [salida.m4a]"); process.exit(1); }
if (!ffmpegAvailable()) { console.error("Falta ffmpeg en el PATH."); process.exit(1); }
const out = path.resolve(process.argv[3] ?? path.join(root, "docs/trailer", pieza, `musica-${pieza}.m4a`));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "trailer-music-"));
const entry = path.join(tmp, "entry.ts");
fs.writeFileSync(entry, `
import { pieceNotes } from ${JSON.stringify(path.join(root, "src/trailer/audio/piece.ts"))};
import { renderAudio } from ${JSON.stringify(path.join(root, "src/trailer/audio/render.ts"))};
import { encodeWav } from ${JSON.stringify(path.join(root, "src/trailer/audio/wav.ts"))};
import { ${pieza} as spec } from ${JSON.stringify(path.join(root, `src/trailer/pieces/${pieza}.ts`))};
(window as any).renderPiece = async () => {
  const buf = await renderAudio(pieceNotes(spec), spec.duration);
  (window as any).pieceDuration = spec.duration;
  const wav = encodeWav([buf.getChannelData(0), buf.getChannelData(1)], buf.sampleRate);
  let s = ""; for (let i = 0; i < wav.length; i += 0x8000) s += String.fromCharCode(...wav.subarray(i, i + 0x8000));
  return btoa(s);
};`);
const result = await build({ configFile: false, logLevel: "silent", root: tmp, build: { write: false, minify: false, lib: { entry, formats: ["iife"], name: "TrailerMusic", fileName: "bundle" } } });
const code = (Array.isArray(result) ? result[0] : result).output[0].code;
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage();
  await page.setContent("<html></html>");
  await page.addScriptTag({ content: code });
  const b64 = await page.evaluate(() => window.renderPiece());
  const secs = await page.evaluate(() => window.pieceDuration);
  const wav = path.join(tmp, `${pieza}.wav`);
  fs.writeFileSync(wav, Buffer.from(b64, "base64"));
  if (process.env.TRAILER_MUSIC_WAV) fs.copyFileSync(wav, process.env.TRAILER_MUSIC_WAV); // sin normalizar, para medir la mezcla
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await run(["-i", wav, "-af", LOUDNORM, "-t", String(secs), "-c:a", "aac", "-b:a", "160k", "-ar", "48000", out]); // recorta la cola del render
  console.log(`✓ ${path.relative(root, out)}`);
} finally { await browser.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
