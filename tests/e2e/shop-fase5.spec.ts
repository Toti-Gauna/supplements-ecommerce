import { expect, test, type Page } from "@playwright/test";

/** Vista previa de una temática antes de cargar (como "Probar temáticas"). */
const preview = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);

test.describe("temáticas fitness de la Fase 5", () => {
  for (const [id, heading] of [
    ["cyber-monday", "Overclock de precios"],
    ["vuelta-al-gym", "Volvió la rutina"],
    ["operacion-verano", "Modo verano: activado"],
    ["ano-nuevo", "Versión 2027 instalada"],
  ] as const) {
    test(`${id}: acento de temporada, banner y cinta`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await preview(page, id);
      await page.goto("");
      await expect(page.locator("html")).toHaveAttribute("data-season", id);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      await expect(page.locator(`[data-theme-ribbon='${id}']`)).toBeVisible();
    });
  }

  test("el hero de la campaña: titular, oferta y producto en el rack (el arte de cada fecha llega en R3)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await preview(page, "dia-del-amigo");
    await page.goto("");
    await page.keyboard.press("Escape");
    const banner = page.locator("[data-theme-banner='dia-del-amigo']");
    await expect(banner.getByRole("heading", { name: "Tu compañero de gym" })).toBeVisible();
    await expect(banner.getByRole("img", { name: /imagen ilustrativa/ }).first()).toBeVisible();
    await expect(banner).toContainText("$5.000 OFF");
    // Nada de Velmar: sin personajes ni decoraciones de mascotas.
    await expect(page.locator("svg.pup")).toHaveCount(0);
  });
});

test("con movimiento reducido no queda ninguna animación corriendo en una temática", async ({ page }) => {
  await preview(page, "dia-del-amigo");
  await page.goto("");
  await expect(page.locator("#volta-splash")).toBeHidden();
  await expect(page.locator("[data-theme-banner='dia-del-amigo']")).toBeVisible();
  await page.waitForTimeout(800);
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a instanceof CSSAnimation).map((a) => (a as CSSAnimation).animationName));
  expect(running).toEqual([]);
  await expect(page.locator(".amb-field").first()).toBeHidden();
});

test("navegar entre páginas usa View Transitions y la imagen del producto vuela a la ficha", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const w = window as unknown as { __vt: string[] };
    w.__vt = [];
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((arg: Parameters<typeof start>[0]) => {
      w.__vt.push([...document.querySelectorAll<HTMLElement>("[data-card-visual]")].map((el) => el.style.viewTransitionName).filter(Boolean).join(","));
      return start(arg);
    }) as typeof document.startViewTransition;
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Inicio: hay productos repetidos en varios rieles; solo la tarjeta tocada lleva el nombre de la transición.
  await page.goto("");
  await page.keyboard.press("Escape");
  await page.locator("main [data-product-card] h3 a").first().click();
  await expect(page).toHaveURL(/\/p\//);
  await expect(page.locator("[data-vt-hero]")).toBeVisible();
  const calls = await page.evaluate(() => (window as unknown as { __vt: string[] }).__vt);
  expect(calls.length).toBeGreaterThan(0);
  expect(calls).toContain("product-hero");
  expect(errors).toEqual([]);
});

test("microinteracciones: la cantidad rueda sin duplicar el número y el corazón de favoritos destella", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("p/ionic-whey/");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Guardar .* en favoritos/ }).first().click();
  await expect(page.locator("button[aria-pressed='true'] .bg-ember").first()).toBeAttached();
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await page.goto("carrito/");
  await page.keyboard.press("Escape");
  const stepper = page.getByRole("group", { name: /Cantidad/ }).first();
  await stepper.getByRole("button", { name: "Sumar uno" }).click();
  await expect(stepper.locator("output")).toHaveText("2");
  await expect(stepper.locator("span[aria-hidden='true']")).toHaveCount(1);
  await expect(stepper.locator("span[aria-hidden='true']")).toHaveText("2");
  // La bolsa del header se sacude sin duplicarse.
  await expect(page.getByRole("button", { name: /^Carrito, 2 productos/ }).locator("svg")).toHaveCount(1);
});
