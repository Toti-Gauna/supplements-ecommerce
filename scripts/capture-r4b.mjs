// Capturas de R4b (Pedidos unificado y mensajes por estado) para docs/img/rediseno/r4b/: Por cobrar, Para armar,
// Despachos (lista de armado y hoja de ruta), Postventa y la versión WhatsApp de los emails, en 1440 y 390, claro y oscuro.
// Uso: `PAGES_BASE_PATH=/supplements-ecommerce npm run build` y `node scripts/capture-r4b.mjs [carpeta]`. Levanta su
// propio servidor estático (puerto CAPTURE_PORT, 4396 por defecto) y lo cierra al terminar.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.resolve(process.argv[2] || path.join(root, "docs/img/rediseno/r4b"));
const port = Number(process.env.CAPTURE_PORT ?? 4396);
const base = (process.env.PAGES_BASE_PATH ?? "/supplements-ecommerce").replace(/\/+$/, "");
const url = `http://localhost:${port}${base}/`;
fs.mkdirSync(dir, { recursive: true });

const server = spawn(process.execPath, ["tests/e2e/static-server.mjs"], { cwd: root, env: { ...process.env, E2E_PORT: String(port), PAGES_BASE_PATH: base }, stdio: "ignore" });
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(url)).ok) break; } catch { /* todavía no levantó */ }
  await new Promise((r) => setTimeout(r, 200));
}

/** [archivo, ruta, qué esperar, preparar (opcional), página completa]. */
const SHOTS = [
  ["pedidos-cobrar", "admin-demo/pagos/", (p) => p.getByRole("article", { name: /Cobro de/ })],
  ["pedidos-armar", "admin-demo/preparacion/", (p) => p.getByRole("article", { name: /Pedido / }).first()],
  ["despachos-ruta", "admin-demo/despachos/?dia=2026-10-09", (p) => p.getByRole("heading", { name: "Hoja de ruta del cadete" })],
  ["postventa", "admin-demo/postventa/", (p) => p.getByRole("heading", { name: "En camino" })],
  ["mensajes-whatsapp", "admin-demo/emails/editar/?id=tpl-payment-approved", (p) => p.getByRole("figure", { name: "Vista previa del WhatsApp" })],
];

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
try {
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
      if (width > 1000) await page.mouse.move(width - 20, 500);
      const tag = `${width}-${mode}`;
      for (const [name, route, ready] of SHOTS) {
        await page.goto(`${url}${route}`);
        await ready(page).waitFor();
        // En el celular, el primer pantallazo arranca en lo que importa de la vista (la tarjeta, la hoja de ruta, el WhatsApp).
        if (width < 1000) await ready(page).evaluate((el) => el.scrollIntoView({ block: "center" }));
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${dir}/${name}-${tag}.png`, fullPage: width < 1000 ? false : true });
      }
      if (mode === "light") {
        // El WhatsApp de un estado sin email (reclamo), editándose en el panel.
        await page.goto(`${url}admin-demo/emails/`);
        await page.getByRole("button", { name: "Editar el WhatsApp: En reclamo" }).click();
        await page.getByRole("dialog", { name: "En reclamo" }).waitFor();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${dir}/mensajes-whatsapp-panel-${tag}.png` });
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(`Capturas en ${dir}`);
