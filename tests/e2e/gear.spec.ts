import { expect, test } from "@playwright/test";

/** L2: tienda deportiva multimarca. El equipamiento se elige por color y talle (o peso), no vence y tiene su cambio. */
test("boxeo: guantes por color y peso, sin lote ni precio por servicio, y al carrito con esa variante", async ({ page }) => {
  await page.goto("c/boxeo/");
  await expect(page.getByRole("heading", { level: 1, name: /Boxeo y combate/ })).toBeVisible();
  const card = page.locator("[data-product-card]").filter({ hasText: "Guantes de boxeo" });
  await expect(card).toBeVisible();
  await expect(card.getByText(/por servicio/)).toHaveCount(0);
  await card.getByRole("link", { name: "Guantes de boxeo" }).click();
  await expect(page).toHaveURL(/p\/guantes-boxeo\/$/);
  // Color y peso con sus nombres; nada de sabor, lote ni vencimiento.
  await expect(page.getByRole("group", { name: /^Color/ })).toBeVisible();
  const weight = page.getByRole("group", { name: /^Peso/ });
  await expect(weight).toBeVisible();
  await expect(page.getByText(/Sabor/)).toHaveCount(0);
  // (El pie de la tienda habla de lote y vencimiento en general; acá se mira que la ficha no muestre un lote.)
  await expect(page.getByText(/Lote [A-Z]{2}-\d|Vence (el|en) /)).toHaveCount(0);
  await expect(page.getByText("Cambio de talle sin costo")).toBeVisible();
  await page.getByRole("group", { name: /^Color/ }).getByTitle("Negro").click();
  await weight.getByText("14 oz", { exact: true }).click();
  await page.getByRole("button", { name: "Agregar al carrito" }).filter({ visible: true }).first().click();
  await expect(page.getByRole("dialog", { name: "Carrito" }).getByText(/Negro · 14 oz/)).toBeVisible();
});

test("el buscador y el inicio muestran el equipamiento de las marcas que vende la tienda", async ({ page }) => {
  await page.goto("buscar/?q=vendas");
  await expect(page.locator("[data-product-card]").first()).toContainText("Vendas de boxeo");
  await page.goto("");
  const cats = page.locator("section[aria-labelledby='cats-title']");
  await expect(cats.getByRole("link", { name: /Boxeo y combate/ })).toBeAttached();
  await expect(cats.getByRole("link", { name: /Accesorios de gym/ })).toBeAttached();
});
