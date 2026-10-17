import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * L4 · "Armá tu stack" con varios objetivos y deporte, y "Entrená por objetivo o por deporte" en el inicio (pedido de
 * Ignacio: fuerza y salud a la vez; deportes como fútbol o tenis).
 */
async function openBuilder(page: Page, query = "") {
  await page.goto(`crear/${query}`);
  await expect(page.getByRole("heading", { level: 1, name: "Armá tu stack" })).toBeVisible();
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
}

const shelf = (page: Page) => page.getByRole("img", { name: /^Estante de tu stack/ });
const summary = (page: Page) => page.getByRole("region", { name: "Resumen de tu stack" });
const pots = (page: Page) => shelf(page).locator("[data-shelf-pot]");
const goalsParam = (page: Page) => new URL(page.url()).searchParams.get("objetivo");

test("L4 · armador: fuerza + salud arma 4 productos distintos, queda en la URL y sobrevive a la recarga; el cuarto objetivo avisa", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await openBuilder(page);
  await expect(page.getByText("Hasta 3", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Fuerza" }).check();
  await page.getByRole("checkbox", { name: "Salud" }).check();
  await expect(page.locator("[data-stack-headline]")).toHaveText("Tu stack para fuerza + salud");
  await expect(pots(page)).toHaveCount(4);
  const slugs = await summary(page).locator("dt").allTextContents();
  expect(slugs[0]).toBe("Subtotal (4 productos)");
  await expect(shelf(page)).not.toHaveAttribute("aria-label", /lugar libre/);
  const names = (await shelf(page).getAttribute("aria-label"))!.replace(/^Estante de tu stack: /, "").split(/, | y /);
  expect(new Set(names).size).toBe(4);
  await expect(page.getByText("Stack −10 %")).toBeVisible();
  expect(goalsParam(page)).toBe("fuerza,salud");
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);

  await page.reload();
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  await expect(page.getByRole("checkbox", { name: "Fuerza" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Salud" })).toBeChecked();
  await expect(shelf(page)).toHaveAttribute("aria-label", `Estante de tu stack: ${names.slice(0, 3).join(", ")} y ${names[3]}`);
  expect(goalsParam(page)).toBe("fuerza,salud");

  // Tres entran; el cuarto no se marca y avisa.
  await page.getByRole("checkbox", { name: "Energía" }).check();
  await page.getByRole("checkbox", { name: "Definición" }).click();
  await expect(page.getByRole("checkbox", { name: "Definición" })).not.toBeChecked();
  await expect(page.getByText("Ya tenés 3 objetivos: sacá uno para sumar otro.")).toBeVisible();
  expect(goalsParam(page)).toBe("fuerza,salud,energia");
  assertNoExternal();
});

test("L4 · armador: el deporte suma sus objetivos y su equipamiento, que va al carrito aparte del stack", async ({ page }) => {
  await openBuilder(page, "?objetivo=fuerza");
  await expect(page.getByRole("region", { name: /Sumá para tu deporte/ })).toHaveCount(0);
  await page.getByRole("radio", { name: "Fútbol" }).check();
  await expect(page.locator("[data-stack-headline]")).toHaveText("Tu stack para fútbol: fuerza + resistencia + recuperación");
  await expect(page.getByText("Fútbol suma resistencia + recuperación.")).toBeVisible();
  expect(new URL(page.url()).searchParams.get("deporte")).toBe("futbol");
  expect(goalsParam(page)).toBe("fuerza,resistencia,recuperacion");

  const gear = page.getByRole("region", { name: "Sumá para tu deporte · Fútbol" });
  await expect(gear.locator("ul > li")).toHaveCount(2);
  await expect(gear).toContainText("No suma al descuento stack.");
  await gear.getByRole("button", { name: "Agregar Botella deportiva 1 L" }).click();
  await page.getByRole("dialog", { name: "Elegí cómo llevás Botella deportiva 1 L" }).getByRole("button", { name: /Agregar al carrito/ }).click();
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(drawer.getByText("Agregaste Botella deportiva 1 L")).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Quitar Botella deportiva 1 L" })).toBeVisible();
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);

  // Sacar el deporte se lleva lo que había sumado.
  await page.goto("crear/?objetivo=fuerza,resistencia,recuperacion&deporte=futbol");
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  await page.getByRole("radio", { name: "Solo gimnasio" }).check();
  await expect(page.locator("[data-stack-headline]")).toHaveText("Tu stack para fuerza");
  await expect(page.getByRole("region", { name: /Sumá para tu deporte/ })).toHaveCount(0);
});

test("L4 · inicio: pestaña Deportes con flechas, Fútbol abre el armador con el deporte elegido", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("");
  const section = page.locator("section[aria-labelledby='objetivos-title']");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("heading", { name: "Entrená por objetivo o por deporte" })).toBeVisible();
  const goalsTab = section.getByRole("tab", { name: /Objetivos/ });
  await expect(goalsTab).toHaveAttribute("aria-selected", "true");
  await expect(section.getByRole("tabpanel")).toHaveCount(1);
  await expect(section.getByRole("link", { name: "Fuerza", exact: true })).toHaveAttribute("href", /\/crear\/\?objetivo=fuerza&stack=/);

  // Teclado: la flecha a la derecha pasa a Deportes.
  await goalsTab.focus();
  await page.keyboard.press("ArrowRight");
  const sportsTab = section.getByRole("tab", { name: /Deportes/ });
  await expect(sportsTab).toBeFocused();
  await expect(sportsTab).toHaveAttribute("aria-selected", "true");
  const panel = section.getByRole("tabpanel", { name: /Deportes/ });
  await expect(panel.locator(":scope > ul > li")).toHaveCount(12);
  await expect(panel.getByRole("link", { name: "Ver Pack Fútbol" })).toHaveAttribute("href", /\/packs\/\?pack=futbol$/);
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);

  await panel.getByRole("link", { name: "Fútbol", exact: true }).click();
  await expect(page).toHaveURL(/\/crear\/\?/);
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  await expect(page.getByRole("radio", { name: "Fútbol" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Resistencia" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Recuperación" })).toBeChecked();
  await expect(page.getByRole("region", { name: "Sumá para tu deporte · Fútbol" })).toBeVisible();
  assertNoExternal();
});
