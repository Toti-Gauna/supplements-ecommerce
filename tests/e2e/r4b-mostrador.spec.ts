import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * R4b · Modo mostrador: vender con el ticket siempre a la vista, el lote que sale (FEFO), el descuento stack, el cobro con
 * vuelto o en cuotas con recargo, "Venta registrada (simulada)", el cierre del día con la caja esperada, el pedido por
 * chat (nunca pagado solo) y la consulta rápida para WhatsApp. Celular 375 px (proyecto) y escritorio 1440.
 */
const pot = (page: Page, key: string) => page.locator(`[data-pot='${key}']`);
const VAINILLA = "ionic-whey::iw-vainilla-2lb";
const money = (n: string) => new RegExp(`^\\$\\s${n.replace(".", "\\.")}$`);

async function openCounter(page: Page) {
  await page.goto("admin-demo/mostrador/");
  await expect(page.getByRole("heading", { level: 1, name: "Mostrador" })).toBeVisible();
}

async function search(page: Page, q: string) {
  await page.getByLabel("Buscar para vender").fill(q);
  await expect(page.getByText(new RegExp(`potes? para “${q}”`))).toBeVisible();
}

test("vender en el celular: FEFO, stack, vuelto y la venta registrada baja el stock del lote que vence primero", async ({ page }) => {
  const noExternal = guardNetwork(page);
  await openCounter(page);
  const bar = page.getByRole("region", { name: "Ticket en curso" });
  await expect(bar).toContainText("Ticket vacío");
  await search(page, "whey vainilla");
  await expect(pot(page, VAINILLA)).toContainText("Sale lote VL-2603-W · vence 11/2026 (en 56 días)");
  for (let i = 0; i < 5; i++) await pot(page, VAINILLA).click();
  // Los 5 del lote viejo ya están en el ticket: el próximo sale del lote nuevo.
  await expect(pot(page, VAINILLA)).toContainText("Sale lote VL-2609-W");
  await expect(pot(page, VAINILLA)).toContainText("×5 en el ticket");
  await search(page, "creatina");
  await pot(page, "creatina-monohidrato::cm-sin-sabor-300").click();
  await search(page, "overvolt limon");
  await pot(page, "overvolt-pre::ov-limon-300").click();
  // 5 × 54.900 + 29.900 + 36.900 = 341.300 − 10 % stack (34.130).
  await expect(bar.locator("[data-bar-total]")).toHaveText(money("307.170"));
  await bar.getByRole("button", { name: /Ver el Ticket/ }).click();
  const sheet = page.getByRole("dialog", { name: "Ticket" });
  await expect(sheet).toContainText("Descuento stack −10 % (3 categorías)");
  await sheet.getByRole("group", { name: /Cantidad de Ionic Whey 100% \(Vainilla/ }).getByRole("button", { name: "Sumar uno" }).click();
  await expect(sheet.locator(`[data-line='${VAINILLA}']`)).toContainText("Lote VL-2603-W ×5 · VL-2609-W ×1");
  await expect(sheet.locator("[data-ticket-total]")).toHaveText(money("356.580"));
  await sheet.getByRole("button", { name: /^Cobrar/ }).click();
  const charge = page.getByRole("dialog", { name: /^Cobrar/ });
  await expect(charge.getByRole("radio", { name: /^Efectivo/ })).toBeChecked();
  await charge.getByLabel("Con cuánto paga").fill("300000");
  await expect(charge.locator("[data-change]")).toHaveText(/Faltan \$\s56\.580/);
  await expect(charge.getByRole("button", { name: /Registrar venta/ })).toBeDisabled();
  await charge.getByLabel("Con cuánto paga").fill("400000");
  await expect(charge.locator("[data-change]")).toHaveText(/Vuelto: \$\s43\.420/);
  await charge.getByRole("button", { name: /Registrar venta/ }).click();
  const done = page.getByRole("dialog", { name: "Venta registrada (simulada)" });
  await expect(done).toContainText("Ticket 0001");
  await expect(done).toContainText(/Vuelto: \$\s43\.420/);
  await done.getByRole("button", { name: "Nueva venta" }).click();
  await expect(bar).toContainText("Ticket vacío");
  await search(page, "whey vainilla");
  await expect(pot(page, VAINILLA)).toContainText("Stock 12");
  await expect(pot(page, VAINILLA)).toContainText("Sale lote VL-2609-W");
  await expect(page.getByText(/acreditad/i)).toHaveCount(0);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  noExternal();
});

test("cuotas con recargo y cierre del día con la caja esperada", async ({ page }) => {
  await openCounter(page);
  await search(page, "creatina");
  await pot(page, "creatina-monohidrato::cm-sin-sabor-300").click();
  await page.getByRole("region", { name: "Ticket en curso" }).getByRole("button", { name: "Cobrar" }).click();
  const charge = page.getByRole("dialog", { name: /^Cobrar/ });
  // 29.900 × 1,24 = 37.076 → 6 cuotas de 6.180 (6.179,33 redondeado hacia arriba al peso).
  await expect(charge.getByText("6 × $ 6.180 · +24 %")).toBeVisible();
  await charge.getByText("3 cuotas", { exact: true }).click();
  // 29.900 × 1,12 = 33.488 → 3 cuotas de 11.163 (las cuotas iguales, redondeadas al peso): total 33.489.
  await expect(charge.locator("[data-installments]")).toContainText(/3 cuotas de \$\s11\.163/);
  await expect(charge.locator("[data-installments]")).toContainText(/Total con recargo \$\s33\.489 · recargo 12 % \(\$\s3\.589\)/);
  await charge.getByRole("button", { name: /Registrar venta/ }).click();
  await expect(page.getByRole("dialog", { name: "Venta registrada (simulada)" })).toContainText(/crédito 3 cuotas de \$\s11\.163/);
  await page.getByRole("button", { name: "Nueva venta" }).click();
  await pot(page, "creatina-monohidrato::cm-sin-sabor-300").click();
  await page.getByRole("region", { name: "Ticket en curso" }).getByRole("button", { name: "Cobrar" }).click();
  await page.getByRole("dialog", { name: /^Cobrar/ }).getByRole("button", { name: /Registrar venta/ }).click();
  await page.getByRole("button", { name: "Nueva venta" }).click();

  await page.getByRole("tablist", { name: "Pestañas de la sección" }).getByRole("tab", { name: "Cierre del día" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cierre del día" })).toBeVisible();
  await expect(page.getByRole("img", { name: money("49.900") })).toBeVisible(); // fondo 20.000 + efectivo 29.900
  await expect(page.locator("[data-method='CREDIT']")).toContainText(/\$\s33\.489/);
  await expect(page.locator("[data-sale]")).toHaveCount(2);
  await page.getByLabel(/Efectivo contado/).fill("50000");
  await expect(page.locator("#contado-h")).toHaveText(/Sobran \$\s100/);
  await page.getByRole("button", { name: "Cerrar el día" }).click();
  await page.getByRole("dialog", { name: "¿Cerrar el día?" }).getByRole("button", { name: "Cerrar el día" }).click();
  await expect(page.locator("[data-closure]")).toHaveCount(1);
  await expect(page.locator("[data-closure]")).toContainText(/contaste \$\s50\.000: sobran \$\s100/);
  await expect(page.getByRole("img", { name: money("20.000") })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cerrar el día" })).toBeDisabled();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("pedido por chat: entra en Pedidos con su canal y nunca queda pagado solo", async ({ page }) => {
  await page.goto("admin-demo/mostrador/chat/");
  await page.getByRole("button", { name: "Cargar pedido" }).click();
  await expect(page.getByText("Escribí el nombre del cliente.")).toBeVisible();
  await expect(page.getByLabel("Nombre del cliente")).toBeFocused();
  await page.getByText("Instagram", { exact: true }).click();
  await page.getByLabel("Nombre del cliente").fill("Ana Prueba");
  await page.getByLabel("Usuario o teléfono").fill("@ana.entrena");
  await page.getByLabel("Sumar productos").fill("creatina");
  await pot(page, "creatina-monohidrato::cm-sin-sabor-300").click();
  await page.getByText(/^Cadete en /).click();
  await page.getByLabel("Dirección de entrega").fill("Güemes 2900, Mar del Plata");
  await page.getByText("Ya mandó el comprobante por el chat").click();
  // 29.900 − 10 % transferencia + cadete 3.500.
  await expect(page.locator("[data-chat-total]")).toHaveText(money("30.410"));
  await page.getByRole("button", { name: "Cargar pedido" }).click();
  const done = page.locator("[data-chat-done='VOL-000127']");
  await expect(done).toContainText("Estado: Comprobante en revisión");
  await done.getByRole("link", { name: "Ver el pedido" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "VOL-000127" })).toBeVisible();
  await expect(page.getByText("Origen").first()).toBeVisible();
  await expect(page.getByText("Instagram").first()).toBeVisible();
  await expect(page.getByText("Comprobante en revisión").first()).toBeVisible();

  await page.goto("admin-demo/mostrador/chat/");
  await page.getByLabel("Nombre del cliente").fill("Beto Mostrador");
  await page.getByLabel("Teléfono").fill("223 555-0190");
  await page.getByLabel("Sumar productos").fill("guantes");
  await pot(page, "guantes-boxeo::gb-rojo-10oz").click();
  await page.getByText("Cobrado en mano", { exact: true }).click();
  await page.getByRole("button", { name: "Cargar pedido" }).click();
  await expect(page.getByText(/Confirmá que ya lo cobraste/)).toBeVisible();
  await page.getByText("Confirmo que ya lo cobré en mano").click();
  await page.getByRole("button", { name: "Cargar pedido" }).click();
  await expect(page.locator("[data-chat-done='VOL-000128']")).toContainText("Estado: Pagado");
  await expect(page.locator("[data-chat-order]")).toHaveCount(2);
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000128");
  await expect(page.getByText("Cobrado en mano").first()).toBeVisible();
  await expect(page.getByText("Efectivo en mano").first()).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("consulta rápida: el texto para WhatsApp se copia", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("admin-demo/mostrador/consulta/");
  await page.getByLabel("Buscar producto").fill("whey");
  await expect(page.getByRole("button", { name: "Ionic Whey 100%" })).toHaveAttribute("aria-pressed", "true");
  const text = page.locator("[data-whatsapp-text]");
  await expect(text).toContainText("¡Hola! Te paso precio y stock de hoy de Ionic Whey 100%");
  await expect(text).toContainText("• Cookies & cream · 5 lb (2,27 kg): $ 116.900 · quedan 2");
  await page.getByRole("button", { name: "Copiar texto" }).click();
  await expect(page.getByText("Texto copiado: pegalo en el chat.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Frutilla · 5 lb (2,27 kg): $ 116.900 · sin stock por ahora");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test.describe("escritorio 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test("el ticket queda a la vista en su columna, se vende con el teclado y Hoy lleva al mostrador", async ({ page }) => {
    await page.goto("admin-demo/");
    await page.getByRole("link", { name: "Vender en el mostrador" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Mostrador" })).toBeVisible();
    const ticket = page.getByRole("complementary", { name: "Ticket" });
    await expect(ticket).toBeVisible();
    await expect(page.getByRole("region", { name: "Ticket en curso" })).toBeHidden();
    await page.getByLabel("Buscar para vender").fill("whey chocolate");
    // Tab pasa por "Borrar la búsqueda" y llega al primer pote.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(pot(page, "ionic-whey::iw-chocolate-2lb")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(ticket.locator("[data-ticket-total]")).toHaveText(money("54.900"));
    await page.mouse.wheel(0, 1200);
    await expect(ticket.getByRole("button", { name: /^Cobrar/ })).toBeInViewport();
    await ticket.getByRole("button", { name: /^Cobrar/ }).click();
    await page.getByRole("dialog", { name: /^Cobrar/ }).getByText("Débito", { exact: true }).click();
    await page.getByRole("button", { name: /Registrar venta/ }).click();
    await expect(page.getByRole("dialog", { name: "Venta registrada (simulada)" })).toContainText("débito");
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });

  test("el recargo de las cuotas se cambia en Ajustes → Medios de pago", async ({ page }) => {
    await page.goto("admin-demo/ajustes/pagos/");
    await page.getByLabel(/Recargo en 3 cuotas/).fill("20");
    await page.getByRole("button", { name: "Guardar medios de pago" }).click();
    await expect(page.getByText("Medios de pago guardados")).toBeVisible();
    await page.goto("admin-demo/mostrador/");
    await page.getByLabel("Buscar para vender").fill("creatina");
    await pot(page, "creatina-monohidrato::cm-sin-sabor-300").click();
    await page.getByRole("complementary", { name: "Ticket" }).getByRole("button", { name: /^Cobrar/ }).click();
    await expect(page.getByRole("dialog", { name: /^Cobrar/ }).getByText("3 × $ 11.960 · +20 %")).toBeVisible();
  });
});
