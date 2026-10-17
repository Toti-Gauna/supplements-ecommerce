import { expect, test, type Page } from "@playwright/test";

/**
 * Polish 8.2.5: cada página nueva abre desde su cabecera. Con movimiento (como en el iPad): la transición entre
 * páginas era la que dejaba el título tapado por el header o la página a mitad de camino.
 */
/** Carga directa (con su pantalla de carga, que se cierra con Escape). */
async function visit(page: Page, path: string) {
  await page.goto(path);
  await page.keyboard.press("Escape");
  await expect(page.locator("#volta-splash")).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await visit(page, "");
});

/**
 * Abre arriba de todo y el título queda debajo del header fijo (nada tapado). La URL cambia antes de que la página
 * nueva termine de cargar (mientras tanto se ve el esqueleto de `loading.tsx`, sin título): se mide recién con el
 * título de la página nueva a la vista, si no en un equipo lento se medía el esqueleto.
 */
async function opensAtTop(page: Page, url: RegExp) {
  await expect(page).toHaveURL(url);
  await expect(page.locator("main h1").first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(0);
  await page.waitForTimeout(400);
  const { y, h1, header } = await page.evaluate(() => ({
    y: Math.round(scrollY),
    h1: document.querySelector("main h1")?.getBoundingClientRect().top ?? null,
    header: document.querySelector("[data-shop-header]")?.getBoundingClientRect().bottom ?? 0,
  }));
  expect(y, "sigue arriba después de la transición").toBe(0);
  expect(h1, "la página nueva tiene su título").not.toBeNull();
  expect(h1!).toBeGreaterThanOrEqual(header - 1);
}

const down = (page: Page, px: number) => page.evaluate((d) => window.scrollBy({ top: d, behavior: "instant" }), px);

const preview = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);

test("inicio → categoría → producto → producto relacionado", async ({ page }) => {
  await page.locator("#cats-rail").scrollIntoViewIfNeeded();
  await page.locator("#cats-rail a").first().click();
  await opensAtTop(page, /\/c\/[^/]+\/$/);
  await down(page, 500);
  await page.locator("main [data-product-card] h3 a").first().click();
  await opensAtTop(page, /\/p\/[^/]+\/$/);
  const related = page.locator("#relacionados").locator("xpath=ancestor::section[1]");
  await related.scrollIntoViewIfNeeded();
  const before = page.url();
  await related.locator("[data-product-card] h3 a").first().click();
  await expect(page).not.toHaveURL(before);
  await opensAtTop(page, /\/p\/[^/]+\/$/);
});

test("recomendados → producto → carrito → checkout", async ({ page }) => {
  // Con un premio de la ruleta ya guardado, ir al checkout no abre la ruleta primero.
  await page.evaluate(() => localStorage.setItem("volta-demo:account", JSON.stringify({ state: { wheelPrize: { code: "DEMO10", label: "10 % de descuento", at: "2026-10-10T12:00:00.000Z" } }, version: 0 })));
  await visit(page, "");
  const rec = page.locator("#recomendados").locator("xpath=ancestor::section[1]");
  await rec.scrollIntoViewIfNeeded();
  await rec.locator("[data-product-card] h3 a").first().click();
  await opensAtTop(page, /\/p\/[^/]+\/$/);
  await visit(page, "p/overvolt-pre/");
  await down(page, 500);
  // En el celular "Agregar al carrito" vive en la barra flotante de abajo.
  await page.locator("[data-buy-bar]").getByRole("button", { name: /Agregar al carrito/ }).click();
  await page.getByRole("link", { name: "Ver carrito completo" }).click();
  await opensAtTop(page, /\/carrito\/$/);
  await page.getByRole("button", { name: /Continuar al checkout/ }).click();
  await opensAtTop(page, /\/checkout\/$/);
});

test("header y pie: links internos desde abajo de la página", async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await down(page, 1600);
  await page.locator("[data-shop-header]").getByRole("link", { name: "Club Volta" }).click();
  await opensAtTop(page, /\/club\/$/);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.locator("footer").getByRole("link", { name: "Ayuda del box" }).click();
  await opensAtTop(page, /\/preguntas\/$/);
});

test("un link con ancla abre en esa sección (debajo del header) y Atrás vuelve a donde estaba", async ({ page }) => {
  // El link con ancla hacia otra página es "Ver ofertas" de la cinta de la temática (lleva a /#ofertas-tematicas).
  await preview(page, "navidad");
  await visit(page, "c/proteinas/");
  const ribbon = page.locator("[data-theme-ribbon]");
  // Se baja hasta dejar la cinta arriba de todo: se sale de un punto que no es el inicio de la página.
  await down(page, Math.floor((await ribbon.boundingBox())!.y));
  // Se espera a que el link sea el que recibe el toque en su lugar: si no, Playwright reintenta el clic moviendo la página.
  const link = ribbon.getByRole("link", { name: "Ver ofertas" });
  await expect.poll(() => link.evaluate((a) => {
    const r = a.getBoundingClientRect();
    return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === a;
  })).toBe(true);
  const left = await page.evaluate(() => Math.round(scrollY));
  expect(left).toBeGreaterThan(0);
  await link.click();
  await expect(page).toHaveURL(/\/supplements-ecommerce\/#ofertas-tematicas$/);
  await page.waitForTimeout(700);
  const { top, header } = await page.evaluate(() => ({
    top: document.getElementById("ofertas-tematicas")!.getBoundingClientRect().top,
    header: document.querySelector("[data-shop-header]")!.getBoundingClientRect().bottom,
  }));
  expect(top).toBeGreaterThanOrEqual(header - 1);
  expect(top).toBeLessThan(header + 120);
  await page.goBack();
  await expect(page).toHaveURL(/\/c\/proteinas\/$/);
  await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBeGreaterThan(left / 2);
});

test("lo que no es navegación (ordenar los productos) no mueve la página", async ({ page }) => {
  await visit(page, "c/proteinas/");
  await down(page, 300);
  const y = await page.evaluate(() => Math.round(scrollY));
  await page.getByLabel("Ordenar por").selectOption({ index: 2 });
  await page.waitForTimeout(700);
  // El navegador puede correr unos píxeles para mantener a la vista la misma tarjeta (scroll anchoring) al reordenar.
  expect(Math.abs((await page.evaluate(() => Math.round(scrollY))) - y)).toBeLessThanOrEqual(16);
});
