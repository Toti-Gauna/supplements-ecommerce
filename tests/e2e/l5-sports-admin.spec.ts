import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * L5 · cierre de L4: deportes editables en el panel (como los objetivos), el mismo tope de objetivos en el armador que
 * en el quiz (el deporte siempre suma) y las tarjetas de objetivo del inicio con el total de su stack, como las de deporte.
 */
const toast = (page: Page, text: string) => page.getByRole("status").filter({ hasText: text });
const homeSection = (page: Page) => page.locator("section[aria-labelledby='objetivos-title']");

test("panel: cambiar nombre y pack de un deporte y verlo en el inicio, el armador y el quiz", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("admin-demo/categorias/");
  const futbol = page.getByRole("group", { name: "Deporte Fútbol" });
  await futbol.getByLabel("Nombre").fill("Fútbol 5");
  await futbol.getByLabel("Pack sugerido").selectOption({ label: "Pack Salud" });
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Guardar deportes" }).click();
  await expect(toast(page, "Deportes guardados")).toBeVisible();

  await page.goto("");
  const section = homeSection(page);
  // El inicio es HTML estático: hasta que React toma la página (y vuelve a pintar con lo guardado en el panel), el
  // toque en la pestaña no hace nada o cae en una sección que se reemplaza.
  const tab = section.getByRole("tab", { name: /Deportes/ });
  await expect(async () => {
    await section.scrollIntoViewIfNeeded();
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true", { timeout: 1000 });
  }).toPass();
  const panel = section.getByRole("tabpanel", { name: /Deportes/ });
  await expect(panel.getByRole("link", { name: "Ver Pack Salud" })).toHaveAttribute("href", /\/packs\/\?pack=salud$/);
  await panel.getByRole("link", { name: "Fútbol 5", exact: true }).click();
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  await expect(page.getByRole("radio", { name: "Fútbol 5" })).toBeChecked();
  await expect(page.locator("[data-stack-headline]")).toHaveText(/^Tu stack para fútbol 5:/);

  await page.goto("crear/quiz/");
  await page.getByRole("group", { name: /¿Qué querés lograr\?/ }).getByRole("checkbox", { name: /^Fuerza/ }).check();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByRole("radio", { name: /^Fútbol 5/ })).toBeVisible();
  assertNoExternal();
});

test("armador: con 3 objetivos elegidos el deporte igual suma los suyos, como en el quiz", async ({ page }) => {
  await page.goto("crear/?objetivo=fuerza,salud,definicion");
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  await expect(page.getByText("Combinalos: 3 de 3 elegidos.")).toBeVisible();
  await page.getByRole("radio", { name: "Fútbol" }).check();
  await expect(page.locator("[data-stack-headline]")).toHaveText("Tu stack para fútbol: fuerza + salud + definición + resistencia + recuperación");
  await expect(page.getByText("Fútbol suma resistencia + recuperación.")).toBeVisible();
  await expect(page.getByText("Combinalos: 3 de 3 elegidos.")).toBeVisible();
  expect(new URL(page.url()).searchParams.get("objetivo")).toBe("fuerza,salud,definicion,resistencia,recuperacion");
  // Un cuarto propio no entra.
  await page.getByRole("checkbox", { name: "Energía" }).click();
  await expect(page.getByRole("checkbox", { name: "Energía" })).not.toBeChecked();
  await expect(page.getByText("Ya tenés 3 objetivos: sacá uno para sumar otro.")).toBeVisible();
  // Recargar respeta lo elegido y lo que sumó el deporte.
  await page.reload();
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  await expect(page.getByText("Combinalos: 3 de 3 elegidos.")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Recuperación" })).toBeChecked();
});

test("inicio: las tarjetas de objetivo muestran el total de su stack y el producto destacado, y abren ese mismo estante", async ({ page }) => {
  await page.goto("");
  const section = homeSection(page);
  await expect(async () => section.scrollIntoViewIfNeeded()).toPass();
  const panel = section.getByRole("tabpanel", { name: /Objetivos/ });
  await expect(panel.getByText("Su stack")).toHaveCount(7);
  await expect(panel.getByText("Su producto")).toHaveCount(0);
  const fuerza = panel.locator(":scope > ul > li").filter({ has: page.getByRole("link", { name: "Fuerza", exact: true }) });
  const featured = fuerza.getByRole("link", { name: /^Ver / });
  await expect(featured).toHaveAttribute("href", /\/p\//);
  const product = (await featured.textContent())!.replace(/^Ver /, "").trim();
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);

  await fuerza.getByRole("link", { name: "Fuerza", exact: true }).click();
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  await expect(page.getByRole("img", { name: /^Estante de tu stack/ })).toHaveAttribute("aria-label", new RegExp(product.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
