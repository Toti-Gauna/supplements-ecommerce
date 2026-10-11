import readXlsxFile from "read-excel-file/node";
import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.4 (tabla común, filtros, 10 por página, fila → entidad, vista Excel y .xlsx) y 8.3.19 (Productos y stock). */

const TABLES = [
  ["admin-demo/pedidos/", "Pedidos", 5], ["admin-demo/usuarios/", "Clientes", 3], ["admin-demo/productos/", "Productos", 3],
  ["admin-demo/productos/?ver=variantes", "Stock por variante", 3], ["admin-demo/costos/", "Costo y margen por producto", 2],
  ["admin-demo/insumos/", "Insumos del taller", 3], ["admin-demo/categorias/", "Categorías en el orden de la tienda", 3],
] as const;
const base = () => `http://localhost:${process.env.E2E_PORT ?? "4173"}${process.env.PAGES_BASE_PATH ?? ""}/`;
const visibleFilters = (page: Page) => page.locator("form[role=search] select:visible, form[role=search] input[type=date]:visible");
const bodyRows = (page: Page) => page.locator("table tbody tr");

for (const [label, width, height, touch] of [["escritorio", 1440, 900, false], ["iPad horizontal", 1024, 768, true], ["celular", 390, 844, true]] as const) {
  test(`8.3.4 a ${label} ${width}px: todas las tablas tienen buscar, todos sus filtros (los que no entran, en "Más filtros") y reiniciar`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, reducedMotion: "reduce", locale: "es-AR" });
    const page = await ctx.newPage();
    for (const [route, caption, filters] of TABLES) {
      await page.goto(base() + route);
      const table = page.getByRole("region", { name: caption });
      await expect(table.getByRole("searchbox")).toBeVisible();
      await expect(table.getByRole("button", { name: "Buscar", exact: true })).toBeVisible();
      await expect(table.getByRole("button", { name: "Reiniciar filtros" })).toBeVisible();
      const more = table.getByRole("button", { name: /Más filtros/ });
      if (await more.isVisible()) await more.click();
      await expect(visibleFilters(page), `${route}: todos los filtros a mano`).toHaveCount(filters);
      expect(await horizontalOverflow(page), `${route}: sin desborde`).toBeLessThanOrEqual(0);
    }
    await ctx.close();
  });
}

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });
  // El mouse de Playwright arranca en (0, 0), encima de la barra lateral: se lo lleva al contenido.
  test.beforeEach(async ({ page }) => { await page.mouse.move(1200, 500); });

  test("8.3.4 diez por página; filtrar en la página 2 deja una página válida; Reiniciar limpia todo", async ({ page }) => {
    await page.goto("admin-demo/pedidos/");
    const pages = page.getByRole("navigation", { name: "Páginas de pedidos" });
    await expect(pages).toContainText("1–10 de 17 pedidos · página 1 de 2");
    await expect(bodyRows(page)).toHaveCount(10);
    await pages.getByRole("button", { name: "Página siguiente" }).click();
    await expect(pages).toContainText("11–17 de 17 pedidos · página 2 de 2");
    await expect(page).toHaveURL(/pagina=2/);
    await page.getByRole("combobox", { name: "Etapa" }).selectOption("to-collect");
    await expect(pages).toBeHidden();
    const shown = await bodyRows(page).count();
    expect(shown).toBeGreaterThan(0);
    await expect(page.getByText(`${shown} pedidos de 17`)).toBeVisible();
    await expect(page).not.toHaveURL(/pagina=/);
    await page.getByRole("button", { name: "Reiniciar filtros" }).click();
    await expect(bodyRows(page)).toHaveCount(10);
    await expect(page).not.toHaveURL(/etapa=/);
  });

  test("8.3.4 toda la fila abre la entidad correcta; checkbox, switches y botones de adentro no navegan", async ({ page }) => {
    const row = (text: string) => page.getByRole("row").filter({ hasText: text });
    await page.goto("admin-demo/pedidos/");
    await row("VEL-000124").getByLabel("Seleccionar VEL-000124").check();
    await expect(page).toHaveURL(/admin-demo\/pedidos\/$/);
    await row("VEL-000124").getByRole("cell").nth(3).click();
    await expect(page.getByRole("heading", { level: 1, name: /VEL-000124/ })).toBeVisible();

    await page.goto("admin-demo/usuarios/");
    await row("Diego Álvarez").getByRole("cell").nth(2).click();
    await expect(page.getByRole("heading", { level: 1, name: /Diego Álvarez/ })).toBeVisible();

    await page.goto("admin-demo/productos/");
    await page.getByRole("searchbox").fill("vela caniche");
    await row("Vela caniche").getByRole("switch").click();
    await expect(page.getByRole("status").filter({ hasText: "Producto pausado" })).toBeVisible();
    await expect(page).toHaveURL(/admin-demo\/productos\/\?q=/);
    await row("Vela caniche").getByRole("switch").click();
    await row("Vela caniche").getByRole("cell").nth(2).click();
    await expect(page.getByRole("heading", { level: 1, name: "Editar: Vela caniche" })).toBeVisible();

    await page.goto("admin-demo/productos/?ver=variantes&q=caniche%20vainilla");
    await page.getByRole("button", { name: "Sumar 1 a Vela caniche · Vainilla" }).click();
    await expect(page).toHaveURL(/ver=variantes/);
    await row("Vainilla").getByRole("cell").nth(3).click();
    await expect(page.getByRole("heading", { level: 1, name: "Editar: Vela caniche" })).toBeVisible();

    await page.goto("admin-demo/costos/?q=vela%20caniche");
    await row("Vela caniche").getByRole("cell").nth(2).click();
    await expect(page.getByRole("dialog", { name: "Costo de Vela caniche" })).toBeVisible();

    await page.goto("admin-demo/insumos/?q=cera");
    await row("Cera de soja").getByRole("cell").nth(4).click();
    await expect(page.getByRole("dialog", { name: "Insumo Cera de soja" })).toBeVisible();
  });

  test("8.3.4 vista Excel: mismos filtros, solo lectura donde corresponde, Atrás vuelve a la tabla y el .xlsx lleva todas las filas filtradas", async ({ page }) => {
    await page.goto("admin-demo/pedidos/");
    // Sin filtros: el archivo lleva los 17 pedidos aunque la página muestre 10.
    const all = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar Excel (.xlsx)" }).click();
    const sheet = await readXlsxFile((await (await all).path())!);
    expect(sheet[0]!.data).toHaveLength(18);
    expect(sheet[0]!.data[0]).toContain("Código");

    await page.getByRole("combobox", { name: "Etapa" }).selectOption("to-collect");
    const n = await bodyRows(page).count();
    await page.getByRole("button", { name: "Ver en formato Excel" }).click();
    await expect(page.getByRole("heading", { level: 1, name: /Pedidos · formato Excel/ })).toBeVisible();
    const grid = page.getByRole("grid", { name: "Pedidos en formato Excel" });
    await expect(grid.getByRole("row")).toHaveCount(n + 1);
    // Estados y pagos no se editan desde la grilla: nada se abre al escribir.
    await grid.getByRole("gridcell").nth(0).dblclick();
    await page.keyboard.type("x");
    await expect(page.getByLabel("Editar celda")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Guardar cambios" })).toHaveCount(0);
    const filtered = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar Excel (.xlsx)" }).click();
    expect((await readXlsxFile((await (await filtered).path())!))[0]!.data).toHaveLength(n + 1);
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1, name: "Pedidos" })).toBeVisible();
    await expect(page).toHaveURL(/etapa=to-collect/);
    await expect(bodyRows(page)).toHaveCount(n);
  });
});

