import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.9, 8.3.10, 8.3.12, 8.3.13 (Clientes y su ficha) y 8.3.17 (modales de Costos e Insumos). */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const base = () => `http://localhost:${process.env.E2E_PORT ?? "4173"}${process.env.PAGES_BASE_PATH ?? ""}/`;

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1200, 500); });

  test("8.3.9 sin “Para escribirles”; 8.3.10 la ayuda de segmentos se abre con teclado, explica con las reglas del engine y no tapa los filtros", async ({ page }) => {
    await page.goto("admin-demo/usuarios/");
    await expect(page.getByText(/Para escribirles/)).toHaveCount(0);
    const help = page.getByRole("button", { name: "Qué significa: Segmento" });
    await help.focus();
    await page.keyboard.press("Enter");
    const panel = page.getByRole("region", { name: "Segmentos de clientes" });
    await expect(panel).toContainText("Pagó $ 100.000 o más");
    await expect(panel).toContainText("Invitado");
    // La recompra se explica con la misma tabla de consumo que usa el cálculo.
    await expect(panel).toContainText("Se le termina esta semana");
    await expect(panel).toContainText("pre-entrenos y aminoácidos, 4 por semana");
    const select = (await page.getByRole("combobox", { name: "Segmento" }).boundingBox())!;
    expect((await panel.boundingBox())!.y).toBeGreaterThanOrEqual(select.y + select.height);
    await panel.getByRole("button", { name: "Cerrar explicación" }).focus();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    // Recompra atrasada: Paula (whey, hace 14 días) y Tomás (creatina, hace 2); Juan todavía tiene whey.
    await page.getByRole("combobox", { name: "Segmento" }).selectOption("atrasada");
    await expect(page).toHaveURL(/segmento=atrasada/);
    await expect(page.getByRole("row").filter({ hasText: "Paula Castro" })).toHaveCount(1);
    await expect(page.getByRole("row").filter({ hasText: "Tomás Herrera" })).toContainText("Creatina Brava");
    await expect(page.getByRole("row").filter({ hasText: "Juan Ibarra" })).toHaveCount(0);
    // Con 1280 px, el tercer filtro está en "Más filtros"; el objetivo se combina con el segmento.
    await page.getByRole("combobox", { name: "Objetivo" }).selectOption("fuerza");
    await expect(page.getByRole("row").filter({ hasText: "Tomás Herrera" })).toHaveCount(1);
    await expect(page.getByRole("row").filter({ hasText: "Paula Castro" })).toHaveCount(0);
  });

  test("8.3.12 la fila abre la ficha completa arriba de todo; el checkbox no navega; Volver conserva el filtro", async ({ page }) => {
    await page.goto("admin-demo/usuarios/?segmento=vip");
    const row = page.getByRole("row").filter({ hasText: "Valentina Sosa" });
    await row.getByLabel("Seleccionar Valentina Sosa").check();
    await expect(page).toHaveURL(/usuarios\/\?segmento=vip$/);
    await row.getByRole("cell").nth(3).click();
    await expect(page.getByRole("heading", { level: 1, name: /Valentina Sosa/ })).toBeVisible();
    await expect(page).toHaveURL(/usuarios\/ficha\/\?email=vale/);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    for (const section of ["Se le termina", "Historial de compras", "Objetivo y cumpleaños", "Club Volta", "Notas internas"]) {
      await expect(page.getByRole("region", { name: section })).toBeVisible();
    }
    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/usuarios\/\?segmento=vip/);
  });

  test("8.3.17 Costos en modal: frase de ayuda, validación, cancelar con cambios pide confirmar y no guarda, guardar recalcula", async ({ page }) => {
    // VOLTA no usa máquina (la hora cuesta $ 0): se prueba con los minutos de armado ($ 4.500 la hora).
    await page.goto("admin-demo/costos/?q=overvolt");
    await page.getByRole("button", { name: /Overvolt pre-entreno/ }).first().click();
    const dialog = page.getByRole("dialog", { name: "Costo de Overvolt pre-entreno" });
    await expect(dialog.getByText(/Modificá el costo del proveedor, el embalaje, los tiempos y el precio de prueba/)).toBeVisible();
    await dialog.getByLabel("Armado (minutos)").fill("-5");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog.getByText("Minutos enteros, 0 o más.")).toBeVisible();
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog.getByRole("alertdialog", { name: "Cambios sin guardar" })).toBeVisible();
    await dialog.getByRole("button", { name: "Descartar cambios" }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: /Overvolt pre-entreno/ }).first().click();
    await expect(dialog.getByLabel("Armado (minutos)")).toHaveValue("6");
    await dialog.getByLabel("Armado (minutos)").fill("65");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog).toBeHidden();
    await expect(toast(page, "Receta de costo guardada")).toBeVisible();
    await page.getByRole("button", { name: /Overvolt pre-entreno/ }).first().click();
    await expect(dialog.getByLabel("Armado (minutos)")).toHaveValue("65");
    // 65 min × $ 4.500 la hora = $ 4.875 de armado.
    await expect(dialog.getByText(/\$\s?4\.875/).first()).toBeVisible();
  });

  test("8.3.17 Insumos en modal: crear exige datos y crea uno solo; editar guarda una vez; Escape sin cambios cierra", async ({ page }) => {
    await page.goto("admin-demo/insumos/");
    const before = Number((await page.getByText(/^\d+ insumos$/).textContent())!.match(/\d+/)![0]);
    await page.getByRole("button", { name: "Nuevo insumo" }).click();
    const dialog = page.getByRole("dialog", { name: "Nuevo insumo" });
    await expect(dialog.getByText(/Actualizá unidad, costo por unidad, stock mínimo y proveedor/)).toBeVisible();
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog.getByText("Escribí el nombre del insumo.")).toBeVisible();
    await dialog.getByLabel("Nombre").fill("Cinta de regalo");
    await dialog.getByLabel("Unidad de medida").selectOption("m");
    await dialog.getByLabel(/Costo por m/).fill("350");
    await dialog.getByLabel(/Avisar para reponer con/).fill("2,5");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog).toBeHidden();
    await expect(toast(page, "Insumo Cinta de regalo creado")).toBeVisible();
    await expect(page.getByText(`${before + 1} insumos`, { exact: true })).toBeVisible();
    await page.getByRole("row").filter({ hasText: "Cinta de regalo" }).getByRole("cell").nth(4).click();
    const edit = page.getByRole("dialog", { name: "Insumo Cinta de regalo" });
    await page.keyboard.press("Escape");
    await expect(edit).toBeHidden();
    await page.getByRole("row").filter({ hasText: "Cinta de regalo" }).getByRole("cell").nth(4).click();
    await edit.getByLabel("Proveedor (opcional)").fill("Packaging del puerto");
    await edit.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("row").filter({ hasText: "Cinta de regalo" })).toContainText("Packaging del puerto");
  });
});

