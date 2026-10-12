import { expect, test, type Page } from "@playwright/test";
import { holdSplash, sceneOverlaps as overlaps, settleSplash as settle } from "./splash-helpers";

/** Polish 8.1: pantallas de carga centradas, sin superposiciones y con el lienzo oscuro mientras se ven. */
const preview = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);
const center = (r: { x: number; y: number; width: number; height: number }) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "no-preference" }); });

test("Original: un solo aro, concéntrico con el logo, con las piezas montadas encima; lienzo oscuro hasta que se va", async ({ page }) => {
  await page.goto("");
  const splash = page.locator("#volta-splash");
  await expect(splash.locator(".splash-halo")).toHaveCount(1);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe("rgb(7, 9, 12)");
  // Las medidas son de la caja final: las animaciones con fin (menos el telón) saltan a su último cuadro.
  await page.evaluate(() => document.getAnimations().forEach((a) => {
    if (a instanceof CSSAnimation && a.animationName !== "splash-curtain" && a.effect?.getComputedTiming().endTime !== Infinity) a.finish();
  }));
  const view = page.viewportSize()!;
  const halo = (await splash.locator(".splash-halo").boundingBox())!;
  const brand = center((await splash.locator(".splash-brand").boundingBox())!);
  expect(Math.abs(center(halo).x - view.width / 2)).toBeLessThan(2);
  expect(Math.abs(center(halo).y - view.height / 2)).toBeLessThan(2);
  expect(Math.abs(brand.x - center(halo).x)).toBeLessThan(2);
  expect(Math.abs(brand.y - center(halo).y)).toBeLessThan(2);
  const pieces = await splash.locator(".splash-card").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
  expect(pieces).toHaveLength(5);
  for (const p of pieces) expect(Math.abs(Math.hypot(p.x - center(halo).x, p.y - center(halo).y) - halo.width / 2)).toBeLessThan(3);
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
});

const SCENES = ["dia-de-la-madre", "halloween", "cyber-monday", "black-friday", "navidad", "ano-nuevo", "san-valentin", "vuelta-al-gym", "hot-sale", "dia-del-padre", "dia-del-amigo", "operacion-verano"];

for (const [width, height] of [[375, 812], [1440, 900], [844, 390]] as const) {
  test(`a ${width}×${height}: cada escena de temporada rodea al logo compacto sin pisarlo`, async ({ page }) => {
    test.setTimeout(120_000);
    await holdSplash(page);
    await page.setViewportSize({ width, height });
    for (const id of SCENES) {
      await preview(page, id);
      await page.goto("");
      const scene = page.locator(`#volta-splash .season-scene[data-scene='${id}']`);
      await expect(scene.locator("[data-sc]").first()).toBeAttached();
      // Con temática el logo va compacto y sin la batería.
      await expect(page.locator("#volta-splash .splash-battery")).toBeHidden();
      await settle(page);
      expect(await overlaps(page), id).toEqual([]);
      // La escena queda entera a lo ancho de la pantalla (lo de los bordes, como las pistas del chip, se corta adrede).
      const brand = (await page.locator("#volta-splash .splash-brand").boundingBox())!;
      expect(Math.abs(brand.x + brand.width / 2 - width / 2), id).toBeLessThan(2);
    }
  });
}

test("Día de la Madre: la batería en anillo se carga entera alrededor del logo y florece", async ({ page }) => {
  await holdSplash(page);
  await preview(page, "dia-de-la-madre");
  await page.goto("");
  const scene = page.locator("#volta-splash .season-scene");
  await expect(scene.locator(".md-cell")).toHaveCount(28);
  await settle(page);
  await expect(scene.locator(".md-cell").first()).toHaveCSS("opacity", "1");
  await expect(scene.getByText("100%")).toBeVisible();
  await expect(scene.locator(".sc-piece.sc-pop")).toHaveCount(8);
});

test("San Valentín: el corazón rodea al logo, centrado, y entra entero en la pantalla", async ({ page }) => {
  await holdSplash(page);
  await preview(page, "san-valentin");
  await page.goto("");
  const scene = page.locator("#volta-splash .season-scene");
  await expect(scene.locator(".vl-heart")).toHaveCount(24);
  await settle(page);
  const view = page.viewportSize()!;
  const { brand, heart } = await page.locator("#volta-splash").evaluate((splash) => {
    const box = (sel: string) => { const r = splash.querySelector(sel)!.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    return { brand: box(".splash-brand"), heart: box(".season-scene .vl-line") };
  });
  expect(Math.abs(center(heart).x - view.width / 2)).toBeLessThan(2);
  // El logo adentro del corazón; el corazón entero en la pantalla.
  expect(brand.y).toBeGreaterThan(heart.y);
  expect(brand.y + brand.height).toBeLessThan(heart.y + heart.height);
  expect(brand.x).toBeGreaterThan(heart.x);
  expect(heart.x).toBeGreaterThanOrEqual(0);
  expect(heart.x + heart.width).toBeLessThanOrEqual(view.width);
  expect(heart.y + heart.height).toBeLessThan(view.height);
});

test("Año Nuevo: la actualización se instala y el año pasa a 2027", async ({ page }) => {
  await holdSplash(page);
  await preview(page, "ano-nuevo");
  await page.goto("");
  const scene = page.locator("#volta-splash .season-scene");
  await expect(scene.locator(".ny-bar")).toBeAttached();
  await settle(page);
  await expect(scene.getByText("Versión 2027 instalada")).toBeInViewport();
  await expect(scene.getByText("7", { exact: true })).toBeInViewport();
  await expect(scene.getByText("6", { exact: true })).not.toBeInViewport();
});

test("al recargar a mitad de página, la pantalla de carga queda por encima de todo (capa superior)", async ({ page }) => {
  await preview(page, "san-valentin");
  await page.goto("p/ionic-whey/");
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
  await page.reload();
  const splash = page.locator("#volta-splash");
  await expect(splash).toBeVisible();
  expect(await splash.evaluate((s) => s.matches(":popover-open"))).toBe(true);
  // En la capa superior nada de la página puede dibujarse encima, tenga el z-index que tenga; y ocupa la pantalla entera.
  const box = (await splash.boundingBox())!;
  const view = page.viewportSize()!;
  expect([box.x, box.y, box.width, box.height]).toEqual([0, 0, view.width, view.height]);
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  expect(await splash.evaluate((s) => s.matches(":popover-open"))).toBe(false);
});
