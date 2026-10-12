import { expect, test, type Page } from "@playwright/test";

/**
 * Fase 8 · bug del editor de producto: al llegar con Tab a "Ver en tienda" (barra fija de abajo) o a un paso de la fila
 * compacta (fija arriba), la página se corría para "mostrar" el botón y el editor guardaba otro paso: al volver de la
 * vista previa abría más abajo. Con el teclado tiene que quedar igual que con el mouse.
 */

const base = () => `http://localhost:${process.env.E2E_PORT ?? "4173"}${process.env.PAGES_BASE_PATH ?? ""}/`;
const steps = (page: Page) => page.getByRole("navigation", { name: "Pasos del producto" }).filter({ visible: true });
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));
const focused = (page: Page) => page.evaluate(() => document.activeElement?.textContent ?? "");

for (const [label, width, height, touch] of [["escritorio", 1440, 900, false], ["celular", 390, 844, true]] as const) {
  test(`Tab hasta "Ver en tienda" no corre la página ni cambia el paso; al volver, mismo paso (${label})`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, reducedMotion: "reduce", locale: "es-AR" });
    const page = await ctx.newPage();
    await page.goto(base() + "admin-demo/productos/editar/?id=overvolt-pre");
    await page.getByLabel("Nombre", { exact: true }).fill("Overvolt con teclado");
    const variants = steps(page).getByRole("button", { name: /Variantes, precio y stock/ });
    await variants.click();
    await expect(variants).toHaveAttribute("aria-current", "step");
    await expect.poll(() => scrollY(page)).toBeGreaterThan(200);
    // "Descartar" → "Seguir editando" deja el foco en la barra, como quien la recorre con el teclado.
    await page.getByRole("button", { name: "Descartar", exact: true }).click();
    await page.getByRole("dialog", { name: "¿Descartar los cambios?" }).getByRole("button", { name: "Seguir editando" }).click();
    await expect(page.getByRole("button", { name: "Descartar", exact: true })).toBeFocused();
    const y = await scrollY(page);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Ver en tienda" })).toBeFocused();
    await page.waitForTimeout(250);
    expect(await scrollY(page)).toBe(y);
    await expect(variants).toHaveAttribute("aria-current", "step");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/vista-previa\/\?borrador=/);
    await page.getByRole("button", { name: "Volver al editor" }).click();
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Overvolt con teclado");
    await expect(steps(page).getByRole("button", { name: /Variantes, precio y stock/ })).toHaveAttribute("aria-current", "step");
    await expect.poll(() => scrollY(page)).toBeGreaterThan(y - 40);
    expect(Math.abs((await scrollY(page)) - y)).toBeLessThan(40);
    if (touch) {
      // La fila compacta de pasos también es fija (arriba): llegar a ella con Tab no sube la página.
      await page.evaluate(() => document.querySelector<HTMLElement>("main a[href*='/admin-demo/productos/']")?.focus({ preventScroll: true }));
      const before = await scrollY(page);
      await page.keyboard.press("Tab");
      expect(await focused(page)).toMatch(/Foto/);
      await page.waitForTimeout(250);
      expect(await scrollY(page)).toBe(before);
    }
    await ctx.close();
  });
}
