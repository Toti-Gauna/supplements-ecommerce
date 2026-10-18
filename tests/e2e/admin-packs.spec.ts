import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/** L3 · panel: Packs (lista, editor) y Suscripciones (lista y "Qué preparar"). Todo simulado, solo en este navegador. */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const storedPacks = (page: Page) => page.evaluate(() => (JSON.parse(localStorage.getItem("volta-demo:admin") ?? "null")?.state?.data?.packs ?? []) as { id: string; name: string; active?: boolean; discountPct: number; items: unknown[] }[]);
const row = (page: Page, name: string | RegExp) => page.getByRole("row", { name });

async function addProduct(page: Page, label: string) {
  await page.getByLabel("Agregar un producto").selectOption({ label });
  await page.getByRole("button", { name: "Agregar al pack" }).click();
  await expect(page.getByRole("list", { name: "Productos del pack" }).getByText(label, { exact: true })).toBeVisible();
}

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test("Packs es una pestaña de Stock, con la entrada en la paleta; abre Packs con sus 9 packs", async ({ page }) => {
    const assertNoExternal = guardNetwork(page);
    await page.goto("admin-demo/productos/");
    await page.getByRole("tablist", { name: "Pestañas de la sección" }).getByRole("tab", { name: "Packs" }).click();
    await expect(page).toHaveURL(/admin-demo\/packs\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Packs y suscripciones" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Packs/ })).toHaveAttribute("aria-pressed", "true");
    const table = page.getByRole("table", { name: "Packs" });
    await expect(table.getByRole("row")).toHaveCount(10);
    // Hipertrofia: 4 productos, primera entrega, por mes, descuento y su suscripción activa.
    const hip = row(page, /Pack Hipertrofia/);
    await expect(hip).toContainText("Masa muscular · 4 productos");
    await expect(hip).toContainText("142.740");
    await expect(hip).toContainText("122.145");
    await expect(hip).toContainText("10 % + 5 % por mes");
    await expect(hip.getByRole("link", { name: "1 activa" })).toBeVisible();
    await expect(hip.getByRole("switch", { name: "Visible en la tienda: Pack Hipertrofia" })).toBeChecked();
    // Paleta de comandos.
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox", { name: /Buscar pedidos/ }).fill("pack");
    await expect(page.getByRole("option", { name: /Nuevo pack/ })).toBeVisible();
    await expect(page.getByRole("option", { name: /Suscripciones y qué preparar/ })).toBeVisible();
    await page.getByRole("option", { name: /Nuevo pack/ }).click();
    await expect(page).toHaveURL(/packs\/editar\/\?nuevo=1/);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    assertNoExternal();
  });

  test("crear un pack con dos productos (uno suplemento): vista previa en vivo, se guarda en data.packs y se ve en la lista", async ({ page }) => {
    await page.goto("admin-demo/packs/");
    await page.getByRole("link", { name: "Nuevo pack" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Nuevo pack" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Guardar pack" })).toBeDisabled();
    await page.getByLabel("Nombre").fill("Pack Prueba E2E");
    await page.getByLabel("Para qué es").fill("Fuerza");
    await addProduct(page, "Ionic Whey 100%");
    await addProduct(page, "Straps de levantamiento");
    const preview = page.getByRole("region", { name: "Vista previa" });
    await expect(preview).toContainText("Se repite cada mes");
    await expect(preview).toContainText("Solo la primera entrega");
    await expect(preview).toContainText("1 × Straps de levantamiento");
    await expect(preview).toContainText("Te dura");
    // Subir y bajar, y que un producto agregado ya no se ofrezca de nuevo.
    await page.getByRole("button", { name: "Subir Straps de levantamiento" }).click();
    await expect(page.getByRole("list", { name: "Productos del pack" }).getByRole("listitem").first()).toContainText("Straps de levantamiento");
    await expect(page.getByLabel("Agregar un producto").locator("option", { hasText: "Ionic Whey 100%" })).toHaveCount(0);
    await page.getByRole("button", { name: "Guardar pack" }).click();
    await expect(toast(page, "Pack creado")).toContainText("solo en esta demo");
    await expect(page).toHaveURL(/admin-demo\/packs\/$/);
    await expect(row(page, /Pack Prueba E2E/)).toContainText("Fuerza · 2 productos");
    await expect(page.getByRole("table", { name: "Packs" }).getByRole("row")).toHaveCount(11);
    const saved = (await storedPacks(page)).find((p) => p.name === "Pack Prueba E2E");
    expect(saved).toMatchObject({ id: "pack-prueba-e2e", active: true });
    expect(saved!.items).toHaveLength(2);
  });

  test("con un solo producto no se guarda: el error está en español junto al botón y no queda nada guardado", async ({ page }) => {
    await page.goto("admin-demo/packs/editar/?nuevo=1");
    await page.getByLabel("Nombre").fill("Pack Incompleto");
    await addProduct(page, "Ionic Whey 100%");
    await page.getByRole("button", { name: "Guardar pack" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Un pack lleva al menos dos productos." })).toBeVisible();
    await expect(page).toHaveURL(/nuevo=1/);
    expect((await storedPacks(page)).some((p) => p.name === "Pack Incompleto")).toBe(false);
    // Corregir el error y guardar sí funciona.
    await addProduct(page, "Creatina monohidrato micronizada");
    await page.getByRole("button", { name: "Guardar pack" }).click();
    await expect(toast(page, "Pack creado")).toBeVisible();
    expect(await storedPacks(page)).toHaveLength(10);
  });

  test("el nombre repetido y el descuento fuera de rango también se frenan", async ({ page }) => {
    await page.goto("admin-demo/packs/editar/?nuevo=1");
    await page.getByLabel("Nombre").fill("pack hipertrofia");
    await addProduct(page, "Ionic Whey 100%");
    await addProduct(page, "Creatina monohidrato micronizada");
    await page.getByLabel(/^Descuento del pack/).fill("55");
    await page.getByRole("button", { name: "Guardar pack" }).click();
    const alert = page.getByRole("alert").filter({ hasText: "Todavía no se puede guardar" });
    await expect(alert).toContainText("Ya hay un pack con ese nombre.");
    await expect(alert).toContainText("El descuento del pack va de 0 a 40 %.");
    expect((await storedPacks(page)).some((p) => p.discountPct === 55)).toBe(false);
  });

  test("editar el descuento cambia el precio de la vista previa y de la lista; el borrador se conserva al salir y avisa", async ({ page }) => {
    await page.goto("admin-demo/packs/");
    await row(page, /Pack Hipertrofia/).getByRole("link", { name: "Editar Pack Hipertrofia" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Editar: Pack Hipertrofia" })).toBeVisible();
    const preview = page.getByRole("region", { name: "Vista previa" });
    await expect(preview).toContainText("$ 142.740");
    await page.getByLabel(/^Descuento del pack/).fill("20");
    // 20 % del pack: primera entrega con $ 31.720 menos; por mes con el 25 % entre los dos descuentos.
    await expect(preview).toContainText("$ 126.880");
    await expect(preview).toContainText("$ 107.775");
    await expect(page.getByText(/Cambios sin guardar/)).toBeVisible();
    // Salir y volver: el borrador sigue.
    await page.goto("admin-demo/pedidos/");
    await page.goto("admin-demo/packs/editar/?id=hipertrofia");
    await expect(page.getByText("Recuperamos los cambios que quedaron sin guardar.")).toBeVisible();
    await expect(page.getByLabel(/^Descuento del pack/)).toHaveValue("20");
    await page.getByRole("button", { name: "Guardar pack" }).click();
    await expect(toast(page, "Pack guardado")).toBeVisible();
    await expect(row(page, /Pack Hipertrofia/)).toContainText("126.880");
    expect((await storedPacks(page)).find((p) => p.id === "hipertrofia")!.discountPct).toBe(20);
  });

  test("descartar vuelve a lo guardado; la variante fija, la cantidad y quitar un producto se reflejan en la vista previa", async ({ page }) => {
    await page.goto("admin-demo/packs/editar/?id=hipertrofia");
    const preview = page.getByRole("region", { name: "Vista previa" });
    await page.getByLabel("Cantidad de Ionic Whey 100%").selectOption("2");
    await expect(preview).toContainText("2 × Ionic Whey 100%");
    await page.getByLabel("Variante de Ionic Whey 100%").selectOption({ index: 2 });
    await page.getByRole("button", { name: "Quitar Straps de levantamiento del pack" }).click();
    await expect(preview).not.toContainText("Straps de levantamiento");
    await expect(preview).not.toContainText("Solo la primera entrega");
    await page.getByRole("button", { name: "Descartar", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Descartar" }).click();
    await expect(preview).toContainText("1 × Ionic Whey 100%");
    await expect(preview).toContainText("Straps de levantamiento");
    await expect(page.getByText("Sin cambios.")).toBeVisible();
  });

  test("ocultar un pack lo saca de la tienda al instante (data.packs) y se puede volver a mostrar", async ({ page }) => {
    await page.goto("admin-demo/packs/");
    const fuerza = page.getByRole("switch", { name: "Visible en la tienda: Pack Fuerza" });
    await fuerza.click();
    await expect(toast(page, "Pack Fuerza oculto de la tienda")).toBeVisible();
    await expect(fuerza).not.toBeChecked();
    expect((await storedPacks(page)).find((p) => p.id === "fuerza")!.active).toBe(false);
    await fuerza.click();
    await expect(fuerza).toBeChecked();
    expect((await storedPacks(page)).find((p) => p.id === "fuerza")!.active).toBe(true);
  });

  test("quitar pide confirmación (y avisa de las suscripciones activas); cancelar no quita nada", async ({ page }) => {
    await page.goto("admin-demo/packs/");
    const salud = row(page, /Pack Salud/);
    await salud.getByRole("button", { name: "Quitar" }).click();
    const dialog = page.getByRole("dialog", { name: "¿Quitar Pack Salud?" });
    await expect(dialog).toContainText("Tiene 1 activa");
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(salud).toBeVisible();
    await salud.getByRole("button", { name: "Quitar" }).click();
    await dialog.getByRole("button", { name: "Quitar pack" }).click();
    await expect(toast(page, "Pack Salud quitado")).toBeVisible();
    await expect(salud).toHaveCount(0);
    expect((await storedPacks(page)).map((p) => p.id)).not.toContain("salud");
    // La suscripción de ese pack queda marcada.
    await page.goto("admin-demo/packs/?ver=suscripciones");
    await expect(row(page, /Valentina Sosa/)).toContainText("Pack quitado");
  });

  test("duplicar deja una copia oculta junto al original", async ({ page }) => {
    await page.goto("admin-demo/packs/");
    await row(page, /Pack Running/).getByRole("button", { name: "Duplicar Pack Running" }).click();
    await expect(toast(page, "Pack duplicado")).toContainText("oculta");
    const copy = row(page, /Pack Running \(copia\)/);
    await expect(copy).toBeVisible();
    await expect(copy.getByRole("switch")).not.toBeChecked();
    expect((await storedPacks(page)).find((p) => p.id === "pack-running-copia")).toMatchObject({ active: false });
  });

  test("Reiniciar demo devuelve los 9 packs", async ({ page }) => {
    await page.goto("admin-demo/packs/");
    await row(page, /Pack Salud/).getByRole("button", { name: "Quitar" }).click();
    await page.getByRole("dialog", { name: "¿Quitar Pack Salud?" }).getByRole("button", { name: "Quitar pack" }).click();
    await expect(page.getByRole("table", { name: "Packs" }).getByRole("row")).toHaveCount(9);
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Reiniciar demo" }).click();
    await page.goto("admin-demo/packs/");
    await expect(page.getByRole("table", { name: "Packs" }).getByRole("row")).toHaveCount(10);
  });
});

test.describe("celular 375 px", () => {
  test("Packs en tarjetas, editor y Suscripciones sin desborde horizontal; pausar funciona con el dedo", async ({ page }) => {
    await page.goto("admin-demo/packs/");
    await expect(page.getByRole("heading", { level: 1, name: "Packs y suscripciones" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Duplicar Pack Hipertrofia" })).toBeVisible();
    await expect(page.getByRole("table")).toBeHidden();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

    await page.getByRole("link", { name: "Editar Pack Hipertrofia" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Editar: Pack Hipertrofia" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Vista previa" })).toContainText("$ 142.740");
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await page.getByLabel(/^Descuento del pack/).fill("15");
    await expect(page.getByRole("region", { name: "Vista previa" })).toContainText("$ 134.810");
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

    await page.goto("admin-demo/packs/?ver=suscripciones");
    await expect(page.getByRole("region", { name: "Qué preparar" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    const card = page.getByRole("list").filter({ hasText: "Julián Paz" }).getByRole("listitem").filter({ hasText: "Julián Paz" });
    await card.getByRole("button", { name: /^Pausar la suscripción de Julián Paz/ }).click();
    await expect(toast(page, "Suscripción pausada: Julián Paz")).toBeVisible();
    await expect(card).toContainText("Pausada");
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});
