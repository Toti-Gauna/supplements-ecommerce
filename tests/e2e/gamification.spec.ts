import { expect, test } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

test("ruleta: gira (sin animación con movimiento reducido), emite un cupón y se aplica en el carrito", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("p/bcaa-211/");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await page.keyboard.press("Escape");
  await page.goto("club/");
  // La ruleta se abre a pantalla completa y se gira con el centro "Girar"
  await page.getByRole("button", { name: "Girar la ruleta" }).click();
  const wheel = page.getByRole("dialog", { name: "Ruleta de cupones" });
  await wheel.getByRole("button", { name: "Girar la ruleta" }).click();
  await expect(wheel.getByText("¡Ganaste!")).toBeVisible();
  await expect(wheel.getByText("Cupón de la ruleta")).toBeVisible();
  const code = (await wheel.getByRole("button", { name: /Copiar código/ }).textContent())!.trim();
  expect(code).toMatch(/^RULETA[A-Z0-9]+$/);
  await wheel.getByRole("button", { name: "Aplicar ahora" }).click();
  await expect(wheel).toBeHidden();
  await page.goto("carrito/");
  // El premio es aleatorio: puede aplicarse o pedir un mínimo de compra; en ambos casos el cupón existe y se valida.
  await expect(page.getByText(new RegExp(code)).first()).toBeVisible();
  await page.goto("club/");
  await expect(page.getByRole("button", { name: "Girar la ruleta" })).toHaveCount(0);
  await expect(page.getByText("Tu premio")).toBeVisible();
  await page.goto("admin-demo/cupones/lista/");
  await expect(page.getByText(code, { exact: true })).toBeVisible();
  assertNoExternal();
});

test("ficha: stock bajo la imagen, cantidad desplegable y favoritos", async ({ page }) => {
  await page.goto("p/overvolt-pre/");
  await expect(page.getByText(/En stock · 12 disponibles/)).toBeVisible();
  // R2a: debajo de la ficha, el riel "Comparalo con…" (reemplaza a "Sumalo a tu stack"; el stack va en la ficha).
  await expect(page.getByRole("heading", { name: /Comparalo/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Armá tu stack|Sumá \d categorías/ }).first()).toBeAttached();
  // Con la máquina cargada, elegir antes de que la ficha termine de hidratar se pierde (React repone el valor):
  // se reintenta hasta que el selector responde.
  const qty = page.getByLabel("Cantidad:");
  await expect(async () => {
    await qty.selectOption("2");
    await expect(qty).toHaveValue("2", { timeout: 500 });
  }).toPass({ timeout: 10_000 });
  // En el celular se agrega desde la barra flotante; la cantidad elegida llega al carrito.
  await page.getByRole("button", { name: /Agregar al carrito/ }).filter({ visible: true }).click();
  await page.getByRole("dialog", { name: "Carrito" }).getByRole("link", { name: "Ver carrito completo" }).click();
  await expect(page).toHaveURL(/carrito\/$/);
  const main = page.locator("main");
  await expect(main.getByRole("group", { name: /Cantidad de Overvolt pre-entreno/ }).locator("output")).toHaveText("2");
  // El sabor elegido y el total de la línea (2 × $ 36.900).
  await expect(main.getByText(/^Frutos rojos/).first()).toBeVisible();
  await expect(main.getByText(/\$\s?73\.800/).first()).toBeVisible();
  // Favoritos: el corazón guarda el producto y aparece en su pantalla (pestaña de la barra inferior)
  await page.goto("p/ionic-whey/");
  await page.getByRole("button", { name: "Guardar Ionic Whey 100% en favoritos" }).filter({ visible: true }).click();
  await page.goto("favoritos/");
  await expect(page.getByRole("list", { name: "Favoritos guardados" }).getByText("Ionic Whey 100%")).toBeVisible();
});

test("barra inferior de la tienda y carrusel con controles accesibles", async ({ page }) => {
  await page.goto("");
  const nav = page.getByRole("navigation", { name: "Navegación inferior" });
  await expect(nav.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Favoritos" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Favoritos" })).toBeVisible();
  await nav.getByRole("link", { name: "Tienda" }).click();
  await expect(page).toHaveURL(/categorias\/$/);
  // Buscar va al centro del dock y abre el buscador superpuesto.
  await nav.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Buscar" })).toBeVisible();
  await page.keyboard.press("Escape");
  // En la ficha la barra inferior se reemplaza por la de compra
  await page.goto("p/ionic-whey/");
  await expect(page.locator("[data-buy-bar]")).toBeVisible();
  await expect(nav).toHaveCount(0);
  await page.goto("");
  await expect(page.getByRole("button", { name: /Reproducir carrusel|Pausar carrusel/ })).toHaveCount(1);
  await expect(page.getByRole("group", { name: "Destacados" }).locator("button[aria-current=true]")).toHaveCount(1);
});

