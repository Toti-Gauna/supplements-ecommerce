// Exportador de trailers a MP4 (P0.6): graba la pieza cuadro a cuadro desde /trailer/<pieza>/?export=1 y la une con su audio.
// Uso: `PAGES_BASE_PATH=/supplements-ecommerce npm run build` y
//   node scripts/trailer-export.mjs <pieza> [--ratio 16x9|9x16|both] [--fps 60] [--only audio|poster|email|video] [--poster-at 4]
// Salida en public/trailer/: <pieza>.m4a (audio −14 LUFS, el que reproduce la página), <pieza>-16x9.mp4, <pieza>-9x16.mp4,
// <pieza>-email.mp4 (720p, < 10 MB) y <pieza>-poster.jpg. Levanta su propio servidor y comprueba que el cuadro sea determinista.
import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { root, startServer } from "./kit-lib.mjs";
import { emailVersion, ffmpegAvailable, LOUDNORM, run, videoEncoder } from "./trailer-export-lib.mjs";

const args = process.argv.slice(2);
const pieza = args[0] && !args[0].startsWith("--") ? args[0] : "firma";
const opt = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const ratios = opt("ratio", "both") === "both" ? ["16x9", "9x16"] : [opt("ratio")];
const fps = Number(opt("fps", 60));
const only = opt("only", "all");
const posterAt = Number(opt("poster-at", 4));
const want = (what) => only === "all" || only === what;
const SIZE = { "16x9": { width: 1920, height: 1080 }, "9x16": { width: 1080, height: 1920 } };

if (!ffmpegAvailable()) { console.error("Falta ffmpeg en el PATH."); process.exit(1); }
const outDir = path.join(root, "public/trailer");
fs.mkdirSync(outDir, { recursive: true });
const out = (name) => path.join(outDir, name);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "trailer-"));

const { url, stop } = await startServer(Number(process.env.TRAILER_EXPORT_PORT ?? 4398));
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
const open = async (ratio) => {
  const page = await (await browser.newContext({ viewport: SIZE[ratio], deviceScaleFactor: 1, reducedMotion: "no-preference" })).newPage();
  await page.goto(`${url}trailer/${pieza}/?export=1&ratio=${ratio}`);
  await page.waitForFunction(() => window.__trailer?.ready === true);
  return page;
};
const shot = (page, t, type = "jpeg") => page.evaluate((s) => window.__trailer.seek(s), t).then(() => page.screenshot(type === "jpeg" ? { type, quality: 96 } : { type }));

try {
  let page = await open("16x9");
  const secs = await page.evaluate(() => window.__trailer.duration);

  // Determinismo: el mismo segundo, dos veces (con otro salto en el medio), da los mismos píxeles.
  const a = createHash("sha256").update(await shot(page, 3.7, "png")).digest("hex");
  await shot(page, 11.2, "png");
  const b = createHash("sha256").update(await shot(page, 3.7, "png")).digest("hex");
  if (a !== b) throw new Error("El cuadro no es determinista: se aborta la exportación.");
  console.log("✓ cuadro determinista");

  const wav = path.join(tmp, "audio.wav"), m4a = out(`${pieza}.m4a`);
  if (want("audio") || want("video")) {
    fs.writeFileSync(wav, Buffer.from(await page.evaluate(() => window.__trailer.wav()), "base64"));
    await run(["-i", wav, "-af", LOUDNORM, "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", m4a]);
    console.log(`✓ audio ${path.basename(m4a)} (${(fs.statSync(m4a).size / 1048576).toFixed(2)} MB)`);
  }
  if (want("poster")) { fs.writeFileSync(out(`${pieza}-poster.jpg`), await shot(page, posterAt)); console.log("✓ póster"); }

  if (want("video")) {
    for (const ratio of ratios) {
      if (ratio !== "16x9") { await page.context().close(); page = await open(ratio); }
      const file = out(`${pieza}-${ratio}.mp4`), enc = videoEncoder({ fps, audio: m4a, out: file });
      const frames = Math.round(secs * fps);
      const t0 = Date.now();
      for (let i = 0; i < frames; i++) {
        await enc.write(await shot(page, i / fps));
        if (i % (fps * 5) === 0) process.stdout.write(`  ${ratio} ${(i / fps).toFixed(0)}/${secs.toFixed(0)} s\r`);
      }
      await enc.end();
      console.log(`✓ ${path.basename(file)} (${(fs.statSync(file).size / 1048576).toFixed(1)} MB, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
  }
  if (want("email")) {
    const mb = await emailVersion({ input: out(`${pieza}-16x9.mp4`), out: out(`${pieza}-email.mp4`) });
    console.log(`✓ ${pieza}-email.mp4 (${mb.toFixed(1)} MB)`);
  }
} finally {
  await browser.close();
  stop();
  fs.rmSync(tmp, { recursive: true, force: true });
}
