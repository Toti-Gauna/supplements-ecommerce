import { expect, test, type Page } from "@playwright/test";

/** L3 · panel: pestaña Suscripciones (lista, filtros, pausar, reanudar, cancelar) y "Qué preparar". Todo simulado. */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });
const row = (page: Page, name: string | RegExp) => page.getByRole("row", { name });

test.describe("escritorio con mouse", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test("Suscripciones: las 4 de muestra con sus números, filtro por pack, y Qué preparar con lo que se repite", async ({ page }) => {
    await page.goto("admin-demo/packs/");
    await page.getByRole("group", { name: "Mostrar" }).getByRole("button", { name: /^Suscripciones/ }).click();
    await expect(page).toHaveURL(/ver=suscripciones/);
    const stats = page.getByRole("group", { name: "Resumen de suscripciones" });
    await expect(stats).toContainText("Activas");
    await expect(stats.locator("div").filter({ hasText: /^Activas3/ })).toBeVisible();
    await expect(stats.locator("div").filter({ hasText: /^Pausadas1/ })).toBeVisible();
    await expect(stats).toContainText("Ingreso mensual estimado");
    await expect(stats).toContainText("$ 260.270");
    await expect(stats.locator("div").filter({ hasText: /^Entregas de los próximos 30 días2/ })).toBeVisible();
    const table = page.getByRole("table", { name: "Suscripciones" });
    await expect(table.getByRole("row")).toHaveCount(5);
    const julian = row(page, /Julián Paz/);
    await expect(julian).toContainText("Pack Hipertrofia");
    await expect(julian).toContainText("Activa");
    await expect(julian).toContainText("13 oct");
    await expect(julian).toContainText("122.145");
    await expect(julian).toContainText("VOL-000098");
    await expect(julian).toContainText("Muestra");
    await expect(row(page, /Valentina Sosa/)).toContainText("Saltea la próxima");
    await expect(row(page, /Camila Torres/)).toContainText("Pausada");
    // Qué preparar: por fecha, solo lo que se repite (sin straps) y el total para el proveedor.
    const prepare = page.getByRole("region", { name: "Qué preparar" });
    await expect(prepare.getByRole("listitem").filter({ hasText: /^martes, 13 de octubre/i })).toContainText("1 × Ionic Whey 100%");
    await expect(prepare).toContainText(/lunes, 26 de octubre/i);
    await expect(prepare).not.toContainText("Straps de levantamiento");
    const totals = prepare.getByRole("table", { name: /Unidades por producto/ });
    await expect(totals.getByRole("row", { name: /Ionic Whey 100%/ })).toContainText("2");
    await expect(totals.getByRole("row", { name: /^Total/ })).toContainText("6");
    await expect(prepare.getByRole("link", { name: "Ver compras" })).toHaveAttribute("href", /admin-demo\/proveedores\/$/);
    // Filtro por pack desde la lista de packs.
    await page.goto("admin-demo/packs/");
    await row(page, /Pack Fútbol/).getByRole("link", { name: "1 activa" }).click();
    await expect(page).toHaveURL(/pack=futbol/);
    await expect(page.getByRole("table", { name: "Suscripciones" }).getByRole("row")).toHaveCount(2);
    await expect(row(page, /Diego Álvarez/)).toBeVisible();
    // Filtro por estado.
    await page.goto("admin-demo/packs/?ver=suscripciones");
    await page.getByLabel("Estado", { exact: true }).first().selectOption("paused");
    await expect(page.getByRole("table", { name: "Suscripciones" }).getByRole("row")).toHaveCount(2);
    await expect(row(page, /Camila Torres/)).toBeVisible();
  });

  test("pausar, reanudar y cancelar (con confirmación) cambian el estado, los números y Qué preparar", async ({ page }) => {
    await page.goto("admin-demo/packs/?ver=suscripciones");
    const stats = page.getByRole("group", { name: "Resumen de suscripciones" });
    const prepare = page.getByRole("region", { name: "Qué preparar" });
    const julian = row(page, /Julián Paz/);
    await julian.getByRole("button", { name: /^Pausar la suscripción de Julián Paz/ }).click();
    await expect(toast(page, "Suscripción pausada: Julián Paz")).toBeVisible();
    await expect(julian).toContainText("Pausada");
    await expect(julian).toContainText("—");
    await expect(stats.locator("div").filter({ hasText: /^Activas2/ })).toBeVisible();
    await expect(stats.locator("div").filter({ hasText: /^Pausadas2/ })).toBeVisible();
    await expect(stats.locator("div").filter({ hasText: /^Entregas de los próximos 30 días1/ })).toBeVisible();
    await expect(prepare).not.toContainText(/martes, 13 de octubre/i);
    await julian.getByRole("button", { name: /^Reanudar la suscripción de Julián Paz/ }).click();
    await expect(toast(page, "Suscripción reanudada: Julián Paz")).toBeVisible();
    await expect(julian).toContainText("Activa");
    await expect(prepare).toContainText(/martes, 13 de octubre/i);
    // Cancelar pide confirmación; "Cancelar" del diálogo no cancela nada.
    await julian.getByRole("button", { name: "Cancelar", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /¿Cancelar la suscripción de Julián Paz\?/ });
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(julian).toContainText("Activa");
    await julian.getByRole("button", { name: "Cancelar", exact: true }).click();
    await dialog.getByRole("button", { name: "Cancelar suscripción" }).click();
    await expect(toast(page, "Suscripción cancelada: Julián Paz")).toBeVisible();
    await expect(julian).toContainText("Cancelada");
    await expect(julian).toContainText("Sin acciones");
    // Sin más entregas en 30 días: estado vacío claro.
    for (const name of ["Valentina Sosa", "Diego Álvarez"]) {
      const r = row(page, new RegExp(name));
      if (await r.getByRole("button", { name: "Cancelar", exact: true }).count()) {
        await r.getByRole("button", { name: "Cancelar", exact: true }).click();
        await page.getByRole("dialog", { name: new RegExp(`¿Cancelar la suscripción de ${name}`) }).getByRole("button", { name: "Cancelar suscripción" }).click();
      }
    }
    await expect(prepare.getByRole("heading", { name: "No hay entregas en los próximos 30 días" })).toBeVisible();
    // Los cambios sobreviven a recargar.
    await page.reload();
    await expect(row(page, /Julián Paz/)).toContainText("Cancelada");
  });

  test("una suscripción que viene de la tienda se distingue de las de muestra y enlaza a su pedido", async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem("volta-demo:subscriptions")) return;
      const sub = { id: "sub-tienda-1", packId: "salud", choices: {}, day: 12, status: "active", startedOn: "2026-10-05", orderCode: "VOL-000123", skipNext: false, customer: "Cliente de la tienda" };
      localStorage.setItem("volta-demo:subscriptions", JSON.stringify({ state: { subscriptions: [sub] }, version: 0 }));
    });
    await page.goto("admin-demo/packs/?ver=suscripciones");
    const mine = row(page, /Cliente de la tienda/);
    await expect(mine).toContainText("Viene de la tienda");
    await expect(mine.getByRole("link", { name: "VOL-000123" })).toHaveAttribute("href", /pedidos\/detalle\/\?codigo=VOL-000123/);
    await expect(page.getByRole("table", { name: "Suscripciones" }).getByRole("row")).toHaveCount(2);
  });
});
