// Placas del trailer (T1.3): pantallas reales de la app a 1600 × 900 (16:9 exacto) y 2×, con las cajas medidas de lo que el
// trailer anima encima (en px del escenario 1920 × 1080). Uso:
//   NEXT_PUBLIC_BRAND=tutienda PAGES_BASE_PATH=/supplements-ecommerce npm run build && node scripts/trailer-plates.mjs [filtro]
// Salida: public/trailer/shots/t1/<id>.jpg (2400 × 1350) y src/trailer/pieces/t1-plates.json.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { root, startServer } from "./kit-lib.mjs";
import { run } from "./trailer-export-lib.mjs";

const KEY = "tutienda", VP = { width: 1600, height: 900 };
const outDir = path.join(root, "public/trailer/shots/t1");
const addPots = async (p) => {
  for (const [q, key] of [["whey vainilla", "ionic-whey::iw-vainilla-2lb"], ["creatina", "creatina-monohidrato::cm-sin-sabor-300"], ["overvolt", "overvolt-pre::ov-limon-300"]]) {
    await p.getByLabel("Buscar para vender").fill(q);
    await p.locator(`[data-pot='${key}']`).click();
  }
  await p.getByRole("button", { name: /^Cobrar/ }).filter({ visible: true }).first().click();
};
const charge = (p) => p.getByRole("dialog", { name: /^Cobrar/ });
/** Viewports de las placas verticales: 390 × 693 y 640 × 1138 son 9:16 y llenan 1080 × 1920 a 2,77× y 1,69×. */
const T390 = { width: 390, height: 693 }, T640 = { width: 640, height: 1138 };
const PLATES = [
  { id: "ficha-light", theme: "light", route: "p/ionic-whey/", boxes: { toggle: (p) => p.getByRole("button", { name: /Activar modo/ }).first(), hero: (p) => p.locator("[data-vt-hero]").first() } },
  { id: "ficha-dark", theme: "dark", route: "p/ionic-whey/", boxes: { hero: (p) => p.locator("[data-vt-hero]").first() } },
  { id: "cobrar", theme: "dark", route: "admin-demo/mostrador/", prep: addPots, boxes: { card: (p) => charge(p).getByText("3 cuotas", { exact: true }).locator("xpath=ancestor::*[self::button or self::label][1]") } },
  { id: "cuotas", theme: "dark", route: "admin-demo/mostrador/", prep: async (p) => { await addPots(p); await charge(p).getByText("3 cuotas", { exact: true }).click(); },
    boxes: { summary: (p) => charge(p).locator("p", { hasText: /cuotas de/ }).first() } },
  { id: "proveedor-pegar", theme: "dark", route: "admin-demo/lista-proveedor/",
    prep: async (p) => { await p.getByRole("button", { name: "Cargar la lista de muestra" }).scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 260)); }, boxes: { load: (p) => p.getByRole("button", { name: "Cargar la lista de muestra" }) } },
  { id: "proveedor-resumen", theme: "dark", route: "admin-demo/lista-proveedor/", wait: 2500,
    prep: async (p) => { await p.getByRole("button", { name: "Cargar la lista de muestra" }).click(); await p.locator("[data-diff-summary]").scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 160)); },
    boxes: { summary: (p) => p.locator("[data-diff-summary]") } },
  // Pantallas de los equipos de "No es solo software" (T1.3 lote 3): al tamaño de su pantalla (1040 × 650 y 380 × 780) y 2×.
  { id: "hoy-1440-dark", theme: "dark", route: "admin-demo/", vp: { width: 1440, height: 900 }, w: 2080, boxes: {} },
  { id: "home-carrusel-390-dark", theme: "dark", route: "", vp: { width: 390, height: 800 }, w: 760, boxes: {} },
  // Versión 9:16 (T1.5): placas de celular que llenan el escenario de 1080 × 1920; las cajas salen en px de ese escenario.
  // La ficha va a 640 px de ancho porque el botón del tema de la cabecera recién aparece desde 640 (en 390 vive en el menú).
  { id: "ficha-light-t", theme: "light", route: "p/ionic-whey/", vp: T640, stage: 1080, scale: 2, w: 1620, boxes: { toggle: (p) => p.getByRole("button", { name: /Activar modo/ }).first(), hero: (p) => p.locator("[data-vt-hero]").first() } },
  { id: "ficha-dark-t", theme: "dark", route: "p/ionic-whey/", vp: T640, stage: 1080, scale: 2, w: 1620, boxes: { hero: (p) => p.locator("[data-vt-hero]").first() } },
  { id: "cobrar-t", theme: "dark", route: "admin-demo/mostrador/", prep: addPots, vp: T390, stage: 1080, scale: 4, w: 1560,
    boxes: { card: (p) => charge(p).getByText("3 cuotas", { exact: true }).locator("xpath=ancestor::*[self::button or self::label][1]") } },
  { id: "cuotas-t", theme: "dark", route: "admin-demo/mostrador/", vp: T390, stage: 1080, scale: 4, w: 1560, prep: async (p) => { await addPots(p); await charge(p).getByText("3 cuotas", { exact: true }).click(); },
    boxes: { summary: (p) => charge(p).locator("p", { hasText: /cuotas de/ }).first() } },
  { id: "proveedor-pegar-t", theme: "dark", route: "admin-demo/lista-proveedor/", vp: T390, stage: 1080, scale: 4, w: 1560,
    prep: async (p) => { await p.getByRole("button", { name: "Cargar la lista de muestra" }).scrollIntoViewIfNeeded(); }, boxes: { load: (p) => p.getByRole("button", { name: "Cargar la lista de muestra" }) } },
  { id: "proveedor-resumen-t", theme: "dark", route: "admin-demo/lista-proveedor/", vp: T390, stage: 1080, scale: 4, w: 1560, wait: 2500,
    prep: async (p) => { await p.getByRole("button", { name: "Cargar la lista de muestra" }).click(); await p.locator("[data-diff-summary]").scrollIntoViewIfNeeded(); },
    boxes: { summary: (p) => p.locator("[data-diff-summary]") } },
];

