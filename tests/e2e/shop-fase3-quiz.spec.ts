import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/** Fase 3 · quiz "¿Qué necesitás?" en el celular (375 px): respuestas → stack con el porqué → carrito con el mismo descuento. */

const totals = (page: Page) => page.getByRole("complementary").filter({ has: page.getByRole("heading", { name: /Con el descuento stack|Resumen/ }) });
const quizAlert = (page: Page) => page.locator("form [role=alert]");
const quizDiscount = (page: Page) => totals(page).locator("div").filter({ has: page.getByText(/^Descuento stack \(\d+ %\)$/) }).locator("dd");

test("Fase 3 · quiz completo: una pregunta por pantalla con teclado, porqué de cada producto, de noche sin cafeína y el mismo descuento en el carrito", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("crear/quiz/");
  await expect(page.getByRole("heading", { level: 1, name: "¿Qué necesitás?" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Pregunta 1 de 4" })).toBeVisible();
  const goal = page.getByRole("group", { name: /¿Qué querés lograr\?/ });
  await expect(goal.getByRole("radio")).toHaveCount(7);
  // Sin respuesta no avanza: avisa.
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(quizAlert(page)).toHaveText("Elegí una opción para seguir.");
  await goal.getByRole("radio", { name: /^Fuerza/ }).check();
  await expect(quizAlert(page)).toHaveCount(0);
  // Enter sobre la opción avanza y el foco va a la pregunta nueva; con flechas se elige.
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: "¿Cuántos días por semana entrenás?" })).toBeFocused();
  await expect(page.getByRole("progressbar", { name: "Pregunta 2 de 4" })).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: /^3 o 4 días/ })).toBeChecked();
  await page.keyboard.press("Enter");
  await page.getByRole("radio", { name: /^A la tarde/ }).check();
  await page.getByRole("button", { name: "Siguiente" }).click();
  // Atrás conserva la respuesta y se puede cambiar.
  await page.getByRole("button", { name: "Atrás" }).click();
  await expect(page.getByRole("radio", { name: /^A la tarde/ })).toBeChecked();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Ver mi stack" }).click();
  await expect(quizAlert(page)).toHaveText("Marcá al menos una opción, o Ninguna.");
  await page.getByRole("checkbox", { name: /^Vegano/ }).check();
  await page.getByRole("checkbox", { name: /^Ninguna/ }).check();
  await expect(page.getByRole("checkbox", { name: /^Vegano/ })).not.toBeChecked();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Ver mi stack" }).click();

  // Resultado: título, orientativo, cada producto con su porqué y el resumen con el descuento stack.
  await expect(page.getByRole("heading", { level: 1, name: "Tu stack para fuerza" })).toBeFocused();
  await expect(page.getByText(/orientativa.*no reemplaza la consulta con un profesional/)).toBeVisible();
  const picks = page.locator("[data-quiz-pick]");
  await expect(picks).toHaveCount(3);
  await expect(page.locator('[data-quiz-pick="overvolt-pre"]')).toContainText("Tomalo 30 minutos antes de entrenar");
  await expect(page.locator('[data-quiz-pick="creatina-monohidrato"]')).toContainText("La más estudiada para fuerza");
  await expect(quizDiscount(page)).toHaveText("−$ 12.170");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  // Cambiar el horario desde el resultado: de noche el pre sale sin cafeína y lo avisa.
  await page.getByRole("button", { name: "Cambiar horario: A la tarde" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "¿A qué hora entrenás?" })).toBeFocused();
  await page.getByRole("radio", { name: /^A la noche/ }).check();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByRole("checkbox", { name: /^Ninguna/ })).toBeChecked();
  await page.getByRole("button", { name: "Ver mi stack" }).click();
  await expect(page.getByText("Entrenás de noche: el pre va sin cafeína para que duermas bien.")).toBeVisible();
  await expect(page.locator('[data-quiz-pick="overvolt-pre"]')).toHaveCount(0);
  await expect(page.locator('[data-quiz-pick="pump-flow"]')).toContainText("Sin estimulantes");
  await expect(page.getByRole("link", { name: "Ajustarlo en el armador" })).toHaveAttribute("href", /\/crear\/\?objetivo=fuerza&stack=base\.ionic-whey\..+pump-flow/);
  const discount = (await quizDiscount(page).textContent())!;
  expect(discount).toBe("−$ 11.830");

  // Al carrito: se abre con las tres variantes y el mismo descuento.
  await page.getByRole("button", { name: "Agregar el stack al carrito" }).click();
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(drawer.getByText(/¡Armaste tu stack!/)).toBeVisible();
  await expect(drawer.getByText("Descuento stack (10 %)")).toBeVisible();
  await page.goto("carrito/");
  const summary = page.getByRole("region", { name: "Resumen", exact: true });
  await expect(summary.locator("div").filter({ has: page.getByText("Descuento stack (10 %)", { exact: true }) }).locator("dd")).toHaveText(discount);
  await expect(summary.locator("dd").last()).toHaveText("$ 106.470");
  await expect(page.getByRole("list", { name: "Productos en el carrito" }).getByRole("listitem")).toHaveCount(3);

  // Las últimas respuestas quedan en el navegador para retomar; "Hacer el quiz de nuevo" arranca de cero.
  await page.goto("crear/quiz/");
  await page.getByRole("button", { name: "Ver mi último stack" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Tu stack para fuerza" })).toBeVisible();
  await expect(page.locator('[data-quiz-pick="pump-flow"]')).toBeVisible();
  await page.getByRole("button", { name: "Hacer el quiz de nuevo" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "¿Qué querés lograr?" })).toBeFocused();
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ver mi último stack" })).toHaveCount(0);
  assertNoExternal();
});
