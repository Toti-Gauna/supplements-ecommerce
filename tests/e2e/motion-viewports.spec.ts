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

test("la pantalla de carga aparece en cada recarga, dura 5 s y se cierra con Escape", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("");
  const splash = page.locator("#volta-splash");
  await expect(splash).toBeVisible();
  await expect(splash.locator(".splash-piece")).toHaveCount(5);
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  await page.getByRole("link", { name: "Ver todas" }).click();
  await expect(page).toHaveURL(/categorias\/$/);
  // Vuelve en la recarga y se va sola a los 5 s
  await page.reload();
  await expect(splash).toBeVisible();
  await expect(splash).toBeHidden({ timeout: 6500 });
});

for (const width of [375, 768, 1440]) {
  test(`capturas a ${width}px`, async ({ page }, info) => {
    // Diez capturas de página completa: a 1440 px cada una tarda 2–6 s, más que los 45 s por defecto.
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["", "p/comedero-perro-globo/", "crear/collar-con-nombre/", "carrito/", "checkout/", "cupones/", "admin-demo/", "admin-demo/pedidos/detalle/?codigo=VOL-000123", "admin-demo/pagos/", "admin-demo/productos/editar/?id=comedero-perro-globo"]) {
      await page.goto(path);
      await page.waitForTimeout(950);
      const overflow = await horizontalOverflow(page);
      expect(overflow, `${path} a ${width}px`).toBeLessThanOrEqual(0);
      await page.screenshot({ path: info.outputPath(`${width}-${path.replace(/\W+/g, "_") || "home"}.png`), fullPage: true });
    }
  });
}
