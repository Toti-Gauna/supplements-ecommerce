import { expect, test } from "@playwright/test";

const hero = "section[aria-roledescription='carrusel']";
const current = `${hero} [aria-roledescription='diapositiva'][aria-hidden='false']`;
const markers = `${hero} [aria-label='Destacados'] button`;

test("el botón de pausa responde al toque sin reactivar el autoplay", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Pausar carrusel" }).tap();
  await expect(page.getByRole("button", { name: "Reproducir carrusel" })).toBeVisible();
  await page.locator("[data-shop-header] a").first().focus();
  await page.waitForTimeout(4800);
  await expect(page.locator(markers).first()).toHaveAttribute("aria-current", "true");
});

test("reducir movimiento: quieto, navegación circular y compra de la diapositiva actual", async ({ page }) => {
  await page.goto("");
  await expect(page.locator(markers).first()).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("button", { name: "Reproducir carrusel" })).toBeDisabled();
  await page.waitForTimeout(4700);
  await expect(page.locator(markers).first()).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Diapositiva anterior" }).click();
  await expect(page.locator(markers).last()).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Diapositiva siguiente" }).click();
  await expect(page.locator(markers).first()).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Diapositiva siguiente" }).click();
  await expect(page.locator(current)).toContainText("Creatina");
  await page.locator(current).getByRole("button", { name: /^Agregar / }).click();
  await expect(page.getByRole("dialog", { name: /Elegí/ })).toBeVisible();
});

test("mouse, foco y pausa mantienen la escena; salir del carrusel permite reproducir", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("");
  await page.keyboard.press("Escape");
  const first = page.locator(markers).first();
  await page.locator(hero).hover();
  await page.waitForTimeout(4800);
  await expect(first).toHaveAttribute("aria-current", "true");
  await first.focus();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(4800);
  await expect(first).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Pausar carrusel" }).click();
  await page.locator("[data-shop-header] a").first().focus();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(4800);
  await expect(first).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Reproducir carrusel" }).click();
  await page.locator("[data-shop-header] a").first().focus();
  await page.mouse.move(0, 0);
  await expect(page.locator(markers).nth(1)).toHaveAttribute("aria-current", "true", { timeout: 7000 });
});

test("deslizar con el dedo usa scroll-snap y frena la reproducción", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("");
  await page.keyboard.press("Escape");
  const track = page.locator("[data-hero-track]");
  const box = (await track.boundingBox())!;
  const session = await page.context().newCDPSession(page);
  const y = Math.min(box.y + 140, 550);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 330, y }] });
  for (let x = 290; x >= 50; x -= 40) {
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await page.waitForTimeout(30);
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator(markers).nth(1)).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("button", { name: "Reproducir carrusel" })).toBeVisible();
  await page.waitForTimeout(4800);
  await expect(page.locator(markers).nth(1)).toHaveAttribute("aria-current", "true");
  const pos = await track.evaluate((el) => ({ left: el.scrollLeft, width: el.clientWidth, snap: getComputedStyle(el).scrollSnapType }));
  expect(pos.left).toBeCloseTo(pos.width, 0);
  expect(pos.snap).toBe("x mandatory");
});
