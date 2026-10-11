import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow, makePng } from "./helpers";

/** Polish 8.3.26 (Temáticas: encabezado y "Cómo se elige") y 8.3.28 (Contenido por tarjetas y editor del carrusel). */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("volta-demo:admin") ?? "null")?.state?.data?.content ?? null);
const preview = (page: Page) => page.locator("[data-slide-preview]");
const titleField = (page: Page) => page.getByRole("textbox", { name: "Título", exact: true });

/** PNG de prueba de `w`×`h` (para la imagen chica que se rechaza por medidas). */
const pngOf = (page: Page, w: number, h: number) => page.evaluate(([cw, ch]) => {
  const c = document.createElement("canvas");
  c.width = cw; c.height = ch;
  c.getContext("2d")!.fillRect(0, 0, cw, ch);
  return c.toDataURL("image/png").split(",")[1]!;
}, [w, h] as const).then((b64) => Buffer.from(b64, "base64"));

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1240, 400); });

  test("8.3.26 Temáticas: la temática fija aparece solo en modo fijo y las tarjetas siguen al modo", async ({ page }) => {
    await page.goto("admin-demo/tematicas/");
    await expect(page.getByRole("link", { name: "Volver a Marketing" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /Temáticas/ })).toBeVisible();
    const mode = page.getByLabel("Modo", { exact: true });
    // Hasta la Fase 5 la tienda arranca sin temática (docs/plan-por-fases.md).
    await expect(mode).toHaveValue("off");
    await expect(page.getByLabel("Temática fija")).toHaveCount(0);
    await mode.selectOption("auto");
    await expect(mode).toHaveValue("auto");
    // En automático no hay selector de temática fija: no se confunde con la que sale por fecha.
    await expect(page.getByLabel("Temática fija")).toHaveCount(0);
    await expect(page.getByText(/usa sola la temática cuyas fechas incluyen hoy/)).toBeVisible();
    await expect(page.getByText("Próxima por fecha")).toBeVisible();
    await mode.selectOption("fixed");
    await page.getByLabel("Temática fija").selectOption("navidad");
    const today = page.locator("p").filter({ hasText: "Hoy ve el cliente" });
    await expect(today).toContainText("Navidad");
    await expect(today).toContainText("Temática fija, sin importar la fecha");
    await expect(page.locator("p").filter({ hasText: "Próxima por fecha" })).toContainText("En modo fijo no cambia sola: sigue Navidad.");
    await mode.selectOption("off");
    await expect(today).toContainText("Sin temática");
    await expect(page.getByLabel("Temática fija")).toHaveCount(0);
    // El botón de la demo sigue funcionando.
    await expect(page.getByRole("switch", { name: /Probar temáticas/ })).toBeVisible();
  });

  test("8.3.28 Contenido: tres tarjetas y cada subpágina tiene solo su tarea, con Volver", async ({ page }) => {
    await page.goto("admin-demo/contenido/");
    const parts = page.getByRole("list", { name: "Partes del contenido" });
    await expect(parts.getByRole("link")).toHaveCount(3);
    await expect(page.getByRole("button", { name: /Guardar/ })).toHaveCount(0);
    await parts.getByRole("link", { name: /Carrusel/ }).click();
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

  test("8.3.28 carrusel: elegir, editar, ver arriba, subir imagen y guardar actualiza la tienda sin tocar preguntas ni textos", async ({ page }) => {
    await page.goto("admin-demo/contenido/carrusel/");
    const before = await stored(page);
    const list = page.getByRole("list").filter({ has: page.getByRole("button", { name: /^Diapositiva 1:/ }) });
    await list.getByRole("button", { name: /^Diapositiva 2:/ }).click();
    await expect(page.getByRole("heading", { name: "Diapositiva 2" })).toBeVisible();
    await titleField(page).fill("Combos para regalar");
    await expect(preview(page)).toContainText("Combos para regalar");
    await expect(preview(page)).toContainText("Volta · 02");
    // Salir y volver conserva el borrador.
    await page.getByRole("link", { name: "Volver a Contenido" }).click();
    await page.getByRole("link", { name: /Carrusel/ }).click();
    await expect(page.getByText("Recuperamos los cambios del carrusel que quedaron sin guardar.")).toBeVisible();
    await list.getByRole("button", { name: /^Diapositiva 2:/ }).click();
    await expect(titleField(page)).toHaveValue("Combos para regalar");
    // Imagen: formato inválido, muy chica y válida.
    const file = page.locator("input[type=file]");
    await file.setInputFiles({ name: "notas.txt", mimeType: "text/plain", buffer: Buffer.from("hola") });
    await expect(page.getByRole("alert").filter({ hasText: "Subí JPG, PNG o WEBP" })).toBeVisible();
    await file.setInputFiles({ name: "chica.png", mimeType: "image/png", buffer: await pngOf(page, 200, 150) });
    await expect(page.getByRole("alert").filter({ hasText: "al menos 400 px" })).toBeVisible();
    await file.setInputFiles({ name: "pote.png", mimeType: "image/png", buffer: await makePng(page) });
    await expect(preview(page).locator("img")).toBeVisible();
    await expect(page.getByRole("button", { name: "Quitar imagen" })).toBeVisible();
    // Encuadre: mueve el punto visible de la imagen en la vista previa.
    await page.getByLabel("Horizontal").fill("20");
    await expect(preview(page).locator("img")).toHaveAttribute("style", /object-position: 20% 50%/);
    // Sin texto alternativo no se guarda; el error señala la diapositiva.
    await page.getByRole("button", { name: "Guardar carrusel" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Describí la imagen" })).toBeVisible();
    await page.getByLabel("Texto alternativo").fill("Pote de proteína sobre la mesada");
    await page.getByRole("button", { name: "Guardar carrusel" }).click();
    await expect(toast(page, "Carrusel guardado")).toBeVisible();
    const after = await stored(page);
    expect(after.slides[1].title).toBe("Combos para regalar");
    expect(after.slides[1].image.alt).toBe("Pote de proteína sobre la mesada");
    expect(after.slides[0].title).toBe(before?.slides?.[0]?.title ?? after.slides[0].title);
    if (before) { expect(after.faqs).toEqual(before.faqs); expect(after.homeCta).toEqual(before.homeCta); }
    await page.goto("");
    const hero = page.locator("section[aria-roledescription=carrusel]");
    await expect(hero.getByRole("img", { name: "Pote de proteína sobre la mesada" })).toBeAttached();
    await expect(hero.getByText("Combos para regalar")).toBeAttached();
  });

  test("8.3.28 carrusel: crear, reordenar y quitar no mezcla datos; texto largo falla con mensaje claro", async ({ page }) => {
    await page.goto("admin-demo/contenido/carrusel/");
    await expect(page.getByRole("button", { name: /^Diapositiva \d:/ })).toHaveCount(3);
    const original = await page.getByRole("button", { name: /^Diapositiva \d:/ }).evaluateAll((els) => els.map((e) => /^Diapositiva \d: (.*), (visible|oculta)/.exec(e.getAttribute("aria-label") ?? "")![1]));
    await page.getByRole("button", { name: "Agregar diapositiva" }).click();
    await expect(page.getByRole("heading", { name: "Diapositiva 4" })).toBeVisible();
    await titleField(page).fill("Una diapositiva con un título larguísimo que no entra en el carrusel del inicio");
    await expect(page.getByText(/sobran \d+/)).toBeVisible();
    await page.getByRole("button", { name: "Guardar carrusel" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /El título tiene \d+ caracteres; el máximo es 60/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Diapositiva 4: .*con errores/ })).toBeVisible();
    await titleField(page).fill("Diapositiva nueva");
    await page.getByRole("button", { name: "Subir diapositiva 4" }).click();
    await expect(page.getByRole("heading", { name: "Diapositiva 3" })).toBeVisible();
    await expect(titleField(page)).toHaveValue("Diapositiva nueva");
    // Quitar la que quedó cuarta (la tercera original) no toca la nueva ni las otras.
    await page.getByRole("button", { name: /^Diapositiva 4:/ }).click();
    const removed = await titleField(page).inputValue();
    expect(removed).not.toBe("Diapositiva nueva");
    await page.getByRole("button", { name: "Quitar", exact: true }).click();
    await page.getByRole("dialog", { name: "Quitar la diapositiva 4" }).getByRole("button", { name: "Quitar" }).click();
    await expect(page.getByRole("button", { name: /^Diapositiva \d:/ })).toHaveCount(3);
    await expect(page.getByRole("button", { name: /^Diapositiva 3:/ })).toContainText("Diapositiva nueva");
    await page.getByRole("button", { name: "Guardar carrusel" }).click();
    await expect(toast(page, "Carrusel guardado")).toBeVisible();
    const titles = (await stored(page)).slides.map((x: { title: string }) => x.title);
    expect(titles).toEqual([original[0], original[1], "Diapositiva nueva"]);
    expect(titles).not.toContain(removed);
  });

  test("8.3.28 carrusel: sin lugar en el navegador avisa y conserva el borrador", async ({ page }) => {
    // Simula el almacenamiento lleno: guardar el panel con una imagen falla (sin borrar nada de lo guardado).
    await page.addInitScript(() => {
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k: string, v: string) {
        if (this === window.localStorage && k === "volta-demo:admin" && v.includes("data:image/jpeg")) throw new DOMException("lleno", "QuotaExceededError");
        return set.call(this, k, v);
      };
    });
    await page.goto("admin-demo/contenido/carrusel/");
    await page.locator("input[type=file]").setInputFiles({ name: "pote.png", mimeType: "image/png", buffer: await makePng(page) });
    await page.getByLabel("Texto alternativo").fill("Pote sobre la mesada");
    await page.getByRole("button", { name: "Guardar carrusel" }).click();
    await expect(toast(page, "No hay lugar para guardar el carrusel")).toBeVisible();
    await expect(page.getByText(/Cambios sin guardar/)).toBeVisible();
    await expect(preview(page).locator("img")).toBeVisible();
    // Lo guardado no cambió y, al volver, el borrador sigue.
    expect((await stored(page))?.slides?.[0]?.image).toBeUndefined();
    await page.reload();
    await expect(page.getByText("Recuperamos los cambios del carrusel que quedaron sin guardar.")).toBeVisible();
    await expect(page.getByLabel("Texto alternativo")).toHaveValue("Pote sobre la mesada");
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
    // Título, bajada y botón de la diapositiva quedan dentro de la vista previa.
    const inner = await preview(page).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return [...el.querySelectorAll("p, span")].every((n) => { const b = n.getBoundingClientRect(); return b.width === 0 || (b.left >= r.left - 1 && b.right <= r.right + 1 && b.top >= r.top - 1 && b.bottom <= r.bottom + 1); });
    });
    expect(inner).toBe(true);
  });
}
