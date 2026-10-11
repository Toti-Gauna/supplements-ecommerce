import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.5–8.3.8 y 8.3.30: fichas completas, comprobantes, reclamos y datos de cobro desde Pagos. */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const confirm = async (page: Page, button: string) => {
  const dialog = page.getByRole("dialog").filter({ has: page.getByRole("button", { name: button }) });
  await dialog.getByRole("button", { name: button }).click();
  await expect(dialog).toBeHidden();
};

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1200, 500); });

  test("8.3.5/8.3.6 ficha de pedido: ID, pago y producción por separado, próxima acción; cambiar estado con confirmación sincroniza la tabla y Volver conserva el filtro", async ({ page }) => {
    await page.goto("admin-demo/pedidos/?etapa=to-make");
    await page.getByRole("row").filter({ hasText: "VOL-000122" }).getByRole("cell").nth(3).click();
    await expect(page.getByRole("heading", { level: 1, name: /VOL-000122/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Migas de pan" })).toContainText("Pedidos");
    await expect(page.getByText("Pago:", { exact: true })).toBeVisible();
    await expect(page.getByText(/Pago:\s*Pagado con Mercado Pago/)).toBeVisible();
    await expect(page.getByText("Producción y entrega:", { exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Próxima acción" })).toContainText("Pasarlo a producción");
    await page.getByRole("button", { name: "En producción", exact: true }).click();
    await confirm(page, "Confirmar cambio");
    await expect(page.getByText(/Producción y entrega:\s*En producción/)).toBeVisible();
    // Recargar mantiene la entidad.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: /VOL-000122/ })).toBeVisible();
    // Volver lleva a la lista con su filtro; el pedido ya no está en "Para producir".
    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/pedidos\/\?etapa=to-make/);
    await expect(page.getByRole("row").filter({ hasText: "VOL-000122" })).toHaveCount(0);
  });

  test("8.3.7 comprobante a la izquierda y datos a la derecha; aprobar desde la ficha cambia estado y contadores; 8.3.8 sin auditoría", async ({ page }) => {
    await page.goto("admin-demo/pagos/");
    await expect(page.getByText("Auditoría de muestra")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Por revisar/ })).toContainText("2");
    await page.getByRole("article", { name: "Pago de VOL-000124" }).getByRole("link", { name: "VOL-000124", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: /VOL-000124/ })).toBeVisible();
    const proof = (await page.getByRole("figure", { name: "Comprobante" }).boundingBox())!;
    const data = (await page.getByRole("region", { name: "Datos del pago" }).boundingBox())!;
    expect(proof.x + proof.width).toBeLessThanOrEqual(data.x);
    await expect(page.getByRole("region", { name: "Datos del pago" })).toContainText("Sofía Ruiz");
    await page.getByRole("button", { name: "Aprobar" }).click();
    await confirm(page, "Aprobar (demo)");
    await expect(page.getByText(/Pago:\s*Pagado · aprobado a mano/)).toBeVisible();
    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page.getByRole("button", { name: /Por revisar/ })).toContainText("1");
    await expect(page.getByRole("button", { name: /Resueltos/ })).toContainText("7");
  });

  test("8.3.30 datos de cobro desde Pagos: mismo editor y valores que Ajustes; cancelar no cambia; guardar llega al checkout y no aprueba nada", async ({ page }) => {
    await page.goto("admin-demo/pagos/?estado=done");
    await page.getByRole("button", { name: "Configurar datos de cobro" }).click();
    const dialog = page.getByRole("dialog", { name: "Configurar datos de cobro" });
    const original = await dialog.getByLabel("Alias").inputValue();
    await dialog.getByLabel("Alias").fill("cambio.que.no.va");
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "Configurar datos de cobro" }).click();
    await expect(dialog.getByLabel("Alias")).toHaveValue(original);
    await dialog.getByLabel("CBU / CVU").fill("123");
    await dialog.getByRole("button", { name: "Guardar datos de cobro" }).click();
    await expect(dialog.getByText("Tiene que tener 22 dígitos.")).toBeVisible();
    await dialog.getByLabel("CBU / CVU").fill("0000003100000000000099");
    await dialog.getByLabel("Alias").fill("volta.cobros.demo");
    await dialog.getByRole("button", { name: "Guardar datos de cobro" }).click();
    await expect(dialog).toBeHidden();
    await expect(toast(page, "Datos de cobro de muestra guardados")).toBeVisible();
    // El filtro de la cola sigue igual y no se aprobó ningún pago.
    await expect(page.getByRole("button", { name: /Resueltos/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /Por revisar/ })).toContainText("2");
    await page.goto("admin-demo/ajustes/cobro/");
    await expect(page.getByLabel("Alias")).toHaveValue("volta.cobros.demo");
    await expect(page.getByLabel("CBU / CVU")).toHaveValue("0000003100000000000099");
    // Checkout demo con transferencia: muestra los datos nuevos.
    await page.goto("p/bcaa-211/");
    await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
    await page.goto("checkout/");
    await page.getByLabel("Nombre y apellido").fill("Ana Prueba");
    await page.getByLabel("Email").fill("ana@ejemplo.com");
    await page.getByLabel("Teléfono / WhatsApp").fill("223 555-9999");
    await page.getByRole("button", { name: "Continuar a la entrega" }).click();
    await page.getByText("Retiro en el local").click();
    await page.getByRole("button", { name: "Continuar al pago" }).click();
    await page.getByText("Transferencia bancaria").click();
    await page.getByRole("button", { name: "Revisar pedido" }).click();
    await page.getByRole("checkbox", { name: /Acepto los/ }).check();
    await page.getByRole("button", { name: "Confirmar pedido de demostración" }).click();
    await expect(page.getByText("volta.cobros.demo")).toBeVisible();
  });

  test("8.3.5 reclamos: la lista abre la ficha completa; marcar en curso con confirmación y volver", async ({ page }) => {
    await page.goto("admin-demo/reclamos/");
    await page.getByRole("link", { name: /ARR-0007/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: /ARR-0007/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Mensaje del comprador" })).toContainText("Me arrepentí del pre-entreno");
    await expect(page.getByRole("region", { name: "Pedido" }).getByRole("link", { name: "VOL-000119" })).toBeVisible();
    await page.getByRole("button", { name: "Marcar en curso" }).click();
    await confirm(page, "Marcar en curso");
    await expect(page.getByText(/Estado:\s*En curso/)).toBeVisible();
    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page.getByRole("heading", { level: 1, name: /Reclamos/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /ARR-0007/ })).toContainText("En curso");
  });
});

for (const [label, width, height, touch] of [["iPad vertical", 768, 1024, true], ["celular", 390, 844, true]] as const) {
  test(`8.3.6/8.3.7 a ${label} ${width}px: ficha de pedido y de pago apiladas, legibles y sin desborde`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, reducedMotion: "reduce", locale: "es-AR" });
    const page = await ctx.newPage();
    const base = `http://localhost:${process.env.E2E_PORT ?? "4173"}${process.env.PAGES_BASE_PATH ?? ""}/`;
    await page.goto(base + "admin-demo/pedidos/detalle/?codigo=VOL-000124");
    await expect(page.getByRole("region", { name: "Próxima acción" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await page.goto(base + "admin-demo/pagos/detalle/?codigo=VOL-000124");
    const proof = (await page.getByRole("figure", { name: "Comprobante" }).boundingBox())!;
    const data = (await page.getByRole("region", { name: "Datos del pago" }).boundingBox())!;
    expect(data.y).toBeGreaterThanOrEqual(proof.y + proof.height - 1);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await ctx.close();
  });
}
