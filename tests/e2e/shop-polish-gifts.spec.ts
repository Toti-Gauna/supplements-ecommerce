import { expect, test, type Page } from "@playwright/test";
import { sampleGifts } from "../../src/demo/fixtures/gifts";
import { guardNetwork, horizontalOverflow } from "./helpers";

/** Polish 8.2 · Lote 7: el cachorro del Día del Animal (8.2.15) y el regalo en un modal compartido (8.2.16). */

test("8.2.15 Día del Animal: un cachorro asoma por la puerta de la cucha golpe a golpe (ya no la cola) y sale al abrir", async ({ page }) => {
  const g = sampleGifts.find((x) => x.occasion === "dia-del-animal")!;
  await page.goto(`regalo/?c=${g.code}`);
  const stage = page.getByRole("dialog", { name: `Regalo de ${g.from} para ${g.to}` });
  const peek = stage.locator("[data-peek]");
  await expect(peek).toHaveAttribute("data-peek", "0");
  const hit = stage.getByRole("button", { name: /Golpeá el regalo para abrirlo/ });
  for (let i = 1; i <= 4; i++) {
    await hit.click();
    await expect(peek).toHaveAttribute("data-peek", String(i));
  }
  // Asomado del todo: patitas en el umbral y cara contenta (la lengua afuera).
  await expect(stage.locator(".an-cu-paws.is-on")).toHaveCount(1);
  await expect(stage.locator("[data-peek] path[fill='#e86a7c']")).toHaveCount(1);
  await hit.click();
  await expect(peek).toHaveAttribute("data-peek", "out");
  await expect(stage.getByText(g.message, { exact: false })).toBeVisible();
});

const giftDialog = (page: Page) => page.getByRole("dialog", { name: "Es para regalar" });

