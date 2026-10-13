import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.2 · Lote 6 (8.2.13 y pedido de Ignacio): Club premium y la banda del Club del inicio con aire a los costados. */
const preview = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);

test("8.2.13 portada del Club: métricas, próximo premio y accesos; las funciones siguen igual", async ({ page }) => {
  await page.goto("club/");
  const hero = page.getByRole("region", { name: "Sumá carga. Subí de nivel." });
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  for (const label of ["Misiones activas", "Completadas", "Premios en producto"]) await expect(hero.getByText(label, { exact: true })).toBeVisible();
  await expect(hero.getByText("Tu próximo premio")).toBeVisible();
  await expect(hero.getByRole("progressbar", { name: /Progreso hacia/ })).toHaveAttribute("aria-valuenow", "0");
  // Con la cuenta demo, el próximo premio toma el progreso de ejemplo (motor de misiones, sin cambios).
  await hero.getByRole("button", { name: "Ver mi progreso con la cuenta demo" }).click();
  await expect(hero.getByText("Progreso de Sofía")).toBeVisible();
  await expect(hero.getByRole("progressbar", { name: /Progreso hacia/ })).not.toHaveAttribute("aria-valuenow", "0");
  // La ruleta sigue con su único botón y el acceso de la portada lleva hasta ella.
  await expect(page.getByRole("button", { name: "Girar la ruleta" })).toHaveCount(1);
  await hero.getByRole("link", { name: "Ir a la ruleta" }).click();
  await expect(page.getByRole("heading", { name: "Girá y llevate un premio" })).toBeInViewport();
});

test("8.2.13 la portada toma el acento y el adorno de la temática vigente", async ({ page }) => {
  await preview(page, "halloween");
  await page.goto("club/");
  const hero = page.getByRole("region", { name: "Sumá carga. Subí de nivel." });
  await expect(hero.getByText("Club Volta · Halloween")).toBeVisible();
  expect(await hero.locator("h1 .italic").evaluate((el) => getComputedStyle(el).color)).toBe("rgb(255, 138, 31)");
});

for (const [width, height] of [[1280, 900], [820, 1180], [390, 844]] as const) {
  test(`8.2.13 a ${width}px: las misiones se leen enteras y no hay desbordes`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("club/");
    const cards = page.locator("section[aria-labelledby=mis] article");
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      // El estado entra en una línea y el título no se parte en más de dos renglones.
      expect(await card.locator("span.rounded-full").first().evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(32);
      expect(await card.locator("h3").evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight))).toBeLessThan(2.5);
    }
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });

  test(`banda del Club en el inicio a ${width}px: deja aire a la izquierda y a la derecha`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("");
    const band = page.locator("section[aria-labelledby=club]");
    await band.scrollIntoViewIfNeeded();
    const box = (await band.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(12);
    expect(width - (box.x + box.width)).toBeGreaterThanOrEqual(12);
    expect(await band.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(16);
  });
}
