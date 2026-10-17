import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * Fase 6 · Catálogo: lista de precios del proveedor, aumento masivo por marca con deshacer, lotes que vencen y
 * liquidación (vista en la ficha de la tienda), marca como filtro y objetivos editables. En el celular y en escritorio.
 */
const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const money = (n: string) => new RegExp(`\\$\\s?${n.replace(".", "\\.")}`);
const buyCard = (page: Page) => page.getByRole("region", { name: "Elegí sabor, tamaño y cantidad" });
/** Sabores de la ficha: en el celular van debajo de la galería, fuera de la placa de compra. */
const flavors = (page: Page) => page.getByRole("group", { name: /^Sabor/ });

async function supplierList(page: Page) {
  await page.goto("admin-demo/importar/");
  await page.getByRole("button", { name: /Probar con la lista de un proveedor/ }).click();
  // Membrete arriba y columnas propias del distribuidor: se reconoce como lista de proveedor.
  await expect(page.getByRole("button", { name: "Lista de un proveedor" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel(/^Costo/)).toHaveValue("5");
  await expect(page.getByLabel("Precio sugerido")).toHaveValue("6");
  await page.getByRole("button", { name: /Ver vista previa/ }).click();
  await expect(page.getByRole("cell", { name: /No encontramos la presentación “Caja x 24”/ })).toBeVisible();
  await page.getByRole("button", { name: /Con cambios/ }).click();
  await expect(page.getByRole("cell", { name: /Precio \$\s?64\.900 → \$\s?69\.900/ })).toBeVisible();
  await page.getByRole("button", { name: "Actualizar 14 filas" }).click();
  await expect(page.getByRole("heading", { name: "Costos y precios al día" })).toBeVisible();
  await page.getByRole("link", { name: "Ver costos y márgenes" }).click();
  await page.getByLabel("Buscar producto o variante").fill("night vainilla");
  await expect(page.getByText(money("41.200")).filter({ visible: true }).first()).toBeVisible();
  await page.goto("p/night-casein/");
  await expect(buyCard(page)).toBeVisible();
  await expect(page.getByText(money("69.900")).first()).toBeVisible();
  // Deshacer como cualquier importación: el precio vuelve.
  await page.goto("admin-demo/importar/");
  await page.getByRole("button", { name: "Deshacer importación" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Deshacer" }).click();
  await expect(page.getByText(/Última importación/)).toHaveCount(0);
  await page.goto("p/night-casein/");
  await expect(page.getByText(money("64.900")).first()).toBeVisible();
}

async function raiseBrandAndUndo(page: Page) {
  await page.goto("admin-demo/productos/");
  await page.getByRole("button", { name: "Aumentar precios" }).click();
  const dialog = page.getByRole("dialog", { name: "Aumentar precios" });
  await dialog.getByLabel("Marca", { exact: true }).selectOption("Brava Sport");
  await dialog.getByLabel("Porcentaje").fill("ocho");
  await expect(dialog.getByRole("alert")).toContainText("no es un porcentaje válido");
  await dialog.getByLabel("Porcentaje").fill("8");
  const preview = dialog.getByRole("region", { name: "Vista previa de los precios" });
  await expect(preview).toContainText("9 variantes cambian de precio, en 4 productos");
  await expect(preview.getByRole("listitem").filter({ hasText: "Night Casein" }).first()).toContainText(/\$\s?64\.900.*\$\s?70\.100/);
  await expect(preview).not.toContainText("Ionic Whey");
  await dialog.getByRole("button", { name: "Aplicar a 9 variantes" }).click();
  await dialog.getByRole("alertdialog", { name: "Confirmar el aumento" }).getByRole("button", { name: "Sí, aplicar" }).click();
  await expect(toast(page, "Precios actualizados: +8 % a Brava Sport")).toBeVisible();
  await expect(page.getByText(/Último cambio de precios/)).toBeVisible();
  await page.goto("p/night-casein/");
  await expect(page.getByText(money("70.100")).first()).toBeVisible();
  await page.goto("p/ionic-whey/");
  await expect(page.getByText(money("54.900")).first()).toBeVisible();
  // Deshacer exacto el último aumento.
  await page.goto("admin-demo/productos/");
  await page.getByRole("button", { name: "Deshacer aumento" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Deshacer" }).click();
  await expect(page.getByText(/Último cambio de precios/)).toHaveCount(0);
  await page.goto("p/night-casein/");
  await expect(page.getByText(money("64.900")).first()).toBeVisible();
}

async function liquidateLot(page: Page) {
  await page.goto("admin-demo/productos/");
  await page.getByRole("button", { name: /6 lotes vencen en menos de 60 días/ }).click();
  await expect(page).toHaveURL(/ver=variantes.*vence=pronto|vence=pronto.*ver=variantes/);
  await expect(page.getByText("6 variantes de 112")).toBeVisible();
  await page.getByRole("button", { name: "Liquidar del lote VL-2603-W de Ionic Whey 100% · Vainilla · 2 lb (907 g)" }).click();
  const dialog = page.getByRole("dialog", { name: "Liquidar el lote VL-2603-W" });
  await expect(dialog).toContainText("Vence en 56 días");
  await dialog.getByText("−40 %", { exact: true }).click();
  await expect(dialog.getByRole("status", { name: "Vista previa del precio" })).toContainText(money("32.900"));
  await dialog.getByRole("button", { name: /Liquidar a/ }).click();
  await expect(toast(page, "Lote VL-2603-W en liquidación")).toBeVisible();
  await expect(page.getByText("Liquidación −40 %").filter({ visible: true }).first()).toBeVisible();
  // En la tienda: precio tachado, sello con el vencimiento y la compra al precio de liquidación.
  await page.goto("p/ionic-whey/");
  await flavors(page).getByTitle("Vainilla").click();
  await expect(flavors(page).getByRole("radio", { name: "Vainilla" })).toBeChecked();
  await expect(page.getByText("Liquidación · vence 11/2026")).toBeVisible();
  await expect(page.getByText(money("54.900")).first()).toBeVisible();
  // R2a: la etiqueta de laboratorio del envase dice el lote que sale primero y su vencimiento.
  await expect(page.locator("dl[aria-label='Lote del envase']")).toContainText("VL-2603-W · 11/2026");
  await expect(page.getByRole("button", { name: /Agregar al carrito/ }).filter({ visible: true }).first()).toBeEnabled();
  await expect(page.getByText(money("32.900")).first()).toBeVisible();
  // El chocolate no está liquidado.
  await flavors(page).getByTitle("Chocolate").click();
  await expect(page.getByText("Liquidación · vence 11/2026")).toHaveCount(0);
  // Deshacer: quitar la liquidación vuelve al precio de lista.
  await page.goto("admin-demo/productos/?ver=variantes&vence=liquidacion");
  await page.getByRole("button", { name: /^Cambiar la liquidación del lote VL-2603-W/ }).click();
  await page.getByRole("dialog", { name: "Liquidar el lote VL-2603-W" }).getByRole("button", { name: "Quitar liquidación" }).click();
  await expect(toast(page, "Liquidación quitada")).toBeVisible();
  await page.goto("p/ionic-whey/");
  await flavors(page).getByTitle("Vainilla").click();
  await expect(page.getByText("Liquidación · vence 11/2026")).toHaveCount(0);
}

for (const [label, viewport, mobile] of [["celular", { width: 375, height: 812 }, true], ["escritorio", { width: 1440, height: 900 }, false]] as const) {
  test.describe(`Fase 6 catálogo en ${label}`, () => {
    test.use({ viewport, isMobile: mobile, hasTouch: mobile });
    test.beforeEach(async ({ page }) => { if (!mobile) await page.mouse.move(1200, 500); });

    test("cargar la lista de precios del proveedor: vista previa, costo y precio nuevos y deshacer", async ({ page }) => {
      const noExternal = guardNetwork(page);
      await supplierList(page);
      noExternal();
    });

    test("subir 8 % a una marca con vista previa y deshacer exacto", async ({ page }) => {
      await raiseBrandAndUndo(page);
    });

    test("aviso de vencimientos, liquidar un lote y verlo en la ficha de la tienda", async ({ page }) => {
      await liquidateLot(page);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    });
  });
}

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1200, 500); });

  test("marca como filtro en productos, variantes y la vista Excel; insignia de vencimiento en la fila", async ({ page }) => {
    await page.goto("admin-demo/productos/");
    await page.getByRole("combobox", { name: "Marca" }).selectOption("Forja");
    await expect(page).toHaveURL(/marca=Forja/);
    await expect(page.getByText("4 productos de 35")).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "Gel energético con cafeína" })).toContainText("Vence pronto");
    await page.getByRole("button", { name: "Ver en formato Excel" }).click();
    const grid = page.getByRole("grid", { name: "Productos y stock en formato Excel" });
    await expect(grid.getByRole("row")).toHaveCount(10);
    await expect(grid).toContainText("FJ-2602-G · 11/2026");
    await page.goBack();
    await page.getByRole("button", { name: /^Variantes/ }).click();
    await expect(page.getByText("9 variantes de 112")).toBeVisible();
  });

  test("la tarjeta de la tienda avisa la liquidación", async ({ page }) => {
    await page.goto("admin-demo/productos/?ver=variantes&vence=pronto");
    await page.getByRole("button", { name: /^Liquidar del lote FJ-2602-G/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: /Liquidar a/ }).click();
    await page.goto("c/hidratacion/");
    await expect(page.locator("[data-product-card]").filter({ hasText: "Gel energético con cafeína" })).toContainText("Liquidación");
  });
});

