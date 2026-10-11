import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const day = (page: Page, d: string) => page.locator(`td[data-day="${d}"]`);

test.describe("calendario en escritorio", () => {
  test.use({ viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false });

  test("arrastrar un pedido: el feriado lo rechaza, otro día lo acepta con confirmación y el .ics se descarga", async ({ page }) => {
    await page.goto("admin-demo/calendario/");
    await page.mouse.move(1400, 300);
    const chip = page.getByRole("button", { name: /^VOL-000114,/ });
    await expect(day(page, "2026-10-07").getByRole("button", { name: /^VOL-000114,/ })).toBeVisible();
    await chip.dragTo(day(page, "2026-10-12"));
    await expect(toast(page, /el taller no trabaja ese día/)).toBeVisible();
    await expect(day(page, "2026-10-07").getByRole("button", { name: /^VOL-000114,/ })).toBeVisible();
    await chip.dragTo(day(page, "2026-10-13"));
    await page.getByRole("dialog", { name: "Mover VOL-000114" }).getByRole("button", { name: "Mover al mar, 13 oct" }).click();
    await expect(toast(page, /VOL-000114 pasa al mar, 13 oct/)).toBeVisible();
    await expect(day(page, "2026-10-13").getByRole("button", { name: /^VOL-000114,/ })).toBeVisible();
    // Un día completo no acepta el pedido arrastrado y dice por qué (sobrecargarlo es desde Reprogramar)
    await page.getByRole("button", { name: /^VOL-000122,/ }).dragTo(day(page, "2026-10-08"));
    await expect(toast(page, /completo \(3 de 3 pedidos\)/)).toBeVisible();

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar a Google Calendar" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^volta-entregas-\d{4}-\d{2}-\d{2}\.ics$/);
    const ics = readFileSync((await file.path())!, "utf8");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261013");
  });
});

test("reprogramar sin arrastrar: el atrasado pasa a la primera fecha libre", async ({ page }) => {
  await page.goto("admin-demo/calendario/");
  await page.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Reprogramar VOL-000115" }).click();
  const sheet = page.getByRole("dialog", { name: "Entrega VOL-000115" });
  await sheet.getByRole("button", { name: /Primera fecha libre/ }).click();
  await expect(sheet.getByRole("heading", { name: "Lunes, 5 de octubre" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: /Atrasados/ })).toHaveCount(0);
});

test("capacidad del taller: con días completos la tienda muestra la próxima fecha con lugar", async ({ page }) => {
  await page.goto("p/placa-nfc/");
  await expect(page.getByText("Lo tenemos listo el martes, 13 de octubre")).toBeVisible();
  await expect(page.getByText(/el taller ya está completo/)).toBeVisible();
  await page.goto("admin-demo/calendario/");
  await page.getByRole("button", { name: "Capacidad y feriados" }).click();
  await page.getByRole("dialog", { name: "Capacidad y días del taller" }).getByRole("button", { name: /Capacidad y horarios/ }).click();
  const field = page.getByLabel("Pedidos que el taller termina por día");
  await field.fill("4");
  await field.press("Enter");
  await expect(toast(page, "Capacidad: 4 por día")).toBeVisible();
  await page.goto("p/placa-nfc/");
  await expect(page.getByText("Lo tenemos listo el jueves, 8 de octubre")).toBeVisible();
});

test("cola de producción: avanzar descuenta insumos y llega a Listo", async ({ page }) => {
  await page.goto("admin-demo/insumos/");
  await page.getByLabel("Buscar insumo").fill("cera");
  await expect(page.getByLabel("Stock de Cera de soja").first()).toHaveValue("5000");
  await page.goto("admin-demo/produccion/");
  await page.getByRole("button", { name: "Pasar VOL-000113 a En máquina" }).click();
  await expect(toast(page, /Se descontaron sus insumos/)).toBeVisible();
  await page.getByRole("button", { name: /Terminación/ }).first().click();
  await page.getByRole("button", { name: "Pasar VOL-000115 a Listo" }).click();
  await expect(toast(page, "VOL-000115 pasó a “Listo”")).toBeVisible();
  await page.getByRole("group", { name: "Etapa" }).getByRole("button", { name: /^Listo/ }).click();
  await expect(page.getByRole("article", { name: "Pedido VOL-000115" })).toBeVisible();
  await page.goto("admin-demo/insumos/");
  await page.getByLabel("Buscar insumo").fill("cera");
  await expect(page.getByLabel("Stock de Cera de soja").first()).toHaveValue("3920");
});

test("costos: la receta calcula el margen y el precio sugerido llega a la tienda", async ({ page }) => {
  await page.goto("admin-demo/costos/");
  await page.getByLabel("Buscar producto").fill("vela caniche");
  await page.getByRole("button", { name: /Vela caniche/ }).first().click();
  const sheet = page.getByRole("dialog", { name: "Costo de Vela caniche" });
  await expect(sheet.getByText("52%")).toBeVisible();
  await sheet.getByRole("button", { name: /Usar precio sugerido/ }).click();
  await expect(sheet.getByText(/Al guardar, el precio pasa a desde \$\s?11\.500/)).toBeVisible();
  await sheet.getByRole("button", { name: "Guardar" }).click();
  await expect(toast(page, /desde \$\s?11\.500/)).toBeVisible();
  await page.goto("p/vela-caniche/");
  await expect(page.getByText(/\$\s?11\.500/).first()).toBeVisible();
});

test("ficha de cliente: mascota con cumpleaños genera un recordatorio y se guardan notas", async ({ page }) => {
  // 8.3.9: ya no hay bloque "Para escribirles"; queda el filtro "Para escribir" (el inicio enlaza a él).
  await page.goto("admin-demo/usuarios/?escribir=7");
  await expect(page.getByRole("region", { name: "Clientes" }).getByText("Diego Álvarez").first()).toBeVisible();
  await page.goto("admin-demo/usuarios/ficha/?email=vale.s@ejemplo.com");
  await expect(page.getByRole("heading", { level: 1, name: /Valentina Sosa/ })).toBeVisible();
  await page.getByLabel("Nombre").fill("Michi");
  await page.getByLabel("Día del cumpleaños").first().selectOption("15");
  await page.getByLabel("Mes del cumpleaños").first().selectOption("10");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(page.getByText("Cumple de Michi")).toBeVisible();
  await page.getByLabel("Nota nueva").fill("Quiere el collar en terracota.");
  await page.getByRole("button", { name: "Guardar nota" }).click();
  await page.reload();
  await expect(page.getByText("Quiere el collar en terracota.")).toBeVisible();
  await expect(page.getByText("Cumple de Michi")).toBeVisible();
});
