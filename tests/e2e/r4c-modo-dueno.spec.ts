import { expect, test, type Page } from "@playwright/test";
import { checkoutAsGuest, guardNetwork, horizontalOverflow } from "./helpers";

/**
 * R4c · Modo dueño en la tienda: el interruptor aparece solo desde el panel o con `?dueno=1` (y lo recuerda la pestaña),
 * cada placa lleva a la pantalla exacta del panel, se apaga, el comprador normal no ve nada y la confirmación del pedido
 * abre su ficha en el panel. Celular 375 px.
 */
const spots = (page: Page) => page.locator("[data-owner-spot]");
const toggle = (page: Page) => page.getByRole("switch", { name: /Modo dueño/ });
const spot = (page: Page, id: string) => page.locator(`[data-owner-spot='${id}']`).getByRole("link");

/** Pantalla de la tienda → placa → ruta del panel (sin basePath) y algo que la identifica. */
const ROUTES: [string, string, string, RegExp][] = [
  ["", "carrusel", "admin-demo/contenido/carrusel/", /Carrusel/],
  ["", "categorias", "admin-demo/categorias/", /Categorías/],
  ["", "campana", "admin-demo/campanas/", /Campañas/],
  ["", "packs", "admin-demo/packs/", /Packs/],
  ["", "textos", "admin-demo/contenido/textos/", /Textos de inicio/],
  ["", "club", "admin-demo/misiones/", /Misiones/],
  ["", "contacto", "admin-demo/ajustes/", /Contacto/],
  ["p/ionic-whey/", "ficha", "admin-demo/productos/editar/?id=ionic-whey", /Editar: Ionic Whey/],
  ["preguntas/", "preguntas", "admin-demo/contenido/preguntas/", /Preguntas frecuentes/],
  ["campana/?id=black-friday&fase=vivo", "campana", "admin-demo/campanas/editar/?id=black-friday", /Black Friday/],
  ["crear/", "stack", "admin-demo/descuento-stack/", /Descuento stack/],
  ["club/juego/", "juego", "admin-demo/cupones/juego/", /Premios del juego/],
  ["regalar/", "regalos", "admin-demo/regalos/", /Regalos/],
];

test("con ?dueno=1 se prende, muestra los puntos de la pantalla, se apaga y la pestaña lo recuerda", async ({ page }) => {
  const noExternal = guardNetwork(page);
  await page.goto("?dueno=1");
  await expect(toggle(page)).toHaveAttribute("aria-checked", "true");
  await expect(toggle(page)).toContainText("7 puntos para editar en esta pantalla");
  await expect(spots(page)).toHaveCount(7);
  await expect(spot(page, "carrusel")).toHaveAccessibleName("Editar en el panel: Carrusel del inicio (Ajustes · Contenido · Carrusel)");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  // Se recuerda al navegar sin el parámetro (misma pestaña).
  await page.goto("p/ionic-whey/");
  await expect(toggle(page)).toHaveAttribute("aria-checked", "true");
  await expect(spots(page)).toHaveCount(2);
  await toggle(page).click();
  await expect(toggle(page)).toHaveAttribute("aria-checked", "false");
  await expect(spots(page)).toHaveCount(0);
  await page.reload();
  await expect(toggle(page)).toHaveAttribute("aria-checked", "false");
  await toggle(page).focus();
  await page.keyboard.press("Space");
  await expect(spots(page)).toHaveCount(2);
  // ?dueno=0 lo saca del todo.
  await page.goto("?dueno=0");
  await expect(page.locator("main")).toBeVisible();
  await expect(toggle(page)).toHaveCount(0);
  await expect(spots(page)).toHaveCount(0);
  noExternal();
});

test("el comprador normal no ve ni el interruptor ni los puntos", async ({ page }) => {
  for (const path of ["", "p/ionic-whey/", "preguntas/", "crear/"]) {
    await page.goto(path);
    await expect(page.locator("h1, main").first()).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-owner-bar]")).toHaveCount(0);
    await expect(spots(page)).toHaveCount(0);
  }
});

test("desde el panel: el interruptor queda disponible y apagado, y el acceso directo abre la tienda en modo dueño", async ({ page }) => {
  await page.goto("admin-demo/");
  await expect(page.getByRole("heading", { level: 1, name: "Hoy en tu tienda" })).toBeVisible();
  await page.getByRole("button", { name: "Abrir menú del panel" }).click();
  await page.getByRole("dialog", { name: "Menú del panel" }).getByRole("link", { name: "Ir a la tienda" }).click();
  await expect(toggle(page)).toHaveAttribute("aria-checked", "false");
  await expect(spots(page)).toHaveCount(0);
  await page.getByRole("region", { name: "Modo dueño" }).getByRole("link", { name: "Volver al panel" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Hoy en tu tienda" })).toBeVisible();
  await page.getByRole("button", { name: "Abrir menú del panel" }).click();
  await page.getByRole("dialog", { name: "Menú del panel" }).getByRole("link", { name: "Ver la tienda en modo dueño" }).click();
  await expect(toggle(page)).toHaveAttribute("aria-checked", "true");
  await expect(spots(page)).toHaveCount(7);
});

test("cada punto lleva a la pantalla exacta del panel donde se edita", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("?dueno=1");
  await expect(spots(page)).toHaveCount(7);
  for (const [shop, id, panel, heading] of ROUTES) {
    await page.goto(shop || "./");
    const link = spot(page, id);
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL((u) => `${u.pathname.replace(/^\/[^/]+\//, "")}${u.search}` === panel);
    await expect(page.locator("main")).toContainText(heading);
  }
});

test("la confirmación del pedido abre la ficha de ese pedido en el panel", async ({ page }) => {
  await page.goto("p/overvolt-pre/");
  await page.locator("[data-buy-bar]").getByRole("button", { name: /Agregar al carrito/ }).click();
  await page.keyboard.press("Escape");
  await checkoutAsGuest(page);
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  const link = page.getByRole("link", { name: /Ver este pedido en el panel/ });
  await expect(link).toBeVisible();
  const code = (await page.locator("[data-order-panel]").getAttribute("href"))!.match(/codigo=([^&]+)/)![1]!;
  await link.click();
  await expect(page).toHaveURL(new RegExp(`admin-demo/pedidos/detalle/\\?codigo=${code}$`));
  await expect(page.getByRole("heading", { level: 1, name: code })).toBeVisible();
  await expect(page.getByText("Juana Pérez").first()).toBeVisible();
  await expect(page.getByText(/acreditad/i)).toHaveCount(0);
});