test("lotes en el editor: el stock es la suma y se valida el código", async ({ page }) => {
  await page.goto("admin-demo/productos/editar/?id=ionic-whey");
  const variant = page.locator("details").filter({ hasText: "Vainilla · 2 lb (907 g)" });
  await variant.locator("summary").click();
  const lots = variant.getByRole("group", { name: "Lotes de Vainilla · 2 lb (907 g)" });
  await expect(lots.getByText("Sale primero", { exact: true })).toBeVisible();
  await expect(variant.getByText("18 unidades")).toBeVisible();
  await lots.getByRole("button", { name: "Agregar lote" }).click();
  await lots.getByLabel("Unidades").last().fill("6");
  await expect(variant.getByText("24 unidades")).toBeVisible();
  await page.getByRole("button", { name: /^Guardar/ }).first().click();
  await expect(page.getByText("Cada lote con unidades necesita código y mes de vencimiento.").first()).toBeVisible();
  await lots.getByLabel("Código").last().fill("VL-2610-W");
  await page.getByRole("button", { name: /^Guardar/ }).first().click();
  await expect(toast(page, "Producto guardado")).toBeVisible();
  await page.goto("admin-demo/productos/?ver=variantes&q=ionic%20vainilla");
  await expect(page.getByLabel("Unidades de Ionic Whey 100% · Vainilla · 2 lb (907 g)").first()).toHaveValue("24");
});

test("objetivos: cambiar el nombre y el color de uno y verlo en la tienda", async ({ page }) => {
  await page.goto("admin-demo/categorias/");
  const fuerza = page.getByRole("group", { name: "Objetivo Fuerza" });
  await fuerza.getByLabel("Nombre").fill("Fuerza máxima");
  await page.getByRole("button", { name: "Guardar objetivos" }).click();
  await expect(toast(page, "Objetivos guardados")).toBeVisible();
  await page.goto("buscar/?objetivo=fuerza");
  await expect(page.getByRole("heading", { name: "Fuerza máxima" })).toBeVisible();
});
