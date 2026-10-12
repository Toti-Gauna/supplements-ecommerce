import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.29: Ajustes por tarjetas, sin el bloque de Marca. */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("volta-demo:admin") ?? "null")?.state?.data ?? null);
const SUBPAGES = ["contacto", "pagos", "cobro", "envios"] as const;

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1240, 400); });

  test("8.3.29 Ajustes ofrece cuatro tarjetas, sin Marca ni selectores de paleta; cada una abre solo su configuración", async ({ page }) => {
    await page.goto("admin-demo/ajustes/");
    const cards = page.getByRole("list", { name: "Partes de los ajustes" });
    for (const name of ["Contacto y WhatsApp", "Medios de pago", "Datos de cobro", "Envíos y retiro"]) await expect(cards.getByRole("link", { name: new RegExp(name) })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/Marca|paleta/i);
    await expect(page.getByRole("button", { name: /Guardar/ })).toHaveCount(0);
    for (const sub of SUBPAGES) {
      await page.goto(`admin-demo/ajustes/${sub}/`);
      await expect(page.getByRole("link", { name: "Volver a Ajustes" })).toBeVisible();
      await expect(page.locator("input[type=color]")).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^Guardar/ })).toHaveCount(1);
    }
    await cards.page().goto("admin-demo/ajustes/");
    await cards.getByRole("link", { name: /Envíos y retiro/ }).click();
    await expect(page).toHaveURL(/ajustes\/envios\/$/);
    await expect(page.getByRole("heading", { level: 1, name: /Envíos y retiro/ })).toBeVisible();
    await page.getByRole("link", { name: "Volver a Ajustes" }).click();
    await expect(page).toHaveURL(/ajustes\/$/);
  });

  test("8.3.29 borradores por sección: volver los conserva y guardar una no altera otra", async ({ page }) => {
    await page.goto("admin-demo/ajustes/contacto/");
    const wa = page.getByLabel("Número para el botón de WhatsApp");
    await wa.fill("123");
    await page.getByRole("button", { name: "Guardar contacto" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "código de país y área" })).toBeVisible();
    await wa.fill("54 9 223 555 0101");
    // Salir sin guardar y editar otra sección.
    await page.getByRole("link", { name: "Volver a Ajustes" }).click();
    await page.getByRole("link", { name: /Medios de pago/ }).click();
    const pct = page.getByLabel(/Descuento transferencia\/QR/);
    await pct.fill("60");
    await page.getByRole("button", { name: "Guardar medios de pago" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "no puede superar 50%" })).toBeVisible();
    await pct.fill("15");
    await page.getByRole("button", { name: "Guardar medios de pago" }).click();
    await expect(toast(page, "Medios de pago guardados")).toBeVisible();
    let data = await stored(page);
    expect(data.settings.transferDiscountPct).toBe(15);
    expect(data.settings.whatsappNumber).toBeNull();
    // El borrador de contacto sigue; guardarlo no cambia los medios de pago.
    await page.goto("admin-demo/ajustes/contacto/");
    await expect(page.getByText("Recuperamos el número que quedó sin guardar.")).toBeVisible();
    await expect(wa).toHaveValue("54 9 223 555 0101");
    await page.getByRole("button", { name: "Guardar contacto" }).click();
    await expect(toast(page, "WhatsApp guardado")).toBeVisible();
    data = await stored(page);
    expect(data.settings.whatsappNumber).toBe("5492235550101");
    expect(data.settings.transferDiscountPct).toBe(15);
    await page.goto("admin-demo/ajustes/");
    await expect(page.getByRole("link", { name: /Contacto y WhatsApp/ })).toContainText("+5492235550101");
    await expect(page.getByRole("link", { name: /Medios de pago/ })).toContainText("15% por transferencia o QR");
  });

  test("8.3.29 envíos: código postal mal escrito se avisa; guardar cambia solo lo editado y descartar pide confirmación", async ({ page }) => {
    await page.goto("admin-demo/ajustes/envios/");
    const local = page.locator("section").filter({ has: page.getByRole("heading", { name: "Cadete en Mar del Plata" }) });
    await local.getByLabel("Códigos postales con cadete").fill("7600, 76OO, 7601");
    await page.getByRole("button", { name: "Guardar envíos" }).click();
    await expect(local.getByRole("alert")).toContainText("Estos códigos postales no tienen 4 dígitos: 76OO.");
    await local.getByLabel("Códigos postales con cadete").fill("7600, 7601");
    await page.getByLabel(/Envío gratis desde/).fill("95000");
    await page.getByRole("button", { name: "Guardar envíos" }).click();
    await expect(toast(page, "Envíos guardados")).toBeVisible();
    const data = await stored(page);
    expect(data.settings.freeShippingFrom).toBe(95000);
    expect(data.zones.find((z: { id: string }) => z.id === "local").postalCodes).toEqual(["7600", "7601"]);
    expect(data.zones.find((z: { id: string }) => z.id === "national").price).toBe(9800);
    // Descartar: confirma y vuelve a lo guardado.
    const pickup = page.locator("section").filter({ has: page.getByRole("heading", { name: "Retiro en el local" }) });
    await pickup.getByLabel("Plazo que ve el comprador").fill("");
    await page.getByRole("button", { name: "Descartar" }).click();
    await page.getByRole("dialog", { name: "Descartar los cambios" }).getByRole("button", { name: "Descartar" }).click();
    await expect(pickup.getByLabel("Plazo que ve el comprador")).toHaveValue("Listo para retirar al día hábil siguiente");
  });

  test("8.3.29 datos de cobro en su página usan la misma fuente que el modal de Pagos y la tienda sigue con el estilo Volta", async ({ page }) => {
    await page.goto("admin-demo/ajustes/cobro/");
    await page.getByLabel("Alias").fill("volta.ajustes.demo");
    await page.getByRole("button", { name: "Guardar datos de cobro" }).click();
    await expect(toast(page, "Datos de cobro de muestra guardados")).toBeVisible();
    await page.goto("admin-demo/pagos/");
    await page.getByRole("button", { name: "Configurar datos de cobro" }).click();
    await expect(page.getByRole("dialog").getByLabel("Alias")).toHaveValue("volta.ajustes.demo");
    // La tienda arranca en modo oscuro con el verde voltio de la marca: Ajustes no toca la paleta.
    await page.goto("");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--brand-primary").trim().toLowerCase())).toBe("#c8ff2e");
  });
});

for (const [width, height] of [[1180, 820], [820, 1180], [375, 812]] as const) {
  test(`8.3.29 a ${width}×${height}: Ajustes y sus páginas sin desborde`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const route of ["", ...SUBPAGES.map((s) => `${s}/`)]) {
      await page.goto(`admin-demo/ajustes/${route}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await horizontalOverflow(page), route || "entrada").toBe(0);
    }
  });
}
