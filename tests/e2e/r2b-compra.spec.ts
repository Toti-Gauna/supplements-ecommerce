import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow, openCheckoutTicket } from "./helpers";

/**
 * R2b · comprar: el bolso con un solo medidor, "te dura" por línea y la cuenta regresiva del cadete; el checkout en 3
 * pasos con la fecha real y el cupón una sola vez; la confirmación como ficha de entrega que activa los avisos; el
 * seguimiento con el lote después del control del panel, y "Mi box" con baterías, Recomprar y Repetir pedido.
 */
const CART = { lines: [
  { id: "l1", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 },
  { id: "l2", productSlug: "overvolt-pre", variantId: "ov-frutos-rojos-300", quantity: 1 },
] };

const seedCart = (page: Page) => page.addInitScript((cart) => {
  if (sessionStorage.getItem("seeded")) return;
  sessionStorage.setItem("seeded", "1");
  localStorage.setItem("volta-demo:cart", JSON.stringify({ state: cart, version: 0 }));
}, CART);

/** Abre el bolso desde el header; el número del carrito aparece recién con React, así que también es la señal de hidratación. */
async function openBag(page: Page, count: number) {
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(async () => {
    if (!(await drawer.isVisible())) await page.getByRole("button", { name: `Carrito, ${count} productos` }).click({ timeout: 1000 });
    await expect(drawer).toBeVisible({ timeout: 1000 });
  }).toPass();
  return drawer;
}

