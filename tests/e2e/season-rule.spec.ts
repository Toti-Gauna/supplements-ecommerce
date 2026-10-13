import { expect, test, type Page } from "@playwright/test";
import { previewTheme } from "./splash-helpers";

/**
 * Regla de marca (R1): la fecha no pinta la compra. Con cualquier temática, el fondo, las superficies, el header y el
 * botón de compra se ven igual que sin fecha; lo único que cambia es el acento de temporada (filo del header y cinta).
 */
async function paint(page: Page) {
  await page.goto("p/ionic-whey/");
  const buy = page.getByRole("button", { name: "Agregar al carrito" }).first();
  await expect(buy).toBeVisible();
  return page.evaluate(() => {
    const css = (el: Element | null, prop: string) => (el ? getComputedStyle(el).getPropertyValue(prop) : "");
    const buyBtn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Agregar al carrito"))!;
    const header = document.querySelector("[data-shop-header]");
    return {
      body: css(document.body, "background-color"),
      header: css(header, "background-color"),
      buy: css(buyBtn, "background-color"),
      buyText: css(buyBtn, "color"),
      primary: css(document.documentElement, "--brand-primary"),
      edge: css(header, "box-shadow"),
    };
  });
}

test("con una fecha, la tienda y el botón de compra no cambian de color; solo el filo del header", async ({ page }) => {
  const base = await paint(page);
  for (const id of ["dia-de-la-madre", "black-friday"]) {
    await previewTheme(page, id);
    const season = await paint(page);
    await expect(page.locator("html")).toHaveAttribute("data-season", id);
    expect({ ...season, edge: undefined }, id).toEqual({ ...base, edge: undefined });
    expect(season.edge, id).not.toBe(base.edge);
  }
});
