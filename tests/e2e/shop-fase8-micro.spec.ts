import { expect, test, type Page } from "@playwright/test";

/** Fase 8 · microinteracciones: la bolsa se sacude cuando se la ve y la marca de la pestaña activa queda debajo de ella. */

const bag = (page: Page) => page.getByRole("button", { name: /^Carrito,/ }).locator("svg").first();

test("al agregar, la bolsa del header se sacude recién al cerrar el carrito (antes queda tapada)", async ({ page }) => {
  await page.goto("p/overvolt-pre/");
  await expect(page.getByRole("button", { name: "Carrito, 0 productos" })).toBeVisible();
  await page.getByRole("button", { name: /Agregar al carrito/ }).filter({ visible: true }).first().click();
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(drawer).toBeVisible();
  await expect(bag(page)).not.toHaveClass(/animate-bag/);
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(bag(page)).toHaveClass(/animate-bag/);
  await expect(page.getByRole("button", { name: "Carrito, 1 producto" })).toBeVisible();
});

test("la barra inferior marca la pestaña actual y la marca la acompaña al navegar", async ({ page }) => {
  const nav = page.getByRole("navigation", { name: "Navegación inferior" });
  const marker = nav.locator("[aria-hidden='true'] > span").first();
  for (const [path, tab] of [["categorias/", "Tienda"], ["favoritos/", "Mi rack"]] as const) {
    await page.goto(path);
    const link = nav.getByRole("link", { name: tab });
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect.poll(async () => {
      const [m, l] = [await marker.boundingBox(), await link.boundingBox()];
      return Math.abs(m!.x + m!.width / 2 - (l!.x + l!.width / 2));
    }).toBeLessThan(3);
  }
});
