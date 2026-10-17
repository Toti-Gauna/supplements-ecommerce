// Cuadros clave de las pantallas de carga por fecha (R3c) para docs/img/rediseno/r3c/.
// Uso: build con PAGES_BASE_PATH=/supplements-ecommerce, servir out/ (tests/e2e/static-server.mjs) y
//   SPLASH_URL=http://localhost:4351/supplements-ecommerce/ node scripts/capture-splash-frames.mjs [id…]
// Congela todas las animaciones de la pantalla de carga y las lleva al mismo instante (inicio, medio y final).
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../docs/img/rediseno/r3c");
const url = process.env.SPLASH_URL || "http://localhost:4351/supplements-ecommerce/";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
const out = process.env.SPLASH_OUT || root;
fs.mkdirSync(out, { recursive: true });

/** Instantes (ms desde que arranca el splash): inicio de la mecánica, mitad y el último cuadro antes del telón. */
const FRAMES = {
  original: [["inicio", 380], ["medio", 640], ["final", 1140]],
  scene: [["inicio", 420], ["medio", 820], ["final", 1590]],
};
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ["original", "black-friday", "hot-sale", "vuelta-al-gym", "navidad"];
const sizes = [[390, 844], [1440, 900]];

const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
for (const id of ids) {
  for (const [width, height] of sizes) {
    for (const mode of ["dark", "light"]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference", deviceScaleFactor: 1 });
      await context.addInitScript(([pid, m]) => {
        localStorage.setItem("volta-theme", m);
        localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: pid }, version: 0 }));
        localStorage.setItem("volta-quiz-invite", "seen");
        const st = window.setTimeout;
        window.setTimeout = (fn, ms, ...a) => (ms === 4000 ? 0 : st(fn, ms, ...a));
        document.addEventListener("DOMContentLoaded", () => document.getAnimations().forEach((a) => a.pause()));
      }, [id, mode]);
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      const frames = id === "original" ? FRAMES.original : FRAMES.scene;
      // En claro la pantalla de carga es la misma (va sobre la noche): solo el cuadro final, para comprobarlo.
      for (const [label, t] of mode === "light" ? frames.slice(-1) : frames) {
        await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), t);
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        await page.screenshot({ path: path.join(out, `${id}-${width}-${mode === "dark" ? "oscuro" : "claro"}-${label}.png`) });
      }
      await context.close();
    }
  }
}
await browser.close();
