import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * R4c · Margen y costos: la lista del proveedor con margen por marca y vista de diferencias, el aumento al margen de la
 * marca, los costos vivos (fecha, cobertura, ganancia al liquidar) y el lote que vence con combo, cupón y drop armados.
 */
const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text }).first();
const money = (n: string) => new RegExp(`\\$\\s?${n.replace(".", "\\.")}`);
const variant = (page: Page, key: string) => page.locator(`[data-variant='${key}']`);
/** Fila de la tabla (escritorio) o tarjeta (celular) que contiene el texto. */
const entry = (page: Page, text: string) => page.locator(":is(tr, li)").filter({ hasText: text }).first();

async function openList(page: Page) {
  await page.goto("admin-demo/lista-proveedor/");
  await expect(page.getByRole("heading", { level: 1, name: "Lista del proveedor" })).toBeVisible();
  await page.getByRole("button", { name: "Cargar la lista de muestra" }).click();
  await expect(page.locator("[data-diff-summary]")).toHaveText("48 suben, 3 bajan, 2 sin coincidencia");
}

test("la lista del proveedor resume qué sube, qué baja y qué no coincide, y propone el precio de cada marca", async ({ page }) => {
  const noExternal = guardNetwork(page);
  await page.goto("admin-demo/compras/").catch(() => undefined);
  await page.goto("admin-demo/proveedores/");
  await page.getByRole("tab", { name: "Lista del proveedor" }).or(page.getByRole("link", { name: "Lista del proveedor" })).first().click();
  await expect(page).toHaveURL(/lista-proveedor\/$/);
  await page.getByRole("button", { name: "Cargar la lista de muestra" }).click();
  await expect(page.locator("[data-diff-summary]")).toHaveText("48 suben, 3 bajan, 2 sin coincidencia");
  // Las dos que no coinciden, con el motivo.
  await page.getByRole("button", { name: "Sin coincidencia" }).click();
  const loose = page.locator("[data-kind='sin-coincidencia']");
  await expect(loose).toHaveCount(2);
  await expect(loose.first()).toContainText("Nitro Burn pre-entreno");
  await expect(loose.first()).toContainText("No lo vendés");
  await expect(loose.last()).toContainText("No encontramos la presentación");
  await page.getByRole("button", { name: "Bajan" }).click();
  await expect(page.locator("[data-kind='baja']")).toHaveCount(3);
  await page.getByRole("button", { name: "Suben" }).click();
  // Isolate Zero: el costo sube de $ 43.500 a $ 45.000 y, con el 35 % de la marca, el precio propuesto termina en 900.
  const row = variant(page, "isolate-zero::iz-chocolate-2lb");
  await expect(row).toContainText(money("43.500"));
  await expect(row).toContainText(money("45.000"));
  await expect(row).toContainText("+3,4 %");
  await expect(row).toContainText("buscás 35 %");
  await expect(row).toContainText(money("70.900"));
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  noExternal();
});

