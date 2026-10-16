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
  ["categoría", "categorias/", "h1"],
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
  ["panel inicio", "admin-demo/", "h1"],
  ["panel productos", "admin-demo/productos/", "h1"],
  ["panel editor", "admin-demo/productos/editar/?id=overvolt-pre", "h1"],
  ["panel pedidos", "admin-demo/pedidos/", "h1"],
  ["panel clientes", "admin-demo/usuarios/", "h1"],
  ["panel marketing", "admin-demo/marketing/", "h1"],
  ["panel carrusel", "admin-demo/contenido/carrusel/", "h1"],
  ["panel packs", "admin-demo/packs/", "h1"],
  ["panel editor de pack", "admin-demo/packs/editar/?id=hipertrofia", "h1"],
  ["panel suscripciones", "admin-demo/packs/?ver=suscripciones", "h1"],
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
    test("invitación al quiz de la primera visita", async ({ page }) => {
      await page.addInitScript(() => { try { localStorage.removeItem("volta-quiz-invite"); } catch { /* sin almacenamiento */ } });
      await page.goto("");
      await expect(page.getByRole("dialog", { name: "¿Armamos tu rutina en 1 minuto?" })).toBeVisible();
      await page.waitForTimeout(500);
      const found = await audit(page);
      expect(found, describe(found)).toEqual([]);
    });
    test("quiz: deporte y resultado con Tu programa", async ({ page }) => {
      const answers = { goals: ["fuerza", "salud"], sport: "futbol", days: "3-4", time: "tarde", restrictions: [] };
      await page.addInitScript((a) => { try { localStorage.setItem("volta-demo:quiz", a); } catch { /* sin almacenamiento */ } }, JSON.stringify(answers));
      await page.goto("crear/quiz/");
      await page.getByRole("checkbox", { name: /^Fuerza/ }).check();
      await page.getByRole("button", { name: "Siguiente" }).click();
      await page.getByRole("radio", { name: /^Fútbol/ }).check();
      await page.waitForTimeout(400);
      let found = await audit(page);
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
