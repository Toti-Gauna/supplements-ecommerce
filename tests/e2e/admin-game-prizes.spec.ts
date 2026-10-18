import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });

test("premios del juego: editar un nivel, ver la vista previa y que la tienda use lo guardado", async ({ page }) => {
  await page.goto("admin-demo/promos/");
  await page.getByRole("tab", { name: "Premios del juego" }).click();
  await expect(page).toHaveURL(/cupones\/juego\/$/);
  await expect(page.getByRole("heading", { level: 1, name: /Premios del juego/ })).toBeVisible();
  const preview = page.getByRole("region", { name: /Vista previa · Shaker Rush/ });
  await expect(preview.locator("[data-game-preview]")).toHaveText(/^Con 800 puntos ganás 10\s%\sOFF\./);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  // Un valor fuera de rango no se guarda.
  const level2 = page.getByRole("group", { name: "Nivel 2" });
  await level2.getByLabel("Porcentaje").fill("80");
  await page.getByRole("button", { name: "Guardar premios" }).click();
  await expect(level2.getByRole("alert")).toHaveText("El porcentaje va de 1 a 50.");
  await expect(preview).toContainText("Corregí los valores marcados");

  await level2.getByLabel("Porcentaje").fill("15");
  await level2.getByLabel("Vence en (días)").fill("3");
  await expect(preview.locator("[data-game-preview]")).toHaveText(/^Con 800 puntos ganás 15\s%\sOFF\./);
  await expect(preview).toContainText(/Con 800 puntos ganás 15\s%\sOFF \(vence a los 3 días\)\./);
  await page.getByRole("button", { name: "Guardar premios" }).click();
  await expect(toast(page, "Premios del juego guardados")).toBeVisible();

  // La tienda ya muestra el premio nuevo y su vencimiento.
  await page.goto("club/juego/");
  const prizes = page.getByRole("region", { name: /ganá un cupón/ }).getByRole("listitem");
  const tier = prizes.filter({ hasText: /15\s%\sOFF/ }).first();
  await expect(tier).toContainText("desde 800 pts");
  await expect(tier).toContainText("Vence a los 3 días");
  await expect(page.getByText(/vence según el nivel/)).toBeVisible();
  await page.goto("club/");
  await expect(page.getByText(/ganás 5\s%\sOFF, 15\s%\sOFF o envío gratis/)).toBeVisible();
});

test("premios del juego: agregar un nivel y pausar los premios", async ({ page }) => {
  await page.goto("admin-demo/cupones/juego/");
  await page.getByRole("button", { name: "Agregar nivel" }).click();
  const level4 = page.getByRole("group", { name: "Nivel 4" });
  await expect(level4.getByLabel("Desde (puntos)")).toHaveValue("2000");
  await level4.getByLabel("Premio").selectOption({ label: "Monto fijo" });
  await level4.getByLabel("Monto en pesos").fill("5000");
  await page.getByRole("switch", { name: /Se entregan cupones/ }).click();
  await expect(page.getByRole("region", { name: /Vista previa/ }).locator("[data-game-preview]")).toHaveText(/pausados/);
  await page.getByRole("button", { name: "Guardar premios" }).click();
  await expect(toast(page, "Premios del juego guardados")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Premios pausados", { exact: true })).toBeVisible();
  await page.goto("club/juego/");
  await expect(page.getByText(/Ahora los premios están pausados/)).toBeVisible();
});
