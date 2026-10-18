import { expect, test, type Page } from "@playwright/test";
import { guardNetwork } from "./helpers";

async function confirmDialog(page: Page, button: string) {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: button }).click();
  await expect(dialog).toBeHidden();
}

test("cambiar stock y pausar en el panel se refleja en la tienda; el reset vuelve a fixtures", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("admin-demo/productos/editar/?id=overvolt-pre");
  await expect(page.getByRole("heading", { name: /Editar: Overvolt pre-entreno/ })).toBeVisible();
  for (const s of await page.locator("details").filter({ hasText: /Frutos rojos|Limón|Mango/ }).all()) await s.locator("summary").click();
  // Con lotes, el stock de cada variante es la suma de sus lotes (Fase 6): se dejan los tres lotes en 0.
  const units = page.getByLabel("Unidades", { exact: true });
  await expect(units).toHaveCount(3);
  for (let i = 0; i < 3; i++) await units.nth(i).fill("0");
  await page.getByRole("button", { name: "Guardar (solo en esta demo)" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Cambio guardado solo en esta demo" })).toBeVisible();
  await page.goto("p/overvolt-pre/");
  await expect(page.getByText(/Sin stock en esta variante/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Agregar al carrito" }).first()).toBeDisabled();

  await page.goto("admin-demo/productos/");
  // Mass Gainer es el único producto de "Ganadores de peso": pausarlo esconde la categoría.
  await page.getByLabel("Buscar producto").fill("mass");
  await page.getByRole("listitem").filter({ hasText: "Mass Gainer 3 kg" }).getByRole("switch").click();
  await page.goto("categorias/");
  await expect(page.getByRole("link", { name: /Proteínas/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ganadores de peso/ })).toHaveCount(0);

  await page.goto("admin-demo/");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await page.goto("p/overvolt-pre/");
  await expect(page.getByText("En stock · 12 disponibles")).toBeVisible();
  await page.goto("categorias/");
  await expect(page.getByRole("link", { name: /Ganadores de peso/ })).toBeVisible();
  assertNoExternal();
});

test("pagos manuales: aprobar y rechazar con motivo sin declararlo pago real", async ({ page }) => {
  await page.goto("admin-demo/pagos/");
  const card123 = page.getByRole("article").filter({ hasText: "VOL-000123" });
  await card123.getByRole("button", { name: "Aprobar" }).click();
  await expect(page.getByRole("dialog")).toContainText("verificaste el ingreso");
  await confirmDialog(page, "Aprobar");
  await expect(page.getByRole("article").filter({ hasText: "VOL-000123" })).toHaveCount(0);

  const card124 = page.getByRole("article").filter({ hasText: "VOL-000124" });
  await card124.getByRole("button", { name: "Rechazar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Rechazar" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Escribí el motivo");
  await page.getByLabel("Motivo del rechazo").fill("El monto no coincide");
  await confirmDialog(page, "Rechazar");

  await page.getByRole("button", { name: /Resueltos/ }).click();
  await expect(page.getByText("Motivo: El monto no coincide")).toBeVisible();
  // 8.3.8: sin "Auditoría de muestra"; el registro sigue en el historial del pedido.
  await expect(page.getByText("Auditoría de muestra")).toHaveCount(0);
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000123");
  await expect(page.getByText("Pagado").first()).toBeVisible();
  await expect(page.getByText(/Comprobante aprobado tras verificar el ingreso \(simulado\)/)).toBeVisible();
  await expect(page.getByText(/acreditad/i)).toHaveCount(0);
});

test("un comprobante subido en la tienda queda en revisión en el panel, nunca pagado", async ({ page }) => {
  await page.goto("p/bcaa-211/");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await page.goto("checkout/");
  await page.getByLabel("Nombre y apellido").fill("Ana Prueba");
  await page.getByLabel("Email").fill("ana@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-9999");
  await page.getByText("Retiro en el local").click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Transferencia bancaria").click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await page.getByLabel("Subir comprobante").setInputFiles({ name: "transferencia.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF demo") });
  await page.goto("admin-demo/pagos/");
  const card = page.getByRole("article").filter({ hasText: "VOL-DEMO-0001" });
  await expect(card).toContainText("Comprobante en revisión");
  await expect(card).toContainText("transferencia.pdf");
  await expect(card.getByText("Pagado", { exact: true }).filter({ visible: true })).toHaveCount(0);
});

test("cupón y misión creados en el panel funcionan en la tienda", async ({ page }) => {
  await page.goto("admin-demo/cupones/lista/");
  await page.getByRole("button", { name: "Nuevo cupón" }).click();
  await page.getByLabel("Código").fill("FE");
  await page.getByRole("button", { name: "Crear cupón" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "de 3 a 20" })).toBeVisible();
  await page.getByLabel("Código").fill("FERIA15");
  await page.getByLabel("Valor (%)").fill("15");
  await page.getByRole("button", { name: "Crear cupón" }).click();
  await expect(page.getByText("FERIA15", { exact: true })).toBeVisible();

  await page.goto("admin-demo/misiones/");
  await page.getByRole("button", { name: "Nueva misión" }).click();
  await page.getByLabel("Título", { exact: true }).fill("Comprá 3 pre-entrenos");
  await page.getByLabel("Premio", { exact: true }).fill("Shaker de regalo");
  await page.getByRole("button", { name: "Guardar misión" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Comprá 3 pre-entrenos" })).toBeVisible();
  await page.goto("cuenta/");
  await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click();
  await page.getByRole("navigation", { name: "Secciones de la cuenta" }).getByRole("link", { name: /^Misiones/ }).click();
  await expect(page.getByText("Comprá 3 pre-entrenos")).toBeVisible();

  await page.goto("p/overvolt-pre/");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await page.goto("carrito/");
  await page.getByLabel("¿Tenés un código?").fill("feria15");
  await page.getByLabel("¿Tenés un código?").press("Enter");
  await expect(page.getByText(/FERIA15/)).toBeVisible();
  await expect(page.getByText("Cupón", { exact: true })).toBeVisible();
});

test("teclado: navegación del panel y diálogo que se cierra con Escape", async ({ page }) => {
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000121");
  // Pasar a Listo abre el control de lote (Fase 7): se marca el lote con la barra espaciadora y se confirma con teclado.
  const ready = page.getByRole("button", { name: "Listo", exact: true });
  await ready.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Control de lote de VOL-000121" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await ready.press("Enter");
  await expect(dialog.getByRole("checkbox")).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("VOL-000121");
  await expect(page.getByText("Listo").first()).toBeVisible();
});

test("movimiento reducido en el panel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("admin-demo/");
  await expect(page.locator("#volta-splash")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Hoy en tu tienda" })).toBeVisible();
});

test("celular: menú hamburguesa del panel y paginado de pedidos", async ({ page }) => {
  await page.goto("admin-demo/");
  await page.getByRole("button", { name: "Abrir menú del panel" }).click();
  const menu = page.getByRole("dialog", { name: "Menú del panel" });
  await expect(menu.getByText("Datos ficticios · sin login")).toBeVisible();
  await expect(menu.getByRole("link", { name: /^Pedidos \d+ para atender/ })).toBeVisible();
  await menu.getByRole("link", { name: "Pedidos" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Pedidos" })).toBeVisible();
  await expect(menu).toBeHidden();
  const pages = page.getByRole("navigation", { name: "Páginas de pedidos" });
  await expect(pages).toContainText("1–10 de");
  await pages.getByRole("button", { name: "Página 2" }).click();
  await expect(pages).toContainText("11–");
  await expect(pages).toContainText("página 2 de 3");
  await page.getByLabel("Código o cliente").fill("VOL-000123");
  await expect(pages).toBeHidden();
  // Pestañas inferiores: acceso directo y "Más" abre el menú completo
  await page.getByRole("navigation", { name: "Accesos rápidos del panel" }).getByRole("link", { name: "Stock" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Productos/ })).toBeVisible();
  await page.getByRole("button", { name: "Más secciones del panel" }).click();
  await expect(page.getByRole("dialog", { name: "Menú del panel" }).getByRole("link", { name: "Ajustes" })).toBeVisible();
});

test("8.3.11 sin guía de bienvenida: el panel abre directo, también la primera vez y después de reiniciar", async ({ page }) => {
  // Aunque el navegador nunca haya visto el panel (sin preferencias guardadas), no aparece ningún recorrido.
  await page.addInitScript(() => localStorage.removeItem("volta-tour:admin"));
  await page.goto("admin-demo/");
  await expect(page.getByRole("heading", { level: 1, name: "Hoy en tu tienda" })).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ver guía del panel" })).toHaveCount(0);
  // La señal de demo sigue siempre a la vista.
  await expect(page.getByText("Panel de demostración · datos ficticios")).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Hoy en tu tienda" })).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
