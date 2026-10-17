import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * Fase 3 · "Armá tu stack" en el celular: objetivo, lugares, estante en vivo, descuento igual al del carrito, costo por
 * día, link para compartir y el bloque en vivo del inicio. Montos de los fixtures (10 % con 3 categorías).
 */
const base = (process.env.PAGES_BASE_PATH ?? "").replace(/\/+$/, "");

/** El armador responde recién con los datos recuperados y la URL leída. */
async function openBuilder(page: Page, query = "") {
  await page.goto(`crear/${query}`);
  await expect(page.getByRole("heading", { level: 1, name: "Armá tu stack" })).toBeVisible();
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
}

const shelf = (page: Page) => page.getByRole("img", { name: /^Estante de tu stack/ });
const summary = (page: Page) => page.getByRole("region", { name: "Resumen de tu stack" });
const discountRow = (page: Page) => summary(page).locator("div").filter({ has: page.getByText(/^Descuento stack \(10 %\)$/) }).locator("dd");

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test("Fase 3 · armador: objetivo, cambiar un lugar y el tamaño, descuento y costo por día; el carrito aplica el mismo descuento", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await openBuilder(page);
  await expect(shelf(page)).toHaveAttribute("aria-label", "Estante de tu stack, vacío");
  await expect(page.getByRole("button", { name: "Agregar el stack al carrito" })).toBeDisabled();
  await expect(page.getByRole("link", { name: /Hacé el quiz/ })).toHaveAttribute("href", `${base}/crear/quiz/`);

  // Fuerza: proteína + creatina + pre → tres categorías, 10 % sobre $ 121.700.
  await page.getByRole("checkbox", { name: "Fuerza" }).check();
  await expect(page.locator("[data-stack-headline]")).toHaveText("Tu stack para fuerza");
  await expect(shelf(page)).toHaveAttribute("aria-label", "Estante de tu stack: Ionic Whey 100%, Creatina monohidrato micronizada y Overvolt pre-entreno. 1 lugar libre");
  await expect(page.getByText("Stack −10 %")).toBeVisible();
  await expect(discountRow(page)).toHaveText("−$ 12.170");
  await expect(summary(page).locator("dd").last()).toHaveText("$ 109.530");
  await expect(page.locator("[data-per-day]")).toHaveText("$ 3.202");
  await expect(page.getByRole("progressbar", { name: "3 de 3 categorías para el descuento stack" })).toBeVisible();

  // Cambiar la creatina desde la hoja: las opciones son tarjetas y la elegida queda marcada.
  await page.getByRole("button", { name: "Cambiar creatina" }).click();
  const sheet = page.getByRole("dialog", { name: "Elegí creatina" });
  await expect(sheet.getByRole("button", { name: /Creatina monohidrato micronizada/ })).toHaveAttribute("aria-pressed", "true");
  await sheet.getByRole("button", { name: /Creatina Brava 100% pura/ }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("listitem", { name: "Creatina" })).toContainText("Creatina Brava 100% pura");
  await expect(page.getByRole("listitem", { name: "Creatina" })).toContainText("$ 530 por servicio");
  await expect(discountRow(page)).toHaveText("−$ 11.830");

  // Tamaño de la proteína: 5 lb.
  await page.getByLabel("Tamaño de Ionic Whey 100%").selectOption({ label: "5 lb (2,27 kg)" });
  await expect(discountRow(page)).toHaveText("−$ 18.030");
  await expect(summary(page).locator("dd").last()).toHaveText("$ 162.270");
  await expect(page.locator("[data-per-day]")).toHaveText("$ 2.987");
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);

  // Al carrito: se abre el carrito lateral con el stack armado y el mismo descuento.
  await page.getByRole("button", { name: "Agregar el stack al carrito" }).click();
  const drawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(drawer.getByText(/¡Armaste tu stack!/)).toBeVisible();
  await expect(drawer.getByText("10 % off: $ 18.030")).toBeVisible();
  await page.goto("carrito/");
  const cart = page.getByRole("region", { name: "Resumen", exact: true });
  await expect(cart.locator("div").filter({ has: page.getByText("Descuento stack (10 %)", { exact: true }) }).locator("dd")).toHaveText("−$ 18.030");
  await expect(cart.locator("dd").last()).toHaveText("$ 162.270");
  assertNoExternal();
});

