import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/**
 * R2c · Mi rack y ayuda del box: el total del rack con el descuento stack, "Agregar todo", "Armar stack con esto" con
 * cada pote en su lugar, avisos simulados que saltan al bajar un precio en el panel, la ayuda agrupada con buscador sin
 * tildes (y el tema editable en el panel) y el 404 dentro de la tienda con buscador.
 */
const RACK = ["ionic-whey", "creatina-monohidrato", "overvolt-pre", "guantes-boxeo"];
const money = (label: string | null) => Number((label ?? "").replace(/\D/g, ""));

/** Guarda los favoritos una sola vez (las navegaciones siguientes conservan lo que cambió la prueba). */
async function seedRack(page: Page, slugs: string[]) {
  await page.addInitScript((s) => {
    try { if (!localStorage.getItem("volta-demo:favorites")) localStorage.setItem("volta-demo:favorites", JSON.stringify({ state: { slugs: s }, version: 0 })); } catch { /* sin almacenamiento */ }
  }, slugs);
}

const bays = (page: Page) => page.getByRole("list", { name: "Productos de Mi rack" }).getByRole("listitem");
const totals = (page: Page) => page.getByRole("region", { name: "Total del rack" });

test("Mi rack: total con descuento stack, agregar todo y armar stack con cada pote en su lugar", async ({ page }) => {
  await seedRack(page, RACK);
  await page.goto("favoritos/");
  await expect(page.getByRole("heading", { level: 1, name: "Mi rack" })).toBeVisible();
  await expect(bays(page)).toHaveCount(4);
  // El total es la suma de los potes (precio del pote primero) menos el 10 % stack de los tres suplementos.
  const prices = await bays(page).locator("svg[role=img]").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  const sum = prices.reduce((s, l) => s + money(l), 0);
  const supplements = prices.slice(0, 3).reduce((s, l) => s + money(l), 0);
  await expect(totals(page)).toContainText("Descuento stack −10 %");
  await expect(totals(page).locator("[data-rack-total]")).toHaveAttribute("data-rack-total", String(sum - Math.round(supplements * 0.1)));
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);

  await totals(page).getByRole("button", { name: "Agregar todo al carrito" }).click();
  const cart = page.getByRole("dialog", { name: "Carrito" });
  await expect(cart).toBeVisible();
  for (const name of ["Ionic Whey 100%", "Creatina monohidrato micronizada", "Overvolt pre-entreno", "Guantes de boxeo"]) await expect(cart.getByText(name).first()).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(totals(page)).toContainText("3 potes entran en el armador; 1 queda afuera");
  await totals(page).getByRole("link", { name: "Armar stack con esto" }).click();
  await expect(page).toHaveURL(/\/crear\/\?stack=base\.ionic-whey\.[\w-]+(,|%2C)creatina\.creatina-monohidrato\.[\w-]+(,|%2C)energia\.overvolt-pre\./);
  await expect(page.getByRole("heading", { level: 1, name: "Armá tu stack" })).toBeVisible();
  await expect(page.locator("[data-stack-ready]")).toBeAttached();
  for (const name of ["Ionic Whey 100%", "Creatina monohidrato micronizada", "Overvolt pre-entreno"]) await expect(page.locator("main").getByText(name).first()).toBeVisible();
});

