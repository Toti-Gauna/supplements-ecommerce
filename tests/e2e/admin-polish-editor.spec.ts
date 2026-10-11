import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.20 (editor por pasos, foto primero) y 8.3.21 (vista previa en la tienda con el borrador sin guardar). */

const base = () => `http://localhost:${process.env.E2E_PORT ?? "4173"}${process.env.PAGES_BASE_PATH ?? ""}/`;
const STEPS = ["foto", "datos", "venta", "variantes", "envio", "personalizacion", "revision"];
const order = (page: Page) => page.locator("[data-step]").evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.step));
const steps = (page: Page) => page.getByRole("navigation", { name: "Pasos del producto" }).filter({ visible: true });
const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!;
const total = async (page: Page) => Number((await page.getByText(/El archivo \.xlsx lleva \d+ productos/).textContent())!.match(/lleva (\d+)/)![1]);

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false, contextOptions: { reducedMotion: "reduce" } });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1300, 500); });

  test("8.3.20 edición: foto primero, pasos a la derecha con estado por validación; tocar un paso lleva al bloque sin perder lo escrito", async ({ page }) => {
    await page.goto("admin-demo/productos/editar/?id=vela-caniche");
    await expect(page.getByRole("heading", { level: 1, name: /Editar: Vela caniche/ })).toBeVisible();
    expect(await order(page)).toEqual(STEPS);
    const rail = steps(page);
    expect((await rail.boundingBox())!.x).toBeGreaterThan((await page.locator("form").boundingBox())!.x + 500);
    await expect(rail.getByRole("button", { name: "2. Datos generales, completo" })).toBeVisible();
    await expect(rail.getByRole("button", { name: "5. Medidas de envío, por completar" })).toBeVisible();
    await page.getByLabel("Nombre", { exact: true }).fill("Vela caniche XL");
    await rail.getByRole("button", { name: /Variantes, precio y stock/ }).click();
    await expect(rail.getByRole("button", { name: /Variantes, precio y stock/ })).toHaveAttribute("aria-current", "step");
    await expect(page.locator("#paso-variantes-t")).toBeFocused();
    const top = (await box(page, "[data-admin-topbar]"));
    await expect.poll(async () => (await box(page, "#paso-variantes")).y).toBeGreaterThanOrEqual(top.y + top.height);
    expect((await box(page, "#paso-variantes")).y).toBeLessThan(top.y + top.height + 40);
    await rail.getByRole("button", { name: /Datos generales/ }).click();
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Vela caniche XL");
    // Sin texto alternativo no se puede guardar: el error aparece en su paso y la barra lo cuenta.
    await page.getByLabel("Texto alternativo (alt)").fill("");
    await expect(rail.getByRole("button", { name: "1. Foto y texto alternativo, por completar" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar (solo en esta demo)" }).click();
    await expect(page.locator("#paso-foto").getByRole("alert")).toContainText("Escribí el texto alternativo");
    await expect(rail.getByRole("button", { name: "1. Foto y texto alternativo, con errores" })).toBeVisible();
    await expect(page.locator("[data-editor-bar]")).toContainText("Faltan datos en 1 paso");
    await page.getByLabel("Texto alternativo (alt)").fill("Vela con forma de caniche");
    await expect(rail.getByRole("button", { name: "1. Foto y texto alternativo, completo" })).toBeVisible();
    // Al final, la barra ocupa su lugar: no tapa el último bloque.
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(async () => (await box(page, "[data-editor-bar]")).y).toBeGreaterThanOrEqual((await box(page, "#paso-revision")).y + (await box(page, "#paso-revision")).height);
    await page.getByRole("button", { name: "Guardar (solo en esta demo)" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Producto guardado" })).toBeVisible();
    await expect(page).toHaveURL(/admin-demo\/productos\/$/);
  });

  test("8.3.21 vista previa: muestra lo no guardado, no compra ni publica; Volver y Atrás devuelven borrador, paso y scroll", async ({ page }) => {
    await page.goto("admin-demo/productos/editar/?id=vela-caniche");
    await page.getByLabel("Nombre", { exact: true }).fill("Vela caniche borrador");
    await steps(page).getByRole("button", { name: /Personalización/ }).click();
    await page.waitForTimeout(400);
    const y = await page.evaluate(() => scrollY);
    await page.getByRole("button", { name: "Ver en tienda" }).click();
    await expect(page).toHaveURL(/vista-previa\/\?borrador=editar%3Avela-caniche/);
    await expect(page.getByRole("heading", { level: 1, name: "Vela caniche borrador" })).toBeVisible();
    const bar = page.getByRole("complementary", { name: "Vista previa sin publicar" });
    await expect(bar).toBeVisible();
    await expect(page.getByRole("button", { name: "Comprar ahora" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Regalar ahora" })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Carrito, 0 productos/ })).toBeVisible();
    await bar.getByRole("button", { name: "Volver al editor" }).click();
    await expect(page).toHaveURL(/productos\/editar\/\?id=vela-caniche$/);
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Vela caniche borrador");
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y - 40);
    expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(40);
    await expect(steps(page).getByRole("button", { name: /Personalización/ })).toHaveAttribute("aria-current", "step");
    await expect(page.getByText("Recuperamos los cambios sin guardar")).toHaveCount(0);
    // Atrás del navegador hace lo mismo.
    await page.getByRole("button", { name: "Ver en tienda" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Vela caniche borrador" })).toBeVisible();
    await page.goBack();
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Vela caniche borrador");
    // Nada se publicó: la tienda sigue con el nombre guardado y el carrito vacío.
    await page.goto("p/vela-caniche/");
    await expect(page.getByRole("heading", { level: 1, name: "Vela caniche", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Carrito, 0 productos/ })).toBeVisible();
    // Entrar de nuevo al editor recupera el borrador y deja descartarlo.
    await page.goto("admin-demo/productos/editar/?id=vela-caniche");
    await expect(page.getByText("Recuperamos los cambios sin guardar de la última vez.")).toBeVisible();
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Vela caniche borrador");
    await page.getByRole("button", { name: "Descartar cambios" }).click();
    await page.getByRole("dialog", { name: "¿Descartar los cambios?" }).getByRole("button", { name: "Descartar cambios" }).click();
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Vela caniche");
    await page.reload();
    await expect(page.getByText("Recuperamos los cambios sin guardar")).toHaveCount(0);
  });

  test("8.3.21 alta: borrador con id temporal; la vista previa no lo publica, ir y volver no duplica, guardar crea uno solo", async ({ page }) => {
    await page.goto("admin-demo/productos/");
    const before = await total(page);
    await page.getByRole("link", { name: "Nuevo producto" }).click();
    await expect(page).toHaveURL(/productos\/editar\/\?nuevo=1$/);
    await expect(page.getByRole("heading", { level: 1, name: /Nuevo producto/ })).toBeVisible();
    expect(await order(page)).toEqual(STEPS);
    await expect(page.locator("[data-editor-bar]")).toContainText("Completá los pasos y guardá para crearlo.");
    await page.getByLabel("Texto alternativo (alt)").fill("Taza blanca con huellas");
    await page.getByLabel("Nombre", { exact: true }).fill("Taza huellitas");
    await page.getByLabel("Precio base ilustrativo").fill("15000");
    for (let i = 0; i < 2; i++) {
      await page.getByRole("button", { name: "Ver en tienda" }).click();
      await expect(page.getByRole("heading", { level: 1, name: "Taza huellitas" })).toBeVisible();
      await expect(page.getByRole("note").filter({ hasText: "Vista previa del panel" })).toContainText("Está pausado");
      if (i === 0) await page.getByRole("button", { name: "Volver a la creación" }).click(); else await page.goBack();
      await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Taza huellitas");
    }
    // El borrador no está en el catálogo.
    await page.goto("admin-demo/productos/");
    expect(await total(page)).toBe(before);
    await page.getByRole("link", { name: "Nuevo producto" }).click();
    await expect(page.getByLabel("Precio base ilustrativo")).toHaveValue("15000");
    await page.getByRole("button", { name: "Guardar (solo en esta demo)" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Producto creado (pausado)" })).toBeVisible();
    await expect(page).toHaveURL(/admin-demo\/productos\/$/);
    expect(await total(page)).toBe(before + 1);
    await page.getByRole("searchbox").fill("taza huellitas");
    await expect(page.getByRole("row").filter({ hasText: "Taza huellitas" })).toHaveCount(1);
    // El acceso viejo de ⌘K abre un alta limpia, sin lo anterior.
    await page.goto("admin-demo/productos/?nuevo=1");
    await expect(page).toHaveURL(/productos\/editar\/\?nuevo=1$/);
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("");
  });
});

for (const [label, width, height, touch] of [["escritorio chico", 1024, 768, false], ["iPad vertical", 768, 1024, true], ["celular", 390, 844, true]] as const) {
  test(`8.3.20/8.3.21 a ${label} ${width}px: pasos compactos arriba, bloques y campos sin tapar, vista previa sin desborde`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, reducedMotion: "reduce", locale: "es-AR" });
    const page = await ctx.newPage();
    if (!touch) await page.mouse.move(width - 20, 500);
    await page.goto(base() + "admin-demo/productos/editar/?id=home-spray");
    await expect(page.getByRole("heading", { level: 1, name: /Editar: Home spray/ })).toBeVisible();
    const nav = steps(page);
    await expect(nav).toHaveAttribute("data-compact-steps");
    await expect(nav).toContainText("Paso 1 de 7");
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await nav.getByRole("button", { name: /^4\. Variantes/ }).click();
    await expect(nav).toContainText("Paso 4 de 7");
    await expect.poll(async () => (await box(page, "#paso-variantes")).y).toBeGreaterThanOrEqual((await nav.boundingBox())!.y + (await nav.boundingBox())!.height - 1);
    // Un campo enfocado no queda debajo de la barra de guardado ni de los pasos.
    await page.getByLabel("Peso").focus();
    const field = (await page.getByLabel("Peso").boundingBox())!;
    const bar = await box(page, "[data-editor-bar]");
    expect(field.y + field.height).toBeLessThanOrEqual(bar.y);
    expect(field.y).toBeGreaterThanOrEqual((await nav.boundingBox())!.y + (await nav.boundingBox())!.height);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(async () => (await box(page, "[data-editor-bar]")).y).toBeGreaterThanOrEqual((await box(page, "#paso-revision")).y + (await box(page, "#paso-revision")).height - 1);
    await page.getByRole("button", { name: "Ver en tienda" }).click();
    const preview = page.getByRole("complementary", { name: "Vista previa sin publicar" });
    await expect(preview.getByRole("button", { name: "Volver al editor" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await ctx.close();
  });
}
