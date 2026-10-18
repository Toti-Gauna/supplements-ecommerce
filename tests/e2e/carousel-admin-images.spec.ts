import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow, makePng } from "./helpers";

const content = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("volta-demo:admin") ?? "null")?.state?.data?.content);
const preview = (page: Page) => page.locator("[data-hero-preview]");
const save = (page: Page) => page.getByRole("button", { name: "Guardar carrusel" }).click();
const upload = async (page: Page) => page.getByLabel("Subir imagen propia", { exact: true }).setInputFiles({ name: "rack.png", mimeType: "image/png", buffer: await makePng(page) });

test("imagen propia: requiere alt, conserva el encuadre y el borrador, se publica y se puede quitar", async ({ page }) => {
  const network = guardNetwork(page);
  await page.goto("admin-demo/contenido/carrusel/");
  await upload(page);
  await expect(preview(page).locator("img")).toBeVisible();
  await save(page);
  await expect(page.getByRole("alert").filter({ hasText: "Describí la imagen" })).toBeVisible();
  await page.getByRole("textbox", { name: "Texto alternativo", exact: true }).fill("Pote de prueba sobre el rack");
  await page.getByRole("slider", { name: "Horizontal", exact: true }).press("Home");
  await page.getByRole("slider", { name: "Horizontal", exact: true }).press("ArrowRight");
  await page.getByRole("slider", { name: "Vertical", exact: true }).press("End");
  await page.getByRole("slider", { name: "Acercar", exact: true }).press("End");
  await expect(preview(page).locator("img")).toHaveCSS("object-position", "1% 100%");
  expect(await horizontalOverflow(page)).toBe(0);
  await page.getByRole("tab", { name: "Textos de inicio" }).click();
  await page.getByRole("tab", { name: "Carrusel", exact: true }).click();
  await expect(page.getByText("Recuperamos los cambios del carrusel que quedaron sin guardar.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Texto alternativo", exact: true })).toHaveValue("Pote de prueba sobre el rack");
  await save(page);
  await expect(page.getByRole("status").filter({ hasText: "Carrusel guardado" })).toBeVisible();
  const saved = await content(page);
  expect(saved.hero[0].image).toMatchObject({ alt: "Pote de prueba sobre el rack", frame: { x: 1, y: 100, zoom: 2 } });
  expect(saved.hero[0].image.src).toMatch(/^data:image\/jpeg;base64,/);
  await page.goto("");
  await expect(page.getByRole("img", { name: "Pote de prueba sobre el rack" })).toBeVisible();
  await page.goto("admin-demo/contenido/carrusel/");
  await page.getByRole("button", { name: "Centrar encuadre" }).click();
  await expect(preview(page).locator("img")).toHaveCSS("object-position", "50% 50%");
  await page.getByRole("button", { name: "Quitar imagen", exact: true }).click();
  await expect(preview(page).locator("img")).toHaveCount(0);
  await expect(preview(page).locator("svg[aria-label^='Ionic Whey']")).toBeVisible();
  await save(page);
  expect((await content(page)).hero[0].image).toBeUndefined();
  network();
});

test("imagen propia: rechaza formato, peso y medidas con mensajes claros", async ({ page }) => {
  await page.goto("admin-demo/contenido/carrusel/");
  const file = page.getByLabel("Subir imagen propia", { exact: true });
  await file.setInputFiles({ name: "archivo.pdf", mimeType: "application/pdf", buffer: Buffer.from("demo") });
  await expect(page.getByRole("alert").filter({ hasText: "JPG, PNG o WEBP" })).toBeVisible();
  await file.setInputFiles({ name: "grande.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
  await expect(page.getByRole("alert").filter({ hasText: "El máximo es 10 MB" })).toBeVisible();
  const small = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 300; canvas.height = 500;
    return canvas.toDataURL("image/png").split(",")[1]!;
  });
  await file.setInputFiles({ name: "chica.png", mimeType: "image/png", buffer: Buffer.from(small, "base64") });
  await expect(page.getByRole("alert").filter({ hasText: "al menos 400 px de lado" })).toBeVisible();
  await expect(preview(page).locator("img")).toHaveCount(0);
});

test("sin cuota de localStorage: avisa, conserva el borrador y permite corregir y guardar", async ({ page }) => {
  await page.goto("admin-demo/contenido/carrusel/");
  await upload(page);
  await page.getByRole("textbox", { name: "Texto alternativo", exact: true }).fill("Imagen del local");
  await save(page);
  const before = await content(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && key === "volta-demo:admin") throw new DOMException("Sin cuota", "QuotaExceededError");
      original.call(this, key, value);
    };
    (window as Window & { restoreStorage?: () => void }).restoreStorage = () => { Storage.prototype.setItem = original; };
  });
  await page.getByRole("textbox", { name: "Titular", exact: true }).fill("Cambios que siguen en el editor");
  await save(page);
  await expect(page.getByRole("status").filter({ hasText: "No hay lugar para guardar el carrusel" })).toBeVisible();
  expect((await content(page)).hero).toEqual(before.hero);
  await expect(page.getByRole("textbox", { name: "Titular", exact: true })).toHaveValue("Cambios que siguen en el editor");
  await expect(page.getByRole("button", { name: "Guardar carrusel" })).toBeEnabled();
  await page.evaluate(() => (window as Window & { restoreStorage?: () => void }).restoreStorage?.());
  await save(page);
  expect((await content(page)).hero[0].headline).toBe("Cambios que siguen en el editor");
});

test("sin cuota de sessionStorage: el borrador queda en memoria con aviso antes de salir", async ({ page }) => {
  await page.goto("admin-demo/contenido/carrusel/");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === sessionStorage && key.includes("content-draft:hero")) throw new DOMException("Sin cuota", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page.getByRole("textbox", { name: "Titular", exact: true }).fill("Borrador local");
  await expect(page.getByRole("alert").filter({ hasText: "No hay espacio para conservar este borrador" })).toBeVisible();
  await expect(preview(page)).toContainText("Borrador local");
  await save(page);
  await expect(page.getByRole("status").filter({ hasText: "Carrusel guardado" })).toBeVisible();
  expect((await content(page)).hero[0].headline).toBe("Borrador local");
  await expect(page.getByRole("alert").filter({ hasText: "No hay espacio para conservar este borrador" })).toHaveCount(0);
});

test("una imagen que termina de procesarse tras cambiar de destacado no modifica otra diapositiva", async ({ page }) => {
  await page.goto("admin-demo/contenido/carrusel/");
  await page.evaluate(() => {
    const original = window.createImageBitmap.bind(window);
    window.createImageBitmap = (async (file: Blob) => {
      const bitmap = await original(file);
      return new Promise<ImageBitmap>((resolve) => {
        (window as Window & { releaseImage?: () => void }).releaseImage = () => resolve(bitmap);
      });
    }) as typeof createImageBitmap;
  });
  await upload(page);
  await expect(page.getByText("Procesando…", { exact: true })).toBeVisible();
  await page.waitForFunction(() => typeof (window as Window & { releaseImage?: () => void }).releaseImage === "function");
  await page.getByRole("button", { name: /^Destacado 2:/ }).click();
  await page.evaluate(() => (window as Window & { releaseImage?: () => void }).releaseImage?.());
  await expect(preview(page).locator("img")).toHaveCount(0);
  await page.getByRole("button", { name: /^Destacado 1:/ }).click();
  await expect(preview(page).locator("img")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Guardar carrusel" })).toBeDisabled();
});
