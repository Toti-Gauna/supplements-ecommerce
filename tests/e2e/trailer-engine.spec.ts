import { createHash } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

/**
 * Motor del trailer (P0.3): el mismo segundo da exactamente el mismo cuadro llegando por tres caminos (URL `?t=`,
 * salto desde el principio y salto desde más adelante), en 16:9 y en 9:16. Es la base de la exportación a MP4.
 */
const ready = (page: Page) => page.waitForFunction(() => window.__trailer?.ready === true);
const hash = async (page: Page) => createHash("sha256").update(await page.locator("[data-trailer-stage]").screenshot()).digest("hex");
const seek = (page: Page, t: number) => page.evaluate((s) => window.__trailer!.seek(s), t);

for (const ratio of ["16x9", "9x16"] as const) {
  test(`${ratio}: el mismo segundo da el mismo cuadro por tres caminos`, async ({ page }) => {
    await page.setViewportSize(ratio === "16x9" ? { width: 960, height: 540 } : { width: 405, height: 720 });
    for (const t of [2.3, 6.1, 9.6]) {
      await page.goto(`trailer/demo/?export=1&ratio=${ratio}&t=${t}`);
      await ready(page);
      await seek(page, t);
      const byUrl = await hash(page);
      await seek(page, 0);
      await seek(page, t);
      const fromStart = await hash(page);
      await seek(page, 15);
      await seek(page, t);
      const fromLater = await hash(page);
      expect([fromStart, fromLater], `t=${t}`).toEqual([byUrl, byUrl]);
    }
  });
}

test("la página del trailer no muestra la pantalla de carga ni los controles al exportar, y sí al mirarlo", async ({ page }) => {
  await page.goto("trailer/demo/?export=1&t=1");
  await ready(page);
  await expect(page.locator("html")).toHaveClass(/splash-done/);
  await expect(page.locator("[data-trailer-controls]")).toHaveCount(0);
  await page.goto("trailer/demo/?t=1&dev=1");
  await ready(page);
  await expect(page.locator("[data-trailer-controls]")).toContainText("pregunta");
  await expect(page.locator("[data-escena='pregunta']")).toBeVisible();
  await expect(page.locator("[data-escena='cierre']")).toBeHidden();
});

test("la firma de Eclipse: apertura, contacto y precios en pesos con el dólar debajo", async ({ page }) => {
  await page.goto("trailer/firma/?export=1&t=4");
  await ready(page);
  await expect(page.locator("[data-escena='apertura']")).toContainText("Presenta…");
  await seek(page, 23);
  await expect(page.locator("[data-escena='en-vivo']")).toContainText("223-446 7881");
  await seek(page, 28.5);
  const campana = page.locator("[data-escena='precio-campana']");
  await expect(campana).toBeVisible();
  await expect(campana).toContainText("$ 750.000");
  await expect(campana).toContainText("USD 500");
  await expect(page.locator("[data-trailer-stage]")).not.toContainText(/volta/i);
});

test("con música: la firma abre con la puerta de sonido y “Ver sin sonido” arranca el trailer", async ({ page }) => {
  await page.goto("trailer/firma/");
  await ready(page);
  const gate = page.locator("[data-trailer-gate]");
  await expect(gate.getByRole("button", { name: /Reproducir con sonido|Preparando el sonido/ })).toBeVisible();
  await gate.getByRole("button", { name: "Ver sin sonido" }).click();
  await expect(gate).toHaveCount(0);
  await expect(page.locator("[data-trailer-controls]").getByRole("button", { name: "Pausa" })).toBeVisible();
});

test("los MP4 exportados se ofrecen para descargar (y solo los que existen)", async ({ page }) => {
  await page.goto("trailer/firma/?t=1");
  await ready(page);
  const controls = page.locator("[data-trailer-controls]");
  await expect(controls.locator("a[data-download='Descargar MP4']")).toHaveAttribute("href", /\/trailer\/firma-16x9\.mp4$/);
  await expect(controls.locator("a[data-download='Para email']")).toHaveAttribute("href", /\/trailer\/firma-email\.mp4$/);
  await page.goto("trailer/firma/?t=1&ratio=9x16");
  await ready(page);
  await expect(controls.locator("a[data-download='Descargar MP4']")).toHaveAttribute("href", /\/trailer\/firma-9x16\.mp4$/);
  await expect(controls.locator("a[data-download='Para email']")).toHaveCount(0);
  await page.goto("trailer/demo/?t=1");
  await ready(page);
  await expect(controls.locator("a[download]")).toHaveCount(0);
});
