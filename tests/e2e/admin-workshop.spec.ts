import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const day = (page: Page, d: string) => page.locator(`td[data-day="${d}"]`);

test.describe("calendario en escritorio", () => {
  test.use({ viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false });

  test("arrastrar un pedido: el feriado lo rechaza, otro día lo acepta con confirmación, el cadete completo no y el .ics se descarga", async ({ page }) => {
    await page.goto("admin-demo/calendario/");
    await page.mouse.move(1400, 300);
    const chip = page.getByRole("button", { name: /^VOL-000114,/ });
    await expect(day(page, "2026-10-07").getByRole("button", { name: /^VOL-000114,/ })).toBeVisible();
    await chip.dragTo(day(page, "2026-10-12"));
    await expect(toast(page, /no se despacha ese día/)).toBeVisible();
    await expect(day(page, "2026-10-07").getByRole("button", { name: /^VOL-000114,/ })).toBeVisible();
    await chip.dragTo(day(page, "2026-10-13"));
    await page.getByRole("dialog", { name: "Mover VOL-000114" }).getByRole("button", { name: "Mover al mar, 13 oct" }).click();
    await expect(toast(page, /VOL-000114 pasa al mar, 13 oct/)).toBeVisible();
    await expect(day(page, "2026-10-13").getByRole("button", { name: /^VOL-000114,/ })).toBeVisible();
    // Un día con el cadete completo no acepta un pedido con cadete y dice por qué (sobrecargarlo es desde Reprogramar)
    await page.getByRole("button", { name: /^VOL-000110,/ }).dragTo(day(page, "2026-10-08"));
    await expect(toast(page, /El cadete ya tiene ese día completo \(2 de 2 pedidos\)/)).toBeVisible();

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar a Google Calendar" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^volta-despachos-\d{4}-\d{2}-\d{2}\.ics$/);
    const ics = readFileSync((await file.path())!, "utf8");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261013");
  });
});

test("reprogramar sin arrastrar: el atrasado pasa a la primera fecha libre", async ({ page }) => {
  await page.goto("admin-demo/calendario/");
  await page.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Reprogramar VOL-000115" }).click();
  const sheet = page.getByRole("dialog", { name: "Despacho VOL-000115" });
  await sheet.getByRole("button", { name: /Primera fecha libre/ }).click();
  await expect(sheet.getByRole("heading", { name: "Martes, 6 de octubre" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: /Atrasados/ })).toHaveCount(0);
});

test("cupo del cadete: con días completos la tienda muestra la próxima fecha del cadete; retiro y correo salen igual", async ({ page }) => {
  // El catálogo no trae productos por encargo: la Creatina Brava pasa a "A pedido" con 4 días hábiles desde el editor.
  // Desde el lun 5/10 cae el vie 9; el cadete ya tiene 2 de 2 pedidos el 9 (el 12 es feriado).
  await page.goto("admin-demo/productos/editar/?id=creatina-brava");
  await expect(page.getByRole("heading", { name: /Editar: Creatina Brava/ })).toBeVisible();
  await page.getByLabel("Plazo si es por encargo (días hábiles)").fill("4");
  await page.getByRole("checkbox", { name: "A pedido (sin límite)" }).check();
  await page.getByRole("button", { name: "Guardar (solo en esta demo)" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Cambio guardado solo en esta demo" })).toBeVisible();
  await page.goto("p/creatina-brava/");
  await expect(page.getByText("Lo despachamos el viernes, 9 de octubre")).toBeVisible();
  await expect(page.getByText(/Con cadete, el martes, 13 de octubre: los días anteriores el reparto ya está completo/)).toBeVisible();
  await page.goto("admin-demo/calendario/");
  await page.getByRole("button", { name: "Cupo del cadete y feriados" }).click();
  await page.getByRole("dialog", { name: "Cadete y días de despacho" }).getByRole("button", { name: /Cupo del cadete y días/ }).click();
  const field = page.getByLabel("Pedidos que reparte el cadete por día");
  await field.fill("3");
  await field.press("Enter");
  await expect(toast(page, "Cupo del cadete: 3 por día")).toBeVisible();
  await page.goto("p/creatina-brava/");
  await expect(page.getByText("Lo despachamos el viernes, 9 de octubre")).toBeVisible();
  await expect(page.getByText(/el reparto ya está completo/)).toHaveCount(0);
});

test("costos: proveedor + embalaje da el margen y el precio sugerido llega a la tienda", async ({ page }) => {
  await page.goto("admin-demo/costos/");
  // Pump Flow queda con margen bajo (30%) al precio actual: el sugerido para el 35% es $ 36.300.
  await page.getByLabel("Buscar producto").fill("pump flow");
  await page.getByRole("button", { name: /Pump Flow/ }).first().click();
  const sheet = page.getByRole("dialog", { name: "Costo de Pump Flow sin estimulantes" });
  await expect(sheet.getByText("30%")).toBeVisible();
  await expect(sheet.getByText(/Máquina|Armado \(minutos\)/)).toHaveCount(0);
  await sheet.getByRole("button", { name: /Usar precio sugerido/ }).click();
  await expect(sheet.getByText(/Al guardar, el precio pasa a desde \$\s?36\.300/)).toBeVisible();
  await sheet.getByRole("button", { name: "Guardar" }).click();
  await expect(toast(page, /desde \$\s?36\.300/)).toBeVisible();
  await page.goto("p/pump-flow/");
  await expect(page.getByText(/\$\s?36\.300/).first()).toBeVisible();
});

test("ficha de cliente: objetivo y notas se guardan; el enlace viejo “Para escribir” abre las recompras de la semana", async ({ page }) => {
  // El inicio enlazaba a ?escribir=7: ahora es el segmento "Se le termina esta semana".
  await page.goto("admin-demo/usuarios/?escribir=7");
  const list = page.getByRole("region", { name: "Clientes" });
  await expect(list.getByText("Juan Ibarra").filter({ visible: true }).first()).toBeVisible();
  await expect(list.getByText("Valentina Sosa")).toHaveCount(0);
  await page.goto("admin-demo/usuarios/ficha/?email=vale.s@ejemplo.com");
  await expect(page.getByRole("heading", { level: 1, name: /Valentina Sosa/ })).toBeVisible();
  await page.getByLabel("Objetivo", { exact: true }).selectOption({ label: "Fuerza" });
  await expect(toast(page, "Objetivo: Fuerza")).toBeVisible();
  await page.getByLabel("Nota nueva").fill("Prefiere el isolate sabor chocolate.");
  await page.getByRole("button", { name: "Guardar nota" }).click();
  await page.reload();
  await expect(page.getByText("Prefiere el isolate sabor chocolate.")).toBeVisible();
  await expect(page.getByLabel("Objetivo", { exact: true })).toHaveValue("fuerza");
  await page.goto("admin-demo/usuarios/?objetivo=fuerza");
  await expect(page.getByRole("region", { name: "Clientes" }).getByText("Valentina Sosa").first()).toBeVisible();
});
