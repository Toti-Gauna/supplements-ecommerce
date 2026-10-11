import { expect, test } from "@playwright/test";
import { guardNetwork } from "./helpers";

test("flujo móvil completo hasta la confirmación de demostración", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("");
  await expect(page.getByRole("note").filter({ hasText: "No se cobra nada" })).toBeVisible();

  // Búsqueda tolerante a errores
  await page.goto("buscar/?q=comedro");
  await expect(page.getByRole("status").filter({ hasText: "resultados" })).toBeVisible();
  await page.getByRole("link", { name: "Comedero perro globo" }).click();

  // Ficha todo en uno: color, texto con vista previa en vivo, aprobación y agregar
  await expect(page.getByRole("heading", { level: 1, name: "Comedero perro globo" })).toBeVisible();
  await page.getByTitle("Celeste").first().click();
  const text = page.getByLabel("Texto", { exact: true });
  await text.fill("Toby 🐶");
  await expect(page.getByRole("alert").filter({ hasText: "emoji" })).toBeVisible();
  await text.fill("Ñoqui");
  await page.getByText("Manuscrita").click();
  await expect(page.getByText("Vista previa en vivo")).toBeVisible();
  const add = page.getByRole("button", { name: "Agregar al carrito" }).filter({ visible: true });
  // Sin casilla: agregar al carrito equivale a "Así lo quiero" (queda explicado junto a la cantidad)
  await expect(page.getByText(/Al agregarlo confirmás/)).toBeVisible();
  await add.click();
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(drawer.getByText("Agregaste Comedero perro globo")).toBeVisible();
  await drawer.getByRole("link", { name: "Ver carrito completo" }).click();

  // Carrito: cupón vencido, cupón válido
  await expect(page).toHaveURL(/carrito\/$/);
  await expect(page.getByText("✓ Aprobada")).toBeVisible();
  const code = page.getByLabel("¿Tenés un código?");
  await code.fill("invierno");
  await code.press("Enter");
  await expect(page.getByRole("alert").filter({ hasText: "venció" })).toBeVisible();
  await code.fill("bienvenida10");
  await code.press("Enter");
  await expect(page.getByText(/BIENVENIDA10: 10%/)).toBeVisible();
  await expect(page.locator("main").getByRole("progressbar", { name: /Comprá 2 productos/ })).toBeVisible();
  // Al ir a pagar aparece la ruleta (todavía no se giró); se puede seguir sin girar
  await page.getByRole("button", { name: "Continuar al checkout" }).click();
  await page.getByRole("dialog", { name: "Ruleta de cupones" }).getByRole("button", { name: "Continuar sin girar" }).click();
  await expect(page).toHaveURL(/checkout\/$/);

  // Checkout como invitado
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  await expect(page.getByText("Escribí tu nombre y apellido.")).toBeVisible();
  await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
  await page.getByLabel("Email").fill("juana@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  await page.getByText("Cadete en Mar del Plata").click();
  await page.getByLabel("Calle").fill("Güemes");
  await page.getByLabel("Altura").fill("2500");
  await page.getByLabel("Código postal").fill("7600");
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Transferencia bancaria").click();
  await expect(page.getByText("Descuento transferencia/QR")).toBeVisible();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await page.getByRole("button", { name: "Confirmar pedido de demostración" }).click();
  await expect(page.getByText("Para continuar, aceptá los términos.")).toBeVisible();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido de demostración" }).click();

  // Confirmación rotulada como demo; nunca "acreditado"
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
  await expect(page.getByText("PEDIDO DE DEMOSTRACIÓN · no es un pedido real")).toBeVisible();
  await expect(page.getByText("Datos de muestra: no transfieras a esta cuenta.")).toBeVisible();
  await page.getByLabel("Subir comprobante (demo)").setInputFiles({ name: "comprobante.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 demo") });
  await expect(page.getByText(/queda en revisión/i)).toBeVisible();
  await expect(page.getByText(/acreditad/i)).toHaveCount(0);

  // Seguimiento con token fijo
  await page.getByRole("link", { name: "Seguir mi pedido", exact: true }).click();
  await expect(page).toHaveURL(/pedido\/demo-volta\/$/);
  await expect(page.getByText("estado actual")).toBeVisible();
  await expect(page.getByText(/“Ñoqui”/).first()).toBeVisible();

  // Reiniciar demo deja todo vacío
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reiniciar demo" }).first().click();
  await page.goto("carrito/");
  await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
  assertNoExternal();
});

test("checkout con cuenta demo, retiro y Mercado Pago simulado", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("p/vela-caniche/");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await expect(page.getByRole("dialog", { name: "Carrito" }).getByText("Agregaste Vela caniche")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Carrito" })).toBeHidden();
  await page.getByLabel("Cantidad:").selectOption("2");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await page.goto("checkout/");
  await page.getByRole("button", { name: "Ingresar con cuenta demo" }).click();
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  await page.getByText("Retiro en persona").click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Tarjetas de débito, crédito y prepagas", { exact: true }).click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido de demostración" }).click();
  await expect(page.getByRole("progressbar", { name: /Comprá 2 productos/ })).toBeVisible();
  await expect(page.getByText("¡Con este pedido completás la misión!")).toBeVisible();
  await page.getByRole("button", { name: /Simular ida y vuelta/ }).click();
  await expect(page.getByText(/pendiente de confirmación/)).toBeVisible();
  await expect(page.getByText(/acreditad/i)).toHaveCount(0);
  assertNoExternal();
});
