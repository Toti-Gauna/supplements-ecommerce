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

test("la pantalla de carga sale solo la primera vez de la sesión, dura ~1,2 s y se cierra con Escape", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // Controla el cierre breve incluso si cargar la página lleva más de 1,2 s en la suite.
  const now = new Date();
  await page.clock.install({ time: now });
  await page.clock.pauseAt(new Date(now.getTime() + 5_000));
  await page.goto("", { waitUntil: "domcontentloaded" });
  const splash = page.locator("#volta-splash");
  await expect(splash).toBeVisible();
  await expect(splash.locator(".splash-bar span")).toHaveCount(12);
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  await page.clock.resume();
  await page.getByRole("link", { name: "Ver todas" }).click();
  await expect(page).toHaveURL(/categorias\/$/);
  // En la misma sesión no vuelve, ni al recargar.
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(splash).toBeHidden();
  // En una sesión nueva vuelve y se va sola en ~1,2 s.
  await page.evaluate(() => sessionStorage.clear());
  const reloadTime = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(reloadTime + 5_000));
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(splash).toBeVisible();
  await page.clock.runFor(1200);
  await expect(splash).toBeVisible();
  await page.clock.runFor(200);
  await expect(splash).toBeHidden({ timeout: 2500 });
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
