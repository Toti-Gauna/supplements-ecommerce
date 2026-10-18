// Video del kit de venta (docs/kit-de-venta/video/recorrido-kit.webm): el guion de 90 s grabado con Playwright
// (recordVideo), en la compu y en modo oscuro. Cada bloque dura lo que dice `ms` en scripts/kit-lib.mjs.
// Uso: `PAGES_BASE_PATH=/supplements-ecommerce npm run build` y `node scripts/record-kit-video.mjs [carpeta]`. Levanta su
// propio servidor (puerto CAPTURE_PORT, 4398 por defecto) y lo cierra. Los pasos marcados `r4c` se prueban antes sin
// grabar y, si faltan en la build, no entran al video (aviso en consola). Si el archivo pasa de 15 MB, regraba más chico.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { kitContext, root, startServer, STEPS } from "./kit-lib.mjs";

const dir = path.resolve(process.argv[2] || path.join(root, "docs/kit-de-venta/video"));
const target = path.join(dir, "recorrido-kit.webm");
const MAX_BYTES = 15 * 1024 * 1024;
const SIZES = [[1280, 720], [960, 540]];
fs.mkdirSync(dir, { recursive: true });
const { url, stop } = await startServer(Number(process.env.CAPTURE_PORT ?? 4398));
const noop = async () => {};

/** Corre un paso; devuelve false si su pantalla (de R4c) todavía no está. */
async function runStep(step, page, tools) {
  try {
    return (await step.run(page, tools)) !== false;
  } catch (error) {
    if (!step.r4c) throw error;
    console.warn(`  [R4c] ${step.title}: ${error.message.split("\n")[0]}`);
    return false;
  }
}

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
try {
  // 1. Qué pasos de R4c hay en esta build (sin grabar, con la demo limpia).
  const probeCtx = await kitContext(browser, { width: 1280, height: 720, reducedMotion: "reduce" });
  const probePage = await probeCtx.newPage();
  const steps = [];
  for (const step of STEPS) {
    if (step.r4c && !(await runStep(step, probePage, { go: (r) => probePage.goto(`${url}${r}`), wait: noop, shot: noop }))) {
      console.warn(`  [R4c] ${step.title}: la pantalla todavía no está en esta build; queda fuera del video.`);
      continue;
    }
    steps.push(step);
  }
  await probeCtx.close();

  // 2. Grabación, bloque por bloque, con la demo limpia otra vez.
  for (const [width, height] of SIZES) {
    const context = await kitContext(browser, { width, height, reducedMotion: "no-preference", recordVideo: { dir, size: { width, height } } });
    const page = await context.newPage();
    // Con movimiento (con movimiento reducido el video se congela en los esqueletos de carga), pero sin la pantalla de
    // carga en cada página nueva: su script del <head> no abre si "reducir movimiento" está prendido.
    await context.addInitScript(() => {
      const mm = window.matchMedia.bind(window);
      window.matchMedia = (q) => (q.includes("prefers-reduced-motion") && q.includes("reduce") && document.readyState === "loading" ? { ...mm(q), matches: true } : mm(q));
    });
    const tools = { go: (r) => page.goto(`${url}${r}`), wait: (ms) => page.waitForTimeout(ms), shot: () => page.waitForTimeout(600) };
    await page.mouse.move(width - 20, height / 2); // lejos de la barra lateral, que se abre al pasar por encima
    const started = Date.now();
    for (const step of steps) {
      const t0 = Date.now();
      await runStep(step, page, tools);
      const rest = step.ms - (Date.now() - t0);
      if (rest > 0) await page.waitForTimeout(rest);
      console.log(`  ${step.title}: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    }
    const seconds = (Date.now() - started) / 1000;
    const video = page.video();
    await context.close();
    await video.saveAs(target);
    await video.delete();
    const bytes = fs.statSync(target).size;
    console.log(`Video ${width}×${height}: ${seconds.toFixed(0)} s, ${(bytes / 1024 / 1024).toFixed(1)} MB → ${path.relative(root, target)}`);
    if (bytes <= MAX_BYTES) break;
    console.warn("  Pasa de 15 MB: se regraba más chico.");
  }
} finally {
  await browser.close();
  stop();
}
