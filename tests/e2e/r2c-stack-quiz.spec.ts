import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * R2c parte A · "Armá tu stack" como rack con "te dura N días", la placa fija del total en el celular, "Igualar
 * duración", y el quiz a pantalla completa con avance automático y "El protocolo del día" (celular, 375 px).
 */
async function openBuilder(page: Page, query = "") {
  await page.goto(`crear/${query}`);
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
}

const bar = (page: Page) => page.getByRole("region", { name: "Total de tu stack" });
const shelfDays = async (page: Page) => (await page.locator("[data-shelf-days]").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-shelf-days")))));
const money = (text: string) => Number(text.replace(/\D/g, ""));

test("stack en el celular: el total queda fijo arriba del dock y agrega el stack al carrito", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await openBuilder(page);
  // Con el estante vacío no hay placa.
  await expect(bar(page)).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Fuerza" }).check();
  await expect(bar(page)).toBeVisible();
  await expect(bar(page).locator("[data-stack-bar-total]")).toHaveText("$ 109.530");
  await expect(bar(page)).toContainText("−10 % stack");
  await expect(bar(page)).toContainText("≈ $ 3.202/día");

  // Arriba del dock, sin taparlo.
  const dock = await page.locator("[data-shop-bottomnav]").boundingBox();
  const plate = await bar(page).boundingBox();
  expect(dock && plate).toBeTruthy();
  expect(plate!.y + plate!.height).toBeLessThanOrEqual(dock!.y);
  await expect(page.locator("[data-shop-bottomnav]")).toBeVisible();
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);

  // El rack dice cuánto dura cada uno.
  expect(await shelfDays(page)).toEqual([30, 60, 30]);
  await expect(page.getByRole("img", { name: "Crea: Creatina monohidrato micronizada, te dura 60 días" })).toBeAttached();

  // Llegando al resumen, la placa se va (tiene el mismo total y el mismo botón).
  await page.getByRole("region", { name: "Resumen de tu stack" }).scrollIntoViewIfNeeded();
  await expect(bar(page)).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(bar(page)).toBeVisible();

  await bar(page).getByRole("button", { name: "Agregar el stack (3 productos)" }).click();
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(drawer.getByText(/¡Armaste tu stack!/)).toBeVisible();
  await expect(drawer.getByText("10 % off: $ 12.170")).toBeVisible();
  assertNoExternal();
});

test("igualar duración: proteína y pre pasan a dos unidades, todo dura lo mismo y el carrito cobra igual", async ({ page }) => {
  await openBuilder(page, "?objetivo=fuerza");
  const control = page.getByRole("region", { name: "Duración del stack" });
  await expect(control).toContainText("Lo primero se termina a los 30 días y lo último a los 60.");
  const before = await shelfDays(page);
  expect(Math.max(...before) - Math.min(...before)).toBe(30);

  await control.getByRole("button", { name: "Igualar duración" }).click();
  await expect(control.getByRole("status")).toHaveText("Listo: ajustamos Ionic Whey 100% y Overvolt pre-entreno. Todo te dura unos 60 días.");
  await expect(control.locator("[data-duration-status]")).toBeFocused();
  await expect(control).toContainText("Todo te dura 60 días.");
  await expect(control.getByRole("button", { name: "Igualar duración" })).toHaveCount(0);
  const after = await shelfDays(page);
  // Dentro de la tolerancia (10 %, mínimo 3 días).
  expect(Math.max(...after) - Math.min(...after)).toBeLessThanOrEqual(Math.max(3, Math.round(Math.min(...after) * 0.1)));
  await expect(page.getByLabel("Cantidad de Ionic Whey 100%")).toHaveValue("2");
  await expect(page.getByRole("listitem", { name: "Base de proteína" })).toContainText("Te dura 60 días");
  expect(new URL(page.url()).searchParams.get("stack")).toMatch(/^base\.ionic-whey\.[^,]+\.2,creatina\.[^,]+,energia\.overvolt-pre\.[^,]+\.2$/);

  // 2 × 54.900 + 29.900 + 2 × 36.900 = 213.500, con 10 % stack.
  await expect(bar(page).locator("[data-stack-bar-total]")).toHaveText("$ 192.150");
  const summary = page.getByRole("region", { name: "Resumen de tu stack" });
  await expect(summary.getByText("Subtotal (5 productos)")).toBeVisible();
  await bar(page).getByRole("button", { name: /^Agregar el stack \(5 productos\)$/ }).click();
  await expect(page.getByRole("dialog", { name: "Carrito" }).getByRole("group", { name: "Cantidad de Ionic Whey 100%" })).toContainText("2");
  await page.goto("carrito/");
  const cart = page.getByRole("region", { name: "Resumen", exact: true });
  expect(money(await cart.locator("dd").last().innerText())).toBe(192150);

  // Cambiar a mano la cantidad vuelve a desparejar y el botón vuelve.
  await openBuilder(page, "?objetivo=fuerza&stack=base.ionic-whey.iw-chocolate-2lb.2,creatina.creatina-monohidrato.cm-sin-sabor-300");
  expect(await shelfDays(page)).toEqual([60, 60]);
  await page.getByLabel("Cantidad de Ionic Whey 100%").selectOption("1");
  await expect(page.getByRole("region", { name: "Duración del stack" }).getByRole("button", { name: "Igualar duración" })).toBeVisible();
});

