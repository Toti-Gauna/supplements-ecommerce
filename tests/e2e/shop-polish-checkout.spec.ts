import { expect, test, type Page } from "@playwright/test";

/** Polish 8.2 · Lote 5: resumen y total debajo del paso, botones Atrás/Siguiente en su lugar y opción de tarjetas. */

async function toCheckout(page: Page) {
  // Un producto en el carrito y un premio de la ruleta ya guardado (así no se abre la ruleta antes del checkout).
  await page.addInitScript(() => {
    localStorage.setItem("volta-demo:cart", JSON.stringify({ state: { lines: [{ id: "l1", productSlug: "vela-en-lata", variantId: "vel-patria", quantity: 2 }] }, version: 0 }));
    localStorage.setItem("volta-demo:account", JSON.stringify({ state: { wheelPrize: { code: "DEMO", label: "Premio", at: "2026-10-10T12:00:00.000Z" } }, version: 0 }));
  });
  await page.goto("checkout/");
  await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
  await page.getByLabel("Email").fill("juana@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
}

/** El resumen va después de los botones del paso y el total se lee ahí. */
const layout = (page: Page) => page.evaluate(() => {
  const summary = document.querySelector("section[aria-label='Resumen de tu compra']")!.getBoundingClientRect();
  const buttons = [...document.querySelectorAll("main form button")].filter((b) => /Atrás|Continuar|Revisar|Confirmar/.test(b.textContent ?? "")).map((b) => ({ t: b.textContent?.trim(), x: Math.round(b.getBoundingClientRect().x), bottom: b.getBoundingClientRect().bottom }));
  const fieldsets = [...document.querySelectorAll("main form fieldset")].map((f) => f.getBoundingClientRect().bottom);
  return { summaryTop: summary.top, buttons, optionsBottom: Math.max(0, ...fieldsets) };
});

for (const width of [1180, 390]) {
  test(`8.2.9 a ${width}px: el resumen va debajo de las opciones de cada paso y se actualiza; Atrás y Siguiente en su lugar`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await toCheckout(page);
    const summary = page.getByRole("region", { name: "Resumen de tu compra" });
    await expect(summary).toBeVisible();
    await expect(summary.getByText("2 × Vela en lata pintada")).toBeVisible();
    let l = await layout(page);
    expect(l.summaryTop).toBeGreaterThan(l.optionsBottom);
    await page.getByRole("button", { name: "Continuar a la entrega" }).click();
    await expect(summary.getByText("Elegí la entrega")).toBeVisible();
    await page.getByText("Envío al resto del país").click();
    await expect(summary.getByText("Elegí la entrega")).toHaveCount(0);
    l = await layout(page);
    expect(l.summaryTop).toBeGreaterThan(l.optionsBottom);
    // Atrás primero, después Siguiente, en la misma fila y antes del resumen.
    expect(l.buttons.map((b) => b.t)).toEqual(["Atrás", "Continuar al pago"]);
    expect(l.buttons[0]!.x).toBeLessThan(l.buttons[1]!.x);
    expect(l.summaryTop).toBeGreaterThan(Math.max(...l.buttons.map((b) => b.bottom)));
    await page.getByLabel("Calle").fill("Güemes");
    await page.getByLabel("Altura").fill("2500");
    await page.getByLabel("Código postal").fill("1000");
    await page.getByLabel("Ciudad").fill("CABA");
    await page.getByLabel("Provincia").fill("Buenos Aires");
    await page.getByRole("button", { name: "Continuar al pago" }).click();
    // Medio de pago: con transferencia aparece el descuento y baja el total; con tarjeta, no.
    const total = () => summary.locator("dd").last().textContent();
    await page.getByText("Tarjetas de débito, crédito y prepagas", { exact: true }).click();
    const withCard = await total();
    await expect(summary.getByText("Descuento transferencia/QR")).toHaveCount(0);
    await page.getByText("Transferencia bancaria").click();
    await expect(summary.getByText("Descuento transferencia/QR")).toBeVisible();
    expect(await total()).not.toBe(withCard);
    await page.getByText("Tarjetas de débito, crédito y prepagas", { exact: true }).click();
    await expect(summary.getByText("Descuento transferencia/QR")).toHaveCount(0);
    expect(await total()).toBe(withCard);
    l = await layout(page);
    expect(l.buttons.map((b) => b.t)).toEqual(["Atrás", "Revisar pedido"]);
    expect(l.summaryTop).toBeGreaterThan(Math.max(...l.buttons.map((b) => b.bottom)));
  });
}

test("8.2.10 tarjetas de débito, crédito y prepagas: se entiende cómo se pagaría y en la demo no se cobra", async ({ page }) => {
  await toCheckout(page);
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  await page.getByText("Retiro en persona").click();
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
