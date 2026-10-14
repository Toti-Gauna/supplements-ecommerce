import { expect, test } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

// Rutas relativas (sin "/" inicial) para respetar el basePath del baseURL.
const ROUTES = [
  ["", "Cargá tu mejor versión"],
  ["buscar/?q=creatna", "Buscar"],
  ["buscar/?objetivo=masa-muscular", "Buscar"],
  ["categorias/", "Todas las categorías"],
  ["c/proteinas/", "Proteínas"],
  ["p/ionic-whey/", "Ionic Whey 100%"],
  ["crear/", "Armá tu stack"],
  ["crear/quiz/", "¿Qué necesitás?"],
  ["cupones/", "Mis cupones"],
  ["carrito/", "Tu carrito"],
  ["checkout/", "Finalizar compra"],
  ["checkout/confirmacion/", "Confirmación"],
  ["pedido/demo-volta/", "Seguimiento de tu pedido"],
  ["cuenta/", "Mi cuenta"],
  ["preguntas/", "Preguntas frecuentes"],
  ["terminos/", "Términos y condiciones"],
  ["privacidad/", "Política de privacidad"],
  ["arrepentimiento/", "Botón de arrepentimiento"],
  ["club/", "Sumá carga. Subí de nivel."],
  ["regalo/", "¿Te hicieron un regalo?"],
] as const;

test.describe("rutas directas y refresh bajo el subpath", () => {
  for (const [path, heading] of ROUTES) {
    test(`/${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      const target = page.getByRole("heading", { level: path ? 1 : 2, name: heading });
      await expect(target).toBeVisible();
      await page.reload();
      await expect(target).toBeVisible();
      const overflow = await horizontalOverflow(page);
      expect(overflow, "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);
    });
  }

  test("sin barra final redirige y una ruta inexistente da 404 con la página de la tienda", async ({ page }) => {
    const res = await page.goto("p/omega-3");
    expect(page.url()).toMatch(/\/p\/omega-3\/$/);
    expect(res?.status()).toBe(200);
    const missing = await page.goto("p/no-existe/");
    expect(missing?.status()).toBe(404);
  });

  test("assets y metadatos salen del basePath", async ({ page, request }) => {
    await page.goto("");
    const scripts = await page.locator("script[src]").evaluateAll((els) => els.map((e) => (e as HTMLScriptElement).src));
    const base = new URL(page.url()).pathname;
    for (const src of scripts) expect(new URL(src).pathname.startsWith(base)).toBe(true);
    expect((await request.get("sitemap.xml")).status()).toBe(200);
    const og = await request.get("og.png");
    expect(og.headers()["content-type"]).toBe("image/png");
  });
});
