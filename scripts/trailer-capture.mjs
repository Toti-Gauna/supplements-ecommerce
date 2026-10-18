// Capturas por componente para el trailer (P0.2): cada pieza de la tienda y del panel en claro y oscuro, 1440 y 390, a 2x.
// Uso: `NEXT_PUBLIC_BRAND=tutienda PAGES_BASE_PATH=/supplements-ecommerce npm run build` (la ficha "Tu tienda": ningún nombre de marca ajeno en pantalla) y `node scripts/trailer-capture.mjs [carpeta] [filtro]`.
//   carpeta: salida (por defecto docs/trailer/capturas). filtro: texto que debe contener el id de la captura (ej. "mostrador").
// Levanta su propio servidor estático (TRAILER_PORT, 4399 por defecto). Una captura que falla no corta el resto: se lista al final.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { root, startServer } from "./kit-lib.mjs";
import { SHOP } from "./trailer-shots-shop.mjs";
import { ADMIN } from "./trailer-shots-admin.mjs";

/** Prefijo de guardado de los datos de la demo (`storageKey` de la ficha): `tutienda-demo:cart`, `tutienda-demo:account`... */
const KEY = process.env.CAPTURE_KEY ?? "tutienda";
const out = path.resolve(process.argv[2] || path.join(root, "docs/trailer/capturas"));
const only = process.argv[3] || "";
const VIEWPORTS = [{ name: "1440", width: 1440, height: 900 }, { name: "390", width: 390, height: 844 }];
const THEMES = (process.env.CAPTURE_THEMES ?? "light,dark").split(",");
const SHOTS = [...SHOP.map((s) => ({ ...s, area: "tienda" })), ...ADMIN.map((s) => ({ ...s, area: "panel" }))].filter((s) => s.id.includes(only));

/** Todo lo que usa azar (premios, códigos, semillas) sale igual en cada corrida. */
const SEEDED_RANDOM = () => {
  let a = 0x9e3779b9;
  Math.random = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};

const mobileVp = (vp) => vp.width < 500;

async function newPage(browser, vp, theme) {
  const mobile = vp.width < 500;
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires", isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
  await context.addInitScript(SEEDED_RANDOM);
  await context.addInitScript(({ t, k }) => {
    localStorage.setItem("volta-theme", t); // el tema es la única clave fija (no lleva el prefijo de la marca)
    localStorage.setItem(`${k}-sound`, "off");
    localStorage.setItem(`${k}-quiz-invite`, "seen");
    localStorage.setItem(`${k}-trailer-invite`, "seen");
    localStorage.setItem(`${k}-demo:theme-preview`, JSON.stringify({ state: { previewId: "original" }, version: 0 }));
  }, { t: theme, k: KEY });
  return { context, page: await context.newPage() };
}

const { url, stop } = await startServer(Number(process.env.TRAILER_PORT ?? 4399));
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, headless: true, args: ["--no-sandbox"] });
const failed = [];
let done = 0;
try {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      for (const shot of SHOTS) {
        if (shot.only && shot.only !== (vp.width > 500 ? "desktop" : "mobile")) continue;
        const { context, page } = await newPage(browser, vp, theme);
        const file = path.join(out, shot.area, `${shot.id}-${vp.name}-${theme}.png`);
        try {
          await page.goto(`${url}${shot.route}`);
          if (!mobileVp(vp)) await page.mouse.move(vp.width - 20, 500); // con el mouse a un costado, el menú del panel queda plegado
          await page.evaluate(() => document.fonts.ready);
          if (shot.prep) await shot.prep(page, { theme, vp, key: KEY });
          await page.waitForTimeout(shot.wait ?? 600);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          const target = shot.target ? shot.target(page).first() : null;
          if (target) { await target.scrollIntoViewIfNeeded(); await target.screenshot({ path: file }); }
          else await page.screenshot({ path: file });
          done += 1;
        } catch (error) {
          failed.push(`${shot.area}/${shot.id} ${vp.name} ${theme}: ${String(error.message).split("\n")[0]}`);
        }
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  stop();
}
console.log(`Capturas: ${done} listas en ${out}; ${failed.length} fallaron.`);
for (const f of failed) console.warn(`  ✗ ${f}`);
