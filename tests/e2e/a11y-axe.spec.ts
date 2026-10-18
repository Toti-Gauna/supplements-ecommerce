import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Fase 8 · accesibilidad AA con axe-core: pantallas principales de la tienda y del panel, en claro y en oscuro.
 * Solo reglas WCAG 2.x A/AA. Las pantallas se revisan quietas (movimiento reducido, sin temática de fecha).
 */
const AXE = join(process.cwd(), "node_modules/axe-core/axe.min.js");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const PAGES: [string, string, string][] = [
  ["inicio", "", "main"],
  ["ficha", "p/overvolt-pre/", "h1"],
  ["ficha hoja técnica (suplemento)", "p/ionic-whey/", "h1"],
  ["ficha de equipamiento", "p/guantes-boxeo/", "h1"],
  ["categoría", "categorias/", "h1"],
  ["catálogo con filtros y orden", "categorias/?marca=krono-nutrition&sello=sin-azucar&orden=rendidor", "h1"],
  ["categoría con filtros", "c/proteinas/?porserv=1000-2000&orden=proteina", "h1"],
  ["comparador", "comparar/?p=ionic-whey,proteina-vegana,isolate-zero", "[role=table]"],
  ["comparador de equipamiento", "comparar/?p=guantes-boxeo,vendas-boxeo", "[role=table]"],
  ["comparador con un link que mezclaba tipos", "comparar/?p=ionic-whey,shaker-volta", "[role=note]"],
  ["búsqueda con chips", "buscar/?q=proteina sin lactosa", "h1"],
  ["búsqueda sin resultados", "buscar/?q=creatina vainilla", "h1"],
  ["packs", "packs/", "h1"],
  ["pack (detalle)", "packs/?pack=hipertrofia", "h1"],
  ["armador", "crear/", "h1"],
  ["armador con dos objetivos y deporte", "crear/?objetivo=fuerza,salud&deporte=futbol", "h1"],
  ["carrito", "carrito/", "h1"],
  ["club", "club/", "h1"],
  ["juego", "club/juego/", "h1"],
  ["cuenta", "cuenta/", "h1"],
  ["campañas (calendario)", "campana/", "h1"],
  ["Mi rack vacío", "favoritos/", "h1"],
  ["ayuda del box", "preguntas/", "h1"],
  ["términos", "terminos/", "h1"],
  ["privacidad", "privacidad/", "h1"],
  ["arrepentimiento", "arrepentimiento/", "h1"],
  ["404 dentro de la tienda", "no-existe/", "h1"],
  ["campaña en sala de espera", "campana/?id=black-friday&fase=espera", "h1"],
  ["campaña en vivo (drop)", "campana/?id=black-friday&fase=vivo", "h1"],
  ["panel hoy en tu tienda (R4a)", "admin-demo/", "[data-action]"],
  ["panel productos", "admin-demo/productos/", "h1"],
  ["panel editor", "admin-demo/productos/editar/?id=overvolt-pre", "h1"],
  ["panel pedidos", "admin-demo/pedidos/", "h1"],
  ["panel clientes", "admin-demo/usuarios/", "h1"],
  ["panel marketing (ruta vieja, lleva a Campañas)", "admin-demo/marketing/", "h1"],
  ["panel campañas", "admin-demo/campanas/", "[data-campaign-chip]"],
  ["panel editor de campaña", "admin-demo/campanas/editar/?id=black-friday", "[data-preview='desktop']"],
  ["panel piezas de campaña", "admin-demo/campanas/piezas/?id=black-friday", "[data-piece='story']"],
  ["panel carrusel", "admin-demo/contenido/carrusel/", "h1"],
  ["panel packs", "admin-demo/packs/", "h1"],
  ["panel editor de pack", "admin-demo/packs/editar/?id=hipertrofia", "h1"],
  ["panel suscripciones", "admin-demo/packs/?ver=suscripciones", "h1"],
  ["panel categorías, objetivos y deportes", "admin-demo/categorias/", "h1"],
  ["regalá energía (R3b)", "regalar/", "h1"],
  ["taquilla de regalos (R3b)", "regalo/", "h1"],
  ["panel regalos: gift cards (R3b)", "admin-demo/regalos/", "h1"],
  ["panel regalos: estados y sabor elegido (R3b)", "admin-demo/regalos/?ver=regalos", "h1"],
  // R4a: pantallas con pestañas (barra de la sección y subpestañas).
  ["panel promos: cupones (R4a)", "admin-demo/promos/", "[role=tablist]"],
  ["panel promos: ruleta con subpestañas (R4a)", "admin-demo/cupones/ruleta/", "[role=tablist]"],
  ["panel promos: descuento stack (R4a)", "admin-demo/descuento-stack/", "[role=tablist]"],
  ["panel promos: misiones (R4a)", "admin-demo/misiones/", "[role=tablist]"],
  ["panel pedidos: pagos manuales (R4a)", "admin-demo/pagos/", "[role=tablist]"],
  ["panel compras: proveedores (R4a)", "admin-demo/proveedores/", "[role=tablist]"],
  ["panel ajustes: contacto (R4a)", "admin-demo/ajustes/", "[role=tablist]"],
  ["panel ajustes: emails con subpestañas (R4a)", "admin-demo/emails/", "[role=tablist]"],
];

