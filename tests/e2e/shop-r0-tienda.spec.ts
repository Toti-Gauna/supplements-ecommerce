import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * R0 · Tienda. "+ Agregar" de la tarjeta agrega de verdad: el link estirado del nombre cubre toda la tarjeta y, con
 * el `transform` de hover/tap (motion.css), quedaba encima del botón y el clic terminaba en la ficha. Playwright no
 * hace clic si otro elemento intercepta el puntero, así que el clic mismo prueba el apilamiento.
 * También: mega menú, h1 y rieles del inicio, e insignia honesta de las ofertas con mínimo.
 */
const cartBadge = (page: Page) => page.getByRole("button", { name: /^Carrito, 1 producto$/ });

/** El elemento que recibe el puntero en el centro del botón es el botón (y no el link de la tarjeta). */
async function buttonIsOnTop(button: Locator) {
  return button.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return Boolean(hit && el.contains(hit));
  });
}

test.describe("escritorio, con mouse", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test("pasar el mouse por la tarjeta y tocar «Agregar» suma al carrito sin ir a la ficha", async ({ page }) => {
    await page.goto("");
    const rail = page.getByRole("region", { name: /^Recomendados/ });
    const card = rail.locator("[data-product-card]").first();
    await card.scrollIntoViewIfNeeded();
    const name = (await card.getByRole("heading", { level: 3 }).innerText()).trim();
    await card.hover();
    const add = card.getByRole("button", { name: `Agregar ${name} al carrito` });
    await expect(add).toBeVisible();
    expect(await buttonIsOnTop(add), "con el hover, el link de la tarjeta no debe tapar el botón").toBe(true);
    await add.click();
    const drawer = page.getByRole("dialog", { name: "Carrito" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(name).first()).toBeVisible();
    await expect(page).not.toHaveURL(/\/p\//);
    await page.keyboard.press("Escape");
    await expect(cartBadge(page)).toBeVisible();
  });

  test("el resto de la tarjeta sigue llevando a la ficha", async ({ page }) => {
    await page.goto("c/proteinas/");
    const card = page.locator("[data-product-card]").first();
    const href = await card.getByRole("link").getAttribute("href");
    // La imagen no recibe el puntero (lo recibe el link estirado), así que se toca por coordenadas, como una persona.
    const box = (await card.locator("[data-card-visual]").boundingBox())!;
    await page.mouse.click(box.x + box.width / 3, box.y + box.height / 3);
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test("mega menú: cantidades en singular o plural y «Por objetivo» lleva a elegir el objetivo", async ({ page }) => {
    await page.goto("");
    await page.getByRole("button", { name: "Tienda", exact: true }).hover();
    const menu = page.locator("#shop-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByText(/^\d+ productos?$/).first()).toBeVisible();
    await expect(menu.getByText(/^1 productos$/)).toHaveCount(0);
    await expect(menu.getByRole("link", { name: /Por objetivo/ })).toHaveAttribute("href", /\/crear\/$/);
  });
});

test.describe("celular, con toque", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test("tocar «+» en la tarjeta suma al carrito sin ir a la ficha", async ({ page }) => {
    await page.goto("c/proteinas/");
    const card = page.locator("[data-product-card]").first();
    const name = (await card.getByRole("heading", { level: 3 }).innerText()).trim();
    const add = card.getByRole("button", { name: `Agregar ${name} al carrito` });
    await add.scrollIntoViewIfNeeded();
    await add.tap();
    const drawer = page.getByRole("dialog", { name: "Carrito" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(name).first()).toBeVisible();
    await expect(page).toHaveURL(/\/c\/proteinas\/$/);
  });
});

test("inicio: tiene un h1 y «Recomendados» no repite «Más vendidos»", async ({ page }) => {
  await page.goto("");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const names = (region: string) => page.getByRole("region", { name: new RegExp(`^${region}`) }).getByRole("heading", { level: 3 }).allInnerTexts();
  await page.getByRole("region", { name: /^Más vendidos/ }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("region", { name: /^Más vendidos/ }).locator("[data-product-card]").first()).toBeVisible();
  const best = await names("Más vendidos");
  const recommended = await names("Recomendados");
  expect(recommended.length).toBeGreaterThan(0);
  expect(recommended.filter((n) => best.includes(n))).toEqual([]);
});

test("ofertas de Black Friday: con mínimo de compra, la insignia dice la condición y no un «30% OFF» sin descuento", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: "black-friday" }, version: 0 })));
  await page.goto("");
  const rail = page.getByRole("region", { name: /^Ofertas/ });
  await rail.scrollIntoViewIfNeeded();
  await expect(rail.locator("[data-product-card]").first().getByText(/^−30\s%\sdesde\s\$\s40\.000$/)).toBeVisible();
  await expect(rail.getByText("30% OFF")).toHaveCount(0);
  await expect(rail.locator("s")).toHaveCount(0);
});
