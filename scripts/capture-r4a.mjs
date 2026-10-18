// Capturas de R4a ("Hoy en tu tienda", el inicio del panel) para docs/img/rediseno/r4a/: la pantalla entera y el
// primer pantallazo, en 1440 y 390, oscuro y claro. Más el panel de avisos de recompra y la aprobación con confirmación.
// Uso: export estático servido (E2E_PORT=4391 PAGES_BASE_PATH=/supplements-ecommerce node tests/e2e/static-server.mjs)
// y `node scripts/capture-r4a.mjs [url]`.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../docs/img/rediseno/r4a");
const url = process.argv[2] || "http://localhost:4391/supplements-ecommerce/";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
fs.mkdirSync(dir, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const mode of ["dark", "light"]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", deviceScaleFactor: 1, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
    await context.addInitScript((m) => {
      localStorage.setItem("volta-theme", m);
      localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: "original" }, version: 0 }));
      sessionStorage.setItem("volta-demo:splash-seen", "1");
    }, mode);
    await context.clock.setFixedTime(new Date("2026-10-05T09:12:00-03:00"));
    const page = await context.newPage();
    const tag = `${width}-${mode}`;
    await page.goto(`${url}admin-demo/`);
    await page.getByRole("heading", { level: 1, name: "Hoy en tu tienda" }).waitFor();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${dir}/hoy-${tag}.png` });
    await page.screenshot({ path: `${dir}/hoy-${tag}-completa.png`, fullPage: true });
    if (mode === "dark") {
      await page.getByRole("button", { name: /Avisarles/ }).click();
      await page.getByRole("dialog", { name: "Avisos de recompra" }).waitFor();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${dir}/hoy-avisos-${tag}.png` });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      await page.locator("[data-action='receipt:VOL-000123']").getByRole("button", { name: /Aprobar/ }).click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${dir}/hoy-aprobar-${tag}.png` });
    }
    await context.close();
  }
}
await browser.close();
console.log(`Capturas en ${dir}`);
