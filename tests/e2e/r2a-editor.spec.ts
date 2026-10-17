import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/**
 * R2a · Editor de producto "hoja técnica": precio final y servicios por presentación con el precio por servicio en
 * vivo, rótulo y RNPA validados y visibles en la tienda, equipamiento sin rótulo, y la tabla con precio por servicio y
 * margen. Glutamina: una sola presentación (300 g, $ 24.900, 60 servicios) y costo de $ 12.000 en Costos.
 */
const money = (n: string) => new RegExp(`\\$\\s?${n.replace(".", "\\.")}`);
const editor = (slug: string) => `admin-demo/productos/editar/?id=${slug}`;
const save = (page: Page) => page.getByRole("button", { name: /^Guardar/ }).click();
const rotulo = (page: Page) => page.locator("#paso-rotulo");

test.describe("escritorio", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1300, 500); });

  test("precio final y servicios → precio por servicio en vivo → guardar → la ficha muestra el precio nuevo", async ({ page }) => {
    await page.goto(editor("glutamina"));
    const presentacion = page.locator("#paso-variantes details").first();
    await expect(presentacion).toHaveAttribute("open", "");
    const live = presentacion.getByText(/por servicio$/);
    await expect(live).toContainText(money("415"));
    // Nunca "base" ni "recargo": el dueño escribe el precio final de la presentación.
    await expect(page.locator("#paso-variantes")).not.toContainText(/base|recargo/i);
    await presentacion.getByLabel("Precio final (ARS)").fill("30000");
    await expect(live).toContainText(money("500"));
    await presentacion.getByLabel("Servicios (por envase)").fill("75");
    await expect(live).toContainText(money("400"));
    await expect(presentacion.locator("summary")).toContainText(/30\.000.*400\/serv\./);
    await expect(presentacion.getByText(/^Margen \d+ %/)).toContainText("Margen 60 %");
    await save(page);
    await expect(page.getByRole("status").filter({ hasText: "Producto guardado" })).toBeVisible();
    await page.goto("p/glutamina/");
    await expect(page.getByRole("heading", { level: 1, name: "Glutamina micronizada" })).toBeVisible();
    await expect(page.getByText(money("30.000")).first()).toBeVisible();
  });

  test("rótulo: RNPA con formato y tabla con porción y proteínas; lo guardado se ve en la tienda", async ({ page }) => {
    await page.goto(editor("glutamina"));
    const rnpa = page.getByRole("textbox", { name: "RNPA" });
    await rnpa.fill("123");
    await page.getByLabel("Proteínas por porción").fill("");
    await save(page);
    const alert = rotulo(page).getByRole("alert");
    await expect(alert).toContainText("El RNPA tiene que tener el formato 00-000000");
    await expect(alert).toContainText("Falta el renglón de proteínas");
    await expect(rnpa).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("[data-editor-bar]")).toContainText("Faltan datos en 1 paso");
    // Lo que se copia del envase se acomoda solo al salir del campo.
    await rnpa.fill("RNPA N° 04 099999");
    await rnpa.blur();
    await expect(rnpa).toHaveValue("04-099999");
    await page.getByLabel("Porción", { exact: true }).fill("1 medida (5,5 g)");
    await page.getByLabel("Proteínas por porción").fill("4,5 g");
    await page.getByLabel("Cómo se toma").fill("1 medida en agua después de entrenar.");
    await expect(alert).toHaveCount(0);
    await save(page);
    await expect(page.getByRole("status").filter({ hasText: "Producto guardado" })).toBeVisible();
    await page.goto("p/glutamina/");
    await expect(page.getByText("04-099999").first()).toBeVisible();
    const facts = page.getByRole("region", { name: "Información nutricional" });
    await expect(facts).toContainText("1 medida (5,5 g)");
    await expect(facts.getByRole("row").filter({ hasText: "Proteínas" })).toContainText("4,5 g");
  });

  test("equipamiento: sin rótulo, RNPA, servicios ni lotes; se guarda igual", async ({ page }) => {
    await page.goto(editor("straps-algodon"));
    const rail = page.getByRole("navigation", { name: "Pasos del producto" }).filter({ visible: true });
    await expect(rail.getByRole("button", { name: "4. Rótulo: tabla nutricional, modo de uso y RNPA, no aplica" })).toBeVisible();
    await expect(rotulo(page)).toContainText("No aplica al equipamiento");
    await expect(page.getByRole("textbox", { name: "RNPA" })).toHaveCount(0);
    await expect(page.getByLabel("Servicios (por envase)")).toHaveCount(0);
    await expect(page.locator("#paso-variantes")).not.toContainText(/lote/i);
    await expect(page.getByRole("group", { name: "Sellos del rótulo" })).toHaveCount(0);
    await page.getByLabel("Nombre", { exact: true }).fill("Straps de algodón reforzados");
    await save(page);
    await expect(page.getByRole("status").filter({ hasText: "Producto guardado" })).toBeVisible();
  });

  test("Productos y stock: precio por servicio y margen por producto y por variante", async ({ page }) => {
    await page.goto("admin-demo/productos/");
    const table = page.getByRole("region", { name: "Productos" });
    await table.getByRole("searchbox").fill("glutamina");
    await expect(table.getByRole("columnheader", { name: /Precio por servicio/ })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: /Margen/ })).toBeVisible();
    const row = table.getByRole("row").filter({ hasText: "Glutamina micronizada" });
    await expect(row).toContainText(money("415"));
    await expect(row).toContainText("52 %");
    await table.getByRole("searchbox").fill("straps");
    await expect(table.getByRole("row").filter({ hasText: "Straps" })).toContainText("45 %");
    await page.goto("admin-demo/productos/?ver=variantes");
    const stock = page.getByRole("region", { name: "Stock por variante" });
    await stock.getByRole("searchbox").fill("glutamina");
    const vrow = stock.getByRole("row").filter({ hasText: "Glutamina micronizada" });
    await expect(vrow).toContainText(money("415"));
    await expect(vrow).toContainText("52 %");
  });
});

test("celular 375: el editor con precio por servicio, margen y rótulo no se desborda", async ({ page }) => {
  await page.goto(editor("glutamina"));
  await expect(page.locator("#paso-variantes details").first().getByText(/por servicio$/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "RNPA" })).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await page.goto("admin-demo/productos/");
  await expect(page.getByText(/por servicio · margen \d+ %/).first()).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});
