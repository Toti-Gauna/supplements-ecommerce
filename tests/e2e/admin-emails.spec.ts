import { expect, test, type Page } from "@playwright/test";
import { guardNetwork } from "./helpers";

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });

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

  await page.goto("admin-demo/emails/?vista=enviados");
  const inbox = page.getByRole("region", { name: "Bandeja de salida" });
  // Sin productos personalizados no hay email de "diseño recibido": la compra manda solo la confirmación.
  await expect(inbox.getByRole("button", { name: /VOL-DEMO-0001/ })).toHaveCount(1);
  await expect(inbox.getByRole("button", { name: /Recibimos tu diseño/ })).toHaveCount(0);
  await inbox.getByRole("button", { name: /¡Gracias por tu compra, .*VOL-DEMO-0001/ }).click();
  const mail = page.getByRole("dialog", { name: /Email: ¡Gracias por tu compra/ });
  await expect(mail.getByRole("article")).toContainText("1 × Overvolt pre-entreno");
  await expect(mail.getByRole("article")).toContainText("30 servicios");
  await expect(mail.getByText(/Simulado: en la demo no sale ningún email/)).toBeVisible();
  assertNoExternal();
});

test("pasar un pedido a producción manda su email; pausado no sale", async ({ page }) => {
  await page.goto("admin-demo/emails/");
  await page.getByRole("switch", { name: "Se envía solo: Listo para entregar" }).click();
  await expect(toast(page, "“Listo para entregar” pausado")).toBeVisible();
  await page.goto("admin-demo/produccion/");
  await page.getByRole("button", { name: "Pasar VOL-000113 a En máquina" }).click();
  await page.getByRole("group", { name: "Etapa" }).getByRole("button", { name: /^Terminación/ }).click();
  await page.getByRole("button", { name: "Pasar VOL-000115 a Listo" }).click();
  await expect(toast(page, "VOL-000115 pasó a “Listo”")).toBeVisible();
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000113");
  await expect(page.getByRole("button", { name: /VOL-000113 está en producción/ })).toBeVisible();
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000115");
  await expect(page.getByRole("button", { name: /VOL-000115 está listo/ })).toHaveCount(0);
});

test.describe("editor en escritorio", () => {
  test.use({ viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false });

  test("insertar una ficha de dato, ver la vista previa con datos reales, guardar y mandar prueba", async ({ page }) => {
    await page.goto("admin-demo/emails/editar/?id=tpl-payment-approved");
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
    // Asunto con otro dato
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
    await expect(page.getByText(/Ya entra al taller\. Para Julián/)).toBeVisible();
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(toast(page, "Plantilla guardada")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("textbox", { name: "Texto 3" }).locator("[data-token='order.total']")).toBeVisible();
    await page.getByRole("button", { name: "Celular", exact: true }).click();
    await page.getByRole("button", { name: "Enviar prueba" }).click();
    await expect(toast(page, "Prueba en la bandeja de salida")).toBeVisible();
    await page.goto("admin-demo/emails/?vista=enviados");
    await expect(page.getByRole("region", { name: "Bandeja de salida" }).getByText("Prueba").first()).toBeVisible();
  });
});

test("cumpleaños de mascota: el email sale desde los recordatorios de la ficha del cliente", async ({ page }) => {
  await page.goto("admin-demo/usuarios/ficha/?email=diego.a@ejemplo.com");
  // Las fichas de VOLTA no traen mascotas: se carga una desde el panel con el cumple dentro de los 60 días.
  const pets = page.getByRole("region", { name: "Mascotas" });
  await pets.getByLabel("Nombre").fill("Ñoqui");
  await pets.getByLabel("Día del cumpleaños").selectOption("10");
  await pets.getByLabel("Mes del cumpleaños").selectOption({ label: "octubre" });
  await pets.getByRole("button", { name: "Agregar" }).click();
  await expect(toast(page, "Ñoqui agregado a la ficha")).toBeVisible();
  const send = page.getByRole("button", { name: /Simular el email del día: Cumple de Ñoqui/ });
  await send.click();
  await expect(toast(page, "Email de cumpleaños en la bandeja de salida")).toBeVisible();
  await send.click();
  await expect(toast(page, "Ya salió este año")).toBeVisible();
  await page.goto("admin-demo/emails/?vista=enviados");
  await expect(page.getByRole("region", { name: "Bandeja de salida" }).getByRole("button", { name: /¡Feliz cumple, Ñoqui!/ })).toBeVisible();
});
