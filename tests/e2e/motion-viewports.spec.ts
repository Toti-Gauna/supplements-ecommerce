import { expect, test } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

test.describe("movimiento reducido", () => {
  test("sin splash ni animaciones largas", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("");
    await expect(page.locator("#volta-splash")).toBeHidden();
    const duration = await page.locator(".page-enter").first().evaluate((el) => getComputedStyle(el).animationDuration);
    expect(["0.001s", "1ms"]).toContain(duration);
  });
});

test("la pantalla de carga sale en cada carga completa, termina su animación y se cierra con Escape", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("", { waitUntil: "domcontentloaded" });
  const splash = page.locator("#volta-splash");
  await expect(splash).toBeVisible();
  await expect(splash.locator(".splash-bar span")).toHaveCount(12);
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  // Navegar dentro de la tienda no la vuelve a mostrar.
  await page.getByRole("link", { name: "Ver todas" }).first().click();
  await expect(page).toHaveURL(/categorias\/$/);
  await expect(splash).toBeHidden();
  // Al recargar vuelve, y se va sola recién cuando el telón terminó de subir (no a un tiempo fijo).
  await page.addInitScript(() => {
    const w = window as unknown as { curtainEnd?: number; splashDone?: number };
    document.addEventListener("animationend", (e) => { if (e.animationName === "splash-curtain") w.curtainEnd ??= performance.now(); });
    // El script corre antes de que exista <html>: se observa el documento entero.
    new MutationObserver(() => { if (document.documentElement?.classList.contains("splash-done")) w.splashDone ??= performance.now(); })
      .observe(document, { attributes: true, attributeFilter: ["class"], subtree: true });
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(splash).toBeVisible();
  await expect(splash).toBeHidden({ timeout: 5000 });
  const t = await page.evaluate(() => { const w = window as unknown as { curtainEnd?: number; splashDone?: number }; return { curtainEnd: w.curtainEnd, splashDone: w.splashDone }; });
  expect(t.curtainEnd).toBeDefined();
  expect(t.splashDone!).toBeGreaterThanOrEqual(t.curtainEnd!);
});

for (const width of [375, 768, 1440]) {
  test(`capturas a ${width}px`, async ({ page }, info) => {
    // Diez capturas de página completa: a 1440 px cada una tarda 2–6 s, más que los 45 s por defecto.
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["", "p/ionic-whey/", "crear/", "carrito/", "checkout/", "cupones/", "admin-demo/", "admin-demo/pedidos/detalle/?codigo=VOL-000123", "admin-demo/pagos/", "admin-demo/productos/editar/?id=ionic-whey"]) {
      await page.goto(path);
      await page.waitForTimeout(950);
      const overflow = await horizontalOverflow(page);
      expect(overflow, `${path} a ${width}px`).toBeLessThanOrEqual(0);
      await page.screenshot({ path: info.outputPath(`${width}-${path.replace(/\W+/g, "_") || "home"}.png`), fullPage: true });
    }
  });
}
