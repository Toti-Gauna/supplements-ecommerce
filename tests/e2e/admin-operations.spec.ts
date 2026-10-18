import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Fase 7 · Operaciones: preparación con control de lote (Para armar, R4b), reprogramar un despacho y compra sugerida a un proveedor. */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });

test("Para armar (antes Preparación): un pedido pasa por juntar los potes y el control de lote hasta Listo para despachar, con su lote y su email", async ({ page }) => {
  await page.goto("admin-demo/preparacion/");
  const card = page.getByRole("article", { name: "Pedido VOL-000113" });
  // Paso 1: sin tildar lo que se juntó no avanza.
  await card.getByRole("button", { name: /Ya junté todo/ }).click();
  await expect(card.getByRole("alert")).toContainText("Tildá cada producto");
  await card.getByRole("checkbox", { name: /Barra proteica/ }).check();
  await card.getByRole("button", { name: /Ya junté todo/ }).click();
  await expect(toast(page, "VOL-000113: potes juntos")).toBeVisible();
  // Paso 2: el control de lote, con el lote que sale.
  await expect(card).toContainText("Lote VL-2604-B · vence 10/2026");
  // Sin marcar el lote no se despacha.
  await card.getByRole("button", { name: "Listo para despachar" }).click();
  await expect(card.getByRole("alert")).toContainText("Marcá el lote de cada producto");
  await card.getByRole("checkbox", { name: /Barra proteica/ }).check();
  await expect(card).toContainText("1 de 1 controlados");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await card.getByRole("button", { name: "Listo para despachar" }).click();
  await expect(toast(page, "VOL-000113 está listo para despachar")).toBeVisible();
  await expect(card).toHaveCount(0);
  // Listo: aparece en Despachos el día que sale (retiro en el local).
  await page.goto("admin-demo/despachos/?dia=2026-10-08");
  await expect(page.getByRole("region", { name: "Correo y retiros en el local" }).locator("[data-order='VOL-000113']")).toContainText("Listo para retirar");
  // La ficha del pedido muestra el estado, el lote registrado y el email "listo" que salió solo.
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000113");
  await expect(page.getByText(/Preparación y entrega:\s*Listo para retirar/)).toBeVisible();
  await expect(page.getByText("Lote controlado: VL-2604-B · vence 10/2026")).toBeVisible();
  await expect(page.getByRole("button", { name: /VOL-000113 está listo/ })).toBeVisible();
});

test("calendario: reprogramar un despacho desde la agenda lo mueve al día hábil siguiente y queda en el pedido", async ({ page }) => {
  await page.goto("admin-demo/calendario/");
  await page.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Reprogramar VOL-000123" }).click();
  const sheet = page.getByRole("dialog", { name: "Despacho VOL-000123" });
  await expect(sheet).toContainText("Cadete: 1/2 ese día");
  await sheet.getByRole("button", { name: /Día hábil siguiente/ }).click();
  await expect(toast(page, /VOL-000123 pasa al jue, 15 oct/)).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "Jueves, 15 de octubre" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000123");
  await expect(page.getByLabel("Fecha comprometida de despacho")).toHaveValue("2026-10-15");
});

test.describe("proveedores y compras", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("compra sugerida a un proveedor: copiar para WhatsApp, marcar como pedido y recibir suma al stock", async ({ page }) => {
    await page.goto("admin-demo/proveedores/");
    const sur = page.getByRole("article", { name: "Sur Suplementos (muestra)" });
    await expect(sur).toContainText("10 × Mass Gainer 3 kg · Banana");
    await expect(sur).toContainText(/Faltan \$\s?36\.800 para el mínimo de \$\s?800\.000/);
    await sur.getByRole("button", { name: /Copiar pedido para WhatsApp/ }).click();
    await expect(toast(page, "Pedido copiado")).toBeVisible();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain("Hola Germán, ¿cómo va? Te paso el pedido de Volta Suplementos y deporte:");
    expect(text).toContain("• 10 × Mass Gainer 3 kg · Banana");
    expect(text).toContain("¿Lo podemos recibir el 7/10?");
    await sur.getByRole("button", { name: /Marcar como pedido/ }).click();
    await expect(toast(page, "Pedido a Sur Suplementos (muestra) registrado")).toBeVisible();
    await expect(sur).toHaveCount(0);
    const done = page.getByRole("region", { name: "Pedidos hechos" });
    await expect(done).toContainText("Pedido, sin recibir");
    await done.getByRole("button", { name: /Recibir mercadería/ }).click();
    await page.getByRole("dialog", { name: /Recibir el pedido de Sur Suplementos/ }).getByRole("button", { name: "Sumar al stock" }).click();
    await expect(toast(page, "Mercadería recibida: stock actualizado")).toBeVisible();
    await expect(done).toContainText("Recibido");
    // El Mass Gainer banana llegó al objetivo (0 + 10): ya no está para comprar.
    await page.getByRole("group", { name: "Qué ver" }).getByRole("button", { name: /Stock mínimo/ }).click();
    await page.getByLabel("Buscar producto").fill("banana");
    await page.getByLabel("Buscar producto").press("Enter");
    await expect(page.getByText("Sur Suplementos (muestra) · stock 10")).toBeVisible();
  });

  test("subir el stock mínimo de una variante la suma a la compra sugerida de su proveedor", async ({ page }) => {
    await page.goto("admin-demo/proveedores/?ver=minimos");
    await page.getByLabel("Buscar producto").fill("isolate");
    await page.getByLabel("Buscar producto").press("Enter");
    const min = page.getByLabel("Stock mínimo de Isolate Zero · Chocolate").filter({ visible: true });
    await min.fill("9");
    await min.press("Enter");
    await expect(toast(page, "Isolate Zero · Chocolate: mínimo 9, objetivo 10")).toBeVisible();
    await page.getByRole("group", { name: "Qué ver" }).getByRole("button", { name: /Compra sugerida/ }).click();
    await expect(page.getByRole("article", { name: "Distribuidora Atlántica (muestra)" })).toContainText("1 × Isolate Zero · Chocolate");
  });
});