fs.mkdirSync(outDir, { recursive: true });
const { url, stop } = await startServer(Number(process.env.TRAILER_PORT ?? 4399));
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
const only = process.argv[2] ?? "";
const jsonPath = path.join(root, "src/trailer/pieces/t1-plates.json");
const boxes = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : {};
try {
  for (const plate of PLATES.filter((x) => x.id.includes(only))) {
    const vp = plate.vp ?? VP, K = (plate.stage ?? 1920) / vp.width;
    const context = await browser.newContext({ viewport: vp, deviceScaleFactor: plate.scale ?? 2, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires", reducedMotion: "reduce" });
    await context.addInitScript(({ t, k }) => {
      let a = 0x9e3779b9;
      Math.random = () => { a = (a + 0x6d2b79f5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
      localStorage.setItem("volta-theme", t);
      for (const [key, v] of [["sound", "off"], ["quiz-invite", "seen"], ["trailer-invite", "seen"]]) localStorage.setItem(`${k}-${key}`, v);
      localStorage.setItem(`${k}-demo:theme-preview`, JSON.stringify({ state: { previewId: "original" }, version: 0 }));
    }, { t: plate.theme, k: KEY });
    const page = await context.newPage();
    await page.goto(`${url}${plate.route}`);
    await page.mouse.move(vp.width - 20, 500); // el menú del panel queda plegado
    await page.evaluate(() => document.fonts.ready);
    if (plate.prep) await plate.prep(page);
    await page.waitForTimeout(plate.wait ?? 800);
    boxes[plate.id] = {};
    for (const [name, loc] of Object.entries(plate.boxes)) {
      const b = await loc(page).boundingBox();
      if (!b) throw new Error(`${plate.id}: no encontré ${name}`);
      boxes[plate.id][name] = Object.fromEntries(Object.entries(b).map(([k, v]) => [k, Math.round(v * K)]));
    }
    const png = path.join(outDir, `${plate.id}.png`);
    await page.screenshot({ path: png });
    await run(["-i", png, "-vf", `scale=${plate.w ?? 2400}:-2`, "-q:v", "3", path.join(outDir, `${plate.id}.jpg`)]);
    fs.rmSync(png);
    console.log(`✓ ${plate.id}`);
    await context.close();
  }
} finally { await browser.close(); stop(); }
fs.writeFileSync(jsonPath, JSON.stringify(boxes, null, 2) + "\n");
console.log("✓ src/trailer/pieces/t1-plates.json");
