import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/**
 * QA global de Polish 8.2: los recorridos A–E de la spec en seis tamaños de pantalla. Chromium emula el tamaño y el
 * toque (iPad incluido): **no reemplaza** probar en un iPad, un iPhone y un Android reales.
 */
const DEVICES = [
  { name: "escritorio ancho 1600×1000", viewport: { width: 1600, height: 1000 }, mobile: false },
  { name: "notebook 1366×768", viewport: { width: 1366, height: 768 }, mobile: false },
  { name: "tablet horizontal 1180×820", viewport: { width: 1180, height: 820 }, mobile: true },
  { name: "tablet vertical 820×1180", viewport: { width: 820, height: 1180 }, mobile: true },
  { name: "celular 390×844", viewport: { width: 390, height: 844 }, mobile: true },
  { name: "celular chico 320×568", viewport: { width: 320, height: 568 }, mobile: true },
] as const;

const IGNORED = [/GPU stall/i, /Failed to load resource: the server responded with a status of 404/i];

/** Junta errores de consola, pedidos externos y desbordes a lo ancho; al final no tiene que haber ninguno. */
function watch(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`error de página: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !IGNORED.some((re) => re.test(m.text()))) problems.push(`consola: ${m.text()}`); });
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (!["localhost"].includes(url.hostname) && !["data:", "blob:"].includes(url.protocol)) problems.push(`pedido externo: ${r.url()}`);
  });
  const check = async (where: string) => {
    const overflow = await horizontalOverflow(page);
    if (overflow > 0) problems.push(`${where}: desborda ${overflow}px`);
  };
  return { check, done: () => expect(problems, problems.join("\n")).toEqual([]) };
}

const seed = (page: Page, cart: object | null, prize: boolean) =>
  page.addInitScript(({ cart, prize }) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    if (cart) localStorage.setItem("volta-demo:cart", JSON.stringify({ state: cart, version: 0 }));
    if (prize) localStorage.setItem("volta-demo:account", JSON.stringify({ state: { wheelPrize: { code: "DEMO", label: "Premio", at: "2026-10-10T12:00:00.000Z" } }, version: 0 }));
  }, { cart, prize });

async function contactToConfirm(page: Page, pay: "Transferencia bancaria" | "Tarjetas de débito, crédito y prepagas") {
  await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
  await page.getByLabel("Email").fill("juana@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  await page.getByText("Retiro en persona").first().click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText(pay, { exact: true }).click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
}

const confirmOrder = async (page: Page) => {
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido de demostración" }).click();
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
};

for (const d of DEVICES) {
  test.describe(`Recorridos · ${d.name}`, () => {
    test.use({ viewport: d.viewport, isMobile: d.mobile, hasTouch: d.mobile });
    test.describe.configure({ timeout: 90_000 });

    test("A · compra: inicio → categoría → producto → personalización → carrito → checkout → entrega → pago → confirmación", async ({ page }) => {
      const w = watch(page);
      await page.goto("");
      await w.check("inicio");
      await page.locator("#cats-rail a[href$='/c/comederos/']").click();
      await expect(page.getByRole("heading", { level: 1, name: "Comederos" })).toBeVisible();
      await w.check("categoría");
      await page.getByRole("link", { name: "Comedero perro globo" }).first().click();
      await expect(page.getByRole("heading", { level: 1, name: "Comedero perro globo" })).toBeVisible();
      await page.getByLabel("Texto", { exact: true }).fill("Toby");
      await w.check("producto");
      await page.getByRole("button", { name: "Agregar al carrito" }).filter({ visible: true }).first().click();
      await page.getByRole("dialog", { name: "Carrito" }).getByRole("link", { name: "Ver carrito completo" }).click();
      await expect(page.getByText(/“Toby”/).first()).toBeVisible();
      await w.check("carrito");
      await page.getByRole("button", { name: "Continuar al checkout" }).click();
      await page.getByRole("dialog", { name: "Ruleta de cupones" }).getByRole("button", { name: "Continuar sin girar" }).click();
      await contactToConfirm(page, "Tarjetas de débito, crédito y prepagas");
      await w.check("checkout");
      await confirmOrder(page);
      await expect(page.getByText("PEDIDO DE DEMOSTRACIÓN · no es un pedido real")).toBeVisible();
      await w.check("confirmación");
      w.done();
    });

    test("B · regalo desde la ficha: modal → carrito → checkout → revisar el regalo (sin perder la personalización)", async ({ page }) => {
      const w = watch(page);
      await seed(page, null, true);
      await page.goto("p/comedero-perro-globo/");
      await page.getByLabel("Texto", { exact: true }).fill("Toby");
      await page.locator("#personalizar").getByRole("button", { name: "Regalar ahora" }).click();
      const modal = page.getByRole("dialog", { name: "Es para regalar" });
      await modal.getByLabel("Para", { exact: true }).fill("Sofía");
      await modal.getByLabel("De parte de").fill("Lucía");
      await modal.getByLabel("Mensaje").fill("¡Para Toby!");
      await w.check("modal de regalo");
      await page.keyboard.press("Escape");
      await expect(page.getByLabel("Texto", { exact: true })).toHaveValue("Toby");
      await page.locator("#personalizar").getByRole("button", { name: "Regalar ahora" }).click();
      await expect(modal.getByLabel("Para", { exact: true })).toHaveValue("Sofía");
      await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
      await page.getByRole("dialog", { name: "Carrito" }).getByRole("link", { name: "Ver carrito completo" }).click();
      await expect(page.getByText("Regalo para Sofía · de Lucía")).toBeVisible();
      await expect(page.getByText(/“Toby”/).first()).toBeVisible();
      await page.getByRole("button", { name: "Continuar al checkout" }).click();
      await contactToConfirm(page, "Transferencia bancaria");
      await expect(page.getByRole("region", { name: "¿Es para regalo?" }).getByText("Regalo para Sofía")).toBeVisible();
      await expect(page.getByRole("region", { name: "Resumen de tu compra" }).getByText(/regalo para Sofía/)).toBeVisible();
      await w.check("checkout con regalo");
      await confirmOrder(page);
      await expect(page.getByRole("region", { name: "Tu regalo, listo para mandar" })).toBeVisible();
      w.done();
    });

    test("B · regalo desde el checkout: ¿Es para regalo? → modal → revisar el regalo → confirmar", async ({ page }) => {
      const w = watch(page);
      await seed(page, { lines: [{ id: "l1", productSlug: "vela-caniche", variantId: "vc-vainilla", quantity: 1 }], couponCode: null }, true);
      await page.goto("checkout/");
      await contactToConfirm(page, "Transferencia bancaria");
      const section = page.getByRole("region", { name: "¿Es para regalo?" });
      await section.getByRole("button", { name: "Sí, es para regalar" }).click();
      const modal = page.getByRole("dialog", { name: "Es para regalar" });
      await modal.getByLabel("Para", { exact: true }).fill("Juli");
      await modal.getByLabel("De parte de").fill("Caro");
      await w.check("modal desde el checkout");
      await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
      await expect(section.getByText("Regalo para Juli")).toBeVisible();
      await w.check("checkout con regalo");
      await confirmOrder(page);
      await expect(page.getByRole("region", { name: "Tu regalo, listo para mandar" })).toBeVisible();
      w.done();
    });

    test("C · club: misiones → ruleta → premio → aplicar → checkout → desactivar el cupón", async ({ page }) => {
      const w = watch(page);
      await seed(page, { lines: [{ id: "l1", productSlug: "vela-en-lata", variantId: "vel-patria", quantity: 4 }], couponCode: null }, false);
      await page.addInitScript(() => { Math.random = () => 0.1; });
      await page.goto("club/");
      await expect(page.getByRole("heading", { name: "Tus misiones" })).toBeVisible();
      await w.check("club");
      await page.getByRole("link", { name: "Ir a la ruleta" }).click();
      await page.getByRole("button", { name: "Girar la ruleta" }).click();
      const stage = page.getByRole("dialog", { name: "Ruleta de cupones" });
      await stage.getByRole("button", { name: "Girar la ruleta" }).click();
      await expect(stage.getByText("¡Ganaste!")).toBeVisible();
      await w.check("ruleta");
      await stage.getByRole("button", { name: "Aplicar ahora" }).click();
      await page.goto("checkout/");
      const summary = page.getByRole("region", { name: "Resumen de tu compra" });
      await expect(summary.getByText("Cupón", { exact: true })).toBeVisible();
      const withCoupon = await summary.locator("dd").last().textContent();
      await page.getByRole("region", { name: "Cupón del pedido" }).getByRole("button", { name: /^Quitar cupón RULETA/ }).click();
      await expect(summary.getByText("Cupón", { exact: true })).toHaveCount(0);
      expect(await summary.locator("dd").last().textContent()).not.toBe(withCoupon);
      await w.check("checkout sin cupón");
      w.done();
    });

    test("D · navegación: inicio → recomendado → otro recomendado → volver → categoría → carrito", async ({ page }) => {
      const w = watch(page);
      await page.goto("");
      const rail = page.locator("section[aria-labelledby=recomendados]");
      await rail.scrollIntoViewIfNeeded();
      // El riel avanza y vuelve con sus flechas sin dejar huecos (8.2.3).
      const more = rail.getByRole("button", { name: "Más de Recomendados" });
      if (await more.isVisible()) {
        await more.click();
        await expect(rail.getByRole("button", { name: "Anteriores de Recomendados" })).not.toHaveAttribute("aria-disabled", "true");
        await rail.getByRole("button", { name: "Anteriores de Recomendados" }).click();
      }
      const first = rail.locator("[data-product-card] h3 a").first();
      const name1 = (await first.textContent())!.trim();
      await first.click();
      await expect(page.locator("main h1")).toHaveText(name1);
      await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(0);
      await w.check("detalle 1");
      const url1 = page.url();
      const related = page.locator("#relacionados").locator("xpath=ancestor::section[1]");
      await related.scrollIntoViewIfNeeded();
      const second = related.locator("[data-product-card] h3 a").first();
      const name2 = (await second.textContent())!.trim();
      await second.click();
      await expect(page.locator("main h1")).toHaveText(name2);
      await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(0);
      await page.goBack();
      await expect(page.locator("main h1")).toHaveText(name1);
      await expect(page).toHaveURL(url1);
      // Si el clic llega mientras el router todavía termina el "Atrás", la navegación se pierde: se reintenta el clic.
      await expect(async () => {
        await page.getByRole("navigation", { name: "Ruta de navegación" }).getByRole("link").last().click();
        await expect(page).toHaveURL(/\/c\//, { timeout: 2_000 });
      }).toPass({ timeout: 10_000 });
      await expect(page.locator("main h1")).toBeVisible();
      await w.check("categoría");
      await page.locator("[data-shop-header]").getByRole("button", { name: /^Carrito/ }).click();
      await expect(page.getByRole("dialog", { name: "Carrito" })).toBeVisible();
      await w.check("carrito");
      w.done();
    });

    test("E · seguimiento: en producción → en camino → entregado → cambio de temática → repetir", async ({ page }) => {
      const w = watch(page);
      await page.goto("pedido/demo-volta/");
      const run = async () => {
        const zone = page.getByRole("region", { name: "Probá los estados del pedido — Demostración" });
        for (const [label, title] of [["En producción", "En producción"], ["En camino", "En camino"], ["Entregado", "Entregado"]] as const) {
          await zone.getByText(label, { exact: true }).click();
          await expect(page.getByRole("heading", { level: 2, name: title, exact: true })).toBeVisible();
        }
        await expect(page.getByText("Llegó a tu casa", { exact: true })).toBeVisible();
        await w.check("seguimiento");
      };
      await run();
      await expect(page.locator("[data-trk-traveler]")).toHaveCount(0);
      await page.getByRole("button", { name: "Probar temáticas" }).click();
      await page.getByRole("dialog", { name: "Probar temáticas" }).getByRole("button", { name: "Probar Navidad" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-season", "navidad");
      await page.keyboard.press("Escape");
      await expect(page.locator("[data-trk-traveler]")).toHaveAttribute("data-trk-traveler", "Papá Noel en su trineo");
      await run();
      w.done();
    });
  });
}
