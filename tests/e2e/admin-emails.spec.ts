import { expect, test, type Page } from "@playwright/test";
import { guardNetwork } from "./helpers";

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });

/** Cambia el estado desde el detalle del pedido (botón con el nombre del estado y confirmación). */
async function moveOrder(page: Page, code: string, to: RegExp) {
  await page.goto(`admin-demo/pedidos/detalle/?codigo=${code}`);
  await page.getByRole("button", { name: to }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar cambio" }).click();
}

test("compra en la tienda: el email de compra aparece en la bandeja y es el único que sale", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("p/overvolt-pre/");
  // En el celular, "Agregar al carrito" está en la barra flotante (el de la tarjeta queda oculto).
  await page.getByRole("button", { name: "Agregar al carrito" }).filter({ visible: true }).click();
  await page.goto("checkout/");
  await page.getByRole("button", { name: "Ingresar con cuenta demo" }).click();
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  await page.getByText("Retiro en el local").click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Tarjetas de débito, crédito y prepagas", { exact: true }).click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido de demostración" }).click();
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);

  await page.goto("admin-demo/emails/enviados/");
  const inbox = page.getByRole("region", { name: "Bandeja de salida" });
  await expect(inbox.getByRole("button", { name: /VOL-DEMO-0001/ })).toHaveCount(1);
  await inbox.getByRole("button", { name: /¡Recibimos tu pedido, .*VOL-DEMO-0001/ }).click();
  const mail = page.getByRole("dialog", { name: /Email: ¡Recibimos tu pedido/ });
  await expect(mail.getByRole("article")).toContainText("1 × Overvolt pre-entreno");
  await expect(mail.getByRole("article")).toContainText("30 servicios");
  await expect(mail.getByText(/Simulado: en la demo no sale ningún email/)).toBeVisible();
  assertNoExternal();
});

test("mover un pedido a “Listo” manda solo su email (con el lote controlado); una plantilla pausada no sale", async ({ page }) => {
  await moveOrder(page, "VOL-000121", /^Listo/);
  await expect(toast(page, /Pedido en “Listo/)).toBeVisible();
  await page.goto("admin-demo/emails/enviados/");
  const inbox = page.getByRole("region", { name: "Bandeja de salida" });
  await inbox.getByRole("button", { name: /Tu pedido VOL-000121 está listo para salir/ }).click();
  const mail = page.getByRole("dialog", { name: /Email: Tu pedido VOL-000121 está listo para salir/ });
  await expect(mail.getByRole("article")).toContainText("Armado y controlado");
  await expect(mail.getByRole("article")).toContainText(/LOTE \S+ · VTO \d{2}\/\d{4}/);
  await expect(mail.getByRole("listitem", { name: "Listo: ahora" })).toBeVisible();
  await mail.getByRole("button", { name: /Cerrar/ }).click();
  // Pausado: pasar otro pedido a "Enviado" no manda "Va en camino".
  await page.goto("admin-demo/emails/");
  await page.getByRole("switch", { name: "Se envía solo: Va en camino" }).click();
  await expect(toast(page, "“Va en camino” pausado")).toBeVisible();
  await moveOrder(page, "VOL-000120", /^Enviado/);
  await expect(toast(page, /Pedido en “Enviado/)).toBeVisible();
  await page.goto("admin-demo/emails/enviados/");
  await expect(page.getByRole("region", { name: "Bandeja de salida" }).getByRole("button", { name: /VOL-000120 va en camino/ })).toHaveCount(0);
  // El detalle del pedido lista sus emails.
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000121");
  await expect(page.getByRole("button", { name: /VOL-000121 está listo para salir/ })).toBeVisible();
});

