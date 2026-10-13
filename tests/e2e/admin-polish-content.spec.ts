import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";
/** Polish 8.3.26 (Temáticas: encabezado y "Cómo se elige"), 8.3.28 (Contenido por tarjetas) y carrusel BOX con imágenes propias. */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("volta-demo:admin") ?? "null")?.state?.data?.content ?? null);
const preview = (page: Page) => page.locator("[data-hero-preview]");
const titleField = (page: Page) => page.getByRole("textbox", { name: "Titular", exact: true });

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1240, 400); });

  test("8.3.26 Temáticas: la temática fija aparece solo en modo fijo y las tarjetas siguen al modo", async ({ page }) => {
    // La fecha de la demo: octubre de 2026 (sale el Día de la Madre y la próxima es Halloween).
    await page.clock.setFixedTime(new Date("2026-10-12T12:00:00-03:00"));
    await page.goto("admin-demo/tematicas/");
    await expect(page.getByRole("link", { name: "Volver a Marketing" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /Temáticas/ })).toBeVisible();
    const mode = page.getByLabel("Modo", { exact: true });
    await expect(mode).toHaveValue("off");
    await expect(page.locator("p").filter({ hasText: "Hoy ve el cliente" })).toContainText("Sin temática");
    await mode.selectOption("auto");
    await expect(page.getByRole("list", { name: "Temáticas por fecha" }).getByRole("listitem")).toHaveCount(12);
    await expect(page.getByLabel("Temática fija")).toHaveCount(0);
    await expect(page.getByText(/usa sola la temática cuyas fechas incluyen hoy/)).toBeVisible();
    const today = page.locator("p").filter({ hasText: "Hoy ve el cliente" });
    await expect(today).toContainText("Día de la Madre");
    await expect(page.locator("p").filter({ hasText: "Próxima por fecha" })).toContainText("Halloween");
    await mode.selectOption("fixed");
    await page.getByLabel("Temática fija").selectOption("navidad");
    await expect(today).toContainText("Navidad");
    await expect(today).toContainText("Temática fija, sin importar la fecha");
    await expect(page.locator("p").filter({ hasText: "Próxima por fecha" })).toContainText("En modo fijo no cambia sola: sigue Navidad.");
    await mode.selectOption("off");
    await expect(today).toContainText("Sin temática");
    await expect(page.getByLabel("Temática fija")).toHaveCount(0);
    await expect(page.getByRole("switch", { name: /Probar temáticas/ })).toBeVisible();
  });

  test("8.3.28 Contenido: tres tarjetas y cada subpágina tiene solo su tarea, con Volver", async ({ page }) => {
    await page.goto("admin-demo/contenido/");
    const parts = page.getByRole("list", { name: "Partes del contenido" });
    await expect(parts.getByRole("link")).toHaveCount(3);
    await expect(page.getByRole("button", { name: /Guardar/ })).toHaveCount(0);
    await parts.getByRole("link", { name: /Carrusel del inicio/ }).click();
    await expect(page).toHaveURL(/contenido\/carrusel\/$/);
    await expect(page.getByRole("button", { name: "Guardar carrusel" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Guardar (preguntas|textos)/ })).toHaveCount(0);
    await page.getByRole("link", { name: "Volver a Contenido" }).click();
    await parts.getByRole("link", { name: /Preguntas frecuentes/ }).click();
    await expect(page.getByRole("button", { name: "Guardar preguntas" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Guardar (carrusel|textos)/ })).toHaveCount(0);
    await page.goBack();
    await parts.getByRole("link", { name: /Textos de inicio/ }).click();
    await expect(page.getByRole("button", { name: "Guardar textos" })).toBeVisible();
  });

  test("Carrusel BOX: elegir, editar, ver arriba y guardar actualiza la tienda sin tocar preguntas ni textos", async ({ page }) => {
    await page.goto("admin-demo/contenido/carrusel/");
    await expect(page.getByRole("heading", { level: 1, name: "Carrusel del inicio" })).toBeVisible();
    const before = await stored(page);
    const list = page.getByRole("list").filter({ has: page.getByRole("button", { name: /^Destacado 1:/ }) });
    await list.getByRole("button", { name: /^Destacado 2:/ }).click();
    await expect(page.getByRole("heading", { name: "Destacado 2" })).toBeVisible();
    await titleField(page).fill("Fuerza que se nota");
    await page.getByLabel("Producto en el rack").selectOption({ label: "Isolate Zero" });
    await expect(preview(page)).toContainText("Fuerza que se nota");
    await expect(preview(page)).toContainText("Isolate Zero");
    await expect(preview(page).locator("svg[aria-label^='Isolate Zero']")).toBeVisible();
    // Salir y volver conserva el borrador.
    await page.getByRole("link", { name: "Volver a Contenido" }).click();
    await page.getByRole("link", { name: /Carrusel del inicio/ }).click();
    await expect(page.getByText("Recuperamos los cambios del carrusel que quedaron sin guardar.")).toBeVisible();
    await list.getByRole("button", { name: /^Destacado 2:/ }).click();
    await expect(titleField(page)).toHaveValue("Fuerza que se nota");
    await page.getByRole("button", { name: "Guardar carrusel" }).click();
    await expect(toast(page, "Carrusel guardado")).toBeVisible();
    const after = await stored(page);
    expect(after.hero[1]).toMatchObject({ headline: "Fuerza que se nota", productSlug: "isolate-zero" });
    expect(after.hero[0].headline).toBe(before?.hero?.[0]?.headline ?? after.hero[0].headline);
    if (before) { expect(after.faqs).toEqual(before.faqs); expect(after.homeCta).toEqual(before.homeCta); }
    // En la tienda: la diapositiva editada se puede elegir desde las marcas del carrusel.
    await page.goto("");
    const region = page.locator("section[aria-roledescription='carrusel']");
    await region.getByRole("button", { name: /Ir a la diapositiva 2:/ }).click();
    await expect(region.getByRole("heading", { level: 2, name: /Fuerza que se\s*nota/i })).toBeVisible();
  });

  test("Carrusel BOX: crear, reordenar y quitar no mezcla datos; titular largo y todo oculto fallan con mensaje claro", async ({ page }) => {
    await page.goto("admin-demo/contenido/carrusel/");
    const items = page.getByRole("button", { name: /^Destacado \d:/ });
    await expect(items).toHaveCount(3);
    const original = await items.evaluateAll((els) => els.map((e) => /^Destacado \d: (.*?), /.exec(e.getAttribute("aria-label") ?? "")![1]));
    await page.getByRole("button", { name: "Agregar destacado" }).click();
    await expect(page.getByRole("heading", { name: "Destacado 4" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Agregar destacado" })).toHaveCount(0);
    await titleField(page).fill("Un titular larguísimo que no entra en el póster del inicio");
    await expect(page.getByText(/sobran \d+/)).toBeVisible();
    await page.getByRole("button", { name: "Guardar carrusel" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /El titular tiene \d+ caracteres; el máximo es 40/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Destacado 4: .*con errores/ })).toBeVisible();
    await titleField(page).fill("Nuevo ingreso");
    await page.getByRole("button", { name: "Subir destacado 4" }).click();
    await expect(page.getByRole("heading", { name: "Destacado 3" })).toBeVisible();
    await expect(titleField(page)).toHaveValue("Nuevo ingreso");
    // Quitar el que quedó cuarto (el tercero original) no toca el nuevo ni los otros.
    await page.getByRole("button", { name: /^Destacado 4:/ }).click();
    const removed = await titleField(page).inputValue();
    await page.getByRole("button", { name: "Quitar", exact: true }).click();
    await page.getByRole("dialog", { name: "Quitar el destacado 4" }).getByRole("button", { name: "Quitar" }).click();
    await expect(items).toHaveCount(3);
    await expect(page.getByRole("button", { name: /^Destacado 3:/ })).toContainText("Nuevo ingreso");
    // Todos ocultos: no se guarda (el inicio quedaría sin hero).
    for (let i = 1; i <= 3; i++) {
      await page.getByRole("button", { name: new RegExp(`^Destacado ${i}:`) }).click();
      await page.getByRole("switch", { name: /Visible en la tienda/ }).click();
    }
    await page.getByRole("button", { name: "Guardar carrusel" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Dejá al menos un destacado visible" })).toBeVisible();
    await page.getByRole("switch", { name: /Visible en la tienda/ }).click();
    await page.getByRole("button", { name: "Guardar carrusel" }).click();
    await expect(toast(page, "Carrusel guardado")).toBeVisible();
    const headlines = (await stored(page)).hero.map((x: { headline: string }) => x.headline);
    expect(headlines).toEqual([original[0], original[1], "Nuevo ingreso"]);
    expect(headlines).not.toContain(removed);
  });
});

for (const [width, height] of [[1180, 820], [820, 1180], [375, 812]] as const) {
  test(`8.3.26/8.3.28 a ${width}×${height}: sin desbordes, controles legibles y vista previa entera`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("admin-demo/tematicas/");
    expect(await horizontalOverflow(page)).toBe(0);
    expect((await page.getByLabel("Modo", { exact: true }).boundingBox())!.width).toBeGreaterThanOrEqual(260);
    const a = (await page.locator("p").filter({ hasText: "Hoy ve el cliente" }).boundingBox())!;
    const b = (await page.locator("p").filter({ hasText: "Próxima por fecha" }).boundingBox())!;
    expect(a.x + a.width <= b.x + 1 || a.y + a.height <= b.y + 1).toBe(true);
    await page.goto("admin-demo/contenido/carrusel/");
    expect(await horizontalOverflow(page)).toBe(0);
    const box = (await preview(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    const inner = await preview(page).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return [...el.querySelectorAll("p, span")].every((n) => { const b = n.getBoundingClientRect(); return b.width === 0 || (b.left >= r.left - 1 && b.right <= r.right + 1 && b.top >= r.top - 1 && b.bottom <= r.bottom + 1); });
    });
    expect(inner).toBe(true);
  });
}
