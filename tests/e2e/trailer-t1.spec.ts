import { createHash } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

// El config fuerza movimiento reducido para toda la suite; acá se prueba la versión animada (la reducida, con `?reduced=1`).
test.use({ reducedMotion: "no-preference" });

/**
 * T1 · avance (escenas 1 a 13 de docs/trailer/t1/storyboard.md): el mismo segundo da el mismo cuadro por tres caminos en los
 * dos formatos (también con la pantalla de carga real, la bolsa, la ruleta, Shaker Rush y las placas), cada escena muestra su
 * super o rótulo, nunca otra marca, y el movimiento reducido deja la lámina final.
 */
const B = 60 / 128;
const at = (beats: number) => Math.round(beats * B * 1000) / 1000;
const ready = (page: Page) => page.waitForFunction(() => window.__trailer?.ready === true);
const hash = async (page: Page) => createHash("sha256").update(await page.locator("[data-trailer-stage]").screenshot()).digest("hex");
const seek = (page: Page, t: number) => page.evaluate((s) => window.__trailer!.seek(s), t);
const scene = (page: Page, id: string) => page.locator(`[data-escena='${id}']`);

for (const ratio of ["16x9", "9x16"] as const) {
  test(`${ratio}: las escenas del problema dan el mismo cuadro por tres caminos`, async ({ page }) => {
    test.setTimeout(120_000); // 12 cuadros, cada uno con su carga y tres capturas a 2,6×.
    await page.setViewportSize(ratio === "16x9" ? { width: 960, height: 540 } : { width: 405, height: 720 });
    for (const t of [at(13.3), at(22.1), at(28.7), at(30.6), at(32.5), at(35.6), at(38.2), at(40.4), at(42.2), at(46.1), at(49.2), at(53.1)]) {
      await page.goto(`trailer/t1-avance/?export=1&ratio=${ratio}&t=${t}`);
      await ready(page);
      await seek(page, t);
      const byUrl = await hash(page);
      await seek(page, 0);
      await seek(page, t);
      const fromStart = await hash(page);
      await seek(page, at(55));
      await seek(page, t);
      const fromLater = await hash(page);
      expect([fromStart, fromLater], `t=${t}`).toEqual([byUrl, byUrl]);
    }
  });
}

test("cada escena del problema muestra su super y el cierre abre el marco de la tienda", async ({ page }) => {
  await page.goto("trailer/t1-avance/?export=1&t=7");
  await ready(page);
  for (const [beats, id, text] of [[13.5, "calcadas", "Mismo template."], [17, "veinte", "Mismo 20 % OFF."], [21, "potes", "Misma grilla de potes."], [25, "plano", "Y después de comprar, nada."], [29.5, "latido", "La tuya,"]] as const) {
    await seek(page, at(beats));
    await expect(scene(page, id)).toBeVisible();
    await expect(scene(page, id)).toContainText(text);
  }
  await expect(page.locator("[data-trailer-stage]")).not.toContainText(/volta/i);
});

test("la ráfaga: cada plano con su rótulo y lo real con la marca de la tienda", async ({ page }) => {
  await page.goto("trailer/t1-avance/?export=1&t=15");
  await ready(page);
  const chips = [[32.5, "w1-carga", "01 · Pantallas de carga por fecha"], [35.5, "w2-tema", "02 · Modo claro y oscuro"], [38, "w3-regalo", "03 · Regalos que se abren a golpes"],
    [42, "w4-shaker", "04 · Un juego propio"], [46, "w5-ruleta", "05 · Ruleta de cupones"], [50, "w6-mostrador", "06 · Mostrador en cuotas"], [53, "w7-proveedor", "07 · Lista del proveedor"]] as const;
  for (const [beats, id, text] of chips) {
    await seek(page, at(beats));
    await expect(scene(page, id).locator("[data-t='chip']").first(), id).toContainText(text);
  }
  await seek(page, at(32.5));
  await expect(scene(page, "w1-carga").locator(".splash-stage[data-scene='crossfit-open']")).toBeVisible();
  await expect(scene(page, "w1-carga")).toContainText("Tu tienda");
  await seek(page, at(40.5));
  await expect(scene(page, "w3-regalo")).toContainText("¡La rompiste!");
  await expect(scene(page, "w3-regalo").locator("svg text", { hasText: "TU TIENDA" }).first()).toBeAttached();
  await seek(page, at(43.5));
  await expect(scene(page, "w4-shaker")).toContainText("¡Tiempo!");
  await seek(page, at(50.5));
  await expect(scene(page, "w6-mostrador")).toContainText("$ 40.892");
  await seek(page, at(54));
  await expect(scene(page, "w7-proveedor").locator("[data-t='count']")).toHaveText("48");
  await expect(page.locator("[data-trailer-stage]")).not.toContainText(/volta/i);
});

test("con movimiento reducido cada escena queda en su lámina final", async ({ page }) => {
  await page.goto("trailer/t1-avance/?export=1&reduced=1&t=5");
  await ready(page);
  await seek(page, at(27.5));
  await expect(scene(page, "plano")).toBeVisible();
  await expect(scene(page, "plano").locator("[data-t='box']").first()).toBeHidden();
  await expect(scene(page, "plano").locator("[data-t='line']")).toBeVisible();
  await seek(page, at(29.5));
  await expect(scene(page, "latido").locator("[data-t='seg-top']")).toBeVisible();
  await expect(scene(page, "latido").locator("[data-t='pulse']")).toBeHidden();
});
