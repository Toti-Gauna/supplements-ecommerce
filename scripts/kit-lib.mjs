// Recorrido del kit de venta (docs/kit-de-venta/guion-90s.md), compartido por scripts/capture-kit.mjs (capturas) y
// scripts/record-kit-video.mjs (video). Cada bloque del guion es un paso: hace lo que se toca en pantalla y llama a
// `shot(nombre)` en el momento que va a la captura. Un paso que devuelve `false` (o falla, si está marcado `r4c: true`)
// se saltea con un aviso; hoy todos los bloques del guion existen y ninguno está marcado.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const base = (process.env.PAGES_BASE_PATH ?? "/supplements-ecommerce").replace(/\/+$/, "");

/** Levanta el servidor estático de `out/` (como GitHub Pages) y devuelve la URL y cómo cerrarlo. */
export async function startServer(port) {
  const url = `http://localhost:${port}${base}/`;
  const server = spawn(process.execPath, ["tests/e2e/static-server.mjs"], { cwd: root, env: { ...process.env, E2E_PORT: String(port), PAGES_BASE_PATH: base }, stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(url)).ok) return { url, stop: () => server.kill() }; } catch { /* todavía no levantó */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  server.kill();
  throw new Error(`No levantó el servidor en ${url}: ¿corriste el build con PAGES_BASE_PATH=${base}?`);
}

/** Contexto en modo oscuro, sin temática de fecha y sin pantalla de carga (la demo ya vive en el lunes 5/10/2026). */
export async function kitContext(browser, { width, height, ...extra }) {
  const mobile = width < 500;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires", isMobile: mobile, hasTouch: mobile, ...extra });
  await context.addInitScript(() => {
    localStorage.setItem("volta-theme", "dark");
    localStorage.setItem("volta-sound", "off");
    localStorage.setItem("volta-quiz-invite", "seen");
    localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: "original" }, version: 0 }));
    sessionStorage.setItem("volta-demo:splash-seen", "1");
  });
  // Sin reloj falso: la demo ya fecha todo en su día fijo (`demoNow`), y con la hora congelada las hojas del panel abiertas
  // después de la primera página se quedan transparentes.
  return context;
}

const center = (loc) => loc.first().evaluate((el) => el.scrollIntoView({ block: "center" }));
const pot = (page, key) => page.locator(`[data-pot='${key}']`);

