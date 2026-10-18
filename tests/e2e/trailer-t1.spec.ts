import { createHash } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

/**
 * T1 · avance del problema (escenas 1 a 6 de docs/trailer/t1/storyboard.md): el mismo segundo da el mismo cuadro por tres
 * caminos en los dos formatos, cada escena muestra su super y el movimiento reducido deja la lámina final.
 */
const B = 60 / 128;
const at = (beats: number) => Math.round(beats * B * 1000) / 1000;
const ready = (page: Page) => page.waitForFunction(() => window.__trailer?.ready === true);
const hash = async (page: Page) => createHash("sha256").update(await page.locator("[data-trailer-stage]").screenshot()).digest("hex");
const seek = (page: Page, t: number) => page.evaluate((s) => window.__trailer!.seek(s), t);
const scene = (page: Page, id: string) => page.locator(`[data-escena='${id}']`);

for (const ratio of ["16x9", "9x16"] as const) {
  test(`${ratio}: las escenas del problema dan el mismo cuadro por tres caminos`, async ({ page }) => {
    await page.setViewportSize(ratio === "16x9" ? { width: 960, height: 540 } : { width: 405, height: 720 });
    for (const t of [at(13.3), at(17.9), at(22.1), at(25.3), at(28.7)]) {
      await page.goto(`trailer/t1-avance/?export=1&ratio=${ratio}&t=${t}`);
      await ready(page);
      await seek(page, t);
      const byUrl = await hash(page);
      await seek(page, 0);
      await seek(page, t);
      const fromStart = await hash(page);
      await seek(page, at(29));
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
