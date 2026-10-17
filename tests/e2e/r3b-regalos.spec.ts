import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/** R3b (parte A): gift card con monto, sabor abierto para quien recibe, tarjeta para WhatsApp, Mis regalos y el panel. */

const builder = (page: Page) => page.getByRole("dialog", { name: "Regalá energía" });

/** La ficha es HTML estático: hasta que React la toma, "Regalar ahora" no abre nada (se reintenta). */
async function openBuilder(page: Page, slug: string) {
  await page.goto(`p/${slug}/`);
  const button = page.getByRole("region", { name: "Elegí sabor, tamaño y cantidad" }).getByRole("button", { name: "Regalar ahora" });
  await expect(async () => {
    if (!(await builder(page).isVisible())) await button.click({ timeout: 1000 });
    await expect(builder(page)).toBeVisible({ timeout: 1000 });
  }).toPass();
  return builder(page);
}

/** Checkout como invitado hasta "Revisar" (retiro y transferencia); `beforePay` corre en el paso Pago. */
async function checkout(page: Page, beforePay?: () => Promise<void>) {
  await page.getByLabel("Nombre y apellido").fill("Lucía Gómez");
  await page.getByLabel("Email").fill("lucia@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByText("Retiro en el local").first().click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  if (beforePay) await beforePay();
  await page.getByText("Transferencia bancaria").click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
}

/** Una fila del panel (tabla en escritorio, tarjeta en el celular). */
const panelItem = (page: Page, table: string, text: string | RegExp) =>
  page.locator(`section[aria-label='${table}']`).locator("tr, li").filter({ hasText: text }).filter({ visible: true }).first();

const wheelSeen = (page: Page) => page.addInitScript(() => {
  localStorage.setItem("volta-demo:account", JSON.stringify({ state: { wheelPrize: { code: "DEMO", label: "Premio", at: "2026-10-05T12:00:00.000Z" } }, version: 0 }));
});

test("gift card: se compra con monto, se emite con 12 meses y su saldo se usa en el checkout (descuento, no pago)", async ({ page }) => {
  test.setTimeout(90_000);
  const assertNoExternal = guardNetwork(page);
  await wheelSeen(page);
  const modal = await openBuilder(page, "ionic-whey");
  await modal.getByText("Gift card con monto").click();
  await modal.getByLabel("Otro monto").fill("2000");
  await modal.getByLabel("Para", { exact: true }).fill("Juli");
  await modal.getByLabel("De parte de").fill("Caro");
  await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  await expect(modal.getByText(/^El mínimo es \$\s5\.000\.$/).first()).toBeVisible();
  await modal.getByLabel("Otro monto").fill("");
  await modal.getByText(/^\$\s40\.000$/).click();
  await modal.getByRole("button", { name: "Regalar y pagar ahora" }).click();
  await expect(page).toHaveURL(/checkout\/$/);
  await checkout(page);
  const ready = page.getByRole("region", { name: "Tu regalo, listo para mandar" });
  await expect(ready.getByText(/^Para Juli · Gift card de \$\s40\.000$/)).toBeVisible();
  await expect(page.getByText(/pago acreditado/i)).toHaveCount(0);

  // En el panel: emitida con todo el saldo, vence en 12 meses.
  await page.goto("admin-demo/regalos/");
  const row = panelItem(page, "Gift cards", /Juli.*de Caro/);
  await expect(row).toContainText("Sin usar");
  await expect(row).toContainText("5 de oct de 2027");
  const code = (await row.locator("text=/GIFT-[0-9A-Z]{4}-[0-9A-Z]{4}/").first().textContent())!.trim();

  // Otra compra: la gift card paga parte del total como renglón de descuento; una vencida avisa.
  await page.goto("p/overvolt-pre/");
  await expect(async () => {
    await page.getByRole("region", { name: "Elegí sabor, tamaño y cantidad" }).getByRole("button", { name: "Comprar ahora" }).click({ timeout: 1000 });
    await expect(page).toHaveURL(/checkout\/$/, { timeout: 1000 });
  }).toPass();
  await checkout(page, async () => {
    const field = page.getByLabel("¿Tenés una gift card?");
    await field.fill("GIFT-VENC-1D4N");
    await page.getByRole("button", { name: "Aplicar" }).click();
    await expect(page.getByText("Esa gift card venció el 20/09/2026.")).toBeVisible();
    await field.fill(code.toLowerCase());
    await page.getByRole("button", { name: "Aplicar" }).click();
    const applied = page.getByRole("region", { name: "Gift card aplicada" });
    await expect(applied).toContainText(code);
    await expect(applied).toContainText("La gift card cubre todo el pedido.");
  });
  // Con la transferencia (−10 %) el total baja: se usa solo lo necesario y el resto queda como saldo.
  await expect(page.getByRole("region", { name: "Tu pedido" }).getByText("Saldo de gift card")).toBeVisible();
  await page.goto("admin-demo/regalos/");
  const used = panelItem(page, "Gift cards", code);
  await expect(used).toContainText("Con saldo");
  await expect(used).toContainText(/VOL-DEMO-0001 \(\$\s33\.210\)/);
  await expect(used).toContainText(/\$\s6\.790/);
  assertNoExternal();
});

test("sabor abierto: quien regala lo deja abierto, quien recibe lo elige después de abrir (con stock) y el panel lo muestra", async ({ page }) => {
  test.setTimeout(90_000);
  await wheelSeen(page);
  const modal = await openBuilder(page, "ionic-whey");
  await modal.getByLabel("Para", { exact: true }).fill("Mora");
  await modal.getByLabel("De parte de").fill("Lucía");
  await modal.getByText("Que elija el sabor").click();
  await modal.getByText("Que elija el tamaño").click();
  // Regla del precio: se cobra la opción más cara de las que puede elegir (el tamaño grande).
  await expect(modal.getByText(/Se cobra .*5 lb \(2,27 kg\), la más cara de las que puede elegir/)).toBeVisible();
  await modal.getByText("Locker", { exact: true }).click();
  await expect(modal.getByRole("textbox", { name: "Combinación" })).toHaveValue("0510");
  await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  await page.goto("checkout/");
  await checkout(page);
  const ready = page.getByRole("region", { name: "Tu regalo, listo para mandar" });
  await expect(ready.getByText("Lo abre con la combinación de un locker.")).toBeVisible();
  const href = (await ready.getByRole("link", { name: "Ver cómo lo recibe" }).getAttribute("href"))!.replace("&vista=previa", "");

  await page.goto(new URL(href, page.url()).toString());
  const stage = page.getByRole("dialog", { name: "Regalo de Lucía para Mora" });
  await stage.getByRole("button", { name: "Abrirlo de una vez" }).click();
  await expect(stage.getByRole("heading", { name: "Ionic Whey 100%" })).toBeVisible();
  await expect(stage.getByText(/\$\s?\d/)).toHaveCount(0);
  await stage.getByRole("button", { name: "Guardar en mis regalos" }).click();
  // Guardar pide elegir primero; Frutilla de 5 lb no tiene stock.
  await expect(stage.getByRole("heading", { name: "Elegí tu sabor y tamaño" })).toBeVisible();
  await expect(stage.getByRole("radio", { name: /Frutilla · 5 lb/ })).toBeDisabled();
  await stage.getByRole("button", { name: /^Confirmar/ }).click();
  await expect(stage.getByText("Elegí una opción.")).toBeVisible();
  await stage.getByText("Cookies & cream · 2 lb (907 g)").click();
  await stage.getByRole("button", { name: "Confirmar Cookies & cream · 2 lb (907 g)" }).click();
  await expect(stage.getByText("Elegiste Cookies & cream · 2 lb (907 g)")).toBeVisible();
  await expect(stage.getByRole("link", { name: "Está en mis regalos" })).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  await page.goto("admin-demo/regalos/?ver=regalos");
  const row = panelItem(page, "Regalos", "Lucía → Mora");
  await expect(row).toContainText("Canjeado");
  await expect(row).toContainText("Cookies & cream · 2 lb (907 g)");
});

test("la tarjeta se manda por WhatsApp como imagen: PNG 4:5 (descarga si no hay hoja de compartir)", async ({ page }) => {
  await wheelSeen(page);
  const modal = await openBuilder(page, "overvolt-pre");
  await modal.getByLabel("Para", { exact: true }).fill("Mati");
  await modal.getByLabel("De parte de").fill("Flor");
  await modal.getByLabel("Mensaje").fill("¡A romperla!");
  await modal.getByText("Podio", { exact: true }).click();
  await expect(modal.getByRole("img", { name: /^Tarjeta para Mati, de Flor\. “¡A romperla!”/ })).toBeVisible();
  await modal.getByRole("button", { name: "Regalar y pagar ahora" }).click();
  await checkout(page);
  const ready = page.getByRole("region", { name: "Tu regalo, listo para mandar" });
  await expect(ready.getByRole("img", { name: /REGALO-[0-9A-Z]{4}-[0-9A-Z]{4}$/ })).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent("download"), ready.getByRole("button", { name: "Mandar la tarjeta" }).click()]);
  expect(download.suggestedFilename()).toMatch(/^regalo-mati-regalo-[0-9a-z]{4}-[0-9a-z]{4}\.png$/);
  const png = readFileSync((await download.path())!);
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1080, 1350]);
  await expect(page.getByText("Tarjeta descargada")).toBeVisible();
  const whatsapp = decodeURIComponent((await ready.getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href"))!);
  expect(whatsapp).toContain("/regalo/?g=");
});

