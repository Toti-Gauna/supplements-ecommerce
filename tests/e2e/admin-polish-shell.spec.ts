import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.2: barra lateral colapsable en escritorio con mouse; hamburguesa y pestañas en tablets y celulares. */

const rail = (page: Page) => page.locator("aside[data-pinned]");
const panelWidth = (page: Page) => rail(page).locator("> div").evaluate((el) => Math.round(el.getBoundingClientRect().width));
const mainX = (page: Page) => page.locator("main#contenido").evaluate((el) => Math.round(el.getBoundingClientRect().left));

for (const [width, height] of [[1440, 900], [1280, 800], [1024, 768]] as const) {
  test.describe(`escritorio con mouse ${width}×${height}`, () => {
    test.use({ viewport: { width, height }, isMobile: false, hasTouch: false });

    test("solo íconos por defecto; se abre con el mouse y con el teclado sin mover la página; se puede fijar", async ({ page }) => {
      await page.goto("admin-demo/");
      await expect(page.getByRole("heading", { level: 1, name: /Buen día/ })).toBeVisible();
      // El mouse de Playwright arranca en (0, 0), encima del riel: se lo lleva al contenido.
      await page.mouse.move(width - 40, height / 2);
      // Sin hamburguesa ni pestañas inferiores: la barra lateral es la navegación.
      await expect(page.getByRole("button", { name: "Abrir menú del panel" })).toBeHidden();
      await expect(page.getByRole("navigation", { name: "Accesos rápidos del panel" })).toBeHidden();
      await expect.poll(() => panelWidth(page)).toBe(72);
      const x = await mainX(page);
      // Hover: se despliega encima del contenido, que no se corre.
      await rail(page).hover();
      await expect.poll(() => panelWidth(page)).toBe(280);
      expect(await mainX(page)).toBe(x);
      await page.mouse.move(width - 40, height / 2);
      await expect.poll(() => panelWidth(page)).toBe(72);
      // Teclado: al llegar con Tab a una sección, se abre con sus nombres.
      await page.locator("main#contenido").click({ position: { x: 5, y: 5 } });
      await rail(page).getByRole("link", { name: "Pedidos" }).focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect.poll(() => panelWidth(page)).toBe(280);
      // Las secciones conservan su nombre accesible y la marca de la actual.
      await expect(rail(page).getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
      await expect(rail(page).getByRole("link", { name: /Pagos manuales 2 por revisar/ })).toBeAttached();
      // Fijar: ahora ocupa su lugar (el contenido se corre una vez, porque se pidió) y se recuerda al recargar.
      await rail(page).getByRole("button", { name: "Fijar el menú abierto" }).click();
      await page.mouse.move(width - 40, height / 2);
      await expect.poll(() => mainX(page)).toBeGreaterThan(x + 150);
      await page.reload();
      await expect(rail(page)).toHaveAttribute("data-pinned", "true");
      expect(await panelWidth(page)).toBe(280);
      await rail(page).getByRole("button", { name: "Contraer el menú" }).click();
      await page.mouse.move(width - 40, height / 2);
      await expect.poll(() => panelWidth(page)).toBe(72);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    });

    test("un clic en un ícono navega y la barra vuelve a cerrarse al salir el mouse", async ({ page }) => {
      await page.goto("admin-demo/");
      await rail(page).getByRole("link", { name: "Clientes" }).click();
      await expect(page.getByRole("heading", { level: 1, name: "Clientes" })).toBeVisible();
      await page.mouse.move(width - 40, height / 2);
      await expect.poll(() => panelWidth(page)).toBe(72);
      await expect(rail(page).getByRole("link", { name: "Clientes" })).toHaveAttribute("aria-current", "page");
    });
  });
}

for (const [label, width, height] of [["tablet horizontal", 1024, 768], ["tablet vertical", 768, 1024], ["celular", 390, 844], ["celular chico", 360, 740]] as const) {
  test(`${label} ${width}×${height} (táctil): hamburguesa y pestañas con "Más", sin depender del hover`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("admin-demo/");
    await expect(rail(page)).toBeHidden();
    const bar = page.getByRole("navigation", { name: "Accesos rápidos del panel" });
    await expect(bar).toBeVisible();
    for (const tab of ["Inicio", "Pedidos", "Pagos", "Productos"]) await expect(bar.getByRole("link", { name: tab })).toBeVisible();
    await bar.getByRole("button", { name: "Más secciones del panel" }).click();
    const menu = page.getByRole("dialog", { name: "Menú del panel" });
    await expect(menu.getByText("Marketing", { exact: true })).toBeVisible();
    await menu.getByRole("link", { name: "Ajustes" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Ajustes" })).toBeVisible();
    await page.getByRole("button", { name: "Abrir menú del panel" }).click();
    await expect(menu.getByRole("link", { name: "Ajustes" })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    // La barra de abajo no tapa el final de la página: lo último del contenido queda por encima de ella.
    await page.goto("admin-demo/");
    await expect(page.getByRole("heading", { name: "Actividad reciente" })).toBeVisible();
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    const lastBottom = await page.locator("main#contenido > *").last().evaluate((el) => el.getBoundingClientRect().bottom);
    const barTop = (await bar.boundingBox())!.y;
    expect(lastBottom).toBeLessThanOrEqual(barTop);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}