interface Violation { id: string; impact: string | null; help: string; nodes: { target: string[]; failureSummary?: string }[] }

async function audit(page: Page): Promise<Violation[]> {
  // Con content-visibility:auto (pie, secciones de abajo) axe no ve el fondo y mide contra el de la página.
  await page.addStyleTag({ content: ".cv-auto { content-visibility: visible !important; }" });
  await page.addScriptTag({ path: AXE });
  return page.evaluate(async (tags) => {
    const axe = (window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: Violation[] }> } }).axe;
    const r = await axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 6).map((n) => ({ target: n.target, failureSummary: n.failureSummary })) }));
  }, TAGS);
}

const describe = (vs: Violation[]) => vs.map((v) => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.map((n) => `   ${n.target.join(" ")}\n     ${n.failureSummary?.replace(/\n/g, " | ")}`).join("\n")}`).join("\n");

for (const mode of ["dark", "light"] as const) {
  test.describe(`axe AA en modo ${mode === "dark" ? "oscuro" : "claro"}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((m) => { try { localStorage.setItem("volta-theme", m); localStorage.setItem("volta-sound", "off"); } catch { /* sin almacenamiento */ } }, mode);
    });
    for (const [name, path, ready] of PAGES) {
      test(`${name}`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator(ready).first()).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
        // Lo que entra con fundido (aunque sea corto) termina antes de medir contraste.
        await page.waitForTimeout(400);
        const found = await audit(page);
        expect(found, describe(found)).toEqual([]);
      });
    }
    test("panel: el “?” de una pantalla abre su ayuda en un panel (R4a)", async ({ page }) => {
      await page.goto("admin-demo/promos/");
      await page.getByRole("button", { name: "Ayuda: Cupones" }).click();
      await expect(page.getByRole("dialog", { name: "Cupones" })).toBeVisible();
      await page.waitForTimeout(500);
      const found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("inicio: pestaña Deportes de \"Entrená por objetivo o por deporte\"", async ({ page }) => {
      await page.goto("");
      const section = page.locator("section[aria-labelledby='objetivos-title']");
      await section.scrollIntoViewIfNeeded();
      await section.getByRole("tab", { name: /Deportes/ }).click();
      await expect(section.getByRole("tabpanel", { name: /Deportes/ })).toBeVisible();
      await page.waitForTimeout(400);
      const found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("club con la cuenta demo (R2c)", async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("volta-demo:account", JSON.stringify({ state: { user: { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" }, usedRewards: [], wheelPrize: null }, version: 0 }));
        localStorage.setItem("volta-demo:club", JSON.stringify({ state: { checkins: [], sportTried: "boxeo", claims: [] }, version: 2 }));
      });
      await page.goto("club/");
      await expect(page.getByText("Tus puntos del mes", { exact: true })).toBeVisible();
      await page.waitForTimeout(400);
      const found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("disco olímpico con «Cargá la barra» y Shaker Rush con el resultado arcade (R2c)", async ({ page }) => {
      await page.addInitScript(() => { (window as unknown as { __voltaGameTest: object }).__voltaGameTest = { seed: 11, autopilot: true }; });
      await page.clock.install({ time: new Date("2026-10-15T12:00:00-03:00") });
      await page.goto("club/");
      await page.getByRole("button", { name: "Girar la ruleta" }).click();
      await expect(page.getByRole("dialog", { name: "Ruleta de cupones" }).getByRole("button", { name: /Cargá la barra/ })).toBeVisible();
      let found = await audit(page);
      expect(found, describe(found)).toEqual([]);
      await page.goto("club/juego/");
      await expect(page.getByRole("button", { name: "Jugar", exact: true })).toBeEnabled();
      await page.clock.pauseAt(new Date("2026-10-15T12:05:00-03:00"));
      await page.getByRole("button", { name: "Jugar", exact: true }).click();
      await page.clock.runFor(50_000);
      await expect(page.getByRole("button", { name: "Usar cupón ahora" })).toBeVisible();
      await page.clock.resume();
      await page.waitForTimeout(400);
      found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("regalo (R3b): locker con combinación (con error) y la tarjeta de atleta", async ({ page }) => {
      const gift = { code: "REGALO-10CK-000H", from: "Ro", to: "Nacho", message: "Para el lunes: pierna y después batido.", occasion: "dia-del-padre", opening: "locker",
        item: { slug: "ionic-whey", name: "Ionic Whey 100%", variant: "Chocolate · 2 lb (907 g)" }, createdAt: "2026-10-02T15:30:00.000Z" };
      await page.addInitScript((g) => localStorage.setItem("volta-demo:gifts", JSON.stringify({ state: { sent: [g], saved: [], opened: [] }, version: 0 })), gift);
      await page.goto(`regalo/?c=${gift.code}`);
      const stage = page.getByRole("dialog", { name: "Regalo de Ro para Nacho" });
      const code = stage.getByLabel("Combinación del locker");
      await expect(code).toBeVisible();
      await page.waitForTimeout(400);
      let found = await audit(page);
      expect(found, describe(found)).toEqual([]);
      await expect(async () => {
        await code.fill("1234");
        await stage.getByRole("button", { name: "Abrir", exact: true }).click();
        await expect(stage.getByRole("alert")).toBeVisible({ timeout: 1000 });
      }).toPass({ timeout: 15_000 });
      found = await audit(page);
      expect(found, describe(found)).toEqual([]);
      await code.fill("0210");
      await stage.getByRole("button", { name: "Abrir", exact: true }).click();
      await expect(stage.getByRole("heading", { name: gift.item.name })).toBeVisible();
      await page.waitForTimeout(800);
      found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("inicio con campaña: drop de Black Friday (R3a) y modo vitrina", async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: "black-friday" }, version: 0 })));
      await page.goto("");
      await expect(page.locator("[data-theme-banner='black-friday']")).toBeVisible();
      await page.waitForTimeout(400);
      let found = await audit(page);
      expect(found, describe(found)).toEqual([]);
      await page.getByRole("button", { name: "Probar temáticas" }).first().click();
      await page.getByRole("dialog", { name: "Probar temáticas" }).getByRole("button", { name: /Modo vitrina/ }).click();
      await expect(page.getByRole("region", { name: "Modo vitrina" })).toBeVisible();
      await page.waitForTimeout(400);
      found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("catálogo: panel de filtros del celular y selector del comparador", async ({ page }) => {
      await page.goto("categorias/?sello=vegano#catalogo");
      await page.locator("#catalogo").getByRole("button", { name: /^Filtros/ }).click();
      await expect(page.getByRole("dialog", { name: "Filtros" })).toBeVisible();
      await page.waitForTimeout(500);
      let found = await audit(page);
      expect(found, describe(found)).toEqual([]);
      await page.goto("comparar/?p=ionic-whey,proteina-vegana");
      await page.getByRole("button", { name: "Cambiar Ionic Whey 100%" }).click();
      await expect(page.getByRole("dialog", { name: "Cambiar Ionic Whey 100%" })).toBeVisible();
      await page.waitForTimeout(500);
      found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("buscador superpuesto con resultados y una opción activa", async ({ page }) => {
      await page.goto("");
      await page.getByRole("button", { name: "Buscar productos" }).filter({ visible: true }).first().click();
      const combo = page.getByRole("combobox", { name: "Buscar productos" });
      await expect(combo).toBeFocused();
      await combo.fill("vegano");
      await combo.press("ArrowDown");
      await page.waitForTimeout(500);
      const found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("Mi rack con productos y avisos (activo y saltado)", async ({ page }) => {
      await page.addInitScript(() => {
        try {
          localStorage.setItem("volta-demo:favorites", JSON.stringify({ state: { slugs: ["glutamina", "ionic-whey", "guantes-boxeo", "creatina-monohidrato"] }, version: 0 }));
          localStorage.setItem("volta-demo:rack-alerts", JSON.stringify({ state: { items: [
            { slug: "glutamina", variantId: "x", price: 99900, wasOut: false },
            { slug: "ionic-whey", variantId: "x", price: 1, wasOut: false },
          ] }, version: 0 }));
        } catch { /* sin almacenamiento */ }
      });
      await page.goto("favoritos/");
      await expect(page.locator("[data-rack-alert='triggered']")).toBeVisible();
      await page.waitForTimeout(400);
      const found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("invitación al quiz de la primera visita", async ({ page }) => {
      await page.addInitScript(() => { try { localStorage.removeItem("volta-quiz-invite"); } catch { /* sin almacenamiento */ } });
      await page.goto("");
      await expect(page.getByRole("dialog", { name: "¿Armamos tu rutina en 1 minuto?" })).toBeVisible();
      await page.waitForTimeout(500);
      const found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("R2b: bolso, checkout en 3 pasos, ficha de entrega, seguimiento con lote y Mi box", async ({ page }) => {
      test.setTimeout(120_000);
      await page.addInitScript(() => {
        if (sessionStorage.getItem("seeded")) return;
        sessionStorage.setItem("seeded", "1");
        localStorage.setItem("volta-demo:cart", JSON.stringify({ state: { lines: [{ id: "l1", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }, { id: "l2", productSlug: "overvolt-pre", variantId: "ov-frutos-rojos-300", quantity: 1 }] }, version: 0 }));
      });
      const check = async () => {
        await page.waitForTimeout(400);
        const found = await audit(page);
        expect(found, describe(found)).toEqual([]);
      };
      await page.goto("");
      await expect(async () => {
        if (!(await page.getByRole("dialog", { name: "Carrito" }).isVisible())) await page.getByRole("button", { name: "Carrito, 2 productos" }).click({ timeout: 1000 });
        await expect(page.getByRole("dialog", { name: "Carrito" })).toBeVisible({ timeout: 1000 });
      }).toPass();
      await check();
      await page.goto("checkout/");
      await expect(page.locator("#checkout-step")).toBeVisible();
      const toggle = page.getByRole("button", { name: /Ver ticket/ });
      if (await toggle.isVisible()) await toggle.click();
      await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
      await page.getByLabel("Email").fill("juana@ejemplo.com");
      await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
      await page.getByText("Cadete en Mar del Plata").click();
      await page.getByLabel("Calle").fill("Güemes");
      await page.getByLabel("Altura").fill("2500");
      await page.getByLabel("Código postal").fill("7600");
      await check();
      await page.getByRole("button", { name: "Continuar al pago" }).click();
      await page.getByText("Transferencia bancaria").click();
      await check();
      await page.getByRole("button", { name: "Revisar pedido" }).click();
      await expect(page.getByRole("heading", { level: 2, name: "Revisar" })).toBeVisible();
      await check();
      await page.getByRole("checkbox", { name: /Acepto los/ }).check();
      await page.getByRole("button", { name: "Confirmar pedido" }).click();
      await expect(page.locator("section[aria-labelledby=ficha-entrega]")).toBeVisible();
      await page.getByRole("button", { name: "Activar avisos de recompra" }).click();
      await check();
      await page.goto("pedido/demo-volta-entregado/");
      await expect(page.getByText("LOTE").first()).toBeVisible();
      await check();
      await page.goto("cuenta/");
      await expect(async () => {
        if (await page.getByRole("button", { name: "Entrar a la cuenta demo" }).isVisible()) await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click({ timeout: 1000 });
        await expect(page.getByRole("list", { name: "Potes en uso" })).toBeVisible({ timeout: 1000 });
      }).toPass();
      // Se mide como se abre la cuenta: desde arriba (el dock fijo del celular tapa lo que quede debajo al bajar).
      await page.evaluate(() => window.scrollTo(0, 0));
      await check();
    });
    test("R3b: armador Regalá energía (gift card y locker), sabor abierto para elegir y Mis regalos", async ({ page }) => {
      const check = async () => {
        await page.waitForTimeout(400);
        const found = await audit(page);
        expect(found, describe(found)).toEqual([]);
      };
      await page.goto("p/ionic-whey/");
      const modal = page.getByRole("dialog", { name: "Regalá energía" });
      await expect(async () => {
        if (!(await modal.isVisible())) await page.getByRole("region", { name: "Elegí sabor, tamaño y cantidad" }).getByRole("button", { name: "Regalar ahora" }).click({ timeout: 1000 });
        await expect(modal).toBeVisible({ timeout: 1000 });
      }).toPass();
      await modal.getByText("Que elija el sabor").click();
      await modal.getByText("Locker con combinación", { exact: true }).click();
      await check();
      await modal.getByText("Gift card con monto").click();
      await check();
      await page.keyboard.press("Escape");
      await page.goto("regalo/?c=REGALO-SAB0-R01D");
      const stage = page.getByRole("dialog", { name: "Regalo de Mili para Fran" });
      await stage.getByLabel("Combinación del locker").fill("0310");
      await stage.getByRole("button", { name: "Abrir", exact: true }).click();
      await stage.getByRole("button", { name: "Elegí tu sabor" }).click();
      await expect(stage.getByRole("heading", { name: "Elegí tu sabor" })).toBeVisible();
      await check();
      await page.addInitScript(() => { try { localStorage.setItem("volta-demo:account", JSON.stringify({ state: { user: { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" } }, version: 0 })); } catch { /* sin almacenamiento */ } });
      await page.goto("cuenta/#regalos");
      await expect(page.getByRole("list", { name: "Mis gift cards" })).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await check();
    });
    test("quiz: deporte y resultado con Tu programa", async ({ page }) => {
      const answers = { goals: ["fuerza", "salud"], sport: "futbol", days: "3-4", time: "tarde", restrictions: [] };
      await page.addInitScript((a) => { try { localStorage.setItem("volta-demo:quiz", a); } catch { /* sin almacenamiento */ } }, JSON.stringify(answers));
      await page.goto("crear/quiz/");
      await page.getByRole("checkbox", { name: /^Fuerza/ }).check();
      await page.getByRole("button", { name: "Siguiente" }).click();
      await expect(page.getByRole("heading", { level: 2, name: "¿Hacés algún deporte?" })).toBeFocused();
      await page.waitForTimeout(400);
      let found = await audit(page);
      expect(found, describe(found)).toEqual([]);
      // R2c: elegir el deporte pasa sola a la placa de días.
      await page.getByRole("radio", { name: /^Fútbol/ }).click();
      await expect(page.getByRole("heading", { level: 2, name: "¿Cuántos días por semana entrenás?" })).toBeFocused();
      await page.waitForTimeout(400);
      found = await audit(page);
      expect(found, describe(found)).toEqual([]);
      await page.goto("crear/quiz/");
      await page.getByRole("button", { name: "Ver mi último programa" }).click();
      await expect(page.getByRole("region", { name: "Comprar tu programa" })).toBeVisible();
      await page.waitForTimeout(800);
      found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
  });
}

test.describe("axe AA con paneles abiertos", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("volta-sound", "off");
        localStorage.setItem("volta-demo:cart", JSON.stringify({ state: { lines: [{ id: "l1", productSlug: "overvolt-pre", variantId: "ov-frutos-rojos-300", quantity: 2 }] }, version: 0 }));
        localStorage.setItem("volta-demo:account", JSON.stringify({ state: { wheelPrize: { code: "DEMO", label: "Premio", at: "2026-10-10T12:00:00.000Z" } }, version: 0 }));
      } catch { /* sin almacenamiento */ }
    });
  });

  test("carrito lateral al agregar desde la ficha", async ({ page }) => {
    await page.goto("p/overvolt-pre/");
    await page.getByRole("button", { name: /Agregar al carrito/ }).filter({ visible: true }).first().click();
    await expect(page.getByRole("dialog", { name: "Carrito" })).toBeVisible();
    await page.waitForTimeout(500);
    const found = await audit(page);
    expect(found, describe(found)).toEqual([]);
  });

  test("menú del celular", async ({ page }) => {
    await page.goto("");
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(500);
    const found = await audit(page);
    expect(found, describe(found)).toEqual([]);
  });

  test("checkout con un producto", async ({ page }) => {
    await page.goto("checkout/");
    await expect(page.getByLabel("Nombre y apellido")).toBeVisible();
    await page.waitForTimeout(400);
    const found = await audit(page);
    expect(found, describe(found)).toEqual([]);
  });
});
