import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * R4a · "Hoy en tu tienda": el marcador coincide con los datos de muestra, la lista va por urgencia y cada botón
 * resuelve (con confirmación) o lleva exactamente al lugar. Un comprobante nunca queda pagado sin confirmar.
 */
const score = (page: Page, key: string) => page.locator(`[data-score='${key}']`);
const row = (page: Page, id: string) => page.locator(`[data-action='${id}']`);

async function openToday(page: Page) {
  await page.goto("admin-demo/");
  await expect(page.getByRole("heading", { level: 1, name: "Hoy en tu tienda" })).toBeVisible();
}

test("el marcador dice lo mismo que los datos de la demo y la lista va por urgencia", async ({ page }) => {
  const noExternal = guardNetwork(page);
  await openToday(page);
  await expect(score(page, "vendido").getByRole("img", { name: /^\$\s0$/ })).toBeVisible();
  await expect(score(page, "vendido")).toContainText(/7 días: \$\s318\.390/);
  await expect(score(page, "cobrar").getByRole("img", { name: /^\$\s171\.150$/ })).toBeVisible();
  await expect(score(page, "cobrar")).toContainText("2 comprobantes por revisar · 2 sin pagar");
  await expect(score(page, "armar").getByRole("img", { name: "8 pedidos" })).toBeVisible();
  await expect(score(page, "armar")).toContainText("1 atrasado");
  await expect(score(page, "sale").getByRole("img", { name: "1 pedido con el cadete" })).toBeVisible();
  await expect(score(page, "stock").getByRole("img", { name: "30 variantes" })).toBeVisible();
  await expect(page.locator("[data-today-summary]")).toContainText("Tenés 6 cosas para hoy");
  const ids = await page.locator("[data-action]").evaluateAll((els) => els.map((e) => e.getAttribute("data-action")));
  expect(ids).toEqual([
    "late:VOL-000115", "receipt:VOL-000124", "receipt:VOL-000123", "dispatch:VOL-000120", "purchase:suggested", "repurchase:due",
    "pack:rest", "gift:REGALO-T4M4-N0X2", "lot:barra-proteica::bp-mani-x12::VL-2604-B", "campaign:halloween", "lots:rest",
  ]);
  await expect(page.locator("[data-tier]")).toHaveCount(4);
  await expect(page.getByText(/acreditad/i)).toHaveCount(0);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  noExternal();
});

test("aprobar un comprobante pide confirmación; cancelado no cambia nada y confirmado lo saca de la lista", async ({ page }) => {
  await openToday(page);
  await row(page, "receipt:VOL-000123").getByRole("button", { name: /Aprobar/ }).click();
  const dialog = page.getByRole("dialog", { name: "Aprobar el comprobante de VOL-000123" });
  await expect(dialog).toContainText("¿Ya viste en tu cuenta el ingreso de");
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(row(page, "receipt:VOL-000123")).toBeVisible();
  await expect(score(page, "cobrar").getByRole("img", { name: /171\.150/ })).toBeVisible();
  await row(page, "receipt:VOL-000123").getByRole("button", { name: /Aprobar/ }).click();
  await dialog.getByRole("button", { name: "Sí, lo verifiqué" }).click();
  await expect(row(page, "receipt:VOL-000123")).toHaveCount(0);
  await expect(score(page, "cobrar").getByRole("img", { name: /^\$\s114\.640$/ })).toBeVisible();
  await expect(score(page, "armar").getByRole("img", { name: "9 pedidos" })).toBeVisible();
  // El otro comprobante sigue esperando, y en el pedido quedó "Pagado" solo porque se confirmó.
  await expect(row(page, "receipt:VOL-000124")).toBeVisible();
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000123");
  await expect(page.getByText("Pagado").first()).toBeVisible();
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000124");
  await expect(page.getByText("Comprobante en revisión").first()).toBeVisible();
});

