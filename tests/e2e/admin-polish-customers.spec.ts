import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.9, 8.3.10, 8.3.12, 8.3.13 (Clientes y su ficha) y 8.3.17 (modales de Costos e Insumos). */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const base = () => `http://localhost:${process.env.E2E_PORT ?? "4173"}${process.env.PAGES_BASE_PATH ?? ""}/`;

/** Las fichas de VOLTA no traen mascotas: se carga una desde el panel (el recordatorio de su cumple sigue existiendo). */
async function addPet(page: Page, name: string, day: string, month: string) {
  const pets = page.getByRole("region", { name: "Mascotas" });
  await pets.getByLabel("Nombre").fill(name);
  await pets.getByLabel("Día del cumpleaños").selectOption(day);
  await pets.getByLabel("Mes del cumpleaños").selectOption({ label: month });
  await pets.getByRole("button", { name: "Agregar" }).click();
  await expect(toast(page, `${name} agregado a la ficha`)).toBeVisible();
}

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
    const select = (await page.getByRole("combobox", { name: "Segmento" }).boundingBox())!;
    expect((await panel.boundingBox())!.y).toBeGreaterThanOrEqual(select.y + select.height);
    await panel.getByRole("button", { name: "Cerrar explicación" }).focus();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    // Lo que avisaba el bloque sigue a mano como filtro (el inicio enlaza a él).
    // Con 1280 px, el tercer filtro está en "Más filtros".
    // Diego tiene la recompra del Overvolt (pedido VOL-000119) dentro de los 30 días; Julián no tiene nada en ese plazo.
    await page.getByRole("button", { name: /Más filtros/ }).click();
    await page.getByRole("combobox", { name: "Para escribir" }).selectOption("30");
    await expect(page.getByRole("row").filter({ hasText: "Diego Álvarez" })).toHaveCount(1);
    await expect(page.getByRole("row").filter({ hasText: "Julián Paz" })).toHaveCount(0);
  });

  test("8.3.12 la fila abre la ficha completa arriba de todo; el checkbox no navega; Volver conserva el filtro", async ({ page }) => {
    await page.goto("admin-demo/usuarios/?segmento=VIP");
    const row = page.getByRole("row").filter({ hasText: "Valentina Sosa" });
    await row.getByLabel("Seleccionar Valentina Sosa").check();
    await expect(page).toHaveURL(/usuarios\/\?segmento=VIP$/);
    await row.getByRole("cell").nth(3).click();
    await expect(page.getByRole("heading", { level: 1, name: /Valentina Sosa/ })).toBeVisible();
    await expect(page).toHaveURL(/usuarios\/ficha\/\?email=vale/);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    for (const section of ["Mascotas", "Recordatorios (próximos 60 días)", "Historial de compras", "Club Volta", "Cumpleaños del cliente", "Notas internas"]) {
      await expect(page.getByRole("region", { name: section })).toBeVisible();
    }
    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/usuarios\/\?segmento=VIP/);
  });

  test("8.3.17 Costos en modal: frase de ayuda, validación, cancelar con cambios pide confirmar y no guarda, guardar recalcula", async ({ page }) => {
    // Fase 7: el costo es lo que se le paga al proveedor más el embalaje (sin horas de máquina ni de armado).
    await page.goto("admin-demo/costos/?q=overvolt");
    await page.getByRole("button", { name: /Overvolt pre-entreno/ }).first().click();
    const dialog = page.getByRole("dialog", { name: "Costo de Overvolt pre-entreno" });
    await expect(dialog.getByText(/Cargá lo que le pagás al proveedor y el embalaje que lleva/)).toBeVisible();
    await expect(dialog.getByLabel("Armado (minutos)")).toHaveCount(0);
    const supplier = dialog.getByLabel("Costo del proveedor por unidad (pesos)");
    await supplier.fill("22.100,50");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog.getByText(/pesos enteros/)).toBeVisible();
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog.getByRole("alertdialog", { name: "Cambios sin guardar" })).toBeVisible();
    await dialog.getByRole("button", { name: "Descartar cambios" }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: /Overvolt pre-entreno/ }).first().click();
    await expect(supplier).toHaveValue("22100");
    await supplier.fill("24000");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog).toBeHidden();
    await expect(toast(page, "Costos guardados")).toBeVisible();
    await page.getByRole("button", { name: /Overvolt pre-entreno/ }).first().click();
    await expect(supplier).toHaveValue("24000");
    // $ 24.000 del proveedor + $ 794 de embalaje (caja, folleto, precinto y cinta).
    await expect(dialog.getByText(/\$\s?24\.794/).first()).toBeVisible();
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
  test(`8.3.13 ficha de cliente a ${label} ${width}px: columnas solo si entran, botones de recordatorio sin pisar el texto, sin desborde`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, reducedMotion: "reduce", locale: "es-AR" });
    const page = await ctx.newPage();
    // Con mouse, lejos de la barra lateral (se abre al pasar por encima y taparía el formulario).
    if (!touch) await page.mouse.move(width - 20, 500);
    await page.goto(base() + "admin-demo/usuarios/ficha/?email=diego.a@ejemplo.com");
    await addPet(page, "Ñoqui", "10", "octubre");
    const pets = (await page.getByRole("region", { name: "Mascotas" }).boundingBox())!;
    const club = (await page.getByRole("region", { name: "Club Volta" }).boundingBox())!;
    if (width >= 1280) expect(club.x).toBeGreaterThan(pets.x + pets.width - 1);
    else expect(club.y).toBeGreaterThan(pets.y);
    const reminder = page.getByRole("region", { name: "Recordatorios (próximos 60 días)" }).getByRole("listitem").first();
    const title = (await reminder.getByText("Cumple de Ñoqui", { exact: true }).boundingBox())!;
    for (const name of [/Simular el email del día/, /Copiar mensaje/]) {
      const b = (await reminder.getByRole("button", { name }).boundingBox())!;
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