test("Mi rack vacío y quitar un producto", async ({ page }) => {
  await seedRack(page, ["glutamina"]);
  await page.goto("favoritos/");
  await expect(bays(page)).toHaveCount(1);
  await expect(async () => {
    await page.getByRole("button", { name: "Quitar Glutamina micronizada de Mi rack" }).click({ timeout: 1000 });
    await expect(page.getByRole("heading", { name: "Esta barra está sin discos" })).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(page.getByRole("link", { name: "Explorar la tienda" })).toBeVisible();
});

test.describe("avisos simulados (escritorio)", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test("el aviso queda activo y salta cuando el dueño baja el precio en el panel", async ({ page }) => {
    await seedRack(page, ["glutamina", "ionic-whey"]);
    await page.goto("favoritos/");
    await expect(page.getByRole("note").filter({ hasText: "Avisos simulados." })).toContainText("no se manda nada");
    const toggle = page.getByRole("button", { name: "Avisame si baja o si vuelve: Glutamina micronizada" });
    await expect(async () => {
      await toggle.click({ timeout: 1000 });
      await expect(toggle).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
    }).toPass();
    const bay = page.locator("[data-rack-bay='glutamina']");
    await expect(bay.locator("[data-rack-alert='watching']")).toContainText("Te avisamos si baja de precio. (simulado)");
    await expect(page.getByRole("status").filter({ hasText: "aviso activo" })).toHaveText(/1 aviso activo/i);

    await page.goto("admin-demo/productos/editar/?id=glutamina");
    const presentacion = page.locator("#paso-variantes details").first();
    await presentacion.getByLabel("Precio final (ARS)").fill("21900");
    await page.getByRole("button", { name: /^Guardar/ }).click();
    await expect(page.getByRole("status").filter({ hasText: "Producto guardado" })).toBeVisible();

    await page.goto("favoritos/");
    await expect(bay.locator("[data-rack-alert='triggered']")).toContainText("¡Saltó tu aviso! Bajó $ 3.000: de $ 24.900 a $ 21.900.");
    await expect(page.getByRole("status").filter({ hasText: "aviso activo" })).toContainText("1 saltó");
    await bay.getByRole("button", { name: "Seguir avisando: Glutamina micronizada" }).click();
    await expect(bay.locator("[data-rack-alert='watching']")).toBeVisible();
  });
});

test("ayuda del box: grupos por tema, búsqueda sin tildes y contacto por WhatsApp", async ({ page }) => {
  await page.goto("preguntas/");
  await expect(page.getByRole("heading", { level: 1, name: "Ayuda del box" })).toBeVisible();
  for (const topic of ["Compras", "Envíos y cadete", "Pagos", "Cambios y devoluciones", "Suplementos y lotes", "Equipamiento y talles", "Club y regalos"]) {
    await expect(page.getByRole("heading", { level: 2, name: topic, exact: true })).toBeVisible();
  }
  const search = page.getByRole("searchbox", { name: "Buscá en la ayuda" });
  await expect(async () => {
    await search.fill("credito");
    await expect(page.locator("#help-search-status")).toHaveText("2 preguntas con “credito”", { timeout: 1000 });
  }).toPass();
  await expect(page.getByRole("heading", { level: 2, name: "Pagos" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Compras", exact: true })).toHaveCount(0);
  await expect(page.getByText(/tarjeta de crédito, débito o dinero en cuenta/)).toBeVisible();
  await search.fill("devolucion");
  await expect(page.getByRole("heading", { level: 2, name: "Cambios y devoluciones" })).toBeVisible();
  await search.fill("zzzz");
  await expect(page.locator("#help-search-status")).toContainText("No encontramos “zzzz”");
  const whatsapp = page.getByRole("link", { name: "Preguntale al local por WhatsApp" });
  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/.*text=.*ayuda/);
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);
});

test("panel: el tema de una pregunta se elige y la ayuda la muestra en ese grupo", async ({ page }) => {
  await page.goto("admin-demo/contenido/preguntas/");
  await page.getByRole("button", { name: "Agregar pregunta" }).click();
  const last = page.getByRole("group").last();
  await last.getByLabel("Tema de la ayuda").selectOption({ label: "Equipamiento y talles" });
  await last.getByLabel("Pregunta", { exact: true }).fill("¿Tienen rodilleras de 7 mm?");
  await last.getByLabel("Respuesta", { exact: true }).fill("Sí, en talles S a XL.");
  await page.getByRole("button", { name: "Guardar preguntas" }).click();
  await page.goto("preguntas/");
  const group = page.getByRole("region", { name: "Equipamiento y talles" });
  await expect(group.getByText("¿Tienen rodilleras de 7 mm?")).toBeVisible();
});

test("404 dentro de la tienda: barra vacía, buscador y atajos", async ({ page }) => {
  const res = await page.goto("p/no-existe/");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Esta barra está vacía" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Atajos" }).getByRole("link", { name: /Mi rack/ })).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  expect(await horizontalOverflow(page), "sin scroll horizontal a 375 px").toBeLessThanOrEqual(0);
  const form = page.locator("form[role=search]");
  await form.getByRole("searchbox", { name: "Buscá un producto" }).fill("creatina");
  await form.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page).toHaveURL(/\/buscar\/\?q=creatina$/);
  await expect(page.getByRole("heading", { level: 1, name: "Buscar" })).toBeVisible();
});