test("el margen de cada marca se edita y cambia el precio propuesto; aplicar guarda costos y precios y se deshace", async ({ page }) => {
  await openList(page);
  const krono = page.locator("[data-brand='Krono Nutrition']");
  await expect(krono).toContainText("Hoy deja");
  await krono.getByLabel("Krono Nutrition").fill("50");
  await krono.getByLabel("Krono Nutrition").press("Enter");
  await expect(toast(page, "Margen de Krono Nutrition: 50 %")).toBeVisible();
  await expect(krono.getByRole("button", { name: "Usar el general" })).toBeVisible();
  const row = variant(page, "isolate-zero::iz-chocolate-2lb");
  await expect(row).toContainText("buscás 50 %");
  await expect(row).toContainText(money("91.900"));
  // Redondeo a $ 100: el mismo costo propone un precio más ajustado.
  await page.getByLabel("Redondeo del precio").selectOption("100");
  await expect(row).toContainText(money("91.600"));
  await page.getByLabel("Redondeo del precio").selectOption("900");
  // Una variante se deja afuera: solo se actualiza su costo.
  await row.getByRole("checkbox").uncheck();
  await page.getByRole("button", { name: "Aplicar costos y precios" }).click();
  const dialog = page.getByRole("dialog", { name: "Aplicar la lista del proveedor" });
  await expect(dialog).toContainText("73 costos");
  await dialog.getByRole("button", { name: "Sí, aplicar" }).click();
  await expect(toast(page, /Lista del proveedor: 73 costos/)).toBeVisible();
  // En la tienda: Isolate Zero (vainilla) tomó el precio nuevo; el chocolate, que quedó afuera, conserva el de lista.
  await page.goto("p/isolate-zero/");
  await expect(page.getByText(money("72.500")).first()).toBeVisible();
  // El costo nuevo rige desde hoy en Costos vivos.
  await page.goto("admin-demo/costos/vivos/");
  await page.getByLabel("Buscar producto").fill("isolate chocolate");
  const costRow = entry(page, "Isolate Zero");
  await expect(costRow).toContainText(money("45.000"));
  await expect(costRow).toContainText(/5 de oct\.? de 2026/);
  // Deshacer deja todo como estaba.
  await page.goto("admin-demo/lista-proveedor/");
  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(toast(page, "Lista deshecha")).toBeVisible();
  await page.goto("admin-demo/costos/vivos/");
  await page.getByLabel("Buscar producto").fill("isolate chocolate");
  await expect(entry(page, "Isolate Zero")).toContainText(/20 de jul\.? de 2026/);
});