test("Mis regalos: gift card con saldo, y los que hice con su estado (enviado, abierto, sabor elegido, canjeado)", async ({ page }) => {
  const item = { slug: "ionic-whey", name: "Ionic Whey 100%", variant: "Sabor a elección", variantId: "iw-chocolate-2lb" };
  const sent = [
    { code: "REGALO-CH0C-01TT", to: "Juli", openChoice: { flavor: true } },
    { code: "REGALO-T4M4-N0X2", to: "Juanma", openChoice: { flavor: true, size: true } },
    { code: "REGALO-SAB0-R01D", to: "Fran", openChoice: { flavor: true } },
    { code: "REGALO-P3XE-1KCP", to: "Sofía" },
  ].map((g) => ({ ...g, from: "Sofía", message: "", occasion: "volta", createdAt: "2026-10-01T12:00:00.000Z", item }));
  await page.addInitScript((list) => {
    localStorage.setItem("volta-demo:gifts", JSON.stringify({ state: { sent: list, saved: [], opened: [] }, version: 0 }));
    localStorage.setItem("volta-demo:account", JSON.stringify({ state: { user: { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" } }, version: 0 }));
  }, sent);
  await page.goto("cuenta/#regalos");
  const wallet = page.getByRole("list", { name: "Mis gift cards" });
  await expect(wallet.getByRole("img", { name: /6\.600/ })).toBeVisible();
  await expect(wallet).toContainText("GIFT-M4RC-0SAG");
  const mine = page.getByRole("region", { name: "Regalos que hice" });
  for (const [to, state] of [["Juli", "Canjeado"], ["Juanma", "Sabor y tamaño elegidos"], ["Fran", "Abierto"], ["Sofía", "Enviado"]]) {
    await expect(mine.getByRole("listitem").filter({ hasText: `Para ${to} ·` }).getByRole("list", { name: `Estado: ${state}` })).toBeVisible();
  }
  await expect(mine.getByRole("listitem").filter({ hasText: "Para Juli ·" })).toContainText("eligió Cookies & cream · 2 lb (907 g)");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("panel: gift cards emitidas y canjeadas con saldo y vencimiento, y el sabor elegido en cada regalo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("admin-demo/marketing/");
  await page.getByRole("list", { name: "Herramientas de marketing" }).getByRole("link", { name: /Regalos y gift cards/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Regalos y gift cards" })).toBeVisible();
  const stats = page.getByRole("group", { name: "Resumen de gift cards" });
  await expect(stats).toContainText(/106\.600/);
  await expect(stats).toContainText(/33\.400/);
  await page.getByLabel("Estado", { exact: true }).first().selectOption("vencida");
  await expect(panelItem(page, "Gift cards", "GIFT-VENC-1D4N")).toContainText(/venció hace \d+ días/);
  await expect(panelItem(page, "Gift cards", "GIFT-M4RC-0SAG")).toBeHidden();
  await page.getByRole("button", { name: /^Regalos/ }).click();
  await expect(panelItem(page, "Regalos", "REGALO-CH0C-01TT")).toContainText("Cookies & cream · 2 lb (907 g)");
  await expect(panelItem(page, "Regalos", "REGALO-SAB0-R01D")).toContainText("Falta elegir");
});

test("la taquilla: el arte a un lado y la entrada al otro, nunca un formulario centrado; los códigos de prueba abren", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("regalo/");
  await expect(page.getByRole("img", { name: /Taquilla de regalos/ })).toBeVisible();
  const ticket = (await page.getByRole("form", { name: "Entrada con código" }).boundingBox())!;
  expect(ticket.x).toBeGreaterThan(1440 * 0.5);
  await page.getByRole("link", { name: /REGALO-GC0S-0F1D/ }).click();
  const stage = page.getByRole("dialog", { name: "Regalo de Gaby para Agus" });
  await stage.getByRole("button", { name: "Abrirlo de una vez" }).click();
  await stage.getByRole("button", { name: "Ver mi gift card" }).click();
  await expect(stage.getByRole("img", { name: /60\.000/ })).toBeVisible();
  await expect(stage.getByText("GIFT-EQV1-P0ZR")).toBeVisible();
});
