// Capturas del Mostrador (R4b) para docs/img/rediseno/r4b/: la pantalla de vender con un ticket con stack en 1440 y 390,
// oscuro y claro; el cobro en cuotas; el cierre del día; el pedido por chat y la consulta rápida.
// Uso: después de `PAGES_BASE_PATH=/supplements-ecommerce npm run build`, `node scripts/capture-r4b-mostrador.mjs`.
// Levanta su propio servidor estático (puerto 4392 o E2E_PORT) y lo cierra al terminar.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "docs/img/rediseno/r4b");
const port = Number(process.env.E2E_PORT ?? 4392);
const url = `http://localhost:${port}/supplements-ecommerce/`;
fs.mkdirSync(dir, { recursive: true });

const server = spawn(process.execPath, ["tests/e2e/static-server.mjs"], { cwd: root, env: { ...process.env, E2E_PORT: String(port), PAGES_BASE_PATH: "/supplements-ecommerce" }, stdio: "ignore" });
const ready = async () => { for (let i = 0; i < 50; i++) { try { if ((await fetch(url)).ok) return; } catch { /* todavía no */ } await new Promise((r) => setTimeout(r, 200)); } throw new Error("sin servidor"); };

const add = async (page, name) => { await page.locator("[data-pot]").filter({ hasText: name }).first().click(); };
async function fillTicket(page) {
  const search = page.getByLabel("Buscar para vender");
  for (const [q, name] of [["whey chocolate", "Chocolate · 2 lb"], ["creatina", "Sin sabor · 300 g"], ["overvolt", "Limón"]]) {
    await search.fill(q);
    await add(page, name);
  }
  await search.fill("");
}

try {
  await ready();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    for (const mode of ["dark", "light"]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", deviceScaleFactor: 1, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires", isMobile: width < 500, hasTouch: width < 500 });
      await context.addInitScript((m) => {
        localStorage.setItem("volta-theme", m);
        localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: "original" }, version: 0 }));
        sessionStorage.setItem("volta-demo:splash-seen", "1");
      }, mode);
      await context.clock.setFixedTime(new Date("2026-10-05T10:42:00-03:00"));
      const page = await context.newPage();
      const tag = `${width}-${mode}`;
      await page.goto(`${url}admin-demo/mostrador/`);
      await page.getByRole("heading", { level: 1, name: "Mostrador" }).waitFor();
      await fillTicket(page);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${dir}/mostrador-${tag}.png` });
      if (`${tag}` === "1440-dark" || `${tag}` === "390-light") {
        await page.getByRole("button", { name: /^Cobrar/ }).filter({ visible: true }).first().click();
        const sheet = page.getByRole("dialog", { name: /Cobrar/ });
        await sheet.getByText("3 cuotas", { exact: true }).click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${dir}/cobro-cuotas${width < 500 ? "-390" : ""}.png` });
        await sheet.getByRole("button", { name: /Registrar venta/ }).click();
        await page.getByText("Venta registrada (simulada)").waitFor();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${dir}/venta-registrada-${tag}.png` });
        await page.getByRole("button", { name: "Nueva venta" }).click();
        await fillTicket(page);
        await page.getByRole("button", { name: /^Cobrar/ }).filter({ visible: true }).first().click();
        await page.getByLabel("Con cuánto paga").fill("120000");
        await page.getByRole("button", { name: /Registrar venta/ }).click();
        await page.getByRole("button", { name: "Nueva venta" }).click();
        await page.goto(`${url}admin-demo/mostrador/cierre/`);
        await page.getByRole("heading", { level: 1, name: "Cierre del día" }).waitFor();
        await page.getByLabel(/Efectivo contado/).fill("129000");
        await page.getByLabel(/Efectivo contado/).blur();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${dir}/cierre-dia${width < 500 ? "-390" : ""}.png` });
        await page.goto(`${url}admin-demo/mostrador/chat/`);
        await page.getByRole("heading", { level: 1, name: "Pedido por chat" }).waitFor();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${dir}/pedido-chat-${tag}.png` });
        await page.goto(`${url}admin-demo/mostrador/consulta/`);
        await page.getByLabel("Buscar producto").fill("whey");
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${dir}/consulta-${tag}.png` });
      }
      await context.close();
    }
  }
  await browser.close();
  console.log(`Capturas en ${dir}`);
} finally {
  server.kill();
}
