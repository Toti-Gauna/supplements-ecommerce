import { expect, test } from "@playwright/test";
import { holdSplash, previewTheme } from "./splash-helpers";

/** Pantalla de carga del box (R1): centrada, con el lienzo oscuro mientras se ve y en la capa superior. */
const center = (r: { x: number; y: number; width: number; height: number }) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "no-preference" }); });

test("símbolo, nombre y barra de carga centrados; lienzo oscuro hasta que se va", async ({ page }) => {
  await holdSplash(page);
  await page.goto("");
  const splash = page.locator("#volta-splash");
  await expect(splash).toBeVisible();
  const night = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--c-night").trim());
  const toRgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe(toRgb(night));
  const view = page.viewportSize()!;
  const brand = center((await splash.locator(".splash-brand").boundingBox())!);
  expect(Math.abs(brand.x - view.width / 2)).toBeLessThan(2);
  expect(Math.abs(brand.y - view.height / 2)).toBeLessThan(2);
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
});

test("con temática, la pantalla de carga es la misma: solo el filo de la barra toma el acento de temporada", async ({ page }) => {
  await holdSplash(page);
  await previewTheme(page, "black-friday");
  await page.goto("");
  await expect(page.locator("html")).toHaveAttribute("data-season", "black-friday");
  const { edge, accent, bg, base } = await page.locator("#volta-splash").evaluate((s) => ({
    edge: getComputedStyle(s.querySelector(".splash-bar")!).borderBottomColor,
    accent: getComputedStyle(document.documentElement).getPropertyValue("--season-accent").trim(),
    bg: getComputedStyle(s).backgroundColor,
    base: getComputedStyle(document.documentElement).getPropertyValue("--c-night").trim(),
  }));
  const probe = await page.evaluate((c) => { const el = document.createElement("i"); el.style.color = c; document.body.append(el); const v = getComputedStyle(el).color; el.remove(); return v; }, accent);
  expect(edge).toBe(probe);
  const night = await page.evaluate((c) => { const el = document.createElement("i"); el.style.color = c; document.body.append(el); const v = getComputedStyle(el).color; el.remove(); return v; }, base);
  expect(bg).toBe(night);
});

test("al recargar en una sesión nueva a mitad de página, la pantalla de carga queda por encima de todo (capa superior)", async ({ page }) => {
  await page.goto("p/ionic-whey/");
  await page.keyboard.press("Escape");
  await page.evaluate(() => { sessionStorage.clear(); window.scrollTo({ top: 700, behavior: "instant" }); });
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
