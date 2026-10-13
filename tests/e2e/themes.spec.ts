import { expect, test } from "@playwright/test";
import { guardNetwork } from "./helpers";

test("probar temáticas: Halloween cambia cinta, acento, carrusel y ofertas (el logo queda limpio); el cupón queda en el carrito", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  // Desde la Fase 5 el botón arranca prendido (para mostrarle la demo al cliente) y la tienda va por fecha.
  await page.goto("admin-demo/tematicas/");
  await expect(page.getByRole("switch", { name: /Probar temáticas/ })).toBeChecked();
  await expect(page.getByLabel("Modo", { exact: true })).toHaveValue("auto");
  // El panel deja puesta una temática (Navidad fija) para ver que "Original" la tapa solo en este navegador.
  await page.getByLabel("Modo", { exact: true }).selectOption("fixed");
  await page.getByLabel("Temática fija").selectOption("navidad");
  await page.goto("");
  await page.getByRole("button", { name: "Probar temáticas" }).first().click();
  const picker = page.getByRole("dialog", { name: "Probar temáticas" });
  await expect(picker.getByRole("button", { name: /^Probar / })).toHaveCount(13);
  await picker.getByRole("button", { name: "Probar Halloween" }).click();
  await expect(picker).toBeHidden();

  // Elegir recarga la página: la fecha llega a la cinta, al banner y al acento de temporada (no repinta la tienda).
  await expect(page.locator("[data-theme-ribbon='halloween']")).toContainText("MONSTER20");
  await expect(page.locator("html")).toHaveAttribute("data-season", "halloween");
  await expect(page.getByRole("heading", { name: "Monster pump" })).toBeVisible();
  // Regla de marca (R1): el logo queda limpio (sin adornos) y no hay guirnaldas.
  await expect(page.locator("[data-shop-header] a[aria-label='Volta, ir al inicio'] svg")).toHaveCount(1);
  await expect(page.locator("[data-garland]")).toHaveCount(0);
  const rail = page.locator("section").filter({ has: page.getByRole("heading", { name: /Ofertas de Halloween/ }) });
  await expect(rail.getByText("20% OFF").first()).toBeVisible();

  await page.getByRole("button", { name: "Usar MONSTER20" }).click();
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
  await page.getByRole("button", { name: "Probar temáticas" }).first().click();
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
  await page.goto("");
  await expect(page.getByRole("heading", { name: "Feliz Navidad con energía" })).toBeVisible();
  await expect(page.locator("[data-theme-ribbon='navidad']")).toContainText("NAVIDAD15");
  await expect(page.getByRole("button", { name: "Probar temáticas" }).first()).toBeVisible();

  // Sin temática y sin el botón de la demo: la tienda vuelve a VOLTA de siempre.
  await page.goto("admin-demo/tematicas/");
  await page.getByLabel("Modo", { exact: true }).selectOption("off");
  await page.getByRole("switch", { name: /Probar temáticas/ }).click();
  await page.goto("");
  await expect(page.getByRole("heading", { name: "Comprá por categoría" })).toBeVisible();
  await expect(page.locator("[data-theme-banner]")).toHaveCount(0);
  await expect(page.locator("[data-theme-ribbon]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Probar temáticas" })).toHaveCount(0);
});

test("modo automático: la tienda sale sola con la temática de la fecha", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("volta-demo:theme-preview"));
  for (const [day, id, heading] of [
    ["2026-10-12", "dia-de-la-madre", "Para la que nunca para"],
    ["2026-11-03", "cyber-monday", "Overclock de precios"],
    ["2027-02-20", "vuelta-al-gym", "Volvió la rutina"],
  ] as const) {
    await page.clock.setFixedTime(new Date(`${day}T12:00:00-03:00`));
    await page.goto("");
    await expect(page.locator("html")).toHaveAttribute("data-season", id);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
  // Entre fechas no hay temática.
  await page.clock.setFixedTime(new Date("2027-04-15T12:00:00-03:00"));
  await page.goto("");
  await expect(page.getByRole("heading", { name: "Comprá por categoría" })).toBeVisible();
  await expect(page.locator("[data-theme-ribbon]")).toHaveCount(0);
});