/** Bloques del guion de 90 s, en orden, con su duración objetivo en el video (ms). */
export const STEPS = [
  { id: "hoy", title: "Hoy en tu tienda", ms: 10000, run: async (page, { go, shot, wait }) => {
    await go("admin-demo/");
    await page.getByRole("heading", { level: 1, name: "Hoy en tu tienda" }).waitFor();
    await shot("01-hoy");
    await wait(2500);
    const row = page.locator("[data-action='receipt:VOL-000123']");
    await center(row).then(() => wait(1200));
    await row.getByRole("button", { name: /Aprobar/ }).click();
    await page.getByRole("dialog", { name: /Aprobar el comprobante/ }).waitFor();
    await shot("01-hoy-aprobar");
    await wait(1800);
    await page.getByRole("button", { name: "Sí, lo verifiqué" }).click();
  } },
  { id: "mostrador", title: "Mostrador: vender y cobrar en cuotas", ms: 12000, run: async (page, { go, shot, wait }) => {
    await go("admin-demo/mostrador/");
    await page.getByRole("heading", { level: 1, name: "Mostrador" }).waitFor();
    for (const [q, key] of [["whey vainilla", "ionic-whey::iw-vainilla-2lb"], ["creatina", "creatina-monohidrato::cm-sin-sabor-300"], ["overvolt", "overvolt-pre::ov-limon-300"]]) {
      await page.getByLabel("Buscar para vender").pressSequentially(q, { delay: 25 });
      await pot(page, key).click();
      await wait(700);
      await page.getByLabel("Buscar para vender").fill("");
    }
    await shot("02-mostrador-ticket");
    await page.getByRole("button", { name: /^Cobrar/ }).filter({ visible: true }).first().click();
    const charge = page.getByRole("dialog", { name: /^Cobrar/ });
    await charge.getByText("3 cuotas", { exact: true }).click();
    await shot("02-mostrador-cuotas");
    await wait(2200);
    await charge.getByRole("button", { name: /Registrar venta/ }).click();
    await page.getByRole("dialog", { name: "Venta registrada (simulada)" }).waitFor();
    await wait(1500);
    await page.getByRole("button", { name: "Nueva venta" }).click();
  } },
  { id: "pedidos", title: "Pedidos unificado con WhatsApp", ms: 10000, run: async (page, { go, shot, wait }) => {
    await go("admin-demo/preparacion/");
    await page.locator("article[data-step]").first().waitFor();
    await shot("03-pedidos-armar");
    await wait(2500);
    await go("admin-demo/pedidos/detalle/?codigo=VOL-000113");
    await page.locator("[data-wa]").first().waitFor();
    await shot("03-pedido-whatsapp");
  } },
  { id: "proveedor", title: "Lista del proveedor con margen por marca", ms: 12000, run: async (page, { go, shot, wait }) => {
    await go("admin-demo/lista-proveedor/");
    await page.getByRole("heading", { level: 1, name: "Lista del proveedor" }).waitFor();
    await page.getByRole("button", { name: "Cargar la lista de muestra" }).click();
    const summary = page.locator("[data-diff-summary]");
    await summary.waitFor();
    await center(summary).then(() => shot("04-proveedor-diferencias"));
    await wait(3000);
    const brand = page.locator("[data-brand='Krono Nutrition']");
    await center(brand).then(() => shot("04-proveedor-margen-marca"));
    await wait(2000);
  } },
  { id: "lote", title: "Lote que vence: acción armada", ms: 10000, run: async (page, { go, shot, wait }) => {
    await go("admin-demo/");
    const row = page.locator("[data-action='lot:barra-proteica::bp-mani-x12::VL-2604-B']");
    await row.waitFor();
    await center(row).then(() => wait(800));
    await row.getByRole("button", { name: /Liquidar −30 %/ }).click();
    const sheet = page.getByRole("dialog", { name: "Liquidar el lote VL-2604-B" });
    await sheet.locator("[data-liquidation-profit]").waitFor();
    await wait(2000);
    await sheet.getByRole("tab", { name: "Combo" }).click();
    await sheet.locator("[data-combo]").waitFor();
    await shot("05-lote-accion");
    await wait(2000);
    await sheet.getByRole("tab", { name: "Drop" }).click();
    await sheet.locator("[data-drop]").waitFor();
  } },
  { id: "recompra", title: "Recompra por WhatsApp", ms: 8000, run: async (page, { go, shot, wait }) => {
    await go("admin-demo/usuarios/");
    const panel = page.getByRole("region", { name: "A quién escribirle hoy" });
    await panel.locator("[data-write]").first().waitFor();
    await panel.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120));
    await shot("06-recompra-whatsapp");
    await wait(3000);
  } },
  { id: "campanas", title: "Campañas y regalos", ms: 7000, run: async (page, { go, shot, wait }) => {
    await go("admin-demo/campanas/");
    await page.locator("[data-campaign-chip]").first().waitFor();
    await shot("07-campanas");
    await wait(3000);
    await go("admin-demo/regalos/");
    await page.getByRole("heading", { level: 1 }).waitFor();
    await shot("08-regalos");
  } },
  { id: "dueno", title: "Modo dueño en la tienda", ms: 9000, run: async (page, { go, shot, wait }) => {
    await go("?dueno=1");
    const spot = page.locator("[data-owner-spot='carrusel']");
    await spot.waitFor();
    await center(spot).then(() => shot("09-modo-dueno-inicio"));
    await wait(2500);
    await go("p/ionic-whey/");
    await page.locator("[data-owner-spot='ficha']").waitFor();
    await shot("09-modo-dueno-ficha");
    await wait(2000);
    await page.locator("[data-owner-spot='ficha']").getByRole("link").click();
    await page.getByRole("heading", { level: 1, name: /Editar: Ionic Whey/ }).waitFor();
    await shot("10-ficha-en-el-panel");
  } },
];
