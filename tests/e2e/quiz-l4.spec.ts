import { expect, test } from "@playwright/test";
import { checkoutAsGuest, guardNetwork, horizontalOverflow, openCheckoutTicket } from "./helpers";

/**
 * L4 · el quiz con varios objetivos y deporte hasta "Tu programa" mensual, el checkout y la suscripción en Mi cuenta
 * (celular, 375 px). La invitación de la primera visita va en quiz-l4-invite.spec.ts.
 */
test("quiz con 2 objetivos y fútbol → Tu programa todos los meses → checkout → la suscripción en Mi cuenta", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("crear/quiz/");
  await expect(page.getByRole("progressbar", { name: "Pregunta 1 de 5" })).toBeVisible();
  const goals = page.getByRole("group", { name: /¿Qué querés lograr\?/ });
  await goals.getByRole("checkbox", { name: /^Fuerza/ }).check();
  await goals.getByRole("checkbox", { name: /^Salud/ }).check();
  await expect(page.getByText("2 de 3 objetivos elegidos")).toBeVisible();
  await page.getByRole("button", { name: "Siguiente" }).click();

  // Deporte: "Solo gimnasio" y los 12 deportes, cada uno con su dibujo.
  await expect(page.getByRole("heading", { level: 2, name: "¿Hacés algún deporte?" })).toBeFocused();
  await expect(page.getByRole("radio")).toHaveCount(13);
  await expect(page.locator("[data-sport-option] svg[data-sport]")).toHaveCount(12);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  // R2c: deporte, días y horario avanzan solos al elegir.
  await page.getByRole("radio", { name: /^Fútbol/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "¿Cuántos días por semana entrenás?" })).toBeFocused();
  await page.getByRole("radio", { name: /^3 o 4 días/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "¿A qué hora entrenás?" })).toBeFocused();
  await page.getByRole("radio", { name: /^A la tarde/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "¿Tenés alguna restricción?" })).toBeFocused();
  await page.getByRole("checkbox", { name: /^Ninguna/ }).check();
  await page.getByRole("button", { name: "Ver mi programa" }).click();

  // Resultado: título con objetivos y deporte, las cinco respuestas, el porqué, el equipamiento y la compra.
  await expect(page.getByRole("heading", { level: 1, name: "Tu programa para fuerza, salud y fútbol" })).toBeFocused();
  const answers = page.getByRole("list", { name: "Tus respuestas" });
  await expect(answers.getByRole("button")).toHaveCount(5);
  await expect(answers.getByRole("button", { name: "Cambiar deporte: Fútbol" })).toBeVisible();
  await expect(page.getByText(/^Para fútbol sumamos/)).toBeVisible();
  await expect(page.locator("[data-quiz-pick]").first()).toContainText("Por qué");
  const gear = page.getByRole("region", { name: "Para tu deporte" });
  await expect(gear.locator("[data-quiz-gear='botella-1l']")).toContainText("Va en tu programa, en la primera entrega");
  await expect(gear.getByRole("button", { name: "Agregar Bandas elásticas x4 al carrito" })).toBeVisible();
  const buy = page.getByRole("region", { name: "Comprar tu programa" });
  await expect(buy.getByRole("button", { name: "Comprar una vez" })).toBeVisible();
  await expect(buy.getByText(/^≈ \$ [\d.]+$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Editarlo en el armador" })).toHaveAttribute("href", /\/crear\/\?objetivo=fuerza.*deporte=futbol/);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  await buy.getByLabel("Día del mes en que lo querés recibir").selectOption("12");
  await buy.getByRole("button", { name: "Quiero este pack todos los meses" }).click();
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(drawer.getByRole("heading", { name: "Tu programa" })).toBeVisible();
  await expect(drawer.getByText("Todos los meses · día 12")).toBeVisible();
  await expect(drawer.getByText("Descuento pack mensual (15 %)")).toBeVisible();

  await checkoutAsGuest(page);
  // Revisar: el ticket agrupa el pack bajo su nombre con el día del mes y su descuento.
  await openCheckoutTicket(page);
  const ticket = page.getByRole("region", { name: "Resumen de tu compra" });
  await expect(ticket.getByText("Tu programa · todos los meses, día 12")).toBeVisible();
  await expect(ticket.getByText("Descuento pack mensual (15 %)")).toBeVisible();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
  await page.getByRole("link", { name: "Mi cuenta → Suscripciones" }).click();
  await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click();
  const sub = page.locator("#cuenta-seccion [data-subscription]");
  await expect(sub).toHaveCount(1);
  await expect(sub.getByRole("heading", { name: "Tu programa" })).toBeVisible();
  await expect(sub.getByText("Activa", { exact: true })).toBeVisible();
  assertNoExternal();
});

test("objetivos: hasta 3; el cuarto no se marca y avisa qué hacer", async ({ page }) => {
  await page.goto("crear/quiz/");
  const goals = page.getByRole("group", { name: /¿Qué querés lograr\?/ });
  await expect(goals.getByRole("checkbox")).toHaveCount(7);
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.locator("form [role=alert]")).toHaveText("Elegí al menos un objetivo.");
  for (const name of [/^Fuerza/, /^Salud/, /^Energía/]) await goals.getByRole("checkbox", { name }).check();
  await expect(page.getByText("3 de 3 objetivos elegidos")).toBeVisible();
  await goals.getByRole("checkbox", { name: /^Resistencia/ }).click();
  await expect(goals.getByRole("checkbox", { name: /^Resistencia/ })).not.toBeChecked();
  await expect(goals.getByRole("checkbox", { checked: true })).toHaveCount(3);
  await expect(page.getByRole("status").filter({ hasText: "Ya elegiste 3. Sacá uno para sumar otro." })).toBeVisible();
  await goals.getByRole("checkbox", { name: /^Salud/ }).uncheck();
  await goals.getByRole("checkbox", { name: /^Resistencia/ }).check();
  await expect(page.getByText("3 de 3 objetivos elegidos")).toBeVisible();
  await expect(goals.getByRole("checkbox", { name: /^Salud/ })).not.toBeChecked();
});
