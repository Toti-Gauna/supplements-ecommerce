// Capturas del kit de venta (docs/kit-de-venta/img/): los momentos del guion de 90 s en 1440 y 390, modo oscuro.
// Uso: `PAGES_BASE_PATH=/supplements-ecommerce npm run build` y `node scripts/capture-kit.mjs [carpeta]`. Levanta su
// propio servidor estático (puerto CAPTURE_PORT, 4397 por defecto) y lo cierra al terminar. Un paso que se marque `r4c`
// en scripts/kit-lib.mjs y no esté en la build se saltea con un aviso.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { kitContext, root, startServer, STEPS } from "./kit-lib.mjs";

const dir = path.resolve(process.argv[2] || path.join(root, "docs/kit-de-venta/img"));
fs.mkdirSync(dir, { recursive: true });
const { url, stop } = await startServer(Number(process.env.CAPTURE_PORT ?? 4397));
const skipped = new Set();
let count = 0;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
try {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    // Cada tamaño arranca con la demo limpia (contexto nuevo = almacenamiento vacío).
    const context = await kitContext(browser, { width, height, reducedMotion: "reduce" });
    const page = await context.newPage();
    if (width > 1000) await page.mouse.move(width - 20, 500);
    const tools = {
      go: (route) => page.goto(`${url}${route}`),
      wait: async () => {},
      shot: async (name) => {
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${dir}/${name}-${width}.png` });
        count += 1;
      },
    };
    for (const step of STEPS) {
      try {
        const done = await step.run(page, tools);
        if (done === false) {
          skipped.add(step.id);
          console.warn(`  [R4c] ${step.title}: la pantalla todavía no está en esta build; se saltea (${width}).`);
        }
      } catch (error) {
        if (!step.r4c) throw error;
        skipped.add(step.id);
        console.warn(`  [R4c] ${step.title}: no se pudo recorrer (${error.message.split("\n")[0]}); se saltea (${width}).`);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  stop();
}
console.log(`${count} capturas en ${path.relative(root, dir)}${skipped.size ? ` · salteados: ${[...skipped].join(", ")}` : ""}`);
