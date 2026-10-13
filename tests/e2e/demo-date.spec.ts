import { expect, test } from "@playwright/test";

/**
 * R0 · una sola fecha de demo (lunes 5/10/2026): el inicio, la ficha, el checkout, la confirmación y el seguimiento
 * prometen el mismo día, el que calcula el calendario de despachos (lo en stock sale al día hábil siguiente).
 */
test("la promesa del cadete es la misma en el inicio, la ficha y el seguimiento de ejemplo", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("region", { name: "Beneficios" })).toContainText("Pedí hoy y llega mañana, mar 6 oct");
  await expect(page.getByText(/Cadete en el día/)).toHaveCount(0);
  await page.goto("p/ionic-whey/");
  await expect(page.getByText("Lo despachamos mañana, martes 6 de octubre")).toBeVisible();
  await page.goto("pedido/demo-volta/");
  await expect(page.getByRole("heading", { level: 2, name: "Armando tu pedido", exact: true })).toBeVisible();
  await expect(page.getByText("Llega mañana, mar 6 oct", { exact: true })).toBeVisible();
  await expect(page.getByText(/8 y el vie 9 de oct/)).toHaveCount(0);
});

test("transferencia: la fecha del checkout queda en la confirmación y, con el comprobante, el seguimiento dice 'en revisión'", async ({ page }) => {
  await page.goto("p/creatina-monohidrato/");
  await page.locator("[data-buy-bar]").getByRole("button", { name: /Agregar al carrito/ }).click();
  await expect(page.getByRole("dialog", { name: "Carrito" })).toBeVisible();
  await page.goto("checkout/");
  await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
  await page.getByLabel("Email").fill("juana@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  const local = page.locator("label").filter({ hasText: "Cadete en Mar del Plata" });
  await expect(local).toContainText("Llega mañana, mar 6 oct");
  await expect(page.locator("label").filter({ hasText: "Retiro en el local" })).toContainText("Retiralo desde mañana, mar 6 oct");
  await local.click();
  await page.getByLabel("Calle").fill("Güemes");
  await page.getByLabel("Altura").fill("2500");
  await page.getByLabel("Código postal").fill("7600");
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Transferencia bancaria").click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await expect(page.getByText(/Cadete en Mar del Plata · Llega mañana, mar 6 oct/)).toBeVisible();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido de demostración" }).click();

  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
  await expect(page.getByText(/Entrega: Llega mañana, mar 6 oct/)).toBeVisible();
  await page.getByLabel("Subir comprobante").setInputFiles({ name: "comprobante.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 demo") });
  await expect(page.getByText(/Estado de muestra: comprobante en revisión/)).toBeVisible();

  await page.getByRole("link", { name: "Seguir mi pedido", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Revisando tu pago", exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Comprobante recibido" })).toBeVisible();
  const stages = page.getByRole("region", { name: "Etapas del pedido" });
  await expect(stages.locator("[aria-current=step]")).toContainText("Pago en revisión");
  await expect(stages.getByRole("listitem").filter({ hasText: /^Pagado/ })).not.toContainText("5 oct");
  await expect(stages.getByRole("listitem").first()).toContainText("5 oct");
  await expect(page.getByText("Llega mañana, mar 6 oct, si el pago se confirma a tiempo")).toBeVisible();
});
