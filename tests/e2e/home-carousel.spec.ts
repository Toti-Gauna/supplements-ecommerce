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
  await page.waitForTimeout(5600);
  await expect(page.locator(markers).first()).toHaveAttribute("aria-current", "true");
});

test("reducir movimiento: quieto, navegación circular y compra de la diapositiva actual", async ({ page }) => {
  await page.goto("");
  await expect(page.locator(markers).first()).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("button", { name: "Reproducir carrusel" })).toBeDisabled();
  await page.waitForTimeout(5600);
  await expect(page.locator(markers).first()).toHaveAttribute("aria-current", "true");
  const height = (await page.locator(hero).boundingBox())!.height;
  await page.getByRole("button", { name: "Diapositiva anterior" }).click();
  await expect(page.locator(markers).last()).toHaveAttribute("aria-current", "true");
  expect((await page.locator(hero).boundingBox())!.height).toBeCloseTo(height, 0);
  await page.getByRole("button", { name: "Diapositiva siguiente" }).click();
  await expect(page.locator(markers).first()).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Diapositiva siguiente" }).click();
  await expect(page.locator(current)).toContainText("Creatina");
  await page.locator(current).getByRole("button", { name: /^Agregar / }).click();
  await expect(page.getByRole("dialog", { name: /Elegí/ })).toBeVisible();
  await expect(page.getByRole("dialog", { name: /Elegí/ })).toContainText("Creatina");
});

test("mouse, foco y pausa mantienen la escena; salir del carrusel permite reproducir", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("");
  await page.keyboard.press("Escape");
  const first = page.locator(markers).first();
  await page.locator(hero).hover();
  await page.waitForTimeout(5600);
  await expect(first).toHaveAttribute("aria-current", "true");
  await first.focus();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(5600);
  await expect(first).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Pausar carrusel" }).click();
  await page.locator("[data-shop-header] a").first().focus();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(5600);
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
  // Con la suite cargada, la página puede no haber pintado el carril todavía: se espera antes de medirlo.
  await expect(track).toBeVisible();
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
  await page.waitForTimeout(5600);
  await expect(page.locator(markers).nth(1)).toHaveAttribute("aria-current", "true");
  const pos = await track.evaluate((el) => ({ left: el.scrollLeft, width: el.clientWidth, snap: getComputedStyle(el).scrollSnapType }));
  expect(pos.left).toBeCloseTo(pos.width, 0);
  expect(pos.snap).toBe("x mandatory");
});

test("banner de imagen: precio total primero, por servicio chico, y la barra del carril es el reloj del autoplay", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("");
  await page.keyboard.press("Escape");
  const slide = page.locator(current);
  // La escena ilustrada protagoniza la diapositiva y el texto va encima.
  await expect(slide.getByRole("img", { name: /imagen ilustrativa/ })).toBeVisible();
  const total = slide.getByRole("img", { name: /^\$\s?[\d.]+$/ });
  const serving = slide.getByText(/por servicio/);
  await expect(total).toBeVisible();
  await expect(serving).toBeVisible();
  expect((await total.boundingBox())!.y).toBeLessThan((await serving.boundingBox())!.y);
  expect(await serving.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeLessThanOrEqual(12);
  await expect(slide.getByRole("link", { name: /Ver producto/ })).toBeVisible();
  // El carril actual se carga; con la pausa queda congelado.
  const fill = page.locator(`${hero} .hero-fill`);
  await expect(fill).toHaveCount(1);
  await page.mouse.move(0, 0);
  await page.locator("[data-shop-header] a").first().focus();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Pausar carrusel" }).click();
  await page.locator("[data-shop-header] a").first().focus();
  await page.mouse.move(0, 0);
  await expect(fill).toHaveCSS("animation-play-state", "paused");
  const frozen = await fill.evaluate((el) => el.getBoundingClientRect().width);
  expect(frozen).toBeGreaterThan(0);
  await page.waitForTimeout(800);
  expect(await fill.evaluate((el) => el.getBoundingClientRect().width)).toBeCloseTo(frozen, 0);
  await expect(page.locator(markers).first()).toHaveAttribute("aria-current", "true");
});

test("con reducir movimiento no hay barra de carga y los controles no pisan la imagen", async ({ page }) => {
  await page.goto("");
  // Hidratado: con reducir movimiento el botón queda en "Reproducir" y deshabilitado.
  await expect(page.getByRole("button", { name: "Reproducir carrusel" })).toBeDisabled();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(`${hero} .hero-fill`)).toHaveCount(0);
  const track = (await page.locator("[data-hero-track]").boundingBox())!;
  for (const name of ["Diapositiva anterior", "Diapositiva siguiente", "Reproducir carrusel"]) {
    const box = (await page.getByRole("button", { name }).boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(track.y + track.height - 1);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  expect((await page.locator(markers).first().boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});
