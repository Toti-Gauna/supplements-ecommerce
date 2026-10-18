import readXlsxFile from "read-excel-file/node";
import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.4 (tabla común, filtros, 10 por página, fila → entidad, vista Excel y .xlsx) y 8.3.19 (Productos y stock). */

const TABLES = [
  ["admin-demo/pedidos/", "Pedidos", 5], ["admin-demo/usuarios/", "Clientes", 3], ["admin-demo/productos/", "Productos", 5],
  ["admin-demo/productos/?ver=variantes", "Stock por variante", 5], ["admin-demo/costos/", "Costo y margen por producto", 2],
  ["admin-demo/insumos/", "Insumos de embalaje y regalo", 3], ["admin-demo/categorias/", "Categorías en el orden de la tienda", 3],
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
    await expect(pages).toContainText("1–10 de 23 pedidos · página 1 de 3");
    await expect(bodyRows(page)).toHaveCount(10);
    await pages.getByRole("button", { name: "Página siguiente" }).click();
    await expect(pages).toContainText("11–20 de 23 pedidos · página 2 de 3");
    await expect(page).toHaveURL(/pagina=2/);
    await page.getByRole("combobox", { name: "Etapa" }).selectOption("to-collect");
    await expect(pages).toBeHidden();
    const shown = await bodyRows(page).count();
    expect(shown).toBeGreaterThan(0);
    await expect(page.getByText(`${shown} pedidos de 23`)).toBeVisible();
    await expect(page).not.toHaveURL(/pagina=/);
    await page.getByRole("button", { name: "Reiniciar filtros" }).click();
    await expect(bodyRows(page)).toHaveCount(10);
    await expect(page).not.toHaveURL(/etapa=/);
  });

  test("8.3.4 toda la fila abre la entidad correcta; checkbox, switches y botones de adentro no navegan", async ({ page }) => {
    const row = (text: string) => page.getByRole("row").filter({ hasText: text });
    await page.goto("admin-demo/pedidos/");
    await row("VOL-000124").getByLabel("Seleccionar VOL-000124").check();
    await expect(page).toHaveURL(/admin-demo\/pedidos\/$/);
    await row("VOL-000124").getByRole("cell").nth(3).click();
    await expect(page.getByRole("heading", { level: 1, name: /VOL-000124/ })).toBeVisible();

    await page.goto("admin-demo/usuarios/");
    await row("Diego Álvarez").getByRole("cell").nth(2).click();
    await expect(page.getByRole("heading", { level: 1, name: /Diego Álvarez/ })).toBeVisible();

    await page.goto("admin-demo/productos/");
    await page.getByRole("searchbox").fill("overvolt");
    await row("Overvolt pre-entreno").getByRole("switch").click();
    await expect(page.getByRole("status").filter({ hasText: "Producto pausado" })).toBeVisible();
    await expect(page).toHaveURL(/admin-demo\/productos\/\?q=/);
    await row("Overvolt pre-entreno").getByRole("switch").click();
    await row("Overvolt pre-entreno").getByRole("cell").nth(2).click();
    await expect(page.getByRole("heading", { level: 1, name: "Editar: Overvolt pre-entreno" })).toBeVisible();

    await page.goto("admin-demo/productos/?ver=variantes&q=overvolt%20frutos");
    await page.getByRole("button", { name: "Sumar 1 a Overvolt pre-entreno · Frutos rojos" }).click();
    await expect(page).toHaveURL(/ver=variantes/);
    await row("Frutos rojos").getByRole("cell").nth(3).click();
    await expect(page.getByRole("heading", { level: 1, name: "Editar: Overvolt pre-entreno" })).toBeVisible();

    await page.goto("admin-demo/costos/?q=overvolt");
    await row("Overvolt pre-entreno").getByRole("cell").nth(2).click();
    await expect(page.getByRole("dialog", { name: "Costo de Overvolt pre-entreno" })).toBeVisible();

    await page.goto("admin-demo/insumos/?q=folleto");
    await row("Folleto con tabla de dosis").getByRole("cell").nth(4).click();
    await expect(page.getByRole("dialog", { name: "Insumo Folleto con tabla de dosis" })).toBeVisible();
  });

  test("8.3.4 vista Excel: mismos filtros, solo lectura donde corresponde, Atrás vuelve a la tabla y el .xlsx lleva todas las filas filtradas", async ({ page }) => {
    await page.goto("admin-demo/pedidos/");
    // Sin filtros: el archivo lleva los 23 pedidos aunque la página muestre 10.
    const all = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar Excel (.xlsx)" }).click();
    const sheet = await readXlsxFile((await (await all).path())!);
    expect(sheet[0]!.data).toHaveLength(24);
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

  test("el Total de los pedidos se ve entero aunque la tabla no entre, también con el menú fijado", async ({ page }) => {
    // Cada celda de "Total" (encabezado y filas) queda dentro de la caja visible de la tabla, con o sin scroll.
    const totalsInside = () => page.locator("table").first().evaluate((t) => {
      const box = t.parentElement!.getBoundingClientRect();
      const col = [...t.querySelectorAll("thead th")].findIndex((th) => th.textContent?.trim().startsWith("Total"));
      const cells = [...t.querySelectorAll("tr")].map((tr) => tr.children[col]!.getBoundingClientRect());
      return { overflow: t.parentElement!.scrollWidth > t.parentElement!.clientWidth, inside: cells.every((c) => c.left >= box.left - 1 && c.right <= box.right + 1) };
    });
    await page.goto("admin-demo/pedidos/");
    await expect(bodyRows(page)).toHaveCount(10);
    expect((await totalsInside()).inside).toBe(true);
    await page.locator("aside[data-pinned]").getByRole("button", { name: "Fijar el menú abierto" }).click();
    await page.mouse.move(1200, 500);
    // Con el menú fijado la tabla seguro no entra: el Total queda fijo a la derecha.
    await expect.poll(totalsInside).toEqual({ overflow: true, inside: true });
  });
});