/** Datos y entrega (cadete) → Pago → Revisar, con el medio de pago elegido. */
async function toReview(page: Page, pay: "Transferencia bancaria" | "Tarjetas de débito, crédito y prepagas") {
  await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
  await page.getByLabel("Email").fill("juana@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByText("Cadete en Mar del Plata").click();
  await page.getByLabel("Calle").fill("Güemes");
  await page.getByLabel("Altura").fill("2500");
  await page.getByLabel("Código postal").fill("7600");
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText(pay, { exact: true }).click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Revisar" })).toBeVisible();
}

async function confirmOrder(page: Page) {
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
}

test("bolso: un solo medidor de carga, te dura N días por línea y la cuenta regresiva del cadete", async ({ page }) => {
  await seedCart(page);
  await page.goto("");
  const drawer = await openBag(page, 2);
  // Un solo medidor (envío gratis + stack) en vez de dos baterías y un anillo.
  await expect(drawer.getByRole("progressbar")).toHaveCount(1);
  const goals = drawer.getByRole("list", { name: "Metas del bolso" });
  await expect(goals).toContainText("Envío gratis");
  await expect(goals).toContainText("faltan $ 28.200");
  await expect(goals).toContainText("1 categoría más");
  await expect(drawer.getByText("Te dura 30 días")).toBeVisible();
  await expect(drawer.getByText("Te dura 52 días")).toBeVisible();
  // El cadete: la fecha del calendario y cuánto falta para que cambie (a la medianoche del día de la demo).
  const cadete = drawer.getByRole("note", { name: "Cadete" });
  await expect(cadete).toContainText("llega mañana, mar 6 oct");
  await expect(cadete).toContainText(/si confirmás en las próximas (\d+ h( \d+ min)?|\d+ min|menos de 1 min)/);
  // Dos wheys: te dura el doble y el envío queda gratis.
  await drawer.getByRole("group", { name: "Cantidad de Ionic Whey 100%" }).getByRole("button", { name: "Sumar uno" }).click();
  await expect(drawer.getByText("Te dura 60 días")).toBeVisible();
  await expect(goals.getByText("Envío gratis")).toContainText("(listo)");
  await expect(drawer.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
});

test("checkout en 3 pasos: la fecha real del calendario en cada paso y el cupón una sola vez", async ({ page }) => {
  await seedCart(page);
  await page.goto("checkout/");
  const steps = page.getByRole("list", { name: "Pasos" }).getByRole("listitem");
  await expect(steps).toHaveText([/Datos y entrega/, /Pago/, /Revisar/]);
  await expect(page.locator("label", { hasText: "Cadete en Mar del Plata" })).toContainText("Llega mañana, mar 6 oct");
  await openCheckoutTicket(page);
  const ticket = page.getByRole("region", { name: "Resumen de tu compra" });
  await expect(ticket).toContainText("La fecha de entrega sale del calendario");
  const code = page.getByLabel("¿Tenés un código?");
  await code.fill("bienvenida10");
  await code.press("Enter");
  await expect(ticket.getByText("Cupón", { exact: true })).toBeVisible();
  await page.getByText("Cadete en Mar del Plata").click();
  await expect(ticket.getByText("Llega mañana, mar 6 oct")).toBeVisible();
  for (const step of ["Pago", "Revisar"]) {
    if (step === "Pago") {
      await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
      await page.getByLabel("Email").fill("juana@ejemplo.com");
      await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
      await page.getByLabel("Calle").fill("Güemes");
      await page.getByLabel("Altura").fill("2500");
      await page.getByLabel("Código postal").fill("7600");
      await page.getByRole("button", { name: "Continuar al pago" }).click();
    } else {
      await page.getByText("Transferencia bancaria").click();
      await page.getByRole("button", { name: "Revisar pedido" }).click();
    }
    await expect(page.getByRole("heading", { level: 2, name: step })).toBeVisible();
    // El cupón sigue aplicado y aparece una sola vez en todo el checkout.
    await expect(page.getByRole("region", { name: "Cupón del pedido" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: /^Quitar cupón BIENVENIDA10/ })).toHaveCount(1);
    await expect(ticket.getByText("Cupón", { exact: true })).toBeVisible();
  }
  const entrega = page.locator("dl").filter({ has: page.locator("dt", { hasText: "Entrega" }) });
  await expect(entrega).toContainText("Llega mañana, mar 6 oct");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("la confirmación es la ficha de entrega y activa los avisos de recompra que se ven en Mi box", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await seedCart(page);
  await page.goto("checkout/");
  await toReview(page, "Transferencia bancaria");
  await confirmOrder(page);
  const ficha = page.locator("section[aria-labelledby=ficha-entrega]");
  await expect(ficha.getByRole("heading", { name: "¡Listo, Juana!" })).toBeVisible();
  const field = (name: string) => ficha.locator("dl > div").filter({ has: page.locator("dt", { hasText: name }) });
  await expect(field("Estado")).toContainText("Pendiente de pago");
  await expect(field("Entrega")).toContainText("Llega mañana, mar 6 oct");
  await expect(ficha.locator("[aria-current=step]")).toContainText("Pago");
  // Avisos de recompra en un toque, uno por pote, contados desde el día que llega.
  const avisos = page.locator("section[aria-labelledby=avisos-recompra]");
  await expect(avisos.getByRole("listitem")).toHaveCount(2);
  await expect(avisos).toContainText("Ionic Whey 100%");
  await expect(avisos).toContainText("se termina 5 nov");
  await avisos.getByRole("button", { name: "Activar avisos de recompra" }).click();
  await expect(avisos.getByRole("status")).toContainText("Avisos activados.");
  await expect(page.getByText(/acreditad/i)).toHaveCount(0);
  await avisos.getByRole("link", { name: "Verlos en Mi box" }).click();
  await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click();
  const reminders = page.getByRole("list", { name: "Avisos de recompra" });
  await expect(reminders.getByRole("listitem")).toHaveCount(2);
  await expect(reminders).toContainText("Overvolt pre-entreno");
  assertNoExternal();
});

test("seguimiento: estados y fechas reales; el lote y el vencimiento aparecen después del control de lote del panel", async ({ page }) => {
  await seedCart(page);
  await page.goto("checkout/");
  await toReview(page, "Tarjetas de débito, crédito y prepagas");
  await confirmOrder(page);
  await page.getByRole("link", { name: "Seguir mi pedido", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Esperando tu comprobante" })).toBeVisible();
  const items = page.getByRole("region", { name: "Tu pedido", exact: true });
  await expect(items.getByText("Lote: se controla al armar tu pedido")).toHaveCount(2);
  await expect(page.getByText("Llega mañana, mar 6 oct, si el pago se confirma a tiempo")).toBeVisible();

  // En el panel: Mercado Pago confirma, se arma y el control de lote lo pasa a Listo.
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-DEMO-0001");
  await page.getByRole("button", { name: "Simular confirmación de Mercado Pago" }).click();
  await page.getByRole("button", { name: "Simular", exact: true }).click();
  await page.getByRole("button", { name: "En preparación", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar cambio" }).click();
  await page.getByRole("button", { name: "Listo", exact: true }).click();
  const lots = page.getByRole("dialog", { name: "Control de lote de VOL-DEMO-0001" });
  for (const box of await lots.getByRole("checkbox").all()) await box.check();
  await lots.getByRole("button", { name: "Listo para despachar" }).click();
  await expect(lots).toBeHidden();

  await page.goto("pedido/demo-volta/");
  await expect(page.getByRole("heading", { level: 2, name: "Listo", exact: true })).toBeVisible();
  const stages = page.getByRole("region", { name: "Etapas del pedido" });
  await expect(stages.locator("[aria-current=step]")).toContainText("Listo");
  await expect(stages.getByRole("listitem").filter({ hasText: /Pagado/ })).toContainText("5 oct");
  await expect(items.getByText("Lote y vencimiento de cada producto, controlados al armar tu pedido.")).toBeVisible();
  await expect(items.getByText("LOTE", { exact: true })).toHaveCount(2);
  await expect(items.getByText(/^VTO/)).toHaveCount(2);
});

test("Mi box: potes en uso como baterías, Recomprar, Repetir pedido y el nivel con su barra", async ({ page }) => {
  await page.goto("cuenta/");
  await expect(async () => {
    const enter = page.getByRole("button", { name: "Entrar a la cuenta demo" });
    if (await enter.isVisible()) await enter.click({ timeout: 1000 });
    await expect(page.getByRole("heading", { level: 2, name: "Mi box" })).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(page.getByRole("progressbar", { name: /Carga hacia el nivel Élite/ })).toBeVisible();
  const pots = page.getByRole("list", { name: "Potes en uso" }).getByRole("listitem");
  await expect(pots).toHaveCount(2);
  await expect(pots.first()).toContainText("Se termina esta semana");
  await expect(pots.first()).toContainText("Ionic Whey 100%");
  await expect(pots.first().getByRole("progressbar")).toHaveAttribute("aria-valuenow", "13");
  await pots.first().getByRole("button", { name: "Recomprar" }).click();
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(drawer.getByText("Agregaste Ionic Whey 100%")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await page.getByRole("button", { name: "Repetir mi último pedido" }).click();
  await expect(drawer.getByRole("list", { name: "Productos en el bolso" })).toContainText("Creatina monohidrato micronizada");
  await page.keyboard.press("Escape");
  await page.getByRole("navigation", { name: "Secciones de la cuenta" }).getByRole("link", { name: /^Mis pedidos/ }).click();
  await expect(page.getByRole("link", { name: "Seguir el pedido VOL-DEMO-0000" })).toBeVisible();
  await page.getByRole("button", { name: "Repetir el pedido VOL-DEMO-0000" }).click();
  // Recomprar + último pedido + repetir: la whey suma 3 en la misma línea.
  await expect(drawer.getByRole("group", { name: "Cantidad de Ionic Whey 100%" }).locator("output")).toHaveText("3");
});
