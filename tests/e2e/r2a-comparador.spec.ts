import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/**
 * R2a · Comparador: "Comparar" en las tarjetas (hasta 3) → bandeja → /comparar/ con el mejor de cada renglón marcado,
 * Cambiar con el buscador, el atajo de la ficha y la comparación como imagen (PNG armado en el navegador).
 */
const row = (page: Page, label: string) => page.locator("[role=row]").filter({ has: page.getByRole("rowheader", { name: label, exact: true }) });
const toggle = (page: Page, name: string) => page.getByRole("button", { name: `Comparar ${name}`, exact: true });
const tray = (page: Page) => page.getByRole("complementary", { name: "Comparación" });
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test("dos desde las tarjetas → bandeja → el comparador marca el mejor por servicio; Cambiar y Quitar", async ({ page }) => {
  await page.goto("c/proteinas/");
  await toggle(page, "Ionic Whey 100%").click();
  await expect(toggle(page, "Ionic Whey 100%")).toHaveAttribute("aria-pressed", "true");
  await expect(tray(page)).toContainText("Comparar (1)");
  await toggle(page, "Proteína vegana arveja + arroz").click();
  await expect(tray(page)).toContainText("Comparar (2)");
  // El acceso del menú existe solo con algo en la bandeja.
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("dialog", { name: "Menú" }).getByRole("link", { name: "Comparar (2)" })).toBeVisible();
  await page.keyboard.press("Escape");

  await tray(page).getByRole("link", { name: /Comparar \(2\)/ }).click();
  await expect(page).toHaveURL(/comparar\/\?p=ionic-whey,proteina-vegana$/);
  await expect(page.getByRole("heading", { level: 1, name: "Comparador" })).toBeVisible();
  const pps = row(page, "Precio por servicio").getByRole("cell");
  await expect(pps).toHaveText([/\$\s?1\.559/, /\$\s?1\.482.*Mejor/, ""]);
  await expect(pps.nth(1)).toHaveAttribute("data-best", "true");
  await expect(row(page, "Servicios").getByRole("cell").first()).toHaveAttribute("data-best", "true");
  await expect(tray(page)).toHaveCount(0);
  expect(await noOverflow(page)).toBeLessThanOrEqual(0);

  // Cambiar: el buscador del rubro elige otro y la URL se actualiza.
  await page.getByRole("button", { name: "Cambiar Ionic Whey 100%" }).click();
  const picker = page.getByRole("dialog", { name: "Cambiar Ionic Whey 100%" });
  await picker.getByRole("searchbox", { name: "Buscar productos" }).fill("isolate");
  await picker.getByRole("button", { name: "Elegir Isolate Zero" }).click();
  await expect(page).toHaveURL(/comparar\/\?p=isolate-zero,proteina-vegana$/);
  await expect(page.getByRole("columnheader").filter({ hasText: "Isolate Zero" })).toBeVisible();
  await expect(row(page, "Proteína por servicio").getByRole("cell").first()).toHaveAttribute("data-best", "true");

  // Sumar un tercero desde el lugar libre; con 3 ya no hay lugar.
  await page.getByRole("button", { name: "Sumar producto" }).click();
  await page.getByRole("dialog", { name: "Sumar a la comparación" }).getByRole("button", { name: "Elegir Night Casein" }).click();
  await expect(page).toHaveURL(/p=isolate-zero,proteina-vegana,night-casein$/);
  await expect(page.getByRole("button", { name: "Sumar producto" })).toHaveCount(0);
  expect(await noOverflow(page)).toBeLessThanOrEqual(0);

  await page.getByRole("button", { name: "Quitar Proteína vegana arveja + arroz de la comparación" }).click();
  await expect(page).toHaveURL(/p=isolate-zero,night-casein$/);
  await page.reload();
  await expect(page.getByRole("columnheader").filter({ hasText: "Night Casein" })).toBeVisible();
});

test("máximo 3: el cuarto no entra y se avisa", async ({ page }) => {
  await page.goto("c/proteinas/");
  for (const name of ["Ionic Whey 100%", "Isolate Zero", "Night Casein"]) await toggle(page, name).click();
  await expect(tray(page)).toContainText("Comparar (3)");
  await toggle(page, "Proteína vegana arveja + arroz").click();
  await expect(page.getByText("Ya tenés 3 para comparar")).toBeVisible();
  await expect(toggle(page, "Proteína vegana arveja + arroz")).toHaveAttribute("aria-pressed", "false");
  await expect(tray(page)).toContainText("Comparar (3)");
  // Tocar de nuevo uno elegido lo saca.
  await toggle(page, "Night Casein").click();
  await expect(tray(page)).toContainText("Comparar (2)");
});

test("la ficha lleva al comparador con el producto y sus parecidos de la misma categoría", async ({ page }) => {
  await page.goto("p/ionic-whey/");
  const link = page.getByRole("link", { name: "Comparar los 3" });
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page).toHaveURL(/comparar\/\?p=ionic-whey,proteina-vegana,night-casein$/);
  await expect(page.getByRole("columnheader")).toHaveCount(3);
});

test("mezcla de equipamiento: lo que es por servicio compara solo los suplementos y se avisa", async ({ page }) => {
  await page.goto("comparar/?p=ionic-whey,shaker-volta");
  await expect(page.getByRole("note")).toContainText("solo los suplementos");
  await expect(row(page, "Precio por servicio").getByRole("cell").nth(1)).toHaveText("No aplica");
});

test("compartir la comparación como imagen: sin hoja de compartir, descarga un PNG", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "canShare", { value: undefined, configurable: true });
  });
  await page.goto("comparar/?p=ionic-whey,proteina-vegana,isolate-zero");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Compartir como imagen" }).click()]);
  expect(download.suggestedFilename()).toBe("comparacion-ionic-whey-vs-proteina-vegana-vs-isolate-zero.png");
  const bytes = readFileSync((await download.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  expect(bytes.length).toBeGreaterThan(20_000);
  await expect(page.getByText("Imagen descargada")).toBeVisible();
});