test("Aumentar precios también sube cada variante al margen de su marca, con vista previa y deshacer", async ({ page }) => {
  await page.goto("admin-demo/productos/");
  await page.getByRole("button", { name: "Aumentar precios" }).click();
  const dialog = page.getByRole("dialog", { name: "Aumentar precios" });
  await dialog.getByLabel("Marca", { exact: true }).selectOption("Krono Nutrition");
  await dialog.getByText("Al margen de la marca").click();
  await expect(dialog.getByText("Krono Nutrition 35 %")).toBeVisible();
  const preview = dialog.getByRole("region", { name: "Vista previa de los precios" });
  await expect(preview).toContainText("variantes cambian de precio");
  await expect(preview.getByRole("listitem").filter({ hasText: "Isolate Zero" }).first()).toContainText(/\$\s?72\.500.*\$\s?68\.900/);
  await dialog.getByRole("button", { name: /^Llevar \d+ variantes al margen/ }).click();
  await dialog.getByRole("alertdialog", { name: "Confirmar el aumento" }).getByRole("button", { name: "Sí, aplicar" }).click();
  await expect(toast(page, /Al margen de la marca: Krono Nutrition/)).toBeVisible();
  await page.goto("p/isolate-zero/");
  await expect(page.getByText(money("68.900")).first()).toBeVisible();
  await page.goto("admin-demo/productos/");
  await page.getByRole("button", { name: "Deshacer aumento" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Deshacer" }).click();
  await page.goto("p/isolate-zero/");
  await expect(page.getByText(money("72.500")).first()).toBeVisible();
});

test("costos vivos: fecha del costo, cobertura de stock y ganancia al liquidar el lote que vence", async ({ page }) => {
  await page.goto("admin-demo/costos/");
  await page.getByRole("tab", { name: "Costos vivos" }).or(page.getByRole("link", { name: "Costos vivos" })).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Costos vivos" })).toBeVisible();
  const summary = page.getByRole("region", { name: "Resumen de costos vivos" });
  await expect(summary).toContainText("Costos sin actualizar");
  await expect(summary).toContainText("Lotes por vencer");
  await page.getByLabel("Buscar producto").fill("barra proteica");
  const row = entry(page, "Maní · Caja x 12");
  await expect(row).toContainText(/14 de sept?\.? de 2026/);
  await expect(row).toContainText("Lote VL-2604-B");
  // 3 unidades a $ 20.300 (−30 %) con el costo puesto en el local de $ 14.450: +$ 17.550; si vence, −$ 43.350.
  await expect(row).toContainText(/\+\$\s?17\.550/);
  await expect(row).toContainText(/Si vence: −\$\s?43\.350/);
  await page.getByLabel("Buscar producto").fill("");
  await page.getByLabel("Costo", { exact: true }).selectOption("viejo").catch(() => undefined);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("el lote que vence trae sus salidas armadas: liquidar con ganancia, combo, cupón y drop", async ({ page }) => {
  await page.goto("admin-demo/");
  const lot = "lot:barra-proteica::bp-mani-x12::VL-2604-B";
  await expect(page.locator(`[data-action='${lot}']`)).toContainText("También lo podés sumar a un combo, mandar un cupón o meter en el drop");
  await page.locator(`[data-action='${lot}']`).getByRole("button", { name: /Liquidar −30 %/ }).click();
  const sheet = page.getByRole("dialog", { name: "Liquidar el lote VL-2604-B" });
  await expect(sheet.getByRole("tab", { name: "Liquidar" })).toHaveAttribute("aria-selected", "true");
  await expect(sheet.locator("[data-liquidation-profit]")).toContainText(/ganás \$\s?17\.550/);
  await expect(sheet).toContainText(/Si el lote vence sin venderse, perdés \$\s?43\.350/);

  // Combo con el complemento más lógico.
  await sheet.getByRole("tab", { name: "Combo" }).click();
  await expect(sheet.locator("[data-combo]")).toContainText("Shaker");
  await sheet.locator("label").filter({ hasText: /^20 %$/ }).click();
  await expect(sheet.getByRole("status", { name: "Precio del combo" })).toContainText(/\$\s?\d/);
  await sheet.getByRole("button", { name: "Crear el combo" }).click();
  await expect(toast(page, "Combo creado")).toBeVisible();

  // Cupón real en Promos y mensaje para quien lo compró.
  await page.locator(`[data-action='${lot}']`).getByRole("button", { name: /Liquidar −30 %/ }).click();
  const again = page.getByRole("dialog", { name: "Liquidar el lote VL-2604-B" });
  await expect(again.getByRole("tab", { name: /Combo/ })).toContainText("(armado)");
  await again.getByRole("tab", { name: "Cupón" }).click();
  await expect(again.locator("[data-lot-coupon]")).toContainText("LOTEVL2604B");
  await expect(again).toContainText("Primero creá el cupón");
  await again.getByRole("button", { name: "Crear el cupón" }).click();
  await expect(toast(page, "Cupón LOTEVL2604B creado")).toBeVisible();
  const wa = again.getByRole("link", { name: /WhatsApp a Ana López con el cupón/ });
  await expect(wa).toBeVisible();
  const href = (await wa.getAttribute("href"))!;
  expect(href).toMatch(/^https:\/\/wa\.me\/549223555/);
  expect(decodeURIComponent(href)).toContain("LOTEVL2604B");
  await again.getByRole("tab", { name: "Drop" }).click();
  await expect(again.locator("[data-drop]")).toContainText("Halloween");
  await again.getByRole("button", { name: /Sumarlo al drop de Halloween/ }).click();
  await expect(toast(page, "Sumado al drop de Halloween")).toBeVisible();

  // Todo quedó en su lugar: pack, cupón y campaña; y Hoy lo dice.
  await page.goto("admin-demo/packs/");
  await expect(page.getByText(/Combo Barra proteica 20 g \+ /).first()).toBeVisible();
  await page.goto("admin-demo/promos/");
  await expect(page.getByText("LOTEVL2604B").first()).toBeVisible();
  await page.goto("admin-demo/campanas/editar/?id=halloween");
  await expect(page.getByRole("checkbox", { name: /^Barra proteica 20 g/ })).toBeChecked();
  await page.goto("admin-demo/");
  await expect(page.locator(`[data-action='${lot}']`)).toContainText("Ya armaste: combo, cupón, drop.");
  await page.goto("packs/");
  await expect(page.getByText(/Combo Barra proteica 20 g \+ /).first()).toBeVisible();
});

for (const [label, width, height] of [["escritorio", 1440, 900], ["celular", 375, 812]] as const) {
  test(`a ${width} px (${label}): lista del proveedor y costos vivos sin desborde`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await openList(page);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await page.goto("admin-demo/costos/vivos/");
    await expect(page.getByRole("heading", { level: 1, name: "Costos vivos" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}