test("8.3.19 un solo módulo: menú con Stock y sin Planilla, “Ver stock” filtra la misma pantalla y las rutas viejas llegan", async ({ page }) => {
  await page.goto("admin-demo/");
  await page.getByRole("button", { name: "Abrir menú del panel" }).click();
  const menu = page.getByRole("dialog", { name: "Menú del panel" });
  await expect(menu.getByRole("link", { name: /^Stock/ })).toBeVisible();
  for (const gone of ["Planilla", "Importar desde Excel", "Productos y stock"]) await expect(menu.getByRole("link", { name: gone, exact: true })).toHaveCount(0);
  await menu.getByRole("link", { name: /^Stock/ }).click();
  const alert = page.getByRole("button", { name: /variantes? necesitan? reposición/ });
  const count = Number((await alert.textContent())!.match(/(\d+) variantes?/)![1]);
  await alert.click();
  await expect(page).toHaveURL(/ver=variantes/);
  await expect(page).toHaveURL(/stock=reponer/);
  await expect(page.getByText(`${count} variantes de 112`)).toBeVisible();
  await page.goto("admin-demo/stock/?vista=reponer");
  await expect(page).toHaveURL(/productos\/\?ver=variantes&stock=reponer/);
  await expect(page.getByText(`${count} variantes de 112`)).toBeVisible();
  // Importar sigue como acción del módulo.
  await page.getByRole("link", { name: "Importar Excel" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Importar desde Excel/ })).toBeVisible();
});

test("8.3.19 “a pedido” sigue igual en la tabla y en la vista Excel", async ({ page }) => {
  // El catálogo de VOLTA no trae variantes a pedido: se pasan las dos de Pump Flow desde el editor.
  await page.goto("admin-demo/productos/editar/?id=pump-flow");
  for (const flavor of ["Uva", "Sandía"]) {
    const variant = page.locator("#paso-variantes details").filter({ has: page.locator("summary", { hasText: flavor }) });
    await variant.locator("summary").click();
    await variant.getByLabel("A pedido (sin límite)").check();
    await expect(variant.locator("summary")).toContainText("a pedido");
  }
  await page.getByRole("button", { name: "Guardar (solo en esta demo)" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Producto guardado" })).toBeVisible();
  await page.goto("admin-demo/productos/?ver=variantes&stock=made-to-order");
  const total = Number((await page.locator("section[aria-label='Stock por variante'] p[aria-live]").first().textContent())!.match(/\d+/)![0]);
  expect(total).toBe(2);
  await page.goto("admin-demo/productos/?ver=variantes&stock=made-to-order&formato=excel");
  const grid = page.getByRole("grid", { name: "Productos y stock en formato Excel" });
  await expect(grid.getByRole("row")).toHaveCount(total + 1);
  await expect(grid.getByRole("gridcell").filter({ hasText: /^a pedido$/ })).toHaveCount(total);
});
