import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { guardNetwork } from "./helpers";

const status = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });

test("importar Excel: planilla de ejemplo, vista previa con errores, importar, ver en la tienda y deshacer", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("admin-demo/importar/");
  await page.getByRole("button", { name: /Probar con una planilla de ejemplo/ }).click();
  // Columnas con otros nombres ("Rubro", "Artículo", "Cantidad") se reconocen solas
  await expect(page.getByLabel("Categoría")).toHaveValue("0");
  await expect(page.getByLabel("Stock", { exact: true })).toHaveValue("4");
  await page.getByRole("button", { name: /Ver vista previa/ }).click();
  await expect(page.getByRole("cell", { name: /pesos enteros, sin centavos/ })).toBeVisible();
  await page.getByRole("button", { name: /Con cambios/ }).click();
  await expect(page.getByRole("cell", { name: /Stock 12 → 9/ })).toBeVisible();
  await page.getByRole("button", { name: /Importar 7 filas/ }).click();
  await expect(page.getByRole("heading", { name: "Catálogo actualizado" })).toBeVisible();

  await page.goto("categorias/");
  await page.getByRole("link", { name: /Mates y cocina/ }).first().click();
  await expect(page).toHaveURL(/c\/demo\/\?slug=mates-y-cocina/);
  await expect(page.getByText("Tabla de picada con nombre")).toBeVisible();

  await page.goto("admin-demo/importar/");
  await page.getByRole("button", { name: "Deshacer importación" }).click();
  await expect(page.getByRole("dialog")).toContainText("también se pierde");
  await page.getByRole("dialog").getByRole("button", { name: "Deshacer" }).click();
  await expect(page.getByText(/Última importación/)).toHaveCount(0);
  await page.goto("categorias/");
  await expect(page.getByRole("link", { name: /Mates y cocina/ })).toHaveCount(0);
  assertNoExternal();
});

test("importar un CSV propio con ; y montos con $", async ({ page }) => {
  await page.goto("admin-demo/importar/");
  const csv = "Producto;Variante;Precio;Stock\nVela caniche;Lavanda;$ 12.900;15\n";
  await page.getByLabel("Elegir archivo de Excel o CSV").setInputFiles({ name: "stock.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await page.getByRole("button", { name: /Ver vista previa/ }).click();
  await expect(page.getByRole("cell", { name: /Precio \$\s?11\.900 → \$\s?12\.900/ })).toBeVisible();
  await page.getByRole("button", { name: /Importar 1 fila/ }).click();
  await page.goto("admin-demo/productos/?ver=variantes");
  await page.getByLabel("Buscar producto o variante").fill("lavanda");
  await expect(page.getByLabel("Unidades de Vela caniche · Lavanda").first()).toHaveValue("15");
});

test("pedidos: filtro de etapa, cambio en lote, ficha completa y exportar a Excel", async ({ page }) => {
  await page.goto("admin-demo/pedidos/");
  const stage = page.getByRole("combobox", { name: "Etapa" });
  await page.getByRole("button", { name: "Más filtros" }).click();
  await stage.selectOption("to-make");
  await page.getByLabel("Seleccionar VOL-000122").first().check();
  await page.getByRole("region", { name: "Acciones en lote" }).getByRole("button", { name: "Pasar a En producción" }).click();
  await expect(status(page, /1 pedido pasó a “En producción”/)).toBeVisible();
  await stage.selectOption("making");
  await page.getByRole("button", { name: /VOL-000122/ }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: /VOL-000122/ })).toBeVisible();
  await expect(page.getByText("En producción").first()).toBeVisible();
  // Atrás vuelve a la tabla con el filtro puesto (vive en la URL).
  await page.goBack();
  await expect(page).toHaveURL(/etapa=making/);
  await page.getByRole("button", { name: "Más filtros" }).click();
  await expect(stage).toHaveValue("making");
  await page.getByRole("button", { name: "Reiniciar filtros" }).click();
  await expect(stage).toHaveValue("");
  await expect(page).not.toHaveURL(/etapa=/);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar Excel (.xlsx)" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^volta-pedidos-\d{4}-\d{2}-\d{2}\.xlsx$/);
  expect(readFileSync((await file.path())!).subarray(0, 2).toString()).toBe("PK");
});

test("stock: sumar en la tabla se refleja en la ficha de la tienda", async ({ page }) => {
  await page.goto("admin-demo/productos/?ver=variantes");
  await page.getByLabel("Buscar producto o variante").fill("caniche vainilla");
  await page.getByRole("button", { name: "Sumar 1 a Vela caniche · Vainilla" }).first().click();
  await expect(page.getByLabel("Unidades de Vela caniche · Vainilla").first()).toHaveValue("9");
  await page.goto("p/vela-caniche/");
  await expect(page.getByText(/En stock · 9 disponibles/)).toBeVisible();
});

test("buscador del panel con Ctrl+K abre un pedido", async ({ page }) => {
  await page.goto("admin-demo/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("000124");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/pedidos\/detalle\/\?codigo=VOL-000124/);
});

test.describe("vista Excel de Productos y stock en escritorio", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });

  test("editar con teclado, validar, pegar desde Excel, deshacer y guardar", async ({ page }) => {
    // La ruta vieja de la Planilla lleva a la vista Excel del módulo unificado.
    await page.goto("admin-demo/planilla/");
    await expect(page.getByRole("heading", { level: 1, name: /Productos y stock · formato Excel/ })).toBeVisible();
    await page.getByLabel("Buscar producto o variante").fill("vela caniche");
    const row = (text: string) => page.getByRole("row").filter({ hasText: text });
    const stock = row("Vainilla").getByRole("gridcell").nth(4);
    await stock.click();
    await page.keyboard.type("abc");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("alert").filter({ hasText: /no es un stock válido/ })).toBeVisible();
    await page.getByLabel("Editar celda").fill("20");
    await page.keyboard.press("Enter");
    await expect(page.getByText("1 cambio sin guardar")).toBeVisible();
    // Pegar dos celdas (precio y stock) copiadas de Excel en la fila de Lavanda
    await row("Lavanda").getByRole("gridcell").nth(3).click();
    await page.evaluate(() => {
      const dt = new DataTransfer();
      dt.setData("text/plain", "$ 13.500\t7\n");
      document.getElementById("sheet-catalog")!.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    await expect(page.getByText("3 cambios sin guardar")).toBeVisible();
    await page.keyboard.press("Control+z");
    await expect(page.getByText("1 cambio sin guardar")).toBeVisible();
    await page.keyboard.press("Control+y");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Todo guardado")).toBeVisible();
    await page.goto("p/vela-caniche/");
    await expect(page.getByText(/En stock · 20 disponibles/)).toBeVisible();
  });
});
