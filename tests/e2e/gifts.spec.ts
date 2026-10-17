import { expect, test, type Page } from "@playwright/test";
import { sampleGifts } from "../../src/demo/fixtures/gifts";
import { guardNetwork, horizontalOverflow } from "./helpers";

/** Checkout de demostración como invitado, con retiro y transferencia (lo mínimo para confirmar). */
async function checkout(page: Page) {
  await page.getByLabel("Nombre y apellido").fill("Lucía Gómez");
  await page.getByLabel("Email").fill("lucia@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByText("Retiro en el local").first().click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Transferencia bancaria").click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
}

test("regalar: ficha → carrito → checkout → link que se abre a golpes, sin precio", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("p/bcaa-211/");
  await page.getByRole("button", { name: "Regalar ahora" }).click();
  const sheet = page.getByRole("dialog", { name: "Es para regalar" });
  // Sin "para quién" no se puede seguir y el foco vuelve al campo
  await sheet.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  await expect(sheet.getByText("Escribí para quién es el regalo.").first()).toBeVisible();
  await expect(sheet.getByLabel("Para", { exact: true })).toBeFocused();
  await sheet.getByLabel("Para", { exact: true }).fill("Sofía");
  await sheet.getByLabel("De parte de").fill("Lucía");
  await sheet.getByLabel("Mensaje").fill("¡Feliz Navidad! Para que arranques el 2027 con todo 🎄");
  await sheet.getByLabel("Ocasión").selectOption("navidad");
  await expect(sheet.getByText("Lo abre a golpes contra una bolsa navideña con moño y gorrito.")).toBeVisible();
  await sheet.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  await expect(page.getByRole("dialog", { name: "Carrito" })).toBeVisible();

  await page.goto("carrito/");
  await expect(page.getByText("Regalo para Sofía · de Lucía")).toBeVisible();
  await page.getByRole("button", { name: "Continuar al checkout" }).click();
  await checkout(page);

  // Confirmación: el regalo listo para mandar con su código y su link
  const ready = page.getByRole("region", { name: "Tu regalo, listo para mandar" });
  await expect(ready).toBeVisible();
  const code = (await ready.getByRole("button", { name: /Copiar código REGALO-/ }).textContent())!.trim();
  expect(code).toMatch(/^REGALO-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
  const whatsapp = await ready.getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href");
  expect(decodeURIComponent(whatsapp!)).toContain(code);
  const href = await ready.getByRole("link", { name: "Ver cómo lo recibe" }).getAttribute("href");
  const link = href!.replace("&vista=previa", "");

  // Quien lo recibe (otro navegador): todo oscuro y la apertura de Navidad (el árbol de discos, R3b) para abrir de a un disco
  const other = await page.context().browser()!.newContext({ viewport: page.viewportSize()!, isMobile: true, hasTouch: true, locale: "es-AR", reducedMotion: "no-preference" });
  const friend = await other.newPage();
  await friend.goto(new URL(link, page.url()).toString());
  await friend.keyboard.press("Escape");
  const stage = friend.getByRole("dialog", { name: "Regalo de Lucía para Sofía" });
  await expect(stage.getByText("Sacá el primer disco")).toBeVisible();
  await expect(stage.locator("[data-variant]")).toHaveAttribute("data-variant", "navidad");
  const gift = stage.getByRole("button", { name: /Sacá un disco del árbol para abrir el regalo/ });
  for (let i = 0; i < 5; i++) await gift.click();
  await expect(stage.getByText("Regalo de Lucía")).toBeVisible({ timeout: 6000 });
  await expect(stage.getByRole("heading", { name: "BCAA 2:1:1" })).toBeVisible();
  await expect(stage.getByText("¡Feliz Navidad! Para que arranques el 2027 con todo 🎄")).toBeVisible();
  await expect(stage.getByText(/\$\s?\d/)).toHaveCount(0);
  await stage.getByRole("button", { name: "Guardá tu regalo" }).click();
  await expect(stage.getByRole("link", { name: "Está en mis regalos" })).toBeVisible();
  expect(await horizontalOverflow(friend)).toBeLessThanOrEqual(0);
  await other.close();
  assertNoExternal();
});

test("regalo en la cuenta y con código: se abre sin el link", async ({ page }) => {
  await page.goto("cuenta/");
  await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click();
  await page.getByRole("link", { name: "Mis regalos" }).click();
  await page.getByRole("link", { name: /Sin abrir · de Lucía/ }).click();
  const stage = page.getByRole("dialog", { name: "Regalo de Lucía para Sofía" });
  // Con "reducir movimiento" (por defecto en los e2e) aparece enseguida "Abrirlo de una vez"
  await stage.getByRole("button", { name: "Abrirlo de una vez" }).click();
  await expect(stage.getByText("¡Feliz día, ma!", { exact: false })).toBeVisible();
  await expect(stage.getByRole("link", { name: "Está en mis regalos" })).toBeVisible();
  await stage.getByRole("button", { name: "Salir" }).click();
  // El hash abre directo la tarjeta de regalos.
  await page.goto("cuenta/#regalos");
  await expect(page.getByRole("link", { name: /Abierto · de Lucía/ })).toBeVisible();

  // Con el código escrito a mano (minúsculas, sin guiones) también abre; uno inventado avisa
  await page.goto("regalo/");
  await page.getByLabel("Código del regalo").fill("regalo p3xe 1kcp");
  await page.getByRole("button", { name: "Abrir regalo" }).click();
  await expect(page.getByRole("dialog", { name: "Regalo de Lucía para Sofía" })).toBeVisible();
  await page.goto("regalo/");
  await page.getByLabel("Código del regalo").fill("REGALO-AAAA-AAAA");
  await page.getByRole("button", { name: "Abrir regalo" }).click();
  await expect(page.getByText(/Revisá el código/)).toBeVisible();
});

test("un link de regalo cortado o editado no abre nada", async ({ page }) => {
  await page.goto("regalo/?g=eyJ2IjoxfQ");
  await expect(page.getByRole("heading", { level: 1, name: "No pudimos abrir ese regalo" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("los regalos de prueba se abren con su código, cada uno con la bolsa de su ocasión", async ({ page }) => {
  test.setTimeout(120_000);
  for (const g of sampleGifts) {
    await page.goto(`regalo/?c=${g.code}`);
    const stage = page.getByRole("dialog", { name: `Regalo de ${g.from} para ${g.to}` });
    await expect(stage.locator("[data-variant]"), g.occasion).toHaveAttribute("data-variant", g.occasion);
    await stage.getByRole("button", { name: "Abrirlo de una vez" }).click();
    await expect(stage.getByText(g.message, { exact: false }), g.occasion).toBeVisible();
    await expect(stage.getByRole("heading", { name: g.item.name })).toBeVisible();
  }
});
