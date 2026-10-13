import { expect, test } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * Fase 5 · recorrido de demo: con "Probar temáticas" se pasa por varias fechas a 375 px. En cada una: el acento de
 * temporada, la cinta con el código, el banner con su titular, el cupón queda en el carrito y nada desborda a lo ancho.
 */
const TOUR = [
  ["dia-de-la-madre", "Día de la Madre", "MAMA15", "Para la que nunca para"],
  ["halloween", "Halloween", "MONSTER20", "Monster pump"],
  ["cyber-monday", "CyberMonday", "CYBER25", "Overclock de precios"],
  ["navidad", "Navidad", "NAVIDAD15", "Este año, Papá Noel entrena"],
  ["dia-del-padre", "Día del Padre", "PAPA20", "Para el que no saltea piernas"],
  ["operacion-verano", "Operación verano", "VERANO20", "Modo verano: activado"],
] as const;

test("Probar temáticas por seis fechas: acento, cinta, banner y cupón en el carrito, sin desborde a 375 px", async ({ page }) => {
  test.setTimeout(180_000);
  const assertNoExternal = guardNetwork(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // Un producto en el carrito para que el cupón de cada fecha se pueda aplicar.
  await page.goto("p/ionic-whey/");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  for (const [id, name, code, heading] of TOUR) {
    await page.goto("");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Probar temáticas" }).first().click();
    await page.getByRole("dialog", { name: "Probar temáticas" }).getByRole("button", { name: `Probar ${name}` }).click();
    await page.keyboard.press("Escape");

    await expect(page.locator("html")).toHaveAttribute("data-season", id);
    await expect(page.locator(`[data-theme-ribbon='${id}']`)).toContainText(code);
    const banner = page.locator(`[data-theme-banner='${id}']`);
    await expect(banner.getByRole("heading", { name: heading })).toBeVisible();
    expect(await horizontalOverflow(page), id).toBeLessThanOrEqual(0);
    await banner.getByRole("button", { name: `Usar ${code}` }).click();
    await expect(banner.getByRole("button", { name: "Cupón en tu carrito" })).toBeDisabled();

    await page.goto("carrito/");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("region", { name: "Cupones" })).toContainText(`${code}:`);
    expect(await horizontalOverflow(page), `${id} carrito`).toBeLessThanOrEqual(0);
  }
  assertNoExternal();
});
