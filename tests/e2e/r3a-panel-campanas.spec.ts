import { readFile } from "node:fs/promises";
import { expect, test, type Download, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/** R3a · Panel → Campañas: calendario, editor con vista previa doble, superposición, resultados, piezas y descuento real. */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("volta-demo:admin") ?? "null")?.state?.data ?? null);
/** Ancho y alto de un PNG (cabecera IHDR). */
const pngSize = async (d: Download) => { const b = await readFile((await d.path())!); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const preview = (page: Page, which: "phone" | "desktop") => page.locator(`[data-preview='${which}']`);

test("calendario: las 17 campañas, los días del deporte marcados y las fechas CACE y Black Friday", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("admin-demo/campanas/");
  await expect(page.getByRole("heading", { level: 1, name: "Campañas" })).toBeVisible();
  const months = page.getByRole("list", { name: "Campañas por mes" });
  await expect(months.getByRole("listitem").filter({ has: page.locator("[data-month-track]") })).toHaveCount(12);
  await expect(page.locator("[data-campaign-chip]")).toHaveCount(17);
  await expect(page.locator("[data-campaign-chip][data-kind='sport']")).toHaveCount(5);
  for (const id of ["crossfit-open", "dia-actividad-fisica", "dia-del-futbolista", "dia-del-running", "dia-del-boxeador"]) {
    await expect(page.locator(`[data-campaign-chip='${id}']`)).toHaveAttribute("data-flag", "sport");
  }
  await expect(page.locator("[data-flag='cace']")).toHaveCount(2);
  await expect(page.getByRole("link", { name: /^Editar Hot Sale, .*CACE/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Editar Black Friday, .*Black Friday/ })).toBeVisible();
  // Año Nuevo cruza el año: barra en diciembre y en enero, un solo enlace.
  await expect(page.locator("[data-bar='ano-nuevo']")).toHaveCount(2);
  await expect(page.locator("[data-campaign-chip='ano-nuevo']")).toHaveCount(1);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  // "Próxima campaña" en el inicio del panel, con los días que faltan y el atajo al editor.
  await page.goto("admin-demo/");
  const next = page.locator("[data-next-campaign]");
  await expect(next).toContainText("Halloween");
  await expect(next).toContainText("faltan 14 días");
  await next.getByRole("link", { name: "Preparar Halloween" }).click();
  await expect(page).toHaveURL(/campanas\/editar\/\?id=halloween/);
  await expect(page.getByRole("heading", { level: 1, name: "Halloween" })).toBeVisible();
  assertNoExternal();
});

test("editor de Black Friday: titular, productos y cupón nuevo con la vista previa doble en vivo", async ({ page }) => {
  await page.goto("admin-demo/campanas/");
  await page.getByRole("link", { name: /^Editar Black Friday/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Black Friday" })).toBeVisible();
  for (const which of ["phone", "desktop"] as const) await expect(preview(page, which).locator("[data-preview-headline]")).toHaveText("Negro total, precios en volt");

  await page.getByLabel("Titular").fill("Black total en la costa");
  for (const which of ["phone", "desktop"] as const) await expect(preview(page, which).locator("[data-preview-headline]")).toHaveText("Black total en la costa");

  const desktopProducts = preview(page, "desktop").getByRole("list", { name: "Productos de la campaña" });
  await expect(desktopProducts.getByRole("img", { name: /Mass Gainer 3 kg/ })).toHaveCount(1);
  await page.getByRole("checkbox", { name: /Mass Gainer 3 kg/ }).uncheck();
  await page.getByRole("checkbox", { name: /Colágeno hidrolizado/ }).check();
  await expect(desktopProducts.getByRole("img", { name: /Mass Gainer 3 kg/ })).toHaveCount(0);
  await expect(desktopProducts.getByRole("img", { name: /Colágeno hidrolizado/ })).toHaveCount(1);

  // Cupón creado desde la campaña: queda elegido y la vista previa lo muestra en el marcador y en el ticket.
  await page.getByRole("button", { name: "Crear cupón" }).click();
  await page.getByLabel("Código").fill("BLACK40");
  await page.getByLabel("Valor").fill("40");
  await page.getByRole("button", { name: "Crear cupón" }).click();
  await expect(page.getByLabel("Cupón de la campaña")).toHaveValue("BLACK40");
  for (const which of ["phone", "desktop"] as const) {
    await expect(preview(page, which).locator("[data-preview-coupon]")).toContainText("BLACK40");
    await expect(preview(page, which).getByRole("img", { name: "40% OFF" })).toBeVisible();
  }
  await page.getByRole("button", { name: "Guardar campaña" }).click();
  await expect(toast(page, "Black Friday guardada")).toBeVisible();
  const bf = (await stored(page)).themes.find((t: { id: string }) => t.id === "black-friday");
  expect([bf.headline, bf.couponCode, bf.productSlugs.includes("colageno"), bf.productSlugs.includes("mass-gainer")]).toEqual(["Black total en la costa", "BLACK40", true, false]);
  expect((await stored(page)).coupons.find((c: { code: string }) => c.code === "BLACK40").themeId).toBe("black-friday");
  await page.reload();
  await expect(preview(page, "desktop").locator("[data-preview-headline]")).toHaveText("Black total en la costa");
});

test("dos campañas no pueden compartir un día: error claro y no se guarda", async ({ page }) => {
  await page.goto("admin-demo/campanas/editar/?id=black-friday");
  await page.getByLabel("Desde").fill("2026-11-03");
  await expect(page.locator("[data-overlap]")).toContainText("Estas fechas se pisan con CyberMonday");
  await expect(page.getByLabel("Desde")).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Guardar campaña" }).click();
  await expect(page.locator("[data-save-bar]")).toContainText("se pisan con CyberMonday");
  expect((await stored(page))?.themes?.find((t: { id: string }) => t.id === "black-friday")?.startsOn ?? "2026-11-23").toBe("2026-11-23");
  await page.getByLabel("Desde").fill("2026-11-20");
  await expect(page.locator("[data-overlap]")).toHaveCount(0);
  await page.getByRole("button", { name: "Guardar campaña" }).click();
  await expect(toast(page, "Black Friday guardada")).toBeVisible();
  expect((await stored(page)).themes.find((t: { id: string }) => t.id === "black-friday").startsOn).toBe("2026-11-20");
});

test.describe("escritorio", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });

test("resultados de los cupones: usos, pedidos y descuento dado por campaña", async ({ page }) => {
  await page.goto("admin-demo/campanas/");
  const table = page.getByRole("region", { name: "Resultados de los cupones por campaña" });
  const mama = table.getByRole("row").filter({ hasText: "MAMA15" });
  await expect(mama).toContainText("Día de la Madre");
  await expect(mama.getByRole("cell").nth(3)).toHaveText("9");
  await expect(mama.getByRole("cell").nth(4)).toHaveText("2");
  await expect(mama.getByRole("cell").nth(5)).toContainText(/\$\s?\d/);
  await expect(mama.getByRole("cell").nth(5)).not.toContainText(/\$\s?0$/);
  await table.getByLabel("Uso", { exact: true }).selectOption("con");
  await expect(table.getByRole("row").filter({ hasText: "MAMA15" })).toHaveCount(1);
  await expect(table.getByRole("row").filter({ hasText: "BLACK30" })).toHaveCount(0);
  await page.goto("admin-demo/campanas/editar/?id=dia-de-la-madre");
  const card = page.locator("[data-campaign-results]");
  await expect(card).toContainText("Resultados de MAMA15");
  await expect(card.getByRole("definition").nth(1)).toHaveText("2");
});
});

