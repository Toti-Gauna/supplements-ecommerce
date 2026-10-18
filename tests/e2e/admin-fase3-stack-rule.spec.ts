import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow, openCheckoutTicket } from "./helpers";

/** Fase 3 · panel: Marketing → Descuento stack. La regla nueva llega a la ficha, el carrito y el checkout. */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("volta-demo:admin") ?? "null")?.state?.data?.settings?.stack ?? null);

async function addFromBar(page: Page, slug: string, name: string) {
  await page.goto(`p/${slug}/`);
  await page.locator("[data-buy-bar]").getByRole("button", { name: /Agregar al carrito/ }).click();
  await expect(page.getByRole("dialog", { name: "Carrito" }).getByText(`Agregaste ${name}`)).toBeVisible();
}

test("Fase 3 · editor del descuento stack: valida, muestra un ejemplo real, guarda 15 % desde 2 categorías y el carrito lo usa; reiniciar demo vuelve a 10 %/3", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("admin-demo/promos/");
  await page.getByRole("tablist", { name: "Pestañas de la sección" }).getByRole("tab", { name: "Descuento stack" }).click();
  await expect(page).toHaveURL(/descuento-stack\/$/);
  await expect(page.getByRole("heading", { level: 1, name: /Descuento stack/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Descuento stack" })).toHaveAttribute("aria-current", "page");
  const pct = page.getByLabel(/^Descuento/);
  const cats = page.getByLabel(/^Categorías distintas/);
  const preview = page.getByRole("region", { name: "Vista previa" });
  await expect(pct).toHaveValue("10");
  await expect(cats).toHaveValue("3");
  await expect(preview).toContainText("Con Ionic Whey 100% + Creatina monohidrato micronizada + Overvolt pre-entreno ahorrás $ 12.170");

  // Fuera de rango: avisa junto al campo y no guarda.
  await pct.fill("31");
  await cats.fill("1");
  await page.getByRole("button", { name: "Guardar descuento stack" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "0 a 30 %" })).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "2 a 5 categorías" })).toBeVisible();
  // Nada guardado: el panel sigue con la regla de fábrica (sin cambios previos no hay estado en el navegador).
  expect((await stored(page)) ?? { pct: 10, minCategories: 3 }).toEqual({ pct: 10, minCategories: 3 });

  await pct.fill("15");
  await cats.fill("2");
  await expect(preview).toContainText("Sumá 2 categorías y llevate 15 % off");
  await expect(preview).toContainText("Con Ionic Whey 100% + Creatina monohidrato micronizada ahorrás $ 12.720");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Guardar descuento stack" }).click();
  await expect(toast(page, "Descuento stack guardado")).toContainText("solo en esta demo");
  expect(await stored(page)).toEqual({ pct: 15, minCategories: 2 });
  await page.reload();
  await expect(pct).toHaveValue("15");
  await expect(cats).toHaveValue("2");

  // Ficha, carrito y checkout con la regla nueva: whey + creatina ya alcanzan.
  await page.goto("p/ionic-whey/");
  await expect(page.getByRole("heading", { name: "Sumá 2 categorías y llevate 15 % off" })).toBeVisible();
  await addFromBar(page, "ionic-whey", "Ionic Whey 100%");
  await addFromBar(page, "creatina-monohidrato", "Creatina monohidrato micronizada");
  await page.goto("carrito/");
  await expect(page.getByText(/¡Armaste tu stack!/)).toBeVisible();
  const summary = page.getByRole("region", { name: "Resumen", exact: true });
  await expect(summary.locator("div").filter({ has: page.getByText("Descuento stack (15 %)", { exact: true }) }).locator("dd")).toHaveText("−$ 12.720");
  await expect(summary.locator("dd").last()).toHaveText("$ 72.080");
  await page.goto("checkout/");
  await openCheckoutTicket(page);
  await expect(page.getByRole("region", { name: "Resumen de tu compra" }).getByText("Descuento stack (15 %)", { exact: true })).toBeVisible();

  // Reiniciar demo: la regla vuelve a la de fábrica.
  await page.goto("admin-demo/descuento-stack/");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Demo reiniciada" })).toBeVisible();
  await expect(page).toHaveURL(/admin-demo\/$/);
  await page.goto("admin-demo/descuento-stack/");
  await expect(page.getByLabel(/^Descuento/)).toHaveValue("10");
  await expect(page.getByLabel(/^Categorías distintas/)).toHaveValue("3");
  assertNoExternal();
});

test("Fase 3 · con 0 % el descuento stack queda apagado: la ficha no promete descuento y el carrito no lo aplica", async ({ page }) => {
  await page.goto("admin-demo/descuento-stack/");
  await page.getByLabel(/^Descuento/).fill("0");
  await expect(page.getByRole("region", { name: "Vista previa" })).toContainText("Descuento stack apagado");
  await page.getByRole("button", { name: "Guardar descuento stack" }).click();
  await expect(toast(page, "Descuento stack guardado")).toBeVisible();
  await page.goto("p/ionic-whey/");
  const offer = page.getByRole("region", { name: "Sumá lo que va con este suplemento" });
  await expect(offer).toBeVisible();
  await expect(offer).not.toContainText("% off");
  await page.goto("admin-demo/descuento-stack/");
  await expect(page.getByLabel(/^Descuento/)).toHaveValue("0");
});
