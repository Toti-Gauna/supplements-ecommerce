import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/**
 * R4a · menú del panel de 21 a 8 entradas (Hoy, Pedidos, Stock, Compras, Clientes, Promos, Campañas, Ajustes), cada una con
 * sus pestañas. Las rutas viejas llevan a su lugar nuevo, las pestañas se usan con el teclado y el "?" abre la ayuda.
 */

const ORDER = ["Hoy", "Pedidos", "Stock", "Compras", "Clientes", "Promos", "Campañas", "Ajustes"];
const rail = (page: Page) => page.locator("aside[data-pinned]").getByRole("navigation", { name: "Secciones del panel demo" });
const tabs = (page: Page) => page.getByRole("tablist", { name: "Pestañas de la sección" });
const subtabs = (page: Page) => page.getByRole("tablist", { name: "Subpestañas" });
/** El nombre de una pestaña puede llevar su contador al final (“Insumos 4 para reponer”). */
const named = (label: string) => new RegExp(`^${label}( \\d+ [a-zé ]+)?$`);

/** [ruta vieja, adónde llega, sección del menú, pestaña, subpestaña]. Una por cada ruta que existía antes de R4a. */
const ROUTES: [string, RegExp, string, string | null, string?][] = [
  ["admin-demo/", /admin-demo\/$/, "Hoy", null],
  ["admin-demo/pedidos/", /pedidos\/$/, "Pedidos", "Pedidos"],
  ["admin-demo/pagos/", /pagos\/$/, "Pedidos", "Pagos manuales"],
  ["admin-demo/preparacion/", /preparacion\/$/, "Pedidos", "Preparación"],
  ["admin-demo/produccion/", /preparacion\/$/, "Pedidos", "Preparación"],
  ["admin-demo/calendario/", /calendario\/$/, "Pedidos", "Calendario de despachos"],
  ["admin-demo/reclamos/", /reclamos\/$/, "Pedidos", "Reclamos"],
  ["admin-demo/productos/", /productos\/$/, "Stock", "Productos y stock"],
  ["admin-demo/stock/", /productos\/\?ver=variantes/, "Stock", "Productos y stock"],
  ["admin-demo/planilla/", /productos\/\?formato=excel/, "Stock", "Productos y stock"],
  ["admin-demo/categorias/", /categorias\/$/, "Stock", "Categorías"],
  ["admin-demo/packs/", /packs\/$/, "Stock", "Packs"],
  ["admin-demo/importar/", /importar\/$/, "Stock", "Importar"],
  ["admin-demo/proveedores/", /proveedores\/$/, "Compras", "Proveedores"],
  ["admin-demo/insumos/", /insumos\/$/, "Compras", "Insumos"],
  ["admin-demo/costos/", /costos\/$/, "Compras", "Costos y margen"],
  ["admin-demo/usuarios/", /usuarios\/$/, "Clientes", null],
  ["admin-demo/cupones/", /promos\/$/, "Promos", "Cupones"],
  ["admin-demo/cupones/lista/", /promos\/$/, "Promos", "Cupones"],
  ["admin-demo/promos/", /promos\/$/, "Promos", "Cupones"],
  ["admin-demo/descuento-stack/", /descuento-stack\/$/, "Promos", "Descuento stack"],
  ["admin-demo/cupones/ruleta/", /cupones\/ruleta\/$/, "Promos", "Ruleta", "Configuración"],
  ["admin-demo/cupones/premios/", /cupones\/premios\/$/, "Promos", "Ruleta", "Premios disponibles"],
  ["admin-demo/cupones/juego/", /cupones\/juego\/$/, "Promos", "Premios del juego"],
  ["admin-demo/misiones/", /misiones\/$/, "Promos", "Misiones", "Misiones y premios"],
  ["admin-demo/misiones/simular/", /misiones\/simular\/$/, "Promos", "Misiones", "Simular progreso"],
  ["admin-demo/regalos/", /regalos\/$/, "Promos", "Regalos y gift cards"],
  ["admin-demo/campanas/", /campanas\/$/, "Campañas", "Campañas"],
  ["admin-demo/marketing/", /campanas\/$/, "Campañas", "Campañas"],
  ["admin-demo/tematicas/", /campanas\/$/, "Campañas", "Campañas"],
  ["admin-demo/estudio/", /estudio\/$/, "Campañas", "Estudio de contenido"],
  ["admin-demo/ajustes/", /ajustes\/$/, "Ajustes", "Contacto"],
  ["admin-demo/ajustes/contacto/", /ajustes\/$/, "Ajustes", "Contacto"],
  ["admin-demo/ajustes/pagos/", /ajustes\/pagos\/$/, "Ajustes", "Medios de pago"],
  ["admin-demo/ajustes/cobro/", /ajustes\/cobro\/$/, "Ajustes", "Datos de cobro"],
  ["admin-demo/ajustes/envios/", /ajustes\/envios\/$/, "Ajustes", "Envíos y retiro"],
  ["admin-demo/contenido/", /contenido\/carrusel\/$/, "Ajustes", "Contenido", "Carrusel"],
  ["admin-demo/contenido/carrusel/", /contenido\/carrusel\/$/, "Ajustes", "Contenido", "Carrusel"],
  ["admin-demo/contenido/textos/", /contenido\/textos\/$/, "Ajustes", "Contenido", "Textos de inicio"],
  ["admin-demo/contenido/preguntas/", /contenido\/preguntas\/$/, "Ajustes", "Contenido", "Preguntas frecuentes"],
  ["admin-demo/emails/", /emails\/$/, "Ajustes", "Emails", "Emails automáticos"],
  ["admin-demo/emails/enviados/", /emails\/enviados\/$/, "Ajustes", "Emails", "Bandeja de salida"],
];

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1300, 500); });

  test("el menú tiene 8 entradas, en este orden", async ({ page }) => {
    await page.goto("admin-demo/");
    const links = rail(page).getByRole("link");
    await expect(links).toHaveCount(8);
    const names = await links.evaluateAll((els) => els.map((el) => el.textContent ?? ""));
    expect(names.map((n, i) => n.startsWith(ORDER[i]!))).toEqual(ORDER.map(() => true));
    await expect(page.getByRole("link", { name: "Mostrador" })).toHaveCount(0);
  });

  for (const [route, url, section, tab, sub] of ROUTES) {
    test(`/${route} → ${section}${tab ? ` · ${tab}` : ""}${sub ? ` · ${sub}` : ""}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(url);
      await expect(rail(page).getByRole("link", { name: new RegExp(`^${section}`) })).toHaveAttribute("aria-current", "page");
      if (tab) {
        await expect(tabs(page).getByRole("tab", { name: named(tab) })).toHaveAttribute("aria-current", "page");
        await expect(tabs(page).getByRole("tab", { name: named(tab) })).toHaveAttribute("aria-selected", "true");
      } else await expect(tabs(page)).toHaveCount(0);
      if (sub) await expect(subtabs(page).getByRole("tab", { name: named(sub) })).toHaveAttribute("aria-current", "page");
      else await expect(subtabs(page)).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    });
  }

  test("las pestañas se recorren con el teclado: flechas, Inicio y Fin mueven el foco y Enter abre", async ({ page }) => {
    await page.goto("admin-demo/promos/");
    const all = tabs(page).getByRole("tab");
    await expect(all).toHaveCount(6);
    // Solo la pestaña activa entra con Tab (foco itinerante).
    await expect(all.nth(0)).toHaveAttribute("tabindex", "0");
    await expect(all.nth(1)).toHaveAttribute("tabindex", "-1");
    await all.nth(0).focus();
    await page.keyboard.press("ArrowRight");
    await expect(all.nth(1)).toBeFocused();
    await expect(page).toHaveURL(/promos\/$/);
    await page.keyboard.press("End");
    await expect(all.nth(5)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(all.nth(0)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(all.nth(5)).toBeFocused();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/descuento-stack\/$/);
    await expect(tabs(page).getByRole("tab", { name: "Descuento stack" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 1, name: "Descuento stack" })).toBeVisible();
  });

  test("el “?” abre la ayuda de la pantalla en un panel, y Escape lo cierra devolviendo el foco", async ({ page }) => {
    await page.goto("admin-demo/promos/");
    // El encabezado es corto: la explicación no ocupa la pantalla hasta que se la pide.
    await expect(page.getByText("Los cupones creados acá funcionan")).toHaveCount(0);
    const help = page.getByRole("button", { name: "Ayuda: Cupones" });
    await help.click();
    const dialog = page.getByRole("dialog", { name: "Cupones" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/cupones/i);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(help).toBeFocused();
  });

  test("no quedan pantallas puente: Marketing, Cupones y ruleta, Contenido y Ajustes abren directo una herramienta", async ({ page }) => {
    for (const route of ["admin-demo/marketing/", "admin-demo/cupones/", "admin-demo/contenido/", "admin-demo/ajustes/"]) {
      await page.goto(route);
      await expect(page.getByRole("main").getByRole("list", { name: /Herramientas|Partes|Tareas/ })).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    }
  });
});

test.describe("celular 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("las pestañas de abajo son Hoy, Pedidos, Stock y Promos más “Más”, y “Más” abre las 8 entradas", async ({ page }) => {
    await page.goto("admin-demo/");
    const bar = page.getByRole("navigation", { name: "Accesos rápidos del panel" });
    const items = bar.getByRole("link");
    await expect(items).toHaveCount(4);
    expect(await items.evaluateAll((els) => els.map((el) => el.textContent?.replace(/^\d+/, "").replace(/ \(.*\)$/, "").trim()))).toEqual(["Hoy", "Pedidos", "Stock", "Promos"]);
    await expect(bar.getByRole("button", { name: "Más secciones del panel" })).toBeVisible();
    await bar.getByRole("button", { name: "Más secciones del panel" }).click();
    const menu = page.getByRole("dialog", { name: "Menú del panel" });
    const links = menu.getByRole("navigation", { name: "Secciones del panel demo" }).getByRole("link");
    await expect(links).toHaveCount(8);
    const names = await links.evaluateAll((els) => els.map((el) => el.textContent ?? ""));
    expect(names.map((n, i) => n.startsWith(ORDER[i]!))).toEqual(ORDER.map(() => true));
  });

  test("las pestañas de una sección se desplazan solas hacia los lados sin desbordar la página", async ({ page }) => {
    for (const route of ["admin-demo/promos/", "admin-demo/ajustes/envios/", "admin-demo/misiones/", "admin-demo/pedidos/"]) {
      await page.goto(route);
      await expect(tabs(page)).toBeVisible();
      expect(await horizontalOverflow(page), route).toBeLessThanOrEqual(0);
    }
    // La pestaña activa de Promos que queda lejos (Regalos) se ve al entrar.
    await page.goto("admin-demo/regalos/");
    await expect(tabs(page).getByRole("tab", { name: "Regalos y gift cards" })).toBeInViewport();
    await page.getByRole("button", { name: /Ayuda: / }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});
