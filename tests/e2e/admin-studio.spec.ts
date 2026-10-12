import { readFile } from "node:fs/promises";
import { expect, test, type Download, type Page } from "@playwright/test";
import { guardNetwork, makePng } from "./helpers";

const open = async (page: Page) => {
  await page.goto("admin-demo/estudio/");
  await expect(page.getByRole("heading", { level: 1, name: /Estudio de contenido/ })).toBeVisible();
  await page.getByLabel("Temática").selectOption("dia-de-la-madre");
};
const bytes = async (d: Download) => readFile((await d.path())!);
const template = (page: Page, name: string) => page.getByRole("group", { name: "Plantilla" }).getByRole("button", { name });

test("oferta de la fecha: los tres formatos con los textos, productos y el cupón de la temática", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await open(page);
  await expect(template(page, "Oferta de la fecha")).toHaveAttribute("aria-pressed", "true");
  const formats = page.getByRole("group", { name: "Formato" });
  for (const name of ["Post", "Historia o reel", "Carrusel"]) await expect(formats.getByRole("button", { name: new RegExp(name) })).toBeVisible();
  await expect(page.getByLabel("Titular")).toHaveValue("Para la que nunca para");
  await expect(page.getByLabel("Bajada")).toHaveValue("Especial Día de la Madre");
  await expect(page.getByRole("group", { name: "Productos de la pieza" }).getByRole("button", { pressed: true })).toHaveCount(3);
  const caption = page.getByRole("textbox", { name: "Texto para el posteo" });
  await expect(caption).toHaveValue(/MAMA15/);
  await expect(caption).toHaveValue(/#DíaDeLaMadre/);
  const hook = await page.getByText(/^Gancho:/).textContent();
  await page.getByRole("button", { name: "Otra idea" }).click();
  await expect(page.getByText(/^Gancho:/)).not.toHaveText(hook!);
  // Cambiar de fecha trae sus textos y su cupón.
  await page.getByLabel("Temática").selectOption("cyber-monday");
  await expect(page.getByLabel("Titular")).toHaveValue("Overclock de precios");
  await expect(caption).toHaveValue(/CYBER25/);
  assertNoExternal();
});

test("plantillas: producto destacado, stack del mes y cupón del juego con los premios guardados", async ({ page }) => {
  // Premio editado en el panel: la pieza del juego lo usa.
  await page.goto("admin-demo/cupones/juego/");
  await page.getByRole("group", { name: "Nivel 2" }).getByLabel("Porcentaje").fill("15");
  await page.getByRole("button", { name: "Guardar premios" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Premios del juego guardados" })).toBeVisible();
  await open(page);
  const caption = page.getByRole("textbox", { name: "Texto para el posteo" });

  await template(page, "Producto destacado").click();
  const products = page.getByRole("group", { name: "Productos de la pieza" });
  await expect(products.getByRole("button", { pressed: true })).toHaveCount(1);
  await products.getByRole("button", { name: "Overvolt pre-entreno" }).click();
  await expect(products.getByRole("button", { pressed: true })).toHaveText("Overvolt pre-entreno");
  await expect(page.getByLabel("Titular")).toHaveValue("Overvolt pre-entreno");
  await expect(caption).toHaveValue(/por servicio[\s\S]*LOTE/);

  await template(page, "Stack del mes").click();
  await expect(products.getByRole("button", { pressed: true })).toHaveCount(3);
  await expect(page.getByLabel("Titular")).toHaveValue("Proteínas + creatinas + pre-entrenos");
  await expect(caption).toHaveValue(/descuento stack \(10 %\)/);
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descargar imagen (PNG)" }).click()]);
  expect(d.suggestedFilename()).toBe("volta-stack-post.png");

  await template(page, "Cupón del juego").click();
  await expect(products).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Premios" })).toContainText(/15\s%\sOFF desde 800 pts/);
  await expect(caption).toHaveValue(/800 puntos → 15 % OFF/);
  await expect(caption).not.toHaveValue(/MAMA15/);
  await page.getByRole("group", { name: "Formato" }).getByRole("button", { name: /Carrusel/ }).click();
  await expect(page.getByText("1 / 3")).toBeVisible();
});

test("exporta el post como PNG con el titular editado y una foto propia", async ({ page }) => {
  await open(page);
  await page.getByLabel("Titular").fill("Para mamá, con energía");
  await page.locator("#st-photo").setInputFiles({ name: "mi-foto.png", mimeType: "image/png", buffer: await makePng(page) });
  await expect(page.getByRole("button", { name: "Quitar foto" })).toBeVisible();
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descargar imagen (PNG)" }).click()]);
  expect(d.suggestedFilename()).toBe("volta-dia-de-la-madre-post.png");
  const png = await bytes(d);
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect(png.length).toBeGreaterThan(50_000);
  await expect(page.getByRole("status").filter({ hasText: "volta-dia-de-la-madre-post.png" })).toBeVisible();
});

test("el carrusel se descarga como una imagen por diapositiva", async ({ page }) => {
  await open(page);
  await page.getByRole("group", { name: "Formato" }).getByRole("button", { name: /Carrusel/ }).click();
  await expect(page.getByText("1 / 6")).toBeVisible();
  await page.getByRole("button", { name: "Diapositiva siguiente" }).click();
  await expect(page.getByText("2 / 6")).toBeVisible();
  const names: string[] = [];
  page.on("download", (d) => names.push(d.suggestedFilename()));
  await page.getByRole("button", { name: "Descargar las 6" }).click();
  await expect.poll(() => names.length, { timeout: 15_000 }).toBe(6);
  expect(names).toContain("volta-dia-de-la-madre-carrusel-6.png");
});

test("exporta la historia de la oferta como imagen y como video con música", async ({ page }) => {
  test.setTimeout(60_000);
  await open(page);
  await page.getByRole("group", { name: "Formato" }).getByRole("button", { name: /Historia o reel/ }).click();
  const [png] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descargar imagen (PNG)" }).click()]);
  expect(png.suggestedFilename()).toBe("volta-dia-de-la-madre-historia.png");
  expect((await bytes(png)).length).toBeGreaterThan(80_000);
  await page.getByLabel(/Duración/).fill("6");
  await expect(page.getByLabel(/Duración: 6 s/)).toBeVisible();
  const [d] = await Promise.all([page.waitForEvent("download", { timeout: 30_000 }), page.getByRole("button", { name: /Grabar video \(6 s/ }).click()]);
  expect(d.suggestedFilename()).toMatch(/^volta-dia-de-la-madre-historia\.(mp4|webm)$/);
  expect((await bytes(d)).length).toBeGreaterThan(20_000);
});
