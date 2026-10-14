import { expect, test, type Page } from "@playwright/test";

/** Compara píxeles de dos recortes; tolera el grano fino del fondo, pero detecta texto o tarjetas por encima. */
async function pixelDifference(page: Page, first: Buffer, second: Buffer) {
  return page.evaluate(async ([a, b]) => {
    const read = async (src: string) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const [left, right] = await Promise.all([read(a!), read(b!)]);
    if (left.length !== right.length) return 1;
    let different = 0;
    for (let i = 0; i < left.length; i += 4) {
      if ([0, 1, 2].some((channel) => Math.abs(left[i + channel]! - right[i + channel]!) > 12)) different++;
    }
    return different / (left.length / 4);
  }, [first, second].map((buffer) => `data:image/png;base64,${buffer.toString("base64")}`));
}

test("con los avisos ocultos el contenido sigue visible durante la navegación", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("categorias/");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Ocultar avisos" }).click();
  const title = page.getByRole("heading", { level: 1 });
  await page.evaluate(() => document.fonts.ready);
  // Las capturas nativas usan antialias en gris: la referencia también necesita una capa compuesta, sin LCD RGB.
  await title.evaluate((el) => { el.style.willChange = "transform"; });
  const clip = (await title.boundingBox())!;
  const reference = await page.screenshot({ clip, scale: "css" });
  await page.goto("cuenta/");
  await page.locator("[data-shop-bottomnav]").getByRole("link", { name: "Tienda", exact: true }).click();
  await page.waitForFunction(() => document.getAnimations().some((animation) =>
    (animation.effect as KeyframeEffect | null)?.pseudoElement?.startsWith("::view-transition-new(")));
  await page.evaluate(() => document.getAnimations().forEach((animation) => {
    if ((animation.effect as KeyframeEffect | null)?.pseudoElement) { animation.pause(); animation.currentTime = 1000; }
    else animation.finish();
  }));
  expect(await pixelDifference(page, reference, await page.screenshot({ clip, scale: "css" })), "el título nuevo no queda detrás de una captura del documento").toBeLessThan(0.005);
  await page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));
});

for (const mode of ["dark", "light"] as const) {
  test(`shell ${mode}: header, zona segura y dock cubren las tarjetas durante una transición`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript((theme) => localStorage.setItem("volta-theme", theme), mode);
    const session = await page.context().newCDPSession(page);
    // Insets reales del navegador: el test también verifica viewport-fit y la zona segura de un iPhone.
    await session.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 47, bottom: 34, left: 0, right: 0 } });
    await page.goto("cuenta/");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click();
    await expect(page.getByText("Hola, Sofía")).toBeVisible();
    await page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect.poll(() => page.locator("[data-shop-header]").evaluate((el) => el.getBoundingClientRect().top)).toBe(83);
    const header = (await page.locator("[data-shop-header]").boundingBox())!;
    const dock = (await page.locator("[data-shop-bottomnav]").boundingBox())!;
    expect(header.y).toBe(47 + 36);
    expect(dock.y + dock.height).toBe(844 - 34 - 8);
    const topClip = { x: 0, y: 0, width: 390, height: header.y + header.height };
    const searchClip = { x: 166, y: dock.y + 8, width: 58, height: 52 };
    const top = await page.screenshot({ clip: topClip, scale: "css" });
    const search = await page.screenshot({ clip: searchClip, scale: "css" });
    // Las tarjetas quedan justo detrás de las dos barras antes de navegar.
    await page.evaluate(() => window.scrollTo({ top: 380, behavior: "instant" }));
    await expect.poll(() => page.locator("[data-shop-header]").evaluate((el) => el.getBoundingClientRect().top)).toBe(47);
    await page.locator("[data-shop-bottomnav]").getByRole("link", { name: "Tienda", exact: true }).click();
    await page.waitForFunction(() => document.getAnimations().some((animation) =>
      (animation.effect as KeyframeEffect | null)?.pseudoElement?.startsWith("::view-transition-new(")));
    await page.evaluate(() => document.getAnimations().forEach((animation) => {
      if ((animation.effect as KeyframeEffect | null)?.pseudoElement) { animation.pause(); animation.currentTime = 0; }
      else animation.finish();
    }));
    expect(await pixelDifference(page, top, await page.screenshot({ clip: topClip, scale: "css" })), "el header y la hora mantienen su fondo").toBeLessThan(0.005);
    expect(await pixelDifference(page, search, await page.screenshot({ clip: searchClip, scale: "css" })), "el contenido no se pinta sobre Buscar").toBeLessThan(0.005);
    await page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));
    const nav = page.locator("[data-shop-bottomnav]");
    // La placa además recibe el toque y abre la búsqueda por encima del contenido.
    await nav.getByRole("button", { name: "Buscar", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Buscar", exact: true })).toBeVisible();
  });
}
