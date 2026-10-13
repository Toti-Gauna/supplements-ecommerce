import { expect, test } from "@playwright/test";
import { guardNetwork } from "./helpers";

test("flujo móvil completo hasta la confirmación de demostración", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("");
  await expect(page.getByRole("region", { name: "Avisos de la tienda" })).toContainText("No se cobra nada");

  // Búsqueda tolerante a errores
  await page.goto("buscar/?q=creatna");
  await expect(page.getByRole("status").filter({ hasText: "resultados" })).toBeVisible();
  await page.getByRole("link", { name: "Creatina monohidrato micronizada" }).first().click();

  // Ficha en una sola tarjeta: tamaño (tarjetas con servicios), el precio se actualiza y se agrega desde la barra de abajo
  await expect(page.getByRole("heading", { level: 1, name: "Creatina monohidrato micronizada" })).toBeVisible();
  const card = page.getByRole("region", { name: "Elegí sabor, tamaño y cantidad" });
  await card.getByText("500 g", { exact: true }).click();
  await expect(card.getByRole("radio", { name: /500 g/ })).toBeChecked();
  const add = page.locator("[data-buy-bar]").getByRole("button", { name: /Agregar al carrito/ });
  await expect(add).toContainText("$ 45.900");
  await add.click();
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(drawer.getByText("Agregaste Creatina monohidrato micronizada")).toBeVisible();
  await drawer.getByRole("link", { name: "Ver carrito completo" }).click();

  // Carrito: cupón vencido, cupón válido
  await expect(page).toHaveURL(/carrito\/$/);
  const cartLines = page.getByRole("list", { name: "Productos en el carrito" });
  await expect(cartLines.getByText("Creatina monohidrato micronizada")).toBeVisible();
  await expect(cartLines.getByText("500 g")).toBeVisible();
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
  await page.getByLabel("Subir comprobante").setInputFiles({ name: "comprobante.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 demo") });
  await expect(page.getByText(/queda en revisión/i)).toBeVisible();
  await expect(page.getByText(/acreditad/i)).toHaveCount(0);

  // Seguimiento con token fijo
  await page.getByRole("link", { name: "Seguir mi pedido", exact: true }).click();
  await expect(page).toHaveURL(/pedido\/demo-volta\/$/);
  await expect(page.getByText("estado actual")).toBeVisible();
  // El seguimiento muestra lo que se compró (no el pedido de ejemplo)
  const items = page.getByRole("region", { name: "Tu pedido", exact: true });
  await expect(items.getByText("1 × Creatina monohidrato micronizada")).toBeVisible();
  await expect(items.getByText("500 g")).toBeVisible();

  // Reiniciar demo deja todo vacío
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reiniciar demo" }).first().click();
  await page.goto("carrito/");
  await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
  assertNoExternal();
});

test("checkout con cuenta demo, retiro y Mercado Pago simulado", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("p/overvolt-pre/");
  // En el celular "Agregar al carrito" está en la barra flotante de abajo (el de la tarjeta se oculta)
  const add = page.locator("[data-buy-bar]").getByRole("button", { name: /Agregar al carrito/ });
  await add.click();
  await expect(page.getByRole("dialog", { name: "Carrito" }).getByText("Agregaste Overvolt pre-entreno")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Carrito" })).toBeHidden();
  await page.getByLabel("Cantidad:").selectOption("2");
  await add.click();
  await page.goto("checkout/");
  await page.getByRole("button", { name: "Ingresar con cuenta demo" }).click();
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  await page.getByText("Retiro en el local").click();
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

test("Fase 2 · descuento stack: proteína + creatina + pre en el carrito restan 10 %; con dos categorías avisa cuánto falta", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  const addFromBar = async (slug: string, name: string) => {
    await page.goto(`p/${slug}/`);
    await page.locator("[data-buy-bar]").getByRole("button", { name: /Agregar al carrito/ }).click();
    await expect(page.getByRole("dialog", { name: "Carrito" }).getByText(`Agregaste ${name}`)).toBeVisible();
  };
  const summary = page.getByRole("region", { name: "Resumen", exact: true });
  const total = summary.locator("dd").last();
  await addFromBar("ionic-whey", "Ionic Whey 100%");
  await addFromBar("creatina-monohidrato", "Creatina monohidrato micronizada");
  await page.goto("carrito/");
  // Dos categorías de suplementos: todavía no hay descuento, solo el aviso de cuánto falta.
  await expect(page.getByText(/Sumá 1 categoría más de suplementos/)).toBeVisible();
  await expect(summary.getByText(/Descuento stack/)).toHaveCount(0);
  await expect(total).toHaveText("$ 84.800");
  await addFromBar("overvolt-pre", "Overvolt pre-entreno");
  await page.goto("carrito/");
  // Tres categorías: 10 % sobre $ 121.700 = $ 12.170 y el total baja.
  await expect(page.getByText(/¡Armaste tu stack!/)).toBeVisible();
  const row = summary.locator("div").filter({ has: page.getByText("Descuento stack (10 %)", { exact: true }) });
  await expect(row.locator("dd")).toHaveText("−$ 12.170");
  await expect(total).toHaveText("$ 109.530");
  await expect(page.getByText(/Sumá \d categorías? más/)).toHaveCount(0);
  assertNoExternal();
});
