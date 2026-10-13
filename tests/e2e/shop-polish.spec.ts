import { expect, test, type Page } from "@playwright/test";

/**
 * Polish 8.2 · Lote 1, al día con R1: el hero del rack (sin carrusel: ninguna flecha pisa nada porque no hay flechas),
 * las categorías como estantes en una fila y el riel de Recomendados sin huecos.
 */
const preview = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);

for (const [width, height] of [[375, 812], [820, 1180], [1440, 900]] as const) {
  test(`R1 hero a ${width}×${height}: la campaña va primero y no rota; los destacados se eligen como un marcador`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await preview(page, "dia-de-la-madre");
    await page.setViewportSize({ width, height });
    await page.goto("");
    await page.keyboard.press("Escape");
    const hero = page.locator("[data-theme-banner='dia-de-la-madre']");
    await expect(hero).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const markers = page.getByRole("group", { name: "Destacados" }).getByRole("button");
    await expect(markers.first()).toHaveAttribute("aria-pressed", "true");
    // Sin autoplay: pasado el tiempo del carrusel viejo, la campaña sigue en pantalla.
    await page.waitForTimeout(4500);
    await expect(hero).toBeVisible();
    await expect(page.getByRole("button", { name: /carrusel/i })).toHaveCount(0);
    // Elegir otro destacado cambia el titular y el marcador de datos (y la campaña deja de estar).
    const title = await page.getByRole("heading", { level: 1 }).innerText();
    await markers.nth(1).click();
    await expect(markers.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-theme-banner]")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(title);
    const name = (await markers.nth(1).innerText()).replace(/^\d+\s*/, "").replace(/…$/, "");
    await expect(page.locator(`dl[aria-label^="Datos de "]`)).toHaveAttribute("aria-label", new RegExp(name.slice(0, 8), "i"));
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
}

/** Filas (por altura) que arman los elementos de una lista. */
const rows = (page: Page, list: string) => page.locator(list).evaluate((ul) => {
  const tops = new Map<number, number>();
  for (const li of ul.children) { const t = Math.round(li.getBoundingClientRect().top); tops.set(t, (tops.get(t) ?? 0) + 1); }
  return [...tops.values()];
});

for (const width of [375, 640, 820, 1080, 1180, 1440]) {
  test(`8.2.2 categorías a ${width}px: estantes en una sola fila en el inicio y ninguno solo en /categorias/`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("");
    const rail = page.locator("#cats-rail");
    await rail.scrollIntoViewIfNeeded();
    expect(await rows(page, "#cats-rail")).toHaveLength(1);
    const overflow = await rail.evaluate((ul) => ul.scrollWidth - ul.clientWidth);
    const more = page.getByRole("button", { name: "Más categorías" });
    const less = page.getByRole("button", { name: "Categorías anteriores" });
    expect(overflow).toBeGreaterThan(2);
    // Con el teclado: Tab hasta la última la trae a la vista.
    await rail.locator("a").last().focus();
    await expect.poll(() => rail.evaluate((ul) => ul.scrollLeft)).toBeGreaterThan(0);
    if (width >= 640) {
      await rail.evaluate((ul) => ul.scrollTo({ left: 0 }));
      await expect(less).toHaveAttribute("aria-disabled", "true");
      const atEnd = () => rail.evaluate((ul) => ul.scrollLeft >= ul.scrollWidth - ul.clientWidth - 2);
      for (let k = 0; k < 8 && !(await atEnd()); k++) { await more.click(); await page.waitForTimeout(400); }
      expect(await atEnd()).toBe(true);
      await expect(more).toHaveAttribute("aria-disabled", "true");
      await expect(less).not.toHaveAttribute("aria-disabled", "true");
    }
    await page.goto("categorias/");
    const counts = await rows(page, "ul[aria-label='Categorías']");
    expect(counts.slice(0, -1).every((c) => c === counts[0]), `filas ${counts}`).toBe(true);
    expect(counts.at(-1)!, `filas ${counts}`).toBeGreaterThan(1);
  });
}

/** Estado del riel de Recomendados: posición, si coincide con el borde de una tarjeta y si hay alguna en blanco a la vista. */
const railState = (page: Page) => page.locator("#recomendados").locator("xpath=ancestor::section[1]").locator("ul").evaluate((ul) => {
  const r = ul.getBoundingClientRect();
  const pad = parseFloat(getComputedStyle(ul).scrollPaddingLeft) || 0;
  const origin = r.left + ul.clientLeft - ul.scrollLeft;
  const max = ul.scrollWidth - ul.clientWidth;
  const points = [...ul.children].map((li) => li.getBoundingClientRect().left - origin - pad);
  const opacity = (el: Element | null): number => (!el || el === ul.closest("section") ? 1 : Number(getComputedStyle(el).opacity) * opacity(el.parentElement));
  const blank = [...ul.children].filter((li) => { const b = li.getBoundingClientRect(); return b.right > r.left + 4 && b.left < r.right - 4 && opacity(li) < 0.98; }).length;
  const left = ul.scrollLeft;
  return { left, aligned: Math.abs(left - max) < 1.5 || points.some((p) => Math.abs(p - left) < 1.5), blank };
});

for (const [width, height] of [[1080, 810], [820, 1180]] as const) {
  test(`8.2.3 Recomendados a ${width}×${height}: 10 idas y vueltas sin huecos, saltos ni reacomodos tardíos`, async ({ page }) => {
    test.setTimeout(150_000);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width, height });
    await page.goto("");
    await page.keyboard.press("Escape");
    await expect(page.locator("#volta-splash")).toBeHidden();
    const section = page.locator("#recomendados").locator("xpath=ancestor::section[1]");
    await section.scrollIntoViewIfNeeded();
    const next = section.getByRole("button", { name: "Más de Recomendados" });
    const prev = section.getByRole("button", { name: "Anteriores de Recomendados" });
    await expect(prev).toHaveAttribute("aria-disabled", "true");
    await expect.poll(async () => (await railState(page)).blank).toBe(0);
    const settle = async () => {
      let last = -1;
      await expect.poll(async () => { const { left } = await railState(page); const still = left === last; last = left; return still; }, { intervals: [120] }).toBe(true);
      const settled = await railState(page);
      expect(settled.aligned, `posición ${settled.left}`).toBe(true);
      expect(settled.blank).toBe(0);
      await page.waitForTimeout(300);
      expect((await railState(page)).left, "sin reacomodo después de frenar").toBe(settled.left);
    };
    const press = async (button: typeof next) => {
      await button.click();
      await page.waitForTimeout(120);
      expect((await railState(page)).blank, "tarjetas en blanco a mitad del recorrido").toBe(0);
      await settle();
    };
    for (let pass = 0; pass < 10; pass++) {
      for (let k = 0; k < 8 && (await next.getAttribute("aria-disabled")) !== "true"; k++) await press(next);
      await expect(next).toHaveAttribute("aria-disabled", "true");
      for (let k = 0; k < 8 && (await prev.getAttribute("aria-disabled")) !== "true"; k++) await press(prev);
      await expect(prev).toHaveAttribute("aria-disabled", "true");
    }
    // Un deslizón rápido hasta el final (de un cuadro al otro) y vuelta: las tarjetas por las que pasó están.
    await section.locator("ul").evaluate((ul) => ul.scrollTo({ left: ul.scrollWidth, behavior: "instant" }));
    await settle();
    await press(prev);
  });
}
