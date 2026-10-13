import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/**
 * R2 · checkout en 3 pasos (Datos y entrega · Pago · Revisar): el ticket fijo a la derecha en escritorio y plegable en
 * el celular, el cupón una sola vez, la fecha real del calendario del cadete por forma de entrega y el total arriba de
 * confirmar. Reemplaza los tests del checkout de 4 pasos de Velmar (8.2.9: resumen debajo de cada paso).
 */

async function toCheckout(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("volta-demo:cart", JSON.stringify({ state: { lines: [{ id: "l1", productSlug: "overvolt-pre", variantId: "ov-frutos-rojos-300", quantity: 2 }] }, version: 0 }));
  });
  await page.goto("checkout/");
  await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
  await page.getByLabel("Email").fill("juana@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
}

/** Abre el ticket si está plegado (celular). */
async function openTicket(page: Page) {
  const toggle = page.getByRole("button", { name: /Ver ticket/ });
  if (await toggle.isVisible()) await toggle.click();
}

for (const width of [1180, 390]) {
  test(`R2 a ${width}px: 3 pasos con la fecha del calendario, ticket con el cupón una vez y el total arriba de confirmar`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await toCheckout(page);
    const steps = page.getByRole("list", { name: "Pasos" }).getByRole("listitem");
    await expect(steps).toHaveCount(3);
    await expect(steps.nth(0)).toContainText("Datos y entrega");
    await expect(page.getByRole("heading", { level: 2, name: "Datos y entrega" })).toBeVisible();
    // Cada forma de entrega con su fecha real (lunes 5/10: cadete y retiro el martes; correo entre el vie 9 y el vie 16).
    await expect(page.locator("label", { hasText: "Cadete en Mar del Plata" })).toContainText("Llega mañana, mar 6 oct");
    await expect(page.locator("label", { hasText: "Retiro en el local" })).toContainText("Retiralo desde mañana, mar 6 oct");
    await expect(page.locator("label", { hasText: "Envío al resto del país" })).toContainText("Llega entre el vie, 9 oct y el vie, 16 oct");
    // El ticket: a la derecha en escritorio, plegado arriba en el celular.
    const summary = page.getByRole("region", { name: "Resumen de tu compra" });
    if (width < 1024) {
      await expect(summary).toBeHidden();
      await openTicket(page);
    }
    await expect(summary).toBeVisible();
    await expect(summary.getByText("2 × Overvolt pre-entreno")).toBeVisible();
    if (width >= 1024) {
      const [form, ticket] = await Promise.all([page.locator("main form").first().boundingBox(), summary.boundingBox()]);
      expect(ticket!.x).toBeGreaterThan(form!.x + form!.width - 1);
    }
    // El cupón aparece una sola vez en todo el checkout.
    await expect(page.getByRole("region", { name: "Cupón del pedido" })).toHaveCount(1);
    await expect(page.getByLabel("¿Tenés un código?")).toHaveCount(1);
    await page.getByText("Cadete en Mar del Plata").click();
    await expect(summary.getByText("Llega mañana, mar 6 oct")).toBeVisible();
    await page.getByLabel("Calle").fill("Güemes");
    await page.getByLabel("Altura").fill("2500");
    await page.getByLabel("Código postal").fill("7600");
    await page.getByRole("button", { name: "Continuar al pago" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Pago" })).toBeVisible();
    // El descuento por transferencia se lee como cifra en la opción y baja el total del ticket.
    await expect(page.locator("label", { hasText: "Transferencia bancaria" })).toContainText(/ahorrás \$\s?7\.380/);
    const total = () => summary.locator("dd").last().textContent();
    await page.getByText("Tarjetas de débito, crédito y prepagas", { exact: true }).click();
    const withCard = await total();
    await page.getByText("Transferencia bancaria").click();
    await expect(summary.getByText("Descuento transferencia/QR")).toBeVisible();
    expect(await total()).not.toBe(withCard);
    await page.getByRole("button", { name: "Revisar pedido" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Revisar" })).toBeVisible();
    // Revisar: la fecha de la entrega y el total justo arriba de confirmar.
    await expect(page.getByText("Llega mañana, mar 6 oct").first()).toBeVisible();
    const pay = page.getByText("Total a pagar");
    const confirm = page.getByRole("button", { name: "Confirmar pedido" });
    expect((await pay.boundingBox())!.y).toBeLessThan((await confirm.boundingBox())!.y);
    // "Cambiar" en Entrega vuelve al primer paso con lo cargado.
    await page.getByRole("button", { name: "Cambiar entrega" }).click();
    await expect(page.getByLabel("Calle")).toHaveValue("Güemes");
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}

test("8.2.10 tarjetas de débito, crédito y prepagas: se entiende cómo se pagaría y en la demo no se cobra", async ({ page }) => {
  await toCheckout(page);
  await page.getByText("Retiro en el local").click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  const card = page.locator("label", { hasText: "Tarjetas de débito, crédito y prepagas" });
  await expect(card).toContainText("Pagá con tarjeta de débito, crédito o prepaga de forma segura. En esta demostración no se realiza ningún cobro real.");
  await expect(card).toContainText("vía Mercado Pago");
  // Siguen transferencia y QR con aprobación manual, y el aviso de que nada cobra.
  await expect(page.getByText("Transferencia bancaria")).toBeVisible();
  await expect(page.getByText("QR", { exact: true })).toBeVisible();
  await expect(page.getByText(/ningún medio cobra de verdad/)).toBeVisible();
  await card.click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await expect(page.getByText(/Tarjeta de débito, crédito o prepaga, vía Mercado Pago \(muestra\)/)).toBeVisible();
});

test("R2 la dirección solo se pide con envío y el código postal sin cadete se avisa en el mismo paso", async ({ page }) => {
  await toCheckout(page);
  await page.getByText("Cadete en Mar del Plata").click();
  await page.getByLabel("Calle").fill("Corrientes");
  await page.getByLabel("Altura").fill("1000");
  await page.getByLabel("Código postal").fill("1000");
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await expect(page.getByText(/Ese código postal no tiene cadete/)).toBeVisible();
  await page.getByText("Retiro en el local").click();
  await expect(page.getByLabel("Calle")).toHaveCount(0);
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Pago" })).toBeVisible();
});