test("quiz a pantalla completa: avanza solo al elegir, con flechas no; y Tu programa trae el protocolo del día", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("crear/quiz/");
  await expect(page.locator("[data-quiz-stage=full]")).toBeVisible();
  const goals = page.getByRole("group", { name: /¿Qué querés lograr\?/ });
  // Varias respuestas: espera "Siguiente". (Antes de que React tome la página, el clic se pierde: se reintenta.)
  await expect(async () => {
    await goals.getByRole("checkbox", { name: /^Fuerza/ }).check();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "¿Hacés algún deporte?" })).toBeFocused({ timeout: 1000 });
  }).toPass();

  // Una sola respuesta: al tocarla pasa sola a la siguiente y el foco va a la pregunta nueva.
  await page.getByRole("radio", { name: /^Solo gimnasio/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "¿Cuántos días por semana entrenás?" })).toBeFocused();
  await expect(page.getByRole("progressbar", { name: "Pregunta 3 de 5" })).toBeVisible();
  // Atrás conserva la respuesta; tocarla de nuevo también avanza.
  await page.getByRole("button", { name: "Atrás" }).click();
  await expect(page.getByRole("radio", { name: /^Solo gimnasio/ })).toBeChecked();
  await page.getByRole("radio", { name: /^Solo gimnasio/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "¿Cuántos días por semana entrenás?" })).toBeFocused();

  // Con el teclado: las flechas eligen sin avanzar; Enter avanza.
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: /^3 o 4 días/ })).toBeChecked();
  await page.waitForTimeout(400);
  await expect(page.getByRole("heading", { level: 2, name: "¿Cuántos días por semana entrenás?" })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: "¿A qué hora entrenás?" })).toBeFocused();
  // Espacio sobre la opción elegida con flechas avanza.
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: /^A la tarde/ })).toBeChecked();
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { level: 2, name: "¿Tenés alguna restricción?" })).toBeFocused();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  // Varias respuestas otra vez: no avanza solo.
  await page.getByRole("checkbox", { name: /^Ninguna/ }).check();
  await page.waitForTimeout(400);
  await expect(page.getByRole("heading", { level: 2, name: "¿Tenés alguna restricción?" })).toBeVisible();
  await page.getByRole("button", { name: "Ver mi programa" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Tu programa para fuerza" })).toBeFocused();

  // El protocolo del día: mañana, pre y post, en orden de reloj, con lo que se toma en cada uno.
  const protocol = page.getByRole("region", { name: "El protocolo del día" });
  await protocol.scrollIntoViewIfNeeded();
  await expect(protocol).toContainText("entrenás a la tarde");
  const moments = protocol.locator("[data-protocol-moment]");
  await expect(moments).toHaveCount(3);
  expect(await moments.evaluateAll((els) => els.map((e) => e.getAttribute("data-protocol-moment")))).toEqual(["manana", "pre", "post"]);
  await expect(moments.nth(0)).toContainText("08:00");
  await expect(moments.nth(0).locator("[data-protocol-item='creatina-monohidrato']")).toContainText("1 medida (5 g)");
  await expect(moments.nth(1)).toContainText("17:30");
  await expect(moments.nth(1).locator("[data-protocol-item='overvolt-pre']")).toContainText("Solo los días que entrenás");
  await expect(moments.nth(2).locator("[data-protocol-item='ionic-whey']")).toBeVisible();
  // La compra del programa sigue igual.
  await expect(page.getByRole("region", { name: "Comprar tu programa" }).getByRole("button", { name: "Comprar una vez" })).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  assertNoExternal();
});
