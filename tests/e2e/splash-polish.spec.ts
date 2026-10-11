import { expect, test, type Page } from "@playwright/test";

/** Polish 8.1: pantallas de carga centradas, sin superposiciones y con el lienzo oscuro mientras se ven. */
const preview = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);
const center = (r: { x: number; y: number; width: number; height: number }) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "no-preference" }); });

test("Original: un solo aro, concéntrico con el logo, con las piezas montadas encima; lienzo oscuro hasta que se va", async ({ page }) => {
  await page.goto("");
  const splash = page.locator("#volta-splash");
  await expect(splash.locator(".splash-halo")).toHaveCount(1);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe("rgb(19, 22, 14)");
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

test("Día de la Madre: la flor se abre alrededor del logo y ningún pétalo ni estambre lo pisa", async ({ page }) => {
  await preview(page, "dia-de-la-madre");
  await page.goto("");
  const scene = page.locator("#volta-splash .season-scene");
  await expect(scene.locator(".md-petal")).toHaveCount(20);
  const brand = (await page.locator("#volta-splash .splash-brand").boundingBox())!;
  // La flor es un punto (0 × 0) en el centro de la pantalla: se mide con el DOM, Playwright no da caja de algo sin tamaño.
  const bloom = await scene.locator(".md-bloom").evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y }; });
  // Las esquinas del logo quedan más cerca del centro de la flor que la ronda de estambres (donde nacen los pétalos).
  const stamens = await scene.locator(".md-stamen").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
  const ring = Math.min(...stamens.map((s) => Math.hypot(s.x - bloom.x, s.y - bloom.y)));
  for (const [x, y] of [[brand.x, brand.y], [brand.x + brand.width, brand.y], [brand.x, brand.y + brand.height], [brand.x + brand.width, brand.y + brand.height]]) {
    expect(Math.hypot(x! - bloom.x, y! - bloom.y)).toBeLessThan(ring);
  }
});

test("San Valentín: Lola y Pancho cenan debajo del logo, todo centrado y sin pisarse", async ({ page }) => {
  await preview(page, "san-valentin");
  await page.goto("");
  const scene = page.locator("#volta-splash .season-scene");
  await expect(scene.locator(".vl-dinner svg.pup")).toHaveCount(2);
  const view = page.viewportSize()!;
  const brand = (await page.locator("#volta-splash .splash-brand").boundingBox())!;
  const heart = (await scene.locator(".vl-heart").boundingBox())!;
  const dinner = (await scene.locator(".vl-dinner").boundingBox())!;
  expect(Math.abs(center(heart).x - view.width / 2)).toBeLessThan(2);
  expect(Math.abs(center(dinner).x - view.width / 2)).toBeLessThan(2);
  // El logo dentro del corazón y la cena debajo; el grupo entero entra en la pantalla.
  expect(brand.y).toBeGreaterThan(heart.y);
  expect(brand.y + brand.height).toBeLessThan(dinner.y);
  expect(heart.y).toBeGreaterThan(0);
  expect(dinner.y + dinner.height).toBeLessThan(view.height);
});

test("al recargar a mitad de página, la pantalla de carga queda por encima de todo (capa superior)", async ({ page }) => {
  await preview(page, "san-valentin");
  await page.goto("p/velador-con-foto/");
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
