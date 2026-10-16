import { expect, test } from "@playwright/test";

/** L1 (pedido de Ignacio): primero lo simple y después la experiencia de armar el stack. */
test("inicio: carrusel, categorías, recomendados y recién después objetivos y el stack", async ({ page }) => {
  await page.goto("");
  const order = await page.locator("main section[aria-labelledby], main section[aria-roledescription='carrusel']").evaluateAll((els) =>
    els.map((el) => el.getAttribute("aria-roledescription") === "carrusel" ? "carrusel" : el.getAttribute("aria-labelledby")));
  const at = (id: string) => order.findIndex((x) => x?.startsWith(id));
  expect(at("carrusel")).toBe(0);
  expect(at("cats-title")).toBeLessThan(at("recomendados"));
  expect(at("recomendados")).toBeLessThan(at("objetivos-title"));
  expect(at("objetivos-title")).toBeLessThan(at("home-stack-title"));
});

test("el dock y el header del celular quedan por encima de la página durante el cambio de página", async ({ page }) => {
  await page.goto("");
  // Cada uno tiene su propia capa en la transición (app/motion.css), por encima de la página que entra y la que sale.
  await expect(page.locator("[data-shop-bottomnav]")).toHaveCSS("view-transition-name", "shop-dock");
  await expect(page.locator("[data-shop-header]")).toHaveCSS("view-transition-name", "shop-header");
});