test("carrito: elegir cupón sin escribir el código y ruleta ofrecida antes de pagar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("p/ionic-whey/");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await page.keyboard.press("Escape");
  await page.goto("carrito/");
  await page.getByRole("button", { name: /Elegir de mis cupones/ }).click();
  const sheet = page.getByRole("dialog", { name: "Mis cupones" });
  // De la tienda solo se listan los vigentes: el vencido de ejemplo queda para el panel.
  await expect(sheet.getByRole("button", { name: "Aplicar cupón BIENVENIDA10" })).toBeVisible();
  await expect(sheet.getByText("INVIERNO")).toHaveCount(0);
  await expect(sheet.getByText("Vencido", { exact: true })).toHaveCount(0);
  await sheet.getByRole("button", { name: "Aplicar cupón BIENVENIDA10" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByText(/BIENVENIDA10: 10%/)).toBeVisible();
  // La ruleta se ofrece en el carrito, antes de empezar a pagar (ya no corta el camino al checkout).
  await page.getByRole("region", { name: "Disco olímpico" }).getByRole("button", { name: "Girar", exact: true }).click();
  const wheel = page.getByRole("dialog", { name: "Ruleta de cupones" });
  await expect(wheel.getByRole("heading", { name: "Cargá la barra" })).toBeVisible();
  await wheel.getByRole("button", { name: "Girar la ruleta" }).click();
  await expect(wheel.getByText("¡Ganaste!")).toBeVisible();
  await wheel.getByRole("button", { name: "Guardar para después" }).click();
  await expect(page).toHaveURL(/checkout\/$/);
  // El premio quedó guardado en "Mis cupones"
  await page.goto("cupones/");
  await expect(page.getByText("Ganado en la ruleta")).toBeVisible();
  // Ya giró: la placa de la ruleta no aparece más e ir a pagar va directo al checkout
  await page.goto("carrito/");
  await expect(page.getByRole("region", { name: "Disco olímpico" })).toHaveCount(0);
  await page.getByRole("button", { name: "Ir a pagar" }).click();
  await expect(page).toHaveURL(/checkout\/$/);
});

test("buscador superpuesto con resultados en vivo y búsquedas recientes", async ({ page }) => {
  await page.goto("");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Buscar" });
  await expect(dialog.getByRole("combobox", { name: "Buscar productos" })).toBeFocused();
  // Con un error de tipeo igual encuentra el producto.
  await page.keyboard.type("glutamna");
  await expect(dialog.getByRole("status")).toContainText("resultado");
  await dialog.getByRole("option", { name: /Glutamina micronizada/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Glutamina micronizada" })).toBeVisible();
  await page.getByRole("button", { name: "Buscar productos" }).click();
  await expect(page.getByRole("dialog", { name: "Buscar" }).getByRole("option", { name: "glutamna" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Buscar" })).toBeHidden();
});

test("seguimiento: el pedido arriba y el resto de productos en un modal", async ({ page }) => {
  await page.goto("pedido/demo-volta/");
  await expect(page.getByRole("heading", { name: "Pedido de ejemplo" })).toBeVisible();
  await page.getByRole("button", { name: /Ver 1 producto más/ }).click();
  await expect(page.getByRole("dialog", { name: "Productos del pedido" }).getByText(/Barra proteica 20 g/)).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByText("Esperando comprobante").click();
  await expect(page.getByRole("heading", { name: "Falta el comprobante" })).toBeVisible();
});

test("menú móvil y carrito lateral se operan con teclado", async ({ page }) => {
  await page.goto("");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  const menu = page.getByRole("dialog", { name: "Menú" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await page.getByRole("button", { name: /^Carrito/ }).click();
  await expect(page.getByRole("dialog", { name: "Carrito" })).toBeVisible();
  await expect(page.getByText("Lo más elegido")).toBeVisible();
});

test("sin desborde horizontal a 375 px con productos en carrito, checkout y confirmación", async ({ page }) => {
  await page.goto("p/ionic-whey/");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await page.keyboard.press("Escape");
  for (const path of ["", "carrito/", "checkout/", "p/ionic-whey/", "p/barra-proteica/", "club/", "cupones/", "pedido/demo-volta/"]) {
    await page.goto(path);
    await page.waitForTimeout(400);
    expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(0);
  }
});

// VOLTA arranca en modo oscuro (el de la marca): se prueba el cambio a claro y la vuelta.
test("modo claro: se activa, se recuerda al recargar y llega al panel", async ({ page }) => {
  await page.goto("");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(11, 12, 13)");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("dialog", { name: "Menú" }).getByRole("button", { name: "Activar modo claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(243, 243, 239)");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("admin-demo/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Activar modo oscuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
