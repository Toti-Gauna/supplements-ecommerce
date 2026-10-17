import { expect, test, type Page } from "@playwright/test";

/**
 * R2a · Catálogo con filtros de máquina: marca, sellos, objetivo, sabor, precio por servicio y categoría, más los
 * órdenes "Más rendidor" y "Más proteína por $". Todo vive en la URL (sobrevive a recargar) y en el celular los
 * filtros van en un panel que sube desde abajo.
 */
const catalog = (page: Page) => page.locator("#catalogo");
const names = (page: Page, scope = "#catalogo") => page.locator(`${scope} [data-product-card] h3`).allTextContents();
const perServing = async (page: Page) =>
  (await page.locator("#catalogo [data-product-card]").filter({ hasText: "por servicio" }).locator("p", { hasText: "por servicio" }).allTextContents())
    .map((t) => Number(t.replace(/[^\d]/g, "")));

test.describe("en el escritorio", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test("marca + sello + «Más rendidor»: ordena por precio por servicio y la URL lo recuerda al recargar", async ({ page }) => {
    await page.goto("categorias/");
    const filters = page.getByRole("complementary", { name: "Filtros del catálogo" });
    await filters.getByRole("group", { name: "Marca" }).getByRole("checkbox", { name: /Krono Nutrition/ }).check();
    await filters.getByRole("group", { name: "Sellos" }).getByRole("checkbox", { name: /Sin azúcar/ }).check();
    await catalog(page).getByLabel("Ordenar por").selectOption({ label: "Más rendidor" });
    await expect(page).toHaveURL(/categorias\/\?marca=krono-nutrition&sello=sin-azucar&orden=rendidor$/);

    const expected = ["L-Carnitina líquida 3000", "Colágeno hidrolizado + vitamina C", "BCAA 2:1:1", "Isolate Zero"];
    await expect.poll(() => names(page)).toEqual(expected);
    const pps = await perServing(page);
    expect(pps).toEqual([...pps].sort((a, b) => a - b));
    await expect(catalog(page).getByRole("list", { name: "Filtros puestos" }).getByRole("button")).toHaveText([/Krono Nutrition/, /Sin azúcar/]);

    await page.reload();
    await expect.poll(() => names(page)).toEqual(expected);
    await expect(filters.getByRole("checkbox", { name: /Krono Nutrition/ })).toBeChecked();
    await expect(catalog(page).getByLabel("Ordenar por")).toHaveValue("value");

    // Sacar un filtro desde su chip y "Limpiar" (el orden se queda).
    await catalog(page).getByRole("button", { name: "Quitar filtro Sellos: Sin azúcar" }).click();
    await expect(page).toHaveURL(/\?marca=krono-nutrition&orden=rendidor$/);
    await catalog(page).getByRole("button", { name: "Limpiar", exact: true }).click();
    await expect(page).toHaveURL(/categorias\/\?orden=rendidor$/);
    // Con "Más rendidor" el equipamiento no se mezcla: va aparte, al final, con el porqué.
    const rest = catalog(page).getByRole("region", { name: /Fuera de este orden/ });
    await expect(rest).toContainText("equipamiento");
    await expect(rest.getByRole("heading", { name: "Guantes de boxeo", exact: false })).toBeVisible();
  });

  test("en una categoría: «Más proteína por $», el rango de precio por servicio y sin filtro de categoría", async ({ page }) => {
    await page.goto("c/proteinas/?orden=proteina");
    await expect.poll(async () => (await page.locator("[data-product-card] h3").allTextContents())[0]).toBe("Ionic Whey 100%");
    const filters = page.getByRole("complementary", { name: "Filtros de la categoría" });
    await expect(filters.getByRole("group", { name: "Categoría" })).toHaveCount(0);
    await filters.getByRole("group", { name: "Precio por servicio" }).getByRole("radio", { name: /\$ 1\.000 a \$ 2\.000/ }).check();
    await expect(page).toHaveURL(/c\/proteinas\/\?porserv=1000-2000&orden=proteina$/);
    await expect.poll(() => page.locator("[data-product-card] h3").allTextContents()).toEqual(["Ionic Whey 100%", "Proteína vegana arveja + arroz"]);
    await filters.getByRole("radio", { name: "Cualquiera" }).check();
    await expect(page).toHaveURL(/c\/proteinas\/\?orden=proteina$/);
  });
});

test("celular: los filtros en un panel con «Ver N productos», chips y «Limpiar»", async ({ page }) => {
  await page.goto("categorias/#catalogo");
  await catalog(page).getByRole("button", { name: /^Filtros/ }).click();
  const sheet = page.getByRole("dialog", { name: "Filtros" });
  await sheet.getByRole("group", { name: "Sellos" }).getByRole("checkbox", { name: /Vegano/ }).check();
  await sheet.getByRole("group", { name: "Objetivo" }).getByRole("checkbox", { name: /Fuerza/ }).check();
  await expect(page).toHaveURL(/\?objetivo=fuerza&sello=vegano(#catalogo)?$/);
  const see = sheet.getByRole("button", { name: /^Ver \d+ productos?$/ });
  const count = Number((await see.textContent())!.replace(/\D/g, ""));
  await see.click();
  await expect(sheet).toBeHidden();
  await expect(catalog(page).getByRole("button", { name: /^Filtros/ })).toContainText("2");
  await expect(page.locator("#catalogo [data-product-card]")).toHaveCount(count);
  await expect(catalog(page).getByRole("button", { name: "Quitar filtro Sellos: Vegano" })).toBeVisible();
  // Sin scroll de costado a 375 px.
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  await catalog(page).getByRole("button", { name: /^Filtros/ }).click();
  await sheet.getByRole("button", { name: "Limpiar" }).click();
  await expect(page).toHaveURL(/categorias\/(#catalogo)?$/);
  await expect(sheet.getByRole("checkbox", { name: /Vegano/ })).not.toBeChecked();
});

test("/categorias/ usa el buscador del rubro (el superpuesto), no el formulario viejo", async ({ page }) => {
  await page.goto("categorias/");
  const main = page.getByRole("main");
  await expect(main.getByRole("search")).toHaveCount(0);
  await main.getByRole("button", { name: "Buscar productos" }).click();
  const dialog = page.getByRole("dialog", { name: "Buscar" });
  await expect(dialog.getByRole("combobox", { name: "Buscar productos" })).toBeFocused();
  await page.keyboard.type("whey");
  await expect(dialog.getByRole("status")).toHaveText("2 resultados para “whey”");
});