for (const [label, width, height, touch] of [["escritorio", 1280, 900, false], ["iPad vertical", 768, 1024, true], ["celular", 390, 844, true]] as const) {
  test(`8.3.13 ficha de cliente a ${label} ${width}px: columnas solo si entran, botones del aviso sin pisar el texto, sin desborde`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, reducedMotion: "reduce", locale: "es-AR" });
    const page = await ctx.newPage();
    // Con mouse, lejos de la barra lateral (se abre al pasar por encima y taparía el formulario).
    if (!touch) await page.mouse.move(width - 20, 500);
    await page.goto(base() + "admin-demo/usuarios/ficha/?email=juan.i@ejemplo.com");
    const runOut = page.getByRole("region", { name: "Se le termina" });
    const left = (await runOut.boundingBox())!;
    const club = (await page.getByRole("region", { name: "Club Volta" }).boundingBox())!;
    if (width >= 1280) expect(club.x).toBeGreaterThan(left.x + left.width - 1);
    else expect(club.y).toBeGreaterThan(left.y);
    const item = runOut.getByRole("listitem").first();
    const title = (await item.getByText("Ionic Whey 100%", { exact: true }).boundingBox())!;
    for (const action of [item.getByRole("button", { name: /Avisarle por email/ }), item.getByRole("link", { name: /WhatsApp/ })]) {
      const b = (await action.boundingBox())!;
      const overlaps = b.x < title.x + title.width && b.x + b.width > title.x && b.y < title.y + title.height && b.y + b.height > title.y;
      expect(overlaps, "el botón no pisa el título").toBe(false);
      expect(b.height).toBeLessThan(48);
    }
    // Los títulos de las tarjetas entran en una línea.
    for (const h of await page.locator("section h2").all()) expect(await h.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(60);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await ctx.close();
  });
}
