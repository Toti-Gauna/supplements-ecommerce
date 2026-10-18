import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * R4b · Mensajes: cada estado del pedido tiene su email y su versión WhatsApp (corta), que se edita junto al email con
 * las mismas fichas de datos y es la que abre "Escribirle por WhatsApp" en Pedidos, al teléfono ficticio del cliente.
 */
const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const waText = async (link: Locator) => decodeURIComponent((await link.getAttribute("href"))!.split("?text=")[1]!);
const wa = (scope: Page | Locator) => scope.getByRole("link", { name: /^Escribirle por WhatsApp/ }).first();

test("cada email muestra su WhatsApp; editarlo en el panel cambia el mensaje que se abre desde Por cobrar, y se puede volver al de muestra", async ({ page }) => {
  await page.goto("admin-demo/emails/");
  await expect(page.locator("[data-wa-line]")).toHaveCount(12);
  const only = page.getByRole("region", { name: "Solo por WhatsApp" });
  for (const label of ["En reclamo", "Cancelado", "Devuelto"]) await expect(only).toContainText(label);
  const line = page.locator("[data-wa-line='proof-received']");
  await expect(line).toContainText("Recibimos el comprobante del pedido");
  await line.getByRole("button", { name: "Editar el WhatsApp: Comprobante en revisión" }).click();
  const sheet = page.getByRole("dialog", { name: "Comprobante en revisión" });
  const box = sheet.getByRole("textbox", { name: "Mensaje de WhatsApp: Comprobante en revisión" });
  await box.click();
  await page.keyboard.press("Control+End");
  await page.keyboard.type(" ¡Gracias por la compra!");
  await expect(sheet.getByRole("figure", { name: "Vista previa del WhatsApp" })).toContainText(/te confirmamos por acá\. ¡Gracias por la compra!/);
  await expect(sheet.getByText("WhatsApp sin guardar")).toBeVisible();
  await sheet.getByRole("button", { name: "Guardar WhatsApp" }).click();
  await expect(toast(page, "Mensaje de WhatsApp guardado")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(line).toContainText("editado");
  await page.goto("admin-demo/pagos/");
  expect(await waText(wa(page.getByRole("article", { name: "Cobro de VOL-000124" })))).toMatch(/^¡Hola Sofía! .*¡Gracias por la compra!$/);
  // Lo editado queda en este navegador al recargar, y "Volver al de muestra" lo deshace.
  await page.goto("admin-demo/emails/");
  await expect(line).toContainText("¡Gracias por la compra!");
  await line.getByRole("button", { name: /Editar el WhatsApp/ }).click();
  await sheet.getByRole("button", { name: "Volver al de muestra" }).click();
  await expect(toast(page, "WhatsApp con el texto de muestra")).toBeVisible();
  await expect(box).not.toContainText("¡Gracias");
});

test.describe("editor del email en escritorio", () => {
  test.use({ viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1400, 500); });

  test("la versión WhatsApp va junto al email y usa las mismas fichas de datos, sin tocar el email", async ({ page }) => {
    await page.goto("admin-demo/emails/editar/?id=tpl-payment-approved");
    const section = page.getByRole("region", { name: "Versión WhatsApp · Pagado" });
    const box = section.getByRole("textbox", { name: "Mensaje de WhatsApp: Pagado" });
    await box.click();
    await page.keyboard.press("Control+End");
    await page.keyboard.type(" Total: ");
    await page.getByRole("button", { name: "Insertar Total del pedido" }).click();
    // El mensaje de muestra ya traía el total: ahora aparece dos veces.
    await expect(box.locator("[data-token='order.total']")).toHaveCount(2);
    await expect(box.locator("[data-token='order.total']").last()).toHaveText("Total del pedido");
    await expect(section.getByRole("figure", { name: "Vista previa del WhatsApp" })).toContainText(/Total: \$\s?\d/);
    // Es otro guardado: el email no queda con cambios sin guardar.
    await expect(page.getByText("Cambios sin guardar")).toHaveCount(0);
    await section.getByRole("button", { name: "Guardar WhatsApp" }).click();
    await expect(toast(page, "Mensaje de WhatsApp guardado")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("region", { name: "Versión WhatsApp · Pagado" }).getByRole("textbox").locator("[data-token='order.total']")).toHaveCount(2);
    await page.goto("admin-demo/pedidos/?q=VOL-000122");
    expect(await waText(page.getByRole("link", { name: /Escribirle por WhatsApp a Valentina Sosa \(VOL-000122/ }).first())).toMatch(/Total: \$\s?71\.425$/);
  });
});

/** [ruta, dónde está el pedido, mensaje que corresponde a su estado]. */
const VIEWS: [string, (p: Page) => Locator, string][] = [
  ["admin-demo/pagos/?codigo=VOL-000126", (p) => p.getByRole("article", { name: "Cobro de VOL-000126" }), "order-created"],
  ["admin-demo/preparacion/", (p) => p.getByRole("article", { name: "Pedido VOL-000115" }), "preparing"],
  ["admin-demo/despachos/", (p) => p.locator("[data-stop='VOL-000120']"), "ready-delivery"],
  ["admin-demo/postventa/", (p) => p.locator("[data-order='VOL-000116']"), "claim"],
  ["admin-demo/pedidos/?q=VOL-000117", (p) => p.getByRole("main"), "cancelled"],
  ["admin-demo/pedidos/detalle/?codigo=VOL-000109", (p) => p.getByRole("main"), "payment-approved"],
  ["admin-demo/pagos/detalle/?codigo=VOL-000124", (p) => p.getByRole("main"), "proof-received"],
  ["admin-demo/reclamos/detalle/?id=c2", (p) => p.getByRole("region", { name: "Pedido" }), "claim"],
];

test("calendario de despachos: la ficha del pedido también tiene su WhatsApp", async ({ page }) => {
  await page.goto("admin-demo/calendario/");
  await page.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Reprogramar VOL-000123" }).click();
  const sheet = page.getByRole("dialog", { name: "Despacho VOL-000123" });
  await expect(sheet.locator("[data-wa]")).toHaveAttribute("data-wa", "proof-received");
});

for (const [route, where, id] of VIEWS) {
  test(`/${route}: “Escribirle por WhatsApp” abre el mensaje de su estado (${id}) al teléfono del cliente`, async ({ page }) => {
    await page.goto(route);
    const link = where(page).locator("[data-wa]").first();
    await expect(link).toHaveAttribute("data-wa", id);
    await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/549223555\d{4}\?text=/);
    await expect(link).toHaveAttribute("target", "_blank");
    expect(await waText(link)).not.toMatch(/acreditad|\{|undefined/i);
  });
}
