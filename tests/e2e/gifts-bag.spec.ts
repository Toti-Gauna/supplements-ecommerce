import { expect, test, type Locator, type Page } from "@playwright/test";
import { demoGifts, sampleGifts } from "../../src/demo/fixtures/gifts";
import { guardNetwork, horizontalOverflow } from "./helpers";

/** Fase 5 · el regalo se abre a golpes contra una bolsa de boxeo, vestida según la ocasión. Quien recibe nunca ve el precio. */

const PRICE = /\$\s?\d/;
const sample = (occasion: string) => sampleGifts.find((g) => g.occasion === occasion)!;
const stageOf = (page: Page, g: { from: string; to: string }) => page.getByRole("dialog", { name: `Regalo de ${g.from} para ${g.to}` });

/** Cinco golpes: cada uno suma un golpe, abre una costura (hasta cuatro) y el último rompe la bolsa y saca el pote. */
async function punchFive(stage: Locator, { chalk }: { chalk: boolean }) {
  const scene = stage.locator("[data-variant]");
  const bag = stage.getByRole("button", { name: /Golpeá la bolsa/ });
  await expect(bag).toHaveAccessibleName("Golpeá la bolsa para abrir el regalo. Faltan 5 golpes.");
  for (let i = 1; i <= 4; i++) {
    await bag.click();
    await expect(scene).toHaveAttribute("data-hits", String(i));
    await expect(scene.locator("[data-seam]")).toHaveCount(i);
    await expect(stage.locator(".bk-chalk").first()).toBeAttached({ attached: chalk });
  }
  await expect(bag).toHaveAccessibleName("Golpeá la bolsa para abrir el regalo. Falta 1 golpe.");
  // Se observan juntos los tres estados transitorios, antes de que aparezca la ficha del regalo.
  await Promise.all([
    bag.click(),
    expect(scene).toHaveAttribute("data-open", "true"),
    expect(scene.locator("[data-reveal='tub']")).toBeVisible(),
    expect(stage.getByText("¡La rompiste!")).toBeVisible(),
  ]);
}

