// Capturas de R4c para docs/img/rediseno/r4c/: lista del proveedor con las diferencias, costos vivos, el lote que vence
// con sus salidas armadas, a quién escribirle hoy (recompra por WhatsApp) y el regalo de cumpleaños, en 1440 y 390.
// Uso: después de `PAGES_BASE_PATH=/supplements-ecommerce npm run build`, `node scripts/capture-r4c.mjs`.
// Levanta su propio servidor estático (puerto 4393 o E2E_PORT) y lo cierra al terminar.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "docs/img/rediseno/r4c");
const port = Number(process.env.E2E_PORT ?? 4393);
const url = `http://localhost:${port}/supplements-ecommerce/`;
fs.mkdirSync(dir, { recursive: true });

const server = spawn(process.execPath, ["tests/e2e/static-server.mjs"], { cwd: root, env: { ...process.env, E2E_PORT: String(port), PAGES_BASE_PATH: "/supplements-ecommerce" }, stdio: "ignore" });
const ready = async () => { for (let i = 0; i < 50; i++) { try { if ((await fetch(url)).ok) return; } catch { /* todavía no */ } await new Promise((r) => setTimeout(r, 200)); } throw new Error("sin servidor"); };

try {
  await ready();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const tag = width < 500 ? "390" : "1440";
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", deviceScaleFactor: 1, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires", isMobile: width < 500, hasTouch: width < 500 });
    await context.addInitScript(() => {
      localStorage.setItem("volta-theme", "dark");
      localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: "original" }, version: 0 }));
      sessionStorage.setItem("volta-demo:splash-seen", "1");
    });
    const page = await context.newPage();
    const shot = async (name) => { await page.waitForTimeout(500); await page.screenshot({ path: `${dir}/${name}-${tag}.png` }); };

    // 1. Lista del proveedor: la lista pegada y las diferencias con el precio propuesto.
    await page.goto(`${url}admin-demo/lista-proveedor/`);
    await page.getByRole("button", { name: "Cargar la lista de muestra" }).click();
    await page.locator("[data-diff-summary]").waitFor();
    const krono = page.locator("[data-brand='Krono Nutrition'] input");
    await krono.fill("45");
    await krono.press("Enter");
    await page.waitForTimeout(6000);
    await page.locator("#diferencias").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.querySelector("#diferencias")?.scrollIntoView({ block: "start" }));
    await shot("lista-proveedor-diferencias");

    // 2. Costos vivos: la fecha del costo, la cobertura y la ganancia al liquidar el lote que vence.
    await page.goto(`${url}admin-demo/costos/vivos/`);
    await page.getByLabel("Buscar producto").fill("barra proteica");
    await page.getByText("Lote VL-2604-B").filter({ visible: true }).first().waitFor();
    await shot("costos-vivos");

    // 3. El lote que vence con sus salidas armadas (liquidar, combo, cupón y drop).
    await page.goto(`${url}admin-demo/`);
    await page.locator("[data-action^='lot:']").first().getByRole("button", { name: /Liquidar/ }).click();
    const sheet = page.getByRole("dialog", { name: /Liquidar el lote/ });
    await sheet.locator("[data-liquidation-profit]").waitFor();
    await shot("lote-acciones");
    await sheet.getByRole("tab", { name: "Combo" }).click();
    await shot("lote-acciones-combo");
    await sheet.getByRole("tab", { name: "Cupón" }).click();
    await sheet.getByRole("button", { name: "Crear el cupón" }).click();
    await sheet.getByRole("link", { name: /WhatsApp a / }).first().waitFor();
    await shot("lote-acciones-cupon");

    // 4. A quién escribirle hoy, con el mensaje armado y el link del bolso.
    await page.goto(`${url}admin-demo/usuarios/`);
    await page.getByRole("region", { name: "A quién escribirle hoy" }).waitFor();
    await shot("recompra-whatsapp");

    // 5. Cumpleaños: la fila de Hoy y el regalo armado en la ficha.
    await page.goto(`${url}admin-demo/`);
    await page.locator("[data-action='birthday:tomas.h@ejemplo.com']").scrollIntoViewIfNeeded();
    await shot("cumpleanos-hoy");
    await page.goto(`${url}admin-demo/usuarios/ficha/?email=tomas.h%40ejemplo.com`);
    await page.getByRole("button", { name: "Mandarle el regalo de cumpleaños" }).click();
    await page.getByRole("dialog", { name: "Armar el regalo de cumpleaños" }).getByRole("button", { name: "Sí, armar el regalo" }).click();
    await page.locator("[data-birthday-gift]").getByText("Regalo armado").waitFor();
    await page.locator("[data-birthday-gift]").scrollIntoViewIfNeeded();
    await shot("cumpleanos");
    await context.close();
  }
  await browser.close();
} finally {
  server.kill();
}
