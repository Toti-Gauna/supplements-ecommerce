import { expect, test, type Page } from "@playwright/test";
import { guardNetwork } from "./helpers";

const sounds = (page: Page) => page.evaluate(() => window.__voltaSounds ?? []);

// El registro de sonidos solo existe si la página lo pide: se crea antes de cada carga.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { window.__voltaSounds = []; });
});

test("ruleta: se gira arrastrándola y da un premio", async ({ page }) => {
  await page.goto("club/");
  await page.getByRole("button", { name: "Girar la ruleta" }).click();
  const disc = page.getByRole("button", { name: "Ruleta: tocala o arrastrala para girar" });
  await disc.scrollIntoViewIfNeeded();
  const box = (await disc.boundingBox())!;
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy - box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(cx + box.width * 0.3, cy - box.height * 0.3, { steps: 4 });
  await page.mouse.move(cx + box.width * 0.4, cy, { steps: 4 });
  await page.mouse.up();
  await expect(page.getByText("¡Ganaste!")).toBeVisible();
  const played = await sounds(page);
  expect(played).toContain("spin");
  expect(played).toContain("win");
  expect(played).toContain("tick");
});

test("ruleta: también se gira con un toque o con el teclado", async ({ page }) => {
  await page.goto("club/");
  await page.getByRole("button", { name: "Girar la ruleta" }).click();
  const disc = page.getByRole("button", { name: "Ruleta: tocala o arrastrala para girar" });
  await disc.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("¡Ganaste!")).toBeVisible();
  await expect(disc).toHaveCount(0);
});

test("sonidos: suenan al agregar y en favoritos; el silencio se recuerda", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("p/ionic-whey/");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  expect(await sounds(page)).toContain("add");
  await page.keyboard.press("Escape");
  const toggle = page.getByRole("button", { name: "Sonidos", exact: true });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: /favoritos/i }).first().click();
  expect(await sounds(page)).toEqual([]);
  await toggle.click();
  await page.evaluate(() => { window.__voltaSounds = []; });
  await page.getByRole("button", { name: /favoritos/i }).first().click();
  expect(await sounds(page)).toContain("unfavorite");
  assertNoExternal();
});

test("ruleta a pantalla completa: solo la ruleta, entera en la pantalla, y el cupón con sus tres botones", async ({ page }) => {
  await page.goto("club/");
  await page.getByRole("button", { name: "Girar la ruleta" }).click();
  const stage = page.getByRole("dialog", { name: "Ruleta de cupones" });
  const viewport = page.viewportSize()!;
  // Hay dos "Salir" (arriba y abajo del cupón): se mide el último, el de los tres botones.
  const inside = async (name: string) => {
    const box = (await stage.getByRole("button", { name, exact: true }).last().boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  };
  await inside("Ruleta: tocala o arrastrala para girar");
  // El fondo no se scrollea mientras está abierta
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
  await stage.getByRole("button", { name: "Girar la ruleta" }).click();
  await expect(stage.getByText("¡Ganaste!")).toBeVisible();
  for (const name of ["Aplicar ahora", "Guardar para después", "Salir"]) await inside(name);
  await stage.getByRole("button", { name: "Salir", exact: true }).last().click();
  await expect(stage).toBeHidden();
  await expect(page.getByText("Tu premio")).toBeVisible();
});