test.describe("editor en escritorio", () => {
  test.use({ viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false });
  // Con mouse, lejos de la barra lateral (se abre al pasar por encima y taparía el formulario).
  test.beforeEach(async ({ page }) => { await page.mouse.move(1400, 500); });

  test("insertar una ficha de dato, ver la vista previa con datos reales, guardar y mandar prueba", async ({ page }) => {
    await page.goto("admin-demo/emails/editar/?id=tpl-payment-approved");
    await page.getByLabel("Con el pedido").selectOption("VOL-000121");
    const text = page.getByRole("textbox", { name: "Texto 3" });
    await expect(text).toContainText("Fecha de entrega");
    await text.click();
    await page.keyboard.press("Control+End");
    await page.keyboard.type(" Total: ");
    await page.getByRole("button", { name: "Insertar Total del pedido" }).click();
    await expect(text.locator("[data-token='order.total']")).toHaveText("Total del pedido");
    const preview = page.getByRole("article", { name: /Email: Pago aprobado/ });
    await expect(preview).toContainText(/Total: \$\s?44\.810/);
    await expect(preview).not.toContainText("{");
    await page.getByRole("textbox", { name: "Asunto" }).click();
    await page.keyboard.press("End");
    await page.getByRole("button", { name: "Insertar Nombre del cliente" }).click();
    await expect(page.getByText("Cambios sin guardar")).toBeVisible();
    // Pegar algo copiado del editor conserva la ficha (no queda el nombre del dato como texto)
    await page.getByRole("textbox", { name: "Texto de vista previa" }).click();
    await page.evaluate(() => {
      const dt = new DataTransfer();
      dt.setData("application/x-volta-inline", JSON.stringify([{ kind: "text", text: " Para " }, { kind: "token", token: "customer.firstName" }]));
      dt.setData("text/plain", " Para Nombre del cliente");
      document.getElementById("e-preheader")!.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    await expect(page.locator("#e-preheader [data-token='customer.firstName']")).toBeVisible();
    await expect(page.getByText(/Ya lo estamos armando\. Para Julián/)).toBeVisible();
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(toast(page, "Plantilla guardada")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("textbox", { name: "Texto 3" }).locator("[data-token='order.total']")).toBeVisible();
    await page.getByRole("button", { name: "Celular", exact: true }).click();
    await page.getByRole("button", { name: "Enviar prueba" }).click();
    await expect(toast(page, "Prueba en la bandeja de salida")).toBeVisible();
    await page.goto("admin-demo/emails/enviados/");
    await expect(page.getByRole("region", { name: "Bandeja de salida" }).getByText("Prueba").first()).toBeVisible();
  });

  test("“Listo para retirar” sale solo en retiros; sin ninguna forma de entrega no se guarda", async ({ page }) => {
    await page.goto("admin-demo/emails/editar/?id=tpl-ready-pickup");
    const options = page.getByLabel("Con el pedido").locator("option");
    await expect(options.first()).toHaveText(/VOL-\d+ · /);
    await expect(page.getByRole("checkbox", { name: "Retiro en el local" })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Cadete en Mar del Plata" })).not.toBeChecked();
    await expect(page.getByRole("article", { name: /listo para retirar/ })).toContainText("Listo para retirar");
    await page.getByRole("checkbox", { name: "Retiro en el local" }).uncheck();
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Elegí al menos una forma de entrega" })).toBeVisible();
  });

  test("aviso de recompra: la vista previa usa el producto de una compra real y la prueba llega a la bandeja", async ({ page }) => {
    await page.goto("admin-demo/emails/editar/?id=tpl-repurchase");
    await page.getByLabel("Con la compra").selectOption("VOL-000121");
    const preview = page.getByRole("article", { name: /Email: Julián, tu Creatina monohidrato micronizada se está por terminar/ });
    await expect(preview).toContainText("Se termina cerca del sábado, 9 de enero");
    await expect(preview.getByRole("link", { name: "Volver a pedirlo" })).toHaveAttribute("href", /\/p\/creatina-monohidrato\/$/);
    await expect(page.getByRole("button", { name: "Insertar Producto que se termina" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Insertar Código del pedido" })).toHaveCount(0);
    await page.getByRole("button", { name: "Enviar prueba" }).click();
    await expect(toast(page, "Prueba en la bandeja de salida")).toBeVisible();
    await page.goto("admin-demo/emails/enviados/");
    await page.getByLabel("Momento").selectOption({ label: "Se le termina el pote" });
    await expect(page.getByRole("region", { name: "Bandeja de salida" }).getByRole("button", { name: /tu Creatina monohidrato micronizada se está por terminar/ })).toBeVisible();
  });
});