test("sacar las piezas: post 1:1, historia 9:16 y gift card en PNG, desde el Estudio", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("admin-demo/estudio/");
  await page.getByRole("link", { name: "Piezas de la campaña" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Sacar las piezas" })).toBeVisible();
  await page.getByLabel("Campaña").selectOption("black-friday");
  await expect(page).toHaveURL(/piezas\/\?id=black-friday/);
  await expect(page.getByRole("img", { name: /Historia con cuenta regresiva de Black Friday/ })).toBeVisible();
  const download = async (piece: string, button: RegExp) => {
    const [d] = await Promise.all([page.waitForEvent("download"), page.locator(`[data-piece='${piece}']`).getByRole("button", { name: button }).click()]);
    return d;
  };
  const post = await download("post", /Descargar post/);
  expect(post.suggestedFilename()).toBe("volta-black-friday-post-1x1.png");
  expect(await pngSize(post)).toEqual([1080, 1080]);
  const story = await download("story", /Descargar historia/);
  expect(story.suggestedFilename()).toBe("volta-black-friday-historia-9x16.png");
  expect(await pngSize(story)).toEqual([1080, 1920]);
  const gift = await download("giftcard", /Descargar gift card/);
  expect(await pngSize(gift)).toEqual([1200, 750]);
  await expect(page.getByRole("status").filter({ hasText: "volta-black-friday-gift-card.png" })).toBeVisible();
  assertNoExternal();
});

test("descuento real: subir el precio antes de la campaña avisa en el editor y en cupones", async ({ page }) => {
  await page.goto("admin-demo/campanas/editar/?id=black-friday");
  await expect(page.locator("[data-preview='desktop']")).toBeVisible();
  await expect(page.locator("[data-real-discount]")).toHaveCount(0);
  await page.goto("admin-demo/productos/");
  await page.getByRole("button", { name: "Aumentar precios" }).click();
  const dialog = page.getByRole("dialog", { name: "Aumentar precios" });
  await dialog.getByLabel("Marca", { exact: true }).selectOption("Krono Nutrition");
  await dialog.getByLabel("Porcentaje").fill("50");
  await dialog.getByRole("button", { name: /^Aplicar a \d+ variantes/ }).click();
  await dialog.getByRole("alertdialog", { name: "Confirmar el aumento" }).getByRole("button", { name: "Sí, aplicar" }).click();
  await expect(toast(page, "Precios actualizados: +50 % a Krono Nutrition")).toBeVisible();
  expect((await stored(page)).priceChanges.length).toBeGreaterThan(0);

  await page.goto("admin-demo/campanas/editar/?id=black-friday");
  const warning = page.locator("[data-real-discount]");
  await expect(warning).toContainText("no es real");
  await expect(warning).toContainText("Isolate Zero");
  await expect(warning).toContainText("más bajo en 30 días");
  await page.goto("admin-demo/cupones/lista/");
  await expect(page.locator("[data-real-discount]")).toContainText("BLACK30");
  await expect(page.locator("[data-real-discount]")).toContainText("Isolate Zero");
});
