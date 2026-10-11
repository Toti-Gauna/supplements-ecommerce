import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.23 (nueva misión en modal), 8.3.24 (Marketing por tarjetas y subpáginas) y 8.3.25 (ruleta y premios). */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const base = () => `http://localhost:${process.env.E2E_PORT ?? "4173"}${process.env.PAGES_BASE_PATH ?? ""}/`;

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1240, 400); });

  test("8.3.23 nueva misión en modal: errores junto a los campos, cerrar conserva el borrador, guardar crea una sola y limpia", async ({ page }) => {
    await page.goto("admin-demo/misiones/");
    const open = page.getByRole("button", { name: "Nueva misión" });
    await open.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Nueva misión" });
    await expect(dialog.getByText(/Completá qué tiene que hacer el cliente/)).toBeVisible();
    // El formulario vive solo en el modal: la página no tiene campos.
    await expect(page.locator("main").getByRole("textbox")).toHaveCount(0);
    await dialog.getByRole("button", { name: "Guardar misión" }).click();
    await expect(dialog.getByText("Escribí un título (3 letras o más).")).toBeVisible();
    await expect(dialog.getByText("Escribí qué gana el cliente (3 letras o más).")).toBeVisible();
    await dialog.getByLabel("Título").fill("Comprá 2 velas");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
    await expect(page.getByRole("list", { name: "Misiones", exact: true })).not.toContainText("Comprá 2 velas");
    await open.click();
    await expect(dialog.getByText("Recuperamos el borrador que dejaste sin guardar.")).toBeVisible();
    await expect(dialog.getByLabel("Título")).toHaveValue("Comprá 2 velas");
    await dialog.getByLabel("Premio").fill("Vela mini de regalo");
    await dialog.getByLabel("Umbral (unidades)").fill("2");
    await dialog.getByRole("button", { name: "Guardar misión" }).click();
    await expect(toast(page, "Misión creada")).toBeVisible();
    await expect(page.getByRole("list", { name: "Misiones", exact: true }).getByRole("listitem").filter({ hasText: "Comprá 2 velas" })).toHaveCount(1);
    await open.click();
    await expect(dialog.getByLabel("Título")).toHaveValue("");
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog).toBeHidden();
    // El simulador es otra tarea, en su propia página.
    await page.getByRole("link", { name: /Simular progreso y premio/ }).click();
    await expect(page).toHaveURL(/misiones\/simular\/$/);
    await expect(page.getByRole("link", { name: "Volver a Misiones y premios" })).toBeVisible();
  });

  test("8.3.24 Marketing por tarjetas: cada una abre su subpágina con migas y Volver; links directos y Atrás funcionan", async ({ page }) => {
    await page.goto("admin-demo/marketing/");
    const tools = page.getByRole("list", { name: "Herramientas de marketing" });
    for (const name of ["Misiones y premios", "Emails automáticos", "Cupones y ruleta", "Temáticas", "Estudio de contenido", "Contenido"]) await expect(tools.getByRole("link", { name: new RegExp(name) })).toBeVisible();
    await tools.getByRole("link", { name: /Cupones y ruleta/ }).click();
    await expect(page).toHaveURL(/cupones\/$/);
    await expect(page.getByRole("heading", { level: 1, name: /Cupones y ruleta/ })).toBeVisible();
    // Solo las tarjetas: ni la lista de cupones ni la ruleta debajo.
    await expect(page.getByRole("button", { name: "Guardar ruleta" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Nuevo cupón" })).toHaveCount(0);
    await page.getByRole("link", { name: /Configuración de ruleta/ }).click();
    await expect(page).toHaveURL(/cupones\/ruleta\/$/);
    await expect(page.getByRole("navigation", { name: "Migas de pan" })).toContainText("Marketing");
    await page.getByRole("link", { name: "Volver a Cupones y ruleta" }).click();
    await expect(page).toHaveURL(/cupones\/$/);
    await page.goBack();
    await expect(page).toHaveURL(/cupones\/ruleta\/$/);
    await expect(page.getByRole("heading", { level: 1, name: /Configuración de ruleta/ })).toBeVisible();
    await page.goto("admin-demo/cupones/premios/");
    await expect(page.getByRole("heading", { level: 1, name: /Premios disponibles/ })).toBeVisible();
    // Emails: plantillas como tarjetas; la bandeja es su propia página (y el enlace viejo lleva ahí).
    await page.goto("admin-demo/emails/?vista=enviados");
    await expect(page).toHaveURL(/emails\/enviados\/$/);
    await expect(page.getByRole("region", { name: "Bandeja de salida" })).toBeVisible();
    await page.getByRole("link", { name: "Volver a Emails automáticos" }).click();
    await expect(page.getByRole("link", { name: "Editar Gracias por tu compra" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Bandeja de salida" })).toHaveCount(0);
  });

  test("8.3.24 editor de email: título a todo el ancho y acciones abajo; los cambios sin guardar vuelven al reabrir y se descartan con confirmación", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto("admin-demo/emails/editar/?id=tpl-order-created");
    const title = (await page.getByRole("heading", { level: 1, name: /Gracias por tu compra/ }).boundingBox())!;
    const actions = (await page.getByRole("group", { name: "Acciones de la plantilla" }).boundingBox())!;
    expect(title.height, "el título entra en una línea").toBeLessThan(70);
    expect(actions.y).toBeGreaterThanOrEqual(title.y + title.height - 1);
    await page.getByRole("navigation", { name: "Partes del editor" }).getByRole("button", { name: "Bloques" }).click();
    await expect(page.locator("#e-blocks")).toBeFocused();
    await page.getByLabel("Nombre interno").fill("Gracias por tu compra (borrador)");
    await expect(page.getByText("Cambios sin guardar")).toBeVisible();
    await page.getByRole("link", { name: "Volver a Emails automáticos" }).click();
    await page.getByRole("link", { name: "Editar Gracias por tu compra" }).click();
    await expect(page.getByText("Recuperamos los cambios sin guardar de esta plantilla.")).toBeVisible();
    await expect(page.getByLabel("Nombre interno")).toHaveValue("Gracias por tu compra (borrador)");
    await page.getByRole("button", { name: "Descartar cambios" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Descartar" }).click();
    await expect(page.getByLabel("Nombre interno")).toHaveValue("Gracias por tu compra");
    // La vista previa sigue reemplazando las fichas.
    await expect(page.getByRole("region", { name: "Vista previa" }).getByText(/¡Gracias por tu compra, Julián! Pedido VEL-000121/)).toBeVisible();
  });

  test("8.3.25 ruleta arriba; premio desde plantilla, elegido por lista y guardado; pesos en cero no se guardan; el borrador vuelve", async ({ page }) => {
    await page.goto("admin-demo/cupones/ruleta/");
    const preview = (await page.getByRole("region", { name: "Vista previa de la ruleta" }).boundingBox())!;
    const config = (await page.getByRole("region", { name: "Visibilidad y vigencia" }).boundingBox())!;
    expect(preview.y + preview.height).toBeLessThanOrEqual(config.y);
    const slot1 = page.getByLabel("Premio del gajo 1");
    await expect(slot1).toHaveValue("p-5");
    await expect(page.getByLabel("Probabilidad del gajo 1")).toHaveText("26%");
    // Premio nuevo desde una plantilla.
    await page.getByRole("button", { name: "Agregar premio" }).click();
    const dialog = page.getByRole("dialog", { name: "Agregar premio" });
    await dialog.getByRole("radio", { name: /Monto fijo de descuento/ }).check();
    await dialog.getByLabel("Monto (ARS)").fill("0");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog.getByText("Un monto en pesos enteros, mayor a 0.")).toBeVisible();
    await dialog.getByLabel("Monto (ARS)").fill("4500");
    await dialog.getByLabel("Compra mínima (ARS)").fill("20000");
    await expect(dialog).toContainText("$4.500 OFF · cupón de un uso, vence a los 7 días, con compras desde $20.000.");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(toast(page, "Premio “$4.500 OFF” creado")).toBeVisible();
    await page.getByLabel("Premio del gajo 2").selectOption({ label: "$4.500 OFF (desde $20.000)" });
    await page.getByRole("button", { name: "Guardar ruleta" }).click();
    await expect(toast(page, "Ruleta guardada")).toBeVisible();
    await page.goto("admin-demo/cupones/premios/");
    await expect(page.getByRole("list", { name: "Catálogo de premios" }).getByRole("listitem").filter({ hasText: "$4.500 OFF" })).toContainText("En la ruleta: 1 gajo");
    // Pesos en cero con la ruleta visible: no se guarda y la probabilidad no inventa números.
    await page.goto("admin-demo/cupones/ruleta/");
    for (let i = 1; i <= 8; i++) await page.getByLabel(`Peso del gajo ${i}`).fill("0");
    await expect(page.getByLabel("Probabilidad del gajo 1")).toHaveText("—");
    await page.getByRole("button", { name: "Guardar ruleta" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "al menos un gajo activo tiene que tener peso mayor a 0" })).toBeVisible();
    // Salir y volver: el borrador sigue y se puede descartar.
    await page.getByRole("link", { name: "Volver a Cupones y ruleta" }).click();
    await page.getByRole("link", { name: /Configuración de ruleta/ }).click();
    await expect(page.getByText("Recuperamos los cambios de la ruleta que quedaron sin guardar.")).toBeVisible();
    await expect(page.getByLabel("Peso del gajo 1")).toHaveValue("0");
    await page.getByRole("button", { name: "Descartar cambios" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Descartar" }).click();
    await expect(page.getByLabel("Peso del gajo 1")).toHaveValue("26");
  });
});

for (const [label, width, height, touch] of [["escritorio chico", 1024, 768, false], ["iPad vertical", 768, 1024, true], ["celular", 390, 844, true]] as const) {
  test(`8.3.24/8.3.25 a ${label} ${width}px: tarjetas, ruleta arriba y editor de email sin desborde`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, reducedMotion: "reduce", locale: "es-AR" });
    const page = await ctx.newPage();
    if (!touch) await page.mouse.move(width - 20, 500);
    for (const route of ["admin-demo/marketing/", "admin-demo/cupones/", "admin-demo/misiones/", "admin-demo/emails/"]) {
      await page.goto(base() + route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await horizontalOverflow(page), route).toBeLessThanOrEqual(0);
    }
    await page.goto(base() + "admin-demo/cupones/ruleta/");
    const preview = (await page.getByRole("region", { name: "Vista previa de la ruleta" }).boundingBox())!;
    expect(preview.y + preview.height).toBeLessThanOrEqual((await page.getByRole("region", { name: "Visibilidad y vigencia" }).boundingBox())!.y);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await page.goto(base() + "admin-demo/emails/editar/?id=tpl-order-created");
    const title = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
    expect((await page.getByRole("group", { name: "Acciones de la plantilla" }).boundingBox())!.y).toBeGreaterThanOrEqual(title.y + title.height - 1);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await page.goto(base() + "admin-demo/misiones/");
    await page.getByRole("button", { name: "Nueva misión" }).click();
    const dialog = (await page.getByRole("dialog", { name: "Nueva misión" }).boundingBox())!;
    expect(dialog.x).toBeGreaterThanOrEqual(0);
    expect(dialog.x + dialog.width).toBeLessThanOrEqual(width + 1);
    await ctx.close();
  });
}
