import { expect, test, type Page } from "@playwright/test";

/**
 * R1 · Búsqueda protagonista. /buscar entiende el rubro (chips con cruz que reescriben `?q=`, aviso de lo que no se
 * puede filtrar, sugerencias con 0 resultados) y el buscador superpuesto se maneja entero con el teclado.
 */
const field = (page: Page) => page.getByRole("searchbox", { name: "Buscar productos" });
const combo = (page: Page) => page.getByRole("dialog", { name: "Buscar" }).getByRole("combobox", { name: "Buscar productos" });

test.describe("/buscar/", () => {
  test("«proteina vegana sin tacc»: dos chips, sacar uno reescribe la URL y suma resultados", async ({ page }) => {
    await page.goto("buscar/?q=proteina vegana sin tacc");
    const chips = page.getByRole("list", { name: "Filtros entendidos" });
    await expect(chips.getByRole("button")).toHaveText([/Vegano/, /Sin TACC/]);
    await expect(page.getByRole("status").filter({ hasText: "1 resultado para" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Proteína vegana arveja + arroz" })).toBeVisible();

    await chips.getByRole("button", { name: "Quitar filtro Sin TACC" }).click();
    await expect(page).toHaveURL(/buscar\/\?q=proteina(%20|\+)vegana$/);
    await expect(field(page)).toHaveValue("proteina vegana");
    await expect(field(page)).toBeFocused();
    await expect(chips.getByRole("button")).toHaveText([/Vegano/]);

    // Sumar un filtro desde los de tocar: aparece como chip y en la URL.
    await page.getByRole("group", { name: "Sumar sabor" }).getByRole("button", { name: /Chocolate/ }).click();
    await expect(page).toHaveURL(/q=proteina(%20|\+)vegana(%20|\+)chocolate$/);
    await expect(chips.getByRole("button", { name: "Quitar filtro Chocolate" })).toBeVisible();
  });

  test("lo que no es un sello se avisa y no se filtra", async ({ page }) => {
    await page.goto("buscar/?q=proteina sin lactosa");
    await expect(page.getByRole("note")).toContainText("No podemos filtrar «sin lactosa»");
    await expect(page.getByRole("status").filter({ hasText: "resultados para" })).toBeVisible();
  });

  test("0 resultados: «Sin “Vainilla” hay N» y «¿Quisiste decir…?» llevan a una búsqueda que sí da", async ({ page }) => {
    await page.goto("buscar/?q=creatina vainilla");
    await expect(page.getByRole("heading", { name: "No encontramos “creatina vainilla”" })).toBeVisible();
    await page.getByRole("button", { name: /Sin «Vainilla» hay 4 productos/ }).click();
    await expect(page).toHaveURL(/q=creatina$/);
    await expect(page.getByRole("region", { name: "Resultados", exact: true }).getByRole("status").filter({ hasText: "4 resultados para" })).toBeVisible();

    await field(page).fill("wey chocolate");
    await page.getByRole("button", { name: /¿Quisiste decir «whey chocolate»\? 2 productos/ }).click();
    await expect(field(page)).toHaveValue("whey chocolate");
    await expect(page.getByRole("status").filter({ hasText: "2 resultados para" })).toBeVisible();
  });
});

test.describe("buscador superpuesto en el escritorio", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test("«/» lo abre y se maneja con flechas, Enter y Escape", async ({ page }) => {
    await page.goto("");
    // El control nativo confirma la hidratación antes de probar el atajo global.
    await expect(page.getByRole("button", { name: "Reproducir carrusel" })).toBeDisabled();
    await page.locator("body").press("/");
    const dialog = page.getByRole("dialog", { name: "Buscar" });
    await expect(combo(page)).toBeFocused();
    await expect(dialog.getByRole("option", { name: /proteína vegana sin TACC/ })).toBeVisible();

    await page.keyboard.type("whey");
    await expect(dialog.getByRole("status")).toHaveText("2 resultados para “whey”");
    const options = dialog.getByRole("option");
    await expect(options).toHaveCount(2);
    // Fila de rack: el precio en el marcador (se lee entero), el precio por servicio chico y la luz de stock.
    await expect(options.first()).toHaveAccessibleName(/Ionic Whey 100%.*En stock.*116\.900.*1\.559 \/ serv/);
    await page.keyboard.press("ArrowDown");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");
    await expect(combo(page)).toHaveAttribute("aria-activedescendant", (await options.first().getAttribute("id"))!);
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { level: 1, name: "Ionic Whey 100%" })).toBeVisible();

    // La búsqueda quedó en las recientes; Enter sin opción activa va a /buscar con la consulta.
    await page.getByRole("button", { name: "Buscar productos" }).first().click();
    await expect(dialog.getByRole("option", { name: "whey", exact: true })).toBeVisible();
    await combo(page).fill("creatina");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/buscar\/\?q=creatina$/);
    await expect(page.getByRole("region", { name: "Resultados", exact: true }).getByRole("status").filter({ hasText: "4 resultados para" })).toBeVisible();

    // El foco no sale del buscador y Escape lo cierra devolviendo el foco.
    const opener = page.getByRole("button", { name: "Buscar productos" }).first();
    await opener.click();
    for (let i = 0; i < 40; i++) await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("0 resultados: la sugerencia carga la consulta corregida", async ({ page }) => {
    await page.goto("");
    await page.getByRole("button", { name: "Buscar productos" }).first().click();
    await combo(page).fill("wey chocolate");
    const dialog = page.getByRole("dialog", { name: "Buscar" });
    await expect(dialog.getByRole("status")).toHaveText("No encontramos “wey chocolate”");
    await dialog.getByRole("button", { name: /¿Quisiste decir «whey chocolate»\?/ }).click();
    await expect(combo(page)).toHaveValue("whey chocolate");
    await expect(combo(page)).toBeFocused();
    await expect(dialog.getByRole("status")).toHaveText("2 resultados para “whey chocolate”");
  });
});

test("buscador superpuesto en el celular: pantalla completa, chips y teclado", async ({ page }) => {
  await page.goto("");
  await page.getByRole("navigation", { name: "Navegación inferior" }).getByRole("button", { name: "Buscar", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Buscar" });
  await expect(combo(page)).toBeFocused();
  const box = (await dialog.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.y).toBeLessThanOrEqual(1);
  expect(Math.round(box.height)).toBeGreaterThanOrEqual(viewport.height - 1);

  await dialog.getByRole("group", { name: "Sumar sello" }).getByRole("button", { name: /Vegano/ }).click();
  await expect(dialog.getByRole("button", { name: "Quitar filtro Vegano" })).toBeVisible();
  await expect(combo(page)).toHaveValue("vegano");
  await expect(dialog.getByRole("status")).toContainText("resultados para “vegano”");
  await combo(page).press("End");
  await page.keyboard.type(" proteina");
  await expect(dialog.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Proteína vegana arveja + arroz" })).toBeVisible();
  await expect(dialog).toBeHidden();
});