test("despachar, liquidar y avisar se resuelven ahí mismo y salen de la lista", async ({ page }) => {
  await openToday(page);
  await row(page, "dispatch:VOL-000120").getByRole("button", { name: /Marcar enviado/ }).click();
  await page.getByRole("dialog", { name: "VOL-000120: ¿ya salió?" }).getByRole("button", { name: "Marcar enviado" }).click();
  await expect(row(page, "dispatch:VOL-000120")).toHaveCount(0);
  await expect(score(page, "sale").getByRole("img", { name: "0 pedidos con el cadete" })).toBeVisible();

  const lot = "lot:barra-proteica::bp-mani-x12::VL-2604-B";
  await row(page, lot).getByRole("button", { name: /Liquidar −30 %/ }).click();
  const sheet = page.getByRole("dialog", { name: "Liquidar el lote VL-2604-B" });
  await expect(sheet.getByRole("radio", { name: "−30 %" })).toBeChecked();
  await sheet.getByRole("button", { name: /Liquidar a/ }).click();
  await expect(row(page, lot)).toHaveCount(0);

  await row(page, "repurchase:due").getByRole("button", { name: /Avisarles/ }).click();
  const notices = page.getByRole("dialog", { name: "Avisos de recompra" });
  const emails = notices.getByRole("button", { name: /^Avisarle por email/ });
  await expect(emails).toHaveCount(6);
  for (let i = 0; i < 6; i++) await emails.first().click();
  await expect(notices.getByText("Listo: les avisaste a todos.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(row(page, "repurchase:due")).toHaveCount(0);
});

const LINKS: [string, string, RegExp, (page: Page) => Promise<void>][] = [
  // R4b: "Armar" abre Para armar en ese pedido; el título del comprobante abre Por cobrar en él.
  ["late:VOL-000115", "Terminar de armar", /preparacion\/\?codigo=VOL-000115/, async (p) => { await expect(p.getByRole("article", { name: "Pedido VOL-000115" })).toBeFocused(); }],
  ["receipt:VOL-000123", "Comprobante de Diego Álvarez", /pagos\/\?codigo=VOL-000123/, async (p) => { await expect(p.getByRole("article", { name: "Cobro de VOL-000123" })).toBeVisible(); }],
  ["purchase:suggested", "Armar los pedidos", /\/admin-demo\/(proveedores|compras)\//, async (p) => { await expect(p.getByText("Laboratorio Costa (muestra)").first()).toBeVisible(); }],
  ["pack:rest", "Ir a Para armar", /\/admin-demo\/preparacion\/$/, async (p) => { await expect(p.getByRole("article", { name: "Pedido VOL-000114" })).toBeVisible(); }],
  ["gift:REGALO-T4M4-N0X2", "Ver el regalo", /regalos\/\?ver=regalos/, async (p) => { await expect(p.getByText("Juanma").first()).toBeVisible(); }],
  ["campaign:halloween", "Preparar Halloween", /campanas\/editar\/\?id=halloween/, async (p) => { await expect(p.getByRole("heading", { level: 1, name: "Halloween" })).toBeVisible(); }],
  ["lots:rest", "Ver los lotes", /vence=pronto/, async (p) => { await expect(p.getByText("BS-2603-A").first()).toBeVisible(); }],
];

for (const [id, label, url, check] of LINKS) {
  test(`“${label}” lleva exactamente al lugar (${id})`, async ({ page }) => {
    await openToday(page);
    await row(page, id).getByRole("link", { name: new RegExp(label) }).click();
    await expect(page).toHaveURL(url);
    await check(page);
  });
}

test("el checklist de la campaña marca lo listo y lleva a las piezas", async ({ page }) => {
  await openToday(page);
  const list = row(page, "campaign:halloween").getByRole("list", { name: "Checklist de la campaña" });
  await expect(list.getByRole("link", { name: /Cupón MONSTER20 activo \(listo\)/ })).toBeVisible();
  await list.getByRole("link", { name: /Piezas para Instagram \(pendiente\)/ }).click();
  await expect(page).toHaveURL(/campanas\/piezas\/\?id=halloween/);
});

for (const [label, width, height] of [["escritorio", 1440, 900], ["celular", 375, 812]] as const) {
  test(`a ${width} px (${label}): sin desborde y cada fila con su botón a la vista`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await openToday(page);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    for (const r of await page.locator("[data-action]").all()) {
      const box = (await r.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      await expect(r.getByRole("button").or(r.getByRole("link").last()).last()).toBeVisible();
    }
  });
}
