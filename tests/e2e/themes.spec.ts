import { expect, test } from "@playwright/test";
import { guardNetwork } from "./helpers";

test("probar temáticas: Halloween cambia cinta, logo, carrusel y ofertas; el cupón queda en el carrito", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  // Hasta la Fase 5 el botón arranca oculto: se prende desde el panel para mostrarle la demo al cliente.
  await page.goto("admin-demo/tematicas/");
  const tryButton = page.getByRole("switch", { name: /Probar temáticas/ });
  await expect(tryButton).not.toBeChecked();
  await tryButton.click();
  await expect(tryButton).toBeChecked();
  // El panel deja puesta una temática (Navidad fija) para ver que "Original" la tapa solo en este navegador.
  await page.getByLabel("Modo", { exact: true }).selectOption("fixed");
  await page.getByLabel("Temática fija").selectOption("navidad");
  await page.goto("");
  await page.getByRole("button", { name: "Probar temáticas" }).click();
  const picker = page.getByRole("dialog", { name: "Probar temáticas" });
  await picker.getByRole("button", { name: "Probar Halloween" }).click();
  await expect(picker).toBeHidden();

  // Elegir recarga la página (sale la pantalla de carga de temporada) y toda la tienda toma la paleta.
  await expect(page.locator("[data-theme-ribbon='halloween']")).toContainText("BOO20");
  await expect(page.locator("html")).toHaveAttribute("data-season", "halloween");
  await expect(page.getByRole("heading", { name: "Truco o regalo" })).toBeVisible();
  const rail = page.locator("section").filter({ has: page.getByRole("heading", { name: /Ofertas de Halloween/ }) });
  await expect(rail.getByText("20% OFF").first()).toBeVisible();

  await page.getByRole("button", { name: "Usar BOO20" }).click();
  await expect(page.getByRole("button", { name: "Cupón en tu carrito" })).toBeDisabled();

  // Se recuerda al recargar y se sale desde la cinta
  await page.reload();
  await expect(page.locator("[data-theme-ribbon='halloween']")).toBeVisible();
  await page.getByRole("button", { name: "Pausar animaciones de la temática" }).click();
  await expect(page.locator("html")).toHaveClass(/amb-paused/);
  await page.locator("[data-theme-ribbon]").getByRole("button", { name: "Salir" }).click();
  await expect(page.locator("[data-theme-ribbon='halloween']")).toHaveCount(0);
  // Sin vista previa manda el panel.
  await expect(page.locator("[data-theme-ribbon='navidad']")).toBeVisible();

  // "Original": la marca sin temática, aunque el panel tenga una puesta
  await page.getByRole("button", { name: "Probar temáticas" }).click();
  await page.getByRole("dialog", { name: "Probar temáticas" }).getByRole("button", { name: "Probar Original" }).click();
  await expect(page.locator("[data-theme-ribbon]")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-season", /.+/);
  assertNoExternal();
});

test("el panel edita la temática y su modo; la tienda lo refleja", async ({ page }) => {
  await page.goto("admin-demo/tematicas/");
  // Sin vista previa: manda el modo del panel.
  await page.evaluate(() => localStorage.removeItem("volta-demo:theme-preview"));
  await expect(page.getByRole("heading", { name: /Temáticas/ })).toBeVisible();
  await page.getByRole("button", { name: "Editar Navidad" }).click();
  const editor = page.getByRole("dialog", { name: "Editar Navidad" });
  await editor.getByLabel("Titular").fill("Feliz Navidad con energía");
  await editor.getByRole("button", { name: "Guardar temática" }).click();
  await expect(editor).toBeHidden();

  await page.getByLabel("Modo", { exact: true }).selectOption("fixed");
  await page.getByLabel("Temática fija").selectOption("navidad");
  // El botón "Probar temáticas" arranca oculto hasta la Fase 5: se prende acá y se apaga al final.
  await page.getByRole("switch", { name: /Probar temáticas/ }).click();
  await page.goto("");
  await expect(page.getByRole("heading", { name: "Feliz Navidad con energía" })).toBeVisible();
  await expect(page.locator("[data-theme-ribbon='navidad']")).toContainText("NAVIDAD15");
  await expect(page.getByRole("button", { name: "Probar temáticas" })).toBeVisible();

  await page.goto("admin-demo/tematicas/");
  await page.getByLabel("Modo", { exact: true }).selectOption("off");
  await page.getByRole("switch", { name: /Probar temáticas/ }).click();
  await page.goto("");
  await expect(page.getByRole("heading", { name: "Comprá por categoría" })).toBeVisible();
  await expect(page.locator("[data-theme-banner]")).toHaveCount(0);
  await expect(page.locator("[data-theme-ribbon]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Probar temáticas" })).toHaveCount(0);
});
