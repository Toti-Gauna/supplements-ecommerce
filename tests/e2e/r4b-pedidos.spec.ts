import { expect, test, type Locator, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * R4b · Pedidos unificado: Por cobrar (de a uno, aprobar con la confirmación del ingreso), Para armar (dos pasos con
 * control de lote), Despachos (lista de armado consolidada y hoja de ruta del cadete), Postventa, WhatsApp por estado
 * en cada vista y las rutas de antes con sus filtros.
 */
const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const card = (page: Page, code: string) => page.getByRole("article", { name: `Cobro de ${code}` });
const pack = (page: Page, code: string) => page.getByRole("article", { name: `Pedido ${code}` });
const tabs = (page: Page) => page.getByRole("tablist", { name: "Pestañas de la sección" });
/** El texto que abre el link de WhatsApp (decodificado). */
const waText = async (link: Locator) => decodeURIComponent((await link.getAttribute("href"))!.split("?text=")[1]!);
const wa = (scope: Page | Locator) => scope.getByRole("link", { name: /^Escribirle por WhatsApp/ }).first();

test("Por cobrar: de a uno; aprobar pide confirmar el ingreso, cancelar no cambia nada y sigue el próximo", async ({ page }) => {
  const noExternal = guardNetwork(page);
  await page.goto("admin-demo/pagos/");
  await expect(tabs(page).getByRole("tab", { name: /^Por cobrar/ })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Revisando 1 de 4")).toBeVisible();
  await expect(card(page, "VOL-000124")).toContainText(/Total del pedido\s*\$\s?13\.230/);
  const link = wa(card(page, "VOL-000124"));
  await expect(link).toHaveAttribute("data-wa", "proof-received");
  await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/5492235550124\?text=/);
  expect(await waText(link)).toMatch(/^¡Hola Sofía! Recibimos el comprobante del pedido VOL-000124/);
  await page.getByRole("button", { name: "Siguiente" }).click();
  const review = card(page, "VOL-000123");
  await review.getByRole("button", { name: "Aprobar" }).click();
  const dialog = page.getByRole("dialog", { name: "Aprobar el comprobante de VOL-000123" });
  await expect(dialog).toContainText(/¿Ya viste en tu cuenta el ingreso de \$\s?56\.510\?/);
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(review).toContainText("Comprobante en revisión");
  await review.getByRole("button", { name: "Aprobar" }).click();
  await dialog.getByRole("button", { name: "Sí, lo verifiqué" }).click();
  await expect(toast(page, "Comprobante aprobado")).toBeVisible();
  await expect(card(page, "VOL-000123")).toHaveCount(0);
  await expect(card(page, "VOL-000125")).toBeVisible();
  await expect(page.getByText("Revisando 2 de 3")).toBeVisible();
  await expect(page.getByRole("button", { name: /Comprobantes por revisar/ })).toContainText("1");
  await expect(page.getByText(/acreditad/i)).toHaveCount(0);
  await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000123");
  await expect(page.getByText(/Pago:\s*Pagado · aprobado a mano/)).toBeVisible();
  await expect(wa(page)).toHaveAttribute("data-wa", "payment-approved");
  noExternal();
});

test("Por cobrar: un comprobante subido queda en revisión, nunca pagado; rechazarlo pide motivo y el WhatsApp lo cuenta", async ({ page }) => {
  await page.goto("admin-demo/pagos/?codigo=VOL-000125");
  const review = card(page, "VOL-000125");
  await review.getByRole("button", { name: "Simular comprobante recibido" }).click();
  await page.getByRole("dialog", { name: "Simular comprobante recibido" }).getByRole("button", { name: "Simular" }).click();
  await expect(review).toContainText("Comprobante en revisión");
  await expect(review.getByText("Pagado", { exact: true }).filter({ visible: true })).toHaveCount(0);
  await review.getByRole("button", { name: "Rechazar" }).click();
  const reject = page.getByRole("dialog", { name: "Rechazar comprobante de VOL-000125" });
  await reject.getByRole("button", { name: "Rechazar" }).click();
  await expect(reject.getByRole("alert")).toContainText("Escribí el motivo");
  await reject.getByLabel("Motivo del rechazo").fill("El monto no coincide");
  await reject.getByRole("button", { name: "Rechazar" }).click();
  await expect(review).toContainText("Pendiente de pago");
  await expect(wa(review)).toHaveAttribute("data-wa", "proof-rejected");
  expect(await waText(wa(review))).toContain("Motivo: El monto no coincide.");
  await page.getByRole("button", { name: /Resueltos/ }).click();
  await expect(page).toHaveURL(/estado=done/);
  await expect(page.getByText("Motivo: El monto no coincide")).toBeVisible();
});

test("Para armar en dos pasos: juntar los potes y controlar lote y vencimiento; lo tildado sigue al volver", async ({ page }) => {
  await page.goto("admin-demo/preparacion/");
  await expect(page.locator("article[data-step]")).toHaveCount(8);
  const order = pack(page, "VOL-000111");
  await expect(order.getByRole("list", { name: "Pasos del armado" }).locator("[aria-current=step]")).toContainText("Juntá los potes");
  await expect(order).toContainText(/Total\s*\$\s?23\.815/);
  await expect(wa(order)).toHaveAttribute("data-wa", "payment-approved");
  await order.getByRole("checkbox", { name: /Colágeno hidrolizado/ }).check();
  // Salir y volver: lo tildado queda (en esta pestaña), el pedido no cambió.
  await page.goto("admin-demo/pedidos/");
  await page.goto("admin-demo/preparacion/");
  await expect(order.getByRole("checkbox", { name: /Colágeno hidrolizado/ })).toBeChecked();
  await order.getByRole("button", { name: /Ya junté todo/ }).click();
  await expect(toast(page, "VOL-000111: potes juntos")).toBeVisible();
  await expect(order).toHaveAttribute("data-step", "2");
  await expect(order.getByRole("list", { name: "Pasos del armado" }).locator("[aria-current=step]")).toContainText("Controlá lote y vencimiento");
  await expect(order).toContainText(/Lote [A-Z]{2}-\d{4}-[A-Z] · vence \d{2}\/\d{4}/);
  await expect(wa(order)).toHaveAttribute("data-wa", "preparing");
  await order.getByRole("button", { name: "Listo para despachar" }).click();
  await expect(order.getByRole("alert")).toContainText("Marcá el lote de cada producto");
  await order.getByRole("checkbox", { name: /Colágeno hidrolizado/ }).check();
  await order.getByRole("button", { name: "Listo para despachar" }).click();
  await expect(toast(page, "VOL-000111 está listo para despachar")).toBeVisible();
  await expect(order).toHaveCount(0);
  // Pasa a Despachos: sale el jueves con el cadete, listo para salir.
  await page.goto("admin-demo/despachos/?dia=2026-10-08");
  await expect(page.locator("[data-stop='VOL-000111']")).toContainText("Listo para salir");
});

test("Despachos: lista de armado consolidada por variante y hoja de ruta del cadete por zona, con lo que hay que cobrar", async ({ page }) => {
  await page.goto("admin-demo/despachos/");
  const days = page.getByRole("group", { name: "Día de despacho" });
  await expect(days.getByRole("button", { name: /^Hoy/ })).toHaveAttribute("aria-pressed", "true");
  await days.getByRole("button", { name: /^jue 8 oct/ }).click();
  await expect(page).toHaveURL(/dia=2026-10-08/);
  const list = page.getByRole("region", { name: "Lista de armado" });
  await expect(list).toContainText("4 potes de 3 variantes para 3 pedidos");
  await expect(list.locator("[data-pick='barra-proteica::bp-mani-x12']")).toContainText(/2×.*Barra proteica/);
  await expect(list.locator("[data-pick='creatina-monohidrato::cm-sin-sabor-500']")).toContainText("Todo junto");
  const route = page.getByRole("region", { name: "Hoja de ruta del cadete" });
  await expect(route.getByRole("region", { name: "Centro, 10 a 12 h" })).toBeVisible();
  expect(await route.locator("[data-stop]").evaluateAll((els) => els.map((e) => e.getAttribute("data-stop")))).toEqual(["VOL-000111", "VOL-000121"]);
  await expect(route.locator("[data-stop='VOL-000121']")).toContainText("Ya pagó: no cobrar");
  const share = route.getByRole("link", { name: /Mandarle la hoja al cadete/ });
  expect(await waText(share)).toContain("1. Centro (10 a 12 h) · Rivadavia 3200");
  await days.getByRole("button", { name: /^vie 9 oct/ }).click();
  await expect(route.locator("[data-stop='VOL-000125']")).toContainText("Sin pagar");
  await expect(route.locator("[data-stop='VOL-000125']")).toContainText(/Cobrar \$\s?36\.710/);
  // Hoy: lo listo sale con "Marcar enviado"; lo atrasado se suma a hoy; correo y retiros abajo.
  await days.getByRole("button", { name: /^Hoy/ }).click();
  await expect(route.locator("[data-stop='VOL-000115']")).toContainText("Atrasado");
  await expect(page.getByRole("region", { name: "Correo y retiros en el local" }).locator("[data-order='VOL-000124']")).toBeVisible();
  await route.locator("[data-stop='VOL-000120']").getByRole("button", { name: "Marcar enviado" }).click();
  await page.getByRole("dialog", { name: "VOL-000120: ¿ya salió?" }).getByRole("button", { name: "Marcar enviado" }).click();
  await expect(route.locator("[data-stop='VOL-000120']")).toHaveCount(0);
  await expect(page.getByRole("tablist", { name: "Subpestañas" }).getByRole("tab", { name: "Lista y hoja de ruta" })).toHaveAttribute("aria-current", "page");
});

test("Postventa: confirmar la entrega de lo que va en camino, el reclamo del pedido y el WhatsApp de cada estado", async ({ page }) => {
  await page.goto("admin-demo/postventa/");
  const onTheWay = page.getByRole("region", { name: /En camino/ });
  const row = onTheWay.locator("[data-order='VOL-000119']");
  await expect(row.getByRole("link", { name: /Arrepentimiento ARR-0007/ })).toBeVisible();
  await expect(wa(row)).toHaveAttribute("data-wa", "shipped");
  await expect(page.getByRole("region", { name: /En reclamo/ }).locator("[data-order='VOL-000116'] [data-wa]")).toHaveAttribute("data-wa", "claim");
  await row.getByRole("button", { name: "Marcar entregado" }).click();
  await page.getByRole("dialog", { name: "VOL-000119: ¿ya llegó?" }).getByRole("button", { name: "Marcar entregado" }).click();
  const delivered = page.getByRole("region", { name: /Entregados hace poco/ }).locator("[data-order='VOL-000119']");
  await expect(delivered).toContainText("Entregado el lun 5 oct");
  await expect(wa(delivered)).toHaveAttribute("data-wa", "delivered");
  await page.getByRole("tablist", { name: "Subpestañas" }).getByRole("tab", { name: "Reclamos" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Reclamos" })).toBeVisible();
});

/** [ruta de antes, adónde llega, pestaña, lo que se ve]. */
const OLD: [string, RegExp, string, (p: Page) => Promise<void>][] = [
  ["admin-demo/pagos/?estado=done", /pagos\/\?estado=done$/, "Por cobrar", async (p) => { await expect(p.getByRole("button", { name: /Resueltos/ })).toHaveAttribute("aria-pressed", "true"); }],
  ["admin-demo/pagos/?estado=waiting", /pagos\/\?estado=waiting$/, "Por cobrar", async (p) => { await expect(card(p, "VOL-000125")).toBeVisible(); }],
  ["admin-demo/pagos/detalle/?codigo=VOL-000124", /pagos\/detalle/, "Por cobrar", async (p) => { await expect(p.getByRole("navigation", { name: "Migas de pan" })).toContainText("Por cobrar"); }],
  ["admin-demo/produccion/", /preparacion\/$/, "Para armar", async (p) => { await expect(p.getByRole("heading", { level: 1, name: "Para armar" })).toBeVisible(); }],
  ["admin-demo/calendario/", /calendario\/$/, "Despachos", async (p) => { await expect(p.getByRole("heading", { level: 1, name: "Calendario de despachos" })).toBeVisible(); }],
  ["admin-demo/reclamos/?estado=cerrados", /reclamos\/\?estado=cerrados$/, "Postventa", async (p) => { await expect(p.getByRole("button", { name: /Cerrados/ })).toHaveAttribute("aria-pressed", "true"); }],
  ["admin-demo/pedidos/?estado=PAID", /pedidos\/\?estado=PAID$/, "Todos", async (p) => {
    await expect(p.getByRole("heading", { level: 1, name: "Todos los pedidos" })).toBeVisible();
    await expect(p.getByRole("region", { name: "Pedidos" })).toContainText("4 pedidos de 23");
  }],
];

for (const [route, url, tab, check] of OLD) {
  test(`la ruta de antes /${route} sigue andando con su filtro (${tab})`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(url);
    await expect(tabs(page).getByRole("tab", { name: new RegExp(`^${tab}`) })).toHaveAttribute("aria-current", "page");
    await check(page);
  });
}

test("Hoy lleva a las pestañas nuevas: Por cobrar, Para armar y Despachos", async ({ page }) => {
  await page.goto("admin-demo/");
  for (const [key, href] of [["cobrar", /\/admin-demo\/pagos\/$/], ["armar", /\/admin-demo\/preparacion\/$/], ["sale", /\/admin-demo\/despachos\/$/]] as const) {
    await expect(page.locator(`[data-score='${key}']`).getByRole("link").first()).toHaveAttribute("href", href);
  }
  await page.locator("[data-score='sale']").getByRole("link").first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Despachos" })).toBeVisible();
});

test("a 375 px: las cuatro vistas nuevas sin desborde, con el total y el WhatsApp a mano", async ({ page }) => {
  for (const route of ["admin-demo/pagos/", "admin-demo/preparacion/", "admin-demo/despachos/?dia=2026-10-09", "admin-demo/postventa/", "admin-demo/pedidos/", "admin-demo/emails/"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    expect(await horizontalOverflow(page), route).toBeLessThanOrEqual(0);
  }
  await page.goto("admin-demo/pagos/");
  const first = card(page, "VOL-000124");
  await expect(first).toContainText(/Total del pedido\s*\$\s?13\.230/);
  await wa(first).scrollIntoViewIfNeeded();
  await expect(wa(first)).toBeInViewport();
  const box = (await first.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(376);
});