test("8.3.19 un solo módulo: menú sin Stock ni Planilla, “Ver stock” filtra la misma pantalla y las rutas viejas llegan", async ({ page }) => {
  await page.goto("admin-demo/");
  await page.getByRole("button", { name: "Abrir menú del panel" }).click();
  const menu = page.getByRole("dialog", { name: "Menú del panel" });
  await expect(menu.getByRole("link", { name: /^Productos y stock/ })).toBeVisible();
  for (const gone of ["Stock", "Planilla", "Importar desde Excel"]) await expect(menu.getByRole("link", { name: gone, exact: true })).toHaveCount(0);
  await menu.getByRole("link", { name: /^Productos y stock/ }).click();
  const alert = page.getByRole("button", { name: /variantes? necesitan? reposición/ });
  const count = Number((await alert.textContent())!.match(/(\d+) variantes?/)![1]);
  await alert.click();
  await expect(page).toHaveURL(/ver=variantes/);
  await expect(page).toHaveURL(/stock=reponer/);
  await expect(page.getByText(`${count} variantes de 40`)).toBeVisible();
  await page.goto("admin-demo/stock/?vista=reponer");
  await expect(page).toHaveURL(/productos\/\?ver=variantes&stock=reponer/);
  await expect(page.getByText(`${count} variantes de 40`)).toBeVisible();
  // Importar sigue como acción del módulo.
  await page.getByRole("link", { name: "Importar Excel" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Importar desde Excel/ })).toBeVisible();
});

test("8.3.19 “a pedido” sigue igual en la tabla y en la vista Excel", async ({ page }) => {
  await page.goto("admin-demo/productos/?ver=variantes&stock=made-to-order");
  const total = Number((await page.locator("section[aria-label='Stock por variante'] p[aria-live]").first().textContent())!.match(/\d+/)![0]);
  expect(total).toBeGreaterThan(0);
  await page.goto("admin-demo/productos/?ver=variantes&stock=made-to-order&formato=excel");
  const grid = page.getByRole("grid", { name: "Productos y stock en formato Excel" });
  await expect(grid.getByRole("row")).toHaveCount(total + 1);
  await expect(grid.getByRole("gridcell").filter({ hasText: /^a pedido$/ })).toHaveCount(total);
});
