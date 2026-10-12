import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.14 (cupo y feriados en modal), 8.3.15 (calendario editable) y 8.3.16 (tablero de preparación, Fase 7). */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const day = (page: Page, d: string) => page.locator(`td[data-day="${d}"]`);
/** Abre un día tocando su esquina (el centro puede tener un pedido encima, que abre su propia ficha). */
const openDay = (page: Page, d: string) => day(page, d).locator("> button").click({ position: { x: 6, y: 6 } });
const base = () => `http://localhost:${process.env.E2E_PORT ?? "4173"}${process.env.PAGES_BASE_PATH ?? ""}/`;

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false });
  test.beforeEach(async ({ page }) => { await page.mouse.move(1400, 300); });

  test("8.3.14 modal con dos tarjetas: foco y Escape; bajar el cupo del cadete avisa qué despachos toca y no mueve pedidos", async ({ page }) => {
    await page.goto("admin-demo/calendario/");
    const opener = page.getByRole("button", { name: "Cupo del cadete y feriados" });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Cadete y días de despacho" });
    const capacity = dialog.getByRole("button", { name: /Cupo del cadete y días/ });
    await expect(capacity).toBeFocused();
    await expect(dialog.getByRole("button", { name: /Días cerrados y feriados/ })).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();

    await opener.click();
    await capacity.click();
    await expect(capacity).toHaveAttribute("aria-expanded", "true");
    await dialog.getByLabel("Pedidos que reparte el cadete por día").fill("1");
    await dialog.getByRole("button", { name: "Guardar cupo y días" }).click();
    const warn = dialog.getByRole("alertdialog", { name: "Cambio que toca despachos" });
    await expect(warn).toContainText("El jue, 8 oct el cadete queda sobrecargado (2 de 1 pedidos).");
    await expect(warn).toContainText("Ningún pedido se mueve solo");
    await warn.getByRole("button", { name: "Seguir editando" }).click();
    await expect(page.getByText("2 por día", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Guardar cupo y días" }).click();
    await warn.getByRole("button", { name: "Guardar igual" }).click();
    await expect(toast(page, "Cupo del cadete: 1 por día")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("1 por día", { exact: true })).toBeVisible();
    // Los pedidos siguen en su fecha.
    await expect(day(page, "2026-10-08").getByRole("button", { name: /^VOL-000113,/ })).toBeVisible();
  });

  test("8.3.14 feriados de a 10 por página y navegables; cierre propio que toca una entrega se confirma y queda marcada; editar y quitar", async ({ page }) => {
    await page.goto("admin-demo/calendario/");
    await page.getByRole("button", { name: "Cupo del cadete y feriados" }).click();
    const dialog = page.getByRole("dialog", { name: "Cadete y días de despacho" });
    await dialog.getByRole("button", { name: /Días cerrados y feriados/ }).click();
    const list = dialog.getByRole("list", { name: "Feriados nacionales" });
    await expect(list.getByRole("listitem")).toHaveCount(10);
    await dialog.getByLabel("Año", { exact: true }).selectOption("todos");
    const pages = dialog.getByRole("navigation", { name: "Páginas de feriados" });
    await expect(pages).toContainText("1–10 de 35");
    await pages.getByRole("button", { name: "Página siguiente" }).click();
    await expect(pages).toContainText("11–20 de 35");
    await pages.getByRole("button", { name: "Página 4" }).click();
    await expect(pages).toContainText("31–35 de 35");
    await expect(list.getByRole("listitem")).toHaveCount(5);
    await expect(pages.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
    // Los cierres propios van aparte.
    await dialog.getByRole("button", { name: /Cierres del local/ }).click();
    await expect(dialog.getByRole("list", { name: "Cierres del local" })).toContainText("Inventario anual");
    // Cerrar un día con una entrega comprometida: se avisa y el pedido no se mueve.
    await dialog.getByLabel("Fecha del cierre").first().fill("2026-10-14");
    await dialog.getByLabel("Motivo").first().fill("Mudanza del local");
    await dialog.getByRole("button", { name: "Agregar cierre" }).click();
    const warn = dialog.getByRole("alertdialog", { name: "Cambio que toca despachos" });
    await expect(warn).toContainText("VOL-000123 queda en un día cerrado (mié, 14 oct · Mudanza del local).");
    await warn.getByRole("button", { name: "Cerrar igual" }).click();
    await expect(dialog.getByRole("list", { name: "Cierres del local" })).toContainText("Mudanza del local");
    // Editar el motivo y después quitarlo con confirmación.
    await dialog.getByRole("button", { name: "Editar el cierre del mié, 14 oct" }).click();
    await dialog.getByRole("form", { name: "Editar cierre del mié, 14 oct" }).getByLabel("Motivo").fill("Mudanza (de muestra)");
    await dialog.getByRole("form", { name: "Editar cierre del mié, 14 oct" }).getByRole("button", { name: "Guardar" }).click();
    await expect(dialog.getByRole("list", { name: "Cierres del local" })).toContainText("Mudanza (de muestra)");
    await page.keyboard.press("Escape");
    const banner = page.getByRole("status").filter({ hasText: "1 pedido quedó en un día cerrado" });
    await expect(banner).toBeVisible();
    await expect(day(page, "2026-10-14").getByRole("button", { name: /^VOL-000123, .*en un día cerrado/ })).toBeVisible();
    await page.getByRole("button", { name: "Cupo del cadete y feriados" }).click();
    await dialog.getByRole("button", { name: /Días cerrados y feriados/ }).click();
    await dialog.getByRole("button", { name: /Cierres del local/ }).click();
    await dialog.getByRole("button", { name: "Quitar el cierre del mié, 14 oct" }).click();
    await dialog.getByRole("alertdialog", { name: "Quitar un cierre" }).getByRole("button", { name: "Quitar cierre" }).click();
    await expect(dialog.getByRole("list", { name: "Cierres del local" })).not.toContainText("Mudanza");
    await page.keyboard.press("Escape");
    await expect(banner).toHaveCount(0);
  });

  test("8.3.15 tocar un día crea y edita entradas que persisten; una nota se vincula al pedido; se mueven arrastrando", async ({ page }) => {
    await page.goto("admin-demo/calendario/");
    await openDay(page, "2026-10-06");
    const dialog = page.getByRole("dialog", { name: "Día martes, 6 de octubre" });
    await expect(dialog.getByRole("region", { name: "Entradas del día" })).toContainText("Recibir la entrega de Krono Nutrition");
    await dialog.getByRole("button", { name: "Nueva entrada" }).click();
    await dialog.getByRole("button", { name: "Guardar entrada" }).click();
    await expect(dialog.getByText("Escribí un título (2 letras o más).")).toBeVisible();
    await dialog.getByLabel("Título").fill("Llamar a la distribuidora");
    await dialog.getByLabel("Notas (opcional)").fill("Pedir precio por 20 potes de whey.");
    await dialog.getByRole("button", { name: "Guardar entrada" }).click();
    await expect(toast(page, "Entrada agregada")).toBeVisible();
    await expect(dialog.getByRole("region", { name: "Entradas del día" })).toContainText("Llamar a la distribuidora");
    // Nota de un pedido, con vínculo.
    await dialog.getByRole("button", { name: "Nueva entrada" }).click();
    await dialog.getByLabel("Tipo").selectOption("pedido");
    await dialog.getByLabel("Título").fill("Confirmar dirección");
    await dialog.getByLabel("Pedido").selectOption("VOL-000123");
    await dialog.getByRole("button", { name: "Guardar entrada" }).click();
    await expect(dialog.getByRole("link", { name: "VOL-000123" })).toBeVisible();
    await page.keyboard.press("Escape");
    // Persiste al recargar; editar cambia el título.
    await page.reload();
    await expect(day(page, "2026-10-06").getByRole("button", { name: /^Llamar a la distribuidora/ })).toBeVisible();
    await day(page, "2026-10-06").getByRole("button", { name: /^Llamar a la distribuidora/ }).click();
    await dialog.getByLabel("Título").fill("Llamar a la distribuidora (urgente)");
    await dialog.getByRole("button", { name: "Guardar entrada" }).click();
    await expect(toast(page, "Entrada actualizada")).toBeVisible();
    await page.keyboard.press("Escape");
    // Arrastrar la entrada a otro día la mueve sin pedir confirmación (no es una fecha prometida).
    await day(page, "2026-10-06").getByRole("button", { name: /^Recibir la entrega/ }).dragTo(day(page, "2026-10-07"));
    await expect(toast(page, /“Recibir la entrega de Krono Nutrition” pasa al mié, 7 oct/)).toBeVisible();
    await expect(day(page, "2026-10-07").getByRole("button", { name: /^Recibir la entrega/ })).toBeVisible();
  });

  test("8.3.15 arrastrar un pedido pide confirmar y se refleja en el pedido; un sábado lo rechaza con el motivo; Reprogramar sin arrastrar confirma la sobrecarga del cadete", async ({ page }) => {
    await page.goto("admin-demo/calendario/");
    const chip = () => page.getByRole("button", { name: /^VOL-000110,/ });
    await chip().dragTo(day(page, "2026-10-10"));
    await expect(toast(page, /Sábado sin despachos: elegí otro día/)).toBeVisible();
    await chip().dragTo(day(page, "2026-10-13"));
    const confirm = page.getByRole("dialog", { name: "Mover VOL-000110" });
    await confirm.getByRole("button", { name: "Cancelar" }).click();
    await expect(day(page, "2026-10-09").getByRole("button", { name: /^VOL-000110,/ })).toBeVisible();
    await chip().dragTo(day(page, "2026-10-13"));
    await confirm.getByRole("button", { name: "Mover al mar, 13 oct" }).click();
    await expect(day(page, "2026-10-13").getByRole("button", { name: /^VOL-000110,/ })).toHaveCount(1);
    await expect(page.locator('[data-code="VOL-000110"]')).toHaveCount(1);
    // Reprogramar con botones (teclado, iPad): un día con el cadete completo pide confirmar antes de sobrecargarlo.
    await chip().click();
    const sheet = page.getByRole("dialog", { name: "Despacho VOL-000110" });
    await sheet.getByLabel("Elegir otra fecha").fill("2026-10-08");
    await sheet.getByRole("button", { name: "Mover", exact: true }).click();
    const full = sheet.getByRole("alertdialog", { name: "Día completo" });
    await expect(full).toContainText("Ya tiene 2 de 2 pedidos");
    await full.getByRole("button", { name: "Mover igual" }).click();
    await expect(toast(page, /VOL-000110 pasa al jue, 8 oct/)).toBeVisible();
    await page.goto("admin-demo/pedidos/detalle/?codigo=VOL-000110");
    await expect(page.getByLabel("Fecha comprometida de despacho")).toHaveValue("2026-10-08");
  });

  test("8.3.15 con teclado: Enter abre el día y Escape lo cierra; 8.3.10 la ayuda explica las marcas", async ({ page }) => {
    await page.goto("admin-demo/calendario/");
    await page.getByRole("button", { name: "Qué significa: marcas del calendario" }).click();
    await expect(page.getByRole("region", { name: "Qué marca el calendario" })).toContainText("Sobrecargado");
    await day(page, "2026-10-09").locator("> button").focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Día viernes, 9 de octubre" });
    await expect(dialog.getByRole("region", { name: "Despachos del día" })).toContainText("VOL-000110");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("8.3.16 Mover etapa y arrastrar actualizan estado y contadores; el embalaje se descuenta una sola vez; un destino inválido explica por qué; soltar en Listo abre el control de lote", async ({ page }) => {
    await page.goto("admin-demo/insumos/");
    // VOL-000113 (2 cajas de barras) usa una bolsa con logo por unidad.
    await page.getByLabel("Buscar insumo").fill("bolsa");
    await expect(page.getByLabel("Stock de Bolsa con logo").first()).toHaveValue("120");
    await page.goto("admin-demo/preparacion/");
    const lane = (id: string) => page.locator(`section[data-column="${id}"]`);
    await expect(lane("queue").locator("> header")).toContainText("4");
    const card = page.getByRole("article", { name: "Pedido VOL-000113" });
    await card.getByRole("button", { name: "Mover etapa" }).click();
    await card.getByRole("button", { name: "Mover VOL-000113 a Control de lote" }).click();
    await expect(toast(page, /Se descontó su embalaje/)).toBeVisible();
    await expect(lane("queue").locator("> header")).toContainText("3");
    await expect(lane("lot-check").getByRole("article", { name: "Pedido VOL-000113" })).toBeVisible();
    // Volver a Armando por el menú no vuelve a descontar.
    await page.getByRole("article", { name: "Pedido VOL-000113" }).getByRole("button", { name: "Mover etapa" }).click();
    await page.getByRole("button", { name: "Mover VOL-000113 a Armando" }).click();
    await expect(lane("picking").getByRole("article", { name: "Pedido VOL-000113" })).toBeVisible();
    // Arrastrar a Por preparar no se puede y lo explica; a la etapa siguiente sí.
    await page.getByRole("article", { name: "Pedido VOL-000110" }).dragTo(lane("queue"));
    await expect(toast(page, "Un pedido que se empezó a armar no vuelve a Por preparar.")).toBeVisible();
    await page.getByRole("article", { name: "Pedido VOL-000110" }).dragTo(lane("lot-check"));
    await expect(toast(page, "VOL-000110 pasó a “Control de lote”")).toBeVisible();
    await expect(lane("lot-check").getByRole("article", { name: "Pedido VOL-000110" })).toBeVisible();
    // Soltarlo en Listo para despachar sin los lotes abre el control de lote.
    await page.getByRole("article", { name: "Pedido VOL-000110" }).dragTo(lane("ready"));
    const lots = page.getByRole("dialog", { name: "Control de lote de VOL-000110" });
    await expect(lots).toContainText("Lote KR-2606-B · vence 12/2027");
    await page.keyboard.press("Escape");
    await expect(lane("lot-check").getByRole("article", { name: "Pedido VOL-000110" })).toBeVisible();
    await page.goto("admin-demo/insumos/");
    await page.getByLabel("Buscar insumo").fill("bolsa");
    await expect(page.getByLabel("Stock de Bolsa con logo").first()).toHaveValue("118");
  });
});

for (const [label, width, height, touch, pinned] of [
  ["escritorio con menú fijo", 1440, 900, false, true], ["escritorio 1280 con menú fijo", 1280, 800, false, true], ["escritorio chico", 1024, 768, false, false],
  ["iPad vertical", 768, 1024, true, false], ["celular", 390, 844, true, false],
] as const) {
  test(`8.3.16/8.3.14 a ${label} ${width}px: carriles legibles con scroll propio, sin desborde de página; modal y día usables`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, reducedMotion: "reduce", locale: "es-AR" });
    const page = await ctx.newPage();
    if (pinned) await page.addInitScript(() => localStorage.setItem("volta-ui:admin-sidebar", "pinned"));
    if (!touch) await page.mouse.move(width - 20, 500);
    await page.goto(base() + "admin-demo/preparacion/");
    await expect(page.getByRole("heading", { level: 1, name: /Preparación de pedidos/ })).toBeVisible();
    for (const lane of await page.locator("section[data-column]").all()) {
      const b = (await lane.boundingBox())!;
      expect(b.width, "cada etapa con ancho legible").toBeGreaterThanOrEqual(250);
      expect((await lane.locator("h2").boundingBox())!.height, "título de etapa en una línea").toBeLessThan(32);
    }
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    if (width < 1024) {
      await page.getByRole("group", { name: "Etapa" }).getByRole("button", { name: /^Listo para despachar/ }).click();
      await expect(page.getByRole("article", { name: "Pedido VOL-000120" })).toBeInViewport();
    }
    await page.goto(base() + "admin-demo/calendario/");
    await page.getByRole("button", { name: "Cupo del cadete y feriados" }).click();
    const dialog = page.getByRole("dialog", { name: "Cadete y días de despacho" });
    await dialog.getByRole("button", { name: /Días cerrados y feriados/ }).click();
    await expect(dialog.getByRole("list", { name: "Feriados nacionales" }).getByRole("listitem")).toHaveCount(10);
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await ctx.close();
  });
}
