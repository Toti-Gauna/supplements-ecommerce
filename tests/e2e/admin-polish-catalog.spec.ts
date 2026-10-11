import { expect, test } from "@playwright/test";

/** Polish 8.3.18 (Insumos con la tabla común y vista Excel editable) y 8.3.22 (Categorías: tabla, modal de alta y detalle). */

const toast = (page: import("@playwright/test").Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1200, 500); });

  test("8.3.18 insumos: buscar y filtrar pasan a la vista Excel; se edita con validación, lo calculado no, y la tabla coincide", async ({ page }) => {
    await page.goto("admin-demo/insumos/");
    await page.getByRole("searchbox").fill("cera");
    await page.getByRole("button", { name: "Ver en formato Excel" }).click();
    const grid = page.getByRole("grid", { name: "Insumos en formato Excel" });
    await expect(grid.getByRole("row")).toHaveCount(2);
    const row = grid.getByRole("row").filter({ hasText: "Cera de soja" });
    // "Piden los pedidos" se calcula con las recetas: no se edita.
    await row.getByRole("gridcell").nth(6).dblclick();
    await expect(page.getByLabel("Editar celda")).toHaveCount(0);
    await row.getByRole("gridcell").nth(3).dblclick();
    await page.getByLabel("Editar celda").fill("-3");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("alert").filter({ hasText: "No puede ser negativa" })).toBeVisible();
    await page.getByLabel("Editar celda").fill("4.200");
    await page.keyboard.press("Enter");
    await expect(page.getByText("1 cambio sin guardar")).toBeVisible();
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(toast(page, "Cambios guardados")).toBeVisible();
    await page.getByRole("button", { name: "Volver a la tabla" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Insumos" })).toBeVisible();
    await expect(page.getByLabel("Stock de Cera de soja").first()).toHaveValue("4200");
    await page.reload();
    await expect(page.getByLabel("Stock de Cera de soja").first()).toHaveValue("4200");
    // Filtro de estado + Reiniciar.
    await page.getByRole("combobox", { name: "Estado" }).selectOption("reponer");
    await expect(page.getByText(/insumos de \d+/)).toBeVisible();
    await page.getByRole("button", { name: "Reiniciar filtros" }).click();
    await expect(page.getByRole("combobox", { name: "Estado" })).toHaveValue("");
  });

  test("8.3.18 salir de la vista Excel con cambios pide confirmar y el borrador no se pierde", async ({ page }) => {
    await page.goto("admin-demo/insumos/?formato=excel&q=cera");
    const row = page.getByRole("grid").getByRole("row").filter({ hasText: "Cera de soja" });
    await row.getByRole("gridcell").nth(4).dblclick();
    await page.getByLabel("Editar celda").fill("900");
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Volver a la tabla" }).click();
    const ask = page.getByRole("alertdialog", { name: "Cambios sin guardar" });
    await expect(ask).toBeVisible();
    await ask.getByRole("button", { name: "Seguir editando" }).click();
    // Recargar no pierde el borrador (queda en esta pestaña hasta guardar o descartar).
    page.once("dialog", (d) => d.accept());
    await page.reload();
    await expect(page.getByText("1 cambio sin guardar")).toBeVisible();
    await expect(page.getByText("Recuperamos los cambios sin guardar")).toBeVisible();
    await page.getByRole("button", { name: "Volver a la tabla" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Descartar y volver" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Insumos" })).toBeVisible();
  });

  test("8.3.22 nueva categoría en modal: foco, Escape, borrador al cerrar, error, crear una sola y limpiar", async ({ page }) => {
    await page.goto("admin-demo/categorias/");
    const open = page.getByRole("button", { name: "Nueva categoría" });
    const before = Number((await page.getByText(/^\d+ categorías$/).textContent())!.match(/\d+/)![0]);
    await open.click();
    const dialog = page.getByRole("dialog", { name: "Nueva categoría" });
    await expect(dialog.getByLabel("Nombre")).toBeFocused();
    await dialog.getByLabel("Nombre").fill("Mates");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
    await open.click();
    await expect(dialog.getByLabel("Nombre")).toHaveValue("Mates");
    await dialog.getByLabel("Nombre").fill("");
    await dialog.getByRole("button", { name: "Crear categoría" }).click();
    await expect(dialog.getByRole("alert")).toHaveText("Escribí un nombre para la categoría.");
    await dialog.getByLabel("Nombre").fill("Velas");
    await expect(dialog.getByText("Ya hay una categoría con ese nombre")).toBeVisible();
    await dialog.getByLabel("Nombre").fill("Mates y cocina");
    await dialog.getByLabel("Descripción (opcional)").fill("Tablas y mates con nombre.");
    await dialog.getByRole("button", { name: "Crear categoría" }).click();
    await expect(dialog).toBeHidden();
    await expect(toast(page, "Categoría “Mates y cocina” creada")).toBeVisible();
    await expect(page.getByText(`${before + 1} categorías`, { exact: true })).toBeVisible();
    await open.click();
    await expect(dialog.getByLabel("Nombre")).toHaveValue("");
    await page.keyboard.press("Escape");
    // Aparece en el selector de categoría del editor de productos.
    await page.goto("admin-demo/productos/editar/?id=vela-caniche");
    await expect(page.locator("select option", { hasText: "Mates y cocina" })).toHaveCount(1);
  });

  test("8.3.22 orden global: con filtros no se reordena; en el orden de la tienda, Subir mueve y se guarda; la fila abre el detalle", async ({ page }) => {
    await page.goto("admin-demo/categorias/");
    const table = page.getByRole("region", { name: "Categorías en el orden de la tienda" });
    await table.getByRole("combobox", { name: "Destacada" }).selectOption("si");
    await expect(table.getByRole("button", { name: /^Subir / })).toHaveCount(0);
    await expect(table.getByText("Para cambiar el orden de la tienda")).toBeVisible();
    await table.getByRole("button", { name: "Reiniciar filtros" }).click();
    await table.getByRole("button", { name: "Subir Comederos" }).click();
    await expect(table.getByRole("row").nth(1)).toContainText("Comederos");
    // El switch de la fila no navega.
    await table.getByRole("switch", { name: "Destacar Velas" }).click();
    await expect(page).toHaveURL(/categorias\/$/);
    await page.reload();
    await expect(table.getByRole("row").nth(1)).toContainText("Comederos");
    await table.getByRole("row").filter({ hasText: "Velas" }).getByRole("cell").nth(3).click();
    await expect(page.getByRole("heading", { level: 1, name: /Velas/ })).toBeVisible();
    await expect(page.getByRole("region", { name: /Productos \(\d+\)/ }).getByRole("link").first()).toBeVisible();
    await expect(page.getByRole("switch", { name: /Destacada/ })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("link", { name: "Categorías" }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: /Categorías y personalización/ })).toBeVisible();
  });

  test("8.3.22 vista Excel de categorías: renombrar se guarda y el orden no cambia", async ({ page }) => {
    await page.goto("admin-demo/categorias/?formato=excel");
    const grid = page.getByRole("grid", { name: "Categorías en formato Excel" });
    const row = grid.getByRole("row").filter({ hasText: "Velas" });
    const position = await row.getByRole("gridcell").nth(0).textContent();
    await row.getByRole("gridcell").nth(1).dblclick();
    await page.getByLabel("Editar celda").fill("Velas aromáticas");
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.getByRole("button", { name: "Volver a la tabla" }).click();
    const back = page.getByRole("region", { name: "Categorías en el orden de la tienda" }).getByRole("row").filter({ hasText: "Velas aromáticas" });
    await expect(back).toBeVisible();
    await expect(back.getByRole("cell").nth(1)).toContainText(position!.trim());
  });
});