test("con movimiento, en el celular: cinco golpes con tiza y costuras, sale el pote y después el producto", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const g = sample("volta");
  await page.goto(`regalo/?c=${g.code}`);
  await page.keyboard.press("Escape"); // cierra la pantalla de carga (no el escenario)
  const stage = stageOf(page, g);
  await expect(stage.locator("[data-variant]")).toHaveAttribute("data-variant", "volta");
  await expect(stage.getByText("¡Pegale a la bolsa!")).toBeVisible();
  // El balanceo de cada golpe alterna de lado.
  await punchFive(stage, { chalk: true });
  await expect(stage.locator(".bk-swing-r, .bk-swing-l").first()).toBeAttached();
  await expect(stage.getByRole("heading", { name: g.item.name })).toBeVisible({ timeout: 6000 });
  await expect(stage.getByText(g.message)).toBeVisible();
  await expect(stage.getByText(PRICE)).toHaveCount(0);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("con \"reducir movimiento\": los mismos cinco golpes, sin tiza ni balanceo, y el producto", async ({ page }) => {
  const g = sample("volta");
  await page.goto(`regalo/?c=${g.code}`);
  const stage = stageOf(page, g);
  await expect(stage.locator("[data-variant]")).toHaveAttribute("data-variant", "volta");
  // Con menos movimiento, "Abrirlo de una vez" aparece enseguida; igual se puede abrir a golpes.
  await expect(stage.getByRole("button", { name: "Abrirlo de una vez" })).toBeVisible();
  await punchFive(stage, { chalk: false });
  await expect(stage.locator(".bk-swing-r, .bk-swing-l, .bk-dent")).toHaveCount(0);
  await expect(stage.getByRole("heading", { name: g.item.name })).toBeVisible();
  await expect(stage.getByText(PRICE)).toHaveCount(0);
});

test("quien recibe nunca ve el precio: Mis regalos, la apertura y lo que hay adentro", async ({ page }) => {
  const g = demoGifts[0]!;
  await page.goto("cuenta/");
  await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click();
  await page.getByRole("link", { name: "Mis regalos" }).click();
  const tile = page.getByRole("link", { name: /Sin abrir · de Lucía/ });
  await expect(tile).toContainText("Bolsa con flores bordadas");
  await expect(tile).toContainText("Tocá y abrilo a golpes");
  const section = page.getByRole("region", { name: "Mis regalos" });
  await expect(section.getByText(PRICE)).toHaveCount(0);
  await tile.click();
  const stage = stageOf(page, g);
  await expect(stage.getByText(PRICE)).toHaveCount(0);
  await stage.getByRole("button", { name: "Abrirlo de una vez" }).click();
  await expect(stage.getByRole("heading", { name: g.item.name })).toBeVisible();
  await expect(stage.getByText(PRICE)).toHaveCount(0);
  // Ni la ficha (tiene el precio) ni el seguimiento del pedido (es de quien compró): solo la tienda y sus regalos.
  await expect(stage.locator("a[href*='/p/'], a[href*='pedido'], a[href*='seguimiento']")).toHaveCount(0);
  await expect(stage.getByRole("link", { name: "Conocer Volta" })).toBeVisible();
});

test("regalo desde el checkout para Navidad: el link abre el árbol de discos (su apertura de Navidad) en otro celular, sin precio", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("volta-demo:cart", JSON.stringify({ state: { lines: [{ id: "a", productSlug: "overvolt-pre", variantId: "ov-limon-300", quantity: 1 }], couponCode: null }, version: 0 }));
    localStorage.setItem("volta-demo:account", JSON.stringify({ state: { wheelPrize: { code: "DEMO", label: "Premio", at: "2026-10-10T12:00:00.000Z" } }, version: 0 }));
  });
  await page.goto("checkout/");
  await page.getByLabel("Nombre y apellido").fill("Lucía Gómez");
  await page.getByLabel("Email").fill("lucia@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByText("Retiro en el local").first().click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Transferencia bancaria").click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  await page.getByRole("region", { name: "¿Es para regalo?" }).getByRole("button", { name: "Sí, es para regalar" }).click();
  const modal = page.getByRole("dialog", { name: "Es para regalar" });
  await modal.getByLabel("Para", { exact: true }).fill("Mateo");
  await modal.getByLabel("De parte de").fill("Lucía");
  await modal.getByLabel("Mensaje").fill("¡Feliz Navidad! Para que el 2027 arranque con todo.");
  await modal.getByLabel("Ocasión").selectOption("navidad");
  await expect(modal.getByText("Lo abre a golpes contra una bolsa navideña con moño y gorrito.")).toBeVisible();
  await expect(modal.locator("[data-variant]")).toHaveAttribute("data-variant", "navidad");
  await expect(modal.getByText("Bolsa navideña con moño y gorrito", { exact: true })).toBeVisible();
  await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();

  const ready = page.getByRole("region", { name: "Tu regalo, listo para mandar" });
  await expect(ready.getByText("Lo abre a golpes contra una bolsa navideña con moño y gorrito.", { exact: false })).toBeVisible();
  const code = (await ready.getByRole("button", { name: /Copiar código REGALO-/ }).textContent())!.trim();
  const whatsapp = decodeURIComponent((await ready.getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href"))!);
  expect(whatsapp).toContain(code);
  expect(whatsapp).toContain("Se abre a golpes");
  expect(whatsapp).not.toMatch(PRICE);
  const link = (await ready.getByRole("link", { name: "Ver cómo lo recibe" }).getAttribute("href"))!.replace("&vista=previa", "");

  const other = await page.context().browser()!.newContext({ viewport: page.viewportSize()!, isMobile: true, hasTouch: true, locale: "es-AR", reducedMotion: "reduce" });
  const friend = await other.newPage();
  await friend.goto(new URL(link, page.url()).toString());
  const stage = stageOf(friend, { from: "Lucía", to: "Mateo" });
  await expect(stage.getByText("Mateo, te llegó un regalo de Lucía")).toBeVisible();
  const scene = stage.locator("[data-variant]");
  await expect(scene).toHaveAttribute("data-variant", "navidad");
  // R3b: Navidad tiene su propia apertura (el árbol de discos), no la bolsa.
  await expect(scene).toHaveAttribute("data-scene", "navidad");
  const tree = stage.getByRole("button", { name: /Sacá un disco del árbol para abrir el regalo/ });
  await expect(tree).toHaveAccessibleName("Sacá un disco del árbol para abrir el regalo. Faltan 5 discos.");
  for (let i = 1; i <= 5; i++) { await tree.click(); await expect(scene).toHaveAttribute("data-hits", String(i)); }
  await expect(scene).toHaveAttribute("data-open", "true");
  await expect(stage.getByRole("heading", { name: "Overvolt pre-entreno" })).toBeVisible();
  await expect(stage.getByText("¡Feliz Navidad! Para que el 2027 arranque con todo.")).toBeVisible();
  await expect(stage.getByText(PRICE)).toHaveCount(0);
  // En la página tampoco hay precios del regalo (la cinta y el pie del local solo dicen desde cuánto el envío es gratis).
  await expect(friend.locator("main").getByText(PRICE)).toHaveCount(0);
  await other.close();
  assertNoExternal();
});