test("8.2.16 modal centrado con vista previa: Escape y Cerrar, foco, fondo quieto y lo escrito sigue al reabrir", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto("p/home-spray/");
  const trigger = page.locator("#personalizar").getByRole("button", { name: "Regalar ahora" });
  await trigger.click();
  const modal = giftDialog(page);
  await expect(modal).toBeVisible();
  const box = (await modal.boundingBox())!;
  expect(Math.abs(box.x + box.width / 2 - 640)).toBeLessThan(4);
  expect(Math.abs(box.y + box.height / 2 - 430)).toBeLessThan(40);
  expect(box.height).toBeLessThanOrEqual(860 * 0.9 + 1);
  await expect(modal.getByLabel("Para", { exact: true })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
  // La vista previa acompaña lo que se escribe.
  await modal.getByLabel("Para", { exact: true }).fill("Sofía");
  await modal.getByLabel("Mensaje").fill("Para que la casa huela rico");
  await modal.getByLabel("Ocasión").selectOption("dia-del-animal");
  await expect(modal.getByText("Para Sofía")).toBeVisible();
  await expect(modal.getByText("“Para que la casa huela rico”")).toBeVisible();
  await expect(modal.getByText("La cucha de Pancho", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  // Al reabrir, todo sigue; el botón Cerrar está a la vista y también cierra.
  await trigger.click();
  await expect(modal.getByLabel("Para", { exact: true })).toHaveValue("Sofía");
  await expect(modal.getByLabel("Ocasión")).toHaveValue("dia-del-animal");
  await modal.getByRole("button", { name: "Cerrar" }).click();
  await expect(modal).toBeHidden();
});

test("8.2.16 validación y límites: para quién, de parte de quién, email y largo del mensaje", async ({ page }) => {
  await page.goto("p/home-spray/");
  await page.getByRole("button", { name: "Regalar ahora" }).click();
  const modal = giftDialog(page);
  await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  await expect(modal.getByText("Escribí para quién es el regalo.")).toBeVisible();
  await expect(modal.getByLabel("Para", { exact: true })).toBeFocused();
  await modal.getByLabel("Para", { exact: true }).fill("Sofía");
  await modal.getByLabel("De parte de").fill("");
  await modal.getByRole("button", { name: "Regalar y pagar ahora" }).click();
  await expect(modal.getByText("Escribí de parte de quién es.")).toBeVisible();
  await modal.getByLabel("De parte de").fill("Lucía");
  await modal.getByLabel(/Email de quien lo recibe/).fill("sofia@");
  await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  await expect(modal.getByText("El email no parece válido.")).toBeVisible();
  await modal.getByLabel(/Email de quien lo recibe/).fill("");
  await modal.getByLabel("Mensaje").fill("a".repeat(250));
  await expect(modal.getByText("10 de más")).toBeVisible();
  await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  await expect(modal.getByText("El mensaje puede tener hasta 240 caracteres.")).toBeVisible();
  // En el celular el modal ocupa el ancho, sube desde abajo y los botones quedan a la vista.
  const box = (await modal.boundingBox())!;
  const vp = page.viewportSize()!;
  expect(Math.round(box.width)).toBe(vp.width);
  expect(Math.round(box.y + box.height)).toBe(vp.height);
  const buy = (await modal.getByRole("button", { name: "Regalar y pagar ahora" }).boundingBox())!;
  expect(buy.y + buy.height).toBeLessThanOrEqual(vp.height);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

async function toConfirm(page: Page) {
  await page.goto("checkout/");
  await page.getByLabel("Nombre y apellido").fill("Lucía Gómez");
  await page.getByLabel("Email").fill("lucia@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  await page.getByText("Retiro en persona").first().click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Transferencia bancaria").click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
}

test("8.2.16 mismo modal y mismo borrador desde la ficha y desde \"¿Es para regalo?\" en el checkout", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  // Premio de la ruleta ya guardado: ir a pagar no abre la ruleta.
  await page.addInitScript(() => localStorage.setItem("volta-demo:account", JSON.stringify({ state: { wheelPrize: { code: "DEMO", label: "Premio", at: "2026-10-10T12:00:00.000Z" } }, version: 0 })));
  await page.goto("p/home-spray/");
  // Empieza el regalo en la ficha y lo deja sin terminar.
  await page.getByRole("button", { name: "Regalar ahora" }).click();
  await giftDialog(page).getByLabel("Para", { exact: true }).fill("Martina");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Agregar al carrito" }).filter({ visible: true }).click();
  // Del carrito al checkout navegando dentro de la tienda: el borrador sigue en memoria.
  await page.getByRole("dialog", { name: "Carrito" }).getByRole("link", { name: "Ver carrito completo" }).click();
  await page.getByRole("button", { name: "Continuar al checkout" }).click();
  await expect(page).toHaveURL(/checkout\/$/);
  await page.getByLabel("Nombre y apellido").fill("Lucía Gómez");
  await page.getByLabel("Email").fill("lucia@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByRole("button", { name: "Continuar a la entrega" }).click();
  await page.getByText("Retiro en persona").first().click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Transferencia bancaria").click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
  const section = page.getByRole("region", { name: "¿Es para regalo?" });
  await section.getByRole("button", { name: "Sí, es para regalar" }).click();
  const modal = giftDialog(page);
  await expect(modal.getByLabel("Para", { exact: true })).toHaveValue("Martina");
  await modal.getByLabel("De parte de").fill("Lucía");
  await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  await expect(modal).toBeHidden();
  // Sigue en el último paso (no se confirmó solo) y el regalo figura en el paso y en el resumen.
  await expect(page.getByRole("button", { name: "Confirmar pedido de demostración" })).toBeVisible();
  await expect(section.getByText("Regalo para Martina")).toBeVisible();
  await expect(page.getByRole("region", { name: "Resumen de tu compra" }).getByText(/regalo para Martina/)).toBeVisible();
  // Se puede quitar y volver a marcar; "Regalar y pagar ahora" pide los términos y después confirma.
  await section.getByRole("button", { name: "Quitar" }).click();
  await expect(section.getByText("Regalo para Martina")).toHaveCount(0);
  await section.getByRole("button", { name: "Sí, es para regalar" }).click();
  await modal.getByLabel("Para", { exact: true }).fill("Martina");
  await modal.getByRole("button", { name: "Regalar y pagar ahora" }).click();
  await expect(page.getByText("Para continuar, aceptá los términos.")).toBeVisible();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await section.getByRole("button", { name: "Editar" }).click();
  await modal.getByRole("button", { name: "Regalar y pagar ahora" }).click();
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
  await expect(page.getByRole("region", { name: "Tu regalo, listo para mandar" })).toBeVisible();
  assertNoExternal();
});

test("8.2.16 con varios productos en el checkout se elige cuál es el regalo", async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("volta-demo:cart", JSON.stringify({ state: { lines: [{ id: "a", productSlug: "vela-en-lata", variantId: "vel-patria", quantity: 1 }, { id: "b", productSlug: "vela-caniche", variantId: "vc-vainilla", quantity: 1 }], couponCode: null }, version: 0 }));
    localStorage.setItem("volta-demo:account", JSON.stringify({ state: { wheelPrize: { code: "DEMO", label: "Premio", at: "2026-10-10T12:00:00.000Z" } }, version: 0 }));
  });
  await toConfirm(page);
  await page.getByRole("button", { name: "Sí, es para regalar" }).click();
  const modal = giftDialog(page);
  await modal.getByLabel("¿Cuál es el regalo?").selectOption("b");
  await expect(modal.getByRole("heading", { name: "Vela caniche" })).toBeVisible();
  await modal.getByLabel("Para", { exact: true }).fill("Juli");
  await modal.getByLabel("De parte de").fill("Caro");
  await modal.getByRole("button", { name: "Agregar regalo al carrito" }).click();
  const section = page.getByRole("region", { name: "¿Es para regalo?" });
  await expect(section.getByRole("listitem").filter({ hasText: "Regalo para Juli" })).toContainText("Vela caniche");
  // Queda el otro producto para regalar aparte.
  await expect(section.getByRole("button", { name: "Regalar otro" })).toBeVisible();
});