test("Fase 3 · armador: vaciar un lugar saca el descuento y el link copiado arma el mismo estante", async ({ page }) => {
  await openBuilder(page, "?objetivo=fuerza");
  await expect(page.getByRole("checkbox", { name: "Fuerza" })).toBeChecked();
  await page.getByRole("button", { name: "Vaciar pre-entreno" }).click();
  await expect(shelf(page)).toHaveAttribute("aria-label", /2 lugares libres$/);
  await expect(page.getByRole("button", { name: "Elegir pre-entreno" })).toBeVisible();
  await expect(summary(page).getByText(/Descuento stack/)).toHaveCount(0);
  await expect(page.getByText(/Sumá 1 categoría más/)).toBeVisible();
  await expect(summary(page).locator("dd").last()).toHaveText("$ 84.800");

  await page.getByRole("button", { name: "Copiar link de mi stack" }).click();
  await expect(page.getByText("Link copiado")).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toBe(`${new URL(page.url()).origin}${base}/crear/?objetivo=fuerza&stack=base.ionic-whey.iw-chocolate-2lb%2Ccreatina.creatina-monohidrato.cm-sin-sabor-300`);

  await page.goto(link);
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  await expect(page.getByRole("checkbox", { name: "Fuerza" })).toBeChecked();
  await expect(shelf(page)).toHaveAttribute("aria-label", "Estante de tu stack: Ionic Whey 100% y Creatina monohidrato micronizada. 2 lugares libres");
  await expect(summary(page).locator("dd").last()).toHaveText("$ 84.800");
});

test("Fase 3 · armador: un link con ?stack= carga el estante con su sabor y tamaño, y descarta lo que no existe", async ({ page }) => {
  await openBuilder(page, "?stack=base.ionic-whey.iw-vainilla-5lb,extra.omega-3.o3-60,energia.no-existe.x");
  await expect(shelf(page)).toHaveAttribute("aria-label", "Estante de tu stack: Ionic Whey 100% y Omega 3 1000 mg. 2 lugares libres");
  await expect(page.getByLabel("Sabor de Ionic Whey 100%")).toHaveValue("Vainilla");
  await expect(page.getByLabel("Tamaño de Ionic Whey 100%")).toHaveValue("5 lb (2,27 kg)");
  await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Solo gimnasio" })).toBeChecked();
  await expect(summary(page).locator("dd").last()).toHaveText("$ 135.800");
  await expect(page.locator("[data-per-day]")).toHaveText("$ 1.874");
});

test("Fase 3 · inicio: el bloque en vivo muestra el stack de los objetivos y lleva al armador", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("");
  const block = page.getByRole("region", { name: "Tu estante, según tu objetivo" });
  const blockShelf = block.getByRole("img", { name: /^Estante de tu stack/ });
  await blockShelf.scrollIntoViewIfNeeded();
  await expect(blockShelf).toHaveAttribute("aria-label", /Ionic Whey 100%, Creatina monohidrato micronizada y Overvolt pre-entreno/);
  await expect(block.locator("[data-home-stack-total]")).toHaveText("$ 109.530");
  // L4: se combinan; con solo salud, su stack.
  await expect(async () => {
    await block.getByRole("checkbox", { name: "Fuerza" }).uncheck();
    await block.getByRole("checkbox", { name: "Salud" }).check();
    await expect(block.locator("[data-home-stack-total]")).toHaveText("$ 87.930", { timeout: 1000 });
  }).toPass();
  await expect(blockShelf).toHaveAttribute("aria-label", /Omega 3 1000 mg/);
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);
  await block.getByRole("link", { name: /Armalo a tu medida/ }).click();
  await expect(page).toHaveURL(/\/crear\/\?objetivo=salud$/);
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  await expect(page.getByRole("checkbox", { name: "Salud" })).toBeChecked();
  await expect(summary(page).locator("dd").last()).toHaveText("$ 87.930");
  assertNoExternal();
});

test("Fase 3 · navegación: \"Armá tu stack\" en el menú del celular, el pie y el header de escritorio", async ({ page }) => {
  await page.goto("");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Armá tu stack" })).toHaveAttribute("href", `${base}/crear/`);
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("dialog", { name: "Menú" }).getByRole("link", { name: "Armá tu stack" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Armá tu stack" })).toBeVisible();
  await expect(page).toHaveTitle(/^Armá tu stack · /);
  await page.setViewportSize({ width: 1280, height: 800 });
  const nav = page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Armá tu stack" });
  await expect(nav).toHaveAttribute("aria-current", "page");
});
