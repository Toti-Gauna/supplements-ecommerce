import { expect, test, type Page } from "@playwright/test";

/** Polish 8.2 · Lote 1: flechas del carrusel principal, categorías en una fila y riel de Recomendados sin huecos. */
const preview = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);

/** Cuántas cajas de texto o de imagen de la diapositiva a la vista pisa alguna flecha. */
const arrowHits = (page: Page) => page.evaluate(() => {
  const track = document.querySelector<HTMLElement>("section[aria-roledescription=carrusel] div.no-scrollbar")!;
  const left = track.getBoundingClientRect().left;
  const slide = [...track.children].find((s) => Math.abs(s.getBoundingClientRect().left - left) < 2)!;
  const arrows = [...document.querySelectorAll("button[aria-label^='Diapositiva ']")].map((b) => b.getBoundingClientRect());
  const boxes: DOMRect[] = [];
  const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (!walker.currentNode.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(walker.currentNode);
    boxes.push(...range.getClientRects());
  }
  // La imagen del producto (no el brillo de fondo, que es decorativo y se desvanece hacia los bordes).
  slide.querySelectorAll("svg[role=img]").forEach((e) => boxes.push(e.closest("div")!.getBoundingClientRect()));
  const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  return { hits: boxes.filter((b) => arrows.some((a) => hit(a, b))).length, label: slide.getAttribute("aria-label") };
});

for (const [width, height] of [[640, 900], [820, 1180], [1080, 810], [1180, 820], [1440, 900]] as const) {
  test(`8.2.1 carrusel principal a ${width}×${height}: las flechas no pisan el texto ni la imagen de ninguna diapositiva`, async ({ page }) => {
    await preview(page, "dia-de-la-madre");
    await page.setViewportSize({ width, height });
    await page.goto("");
    // El carrusel se vuelve a montar cuando la temática de prueba reemplaza a la del día: se mide después.
    await expect(page.locator("[data-theme-banner='dia-de-la-madre']")).toBeVisible();
    const hero = page.locator("section[aria-roledescription=carrusel]");
    const total = await hero.locator("[aria-roledescription=diapositiva]").count();
    expect(total).toBeGreaterThan(1);
    const next = hero.getByRole("button", { name: "Diapositiva siguiente" });
    await expect(next).toBeVisible();
    const box = (await next.boundingBox())!;
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    for (let i = 0; i < total; i++) {
      await expect(hero.getByRole("button", { name: `Ir a la diapositiva ${i + 1}` })).toHaveAttribute("aria-current", "true");
      const { hits, label } = await arrowHits(page);
      expect(hits, `diapositiva ${label}`).toBe(0);
      await next.click();
    }
    await expect(hero.getByRole("button", { name: "Ir a la diapositiva 1" })).toHaveAttribute("aria-current", "true");
  });
}

/** Filas (por altura) que arman los elementos de una lista. */
const rows = (page: Page, list: string) => page.locator(list).evaluate((ul) => {
  const tops = new Map<number, number>();
  for (const li of ul.children) { const t = Math.round(li.getBoundingClientRect().top); tops.set(t, (tops.get(t) ?? 0) + 1); }
  return [...tops.values()];
});

for (const width of [375, 640, 820, 1080, 1180, 1440]) {
  test(`8.2.2 categorías a ${width}px: una sola fila en el inicio y ninguna sola en /categorias/`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("");
    const rail = page.locator("#cats-rail");
    await rail.scrollIntoViewIfNeeded();
    expect(await rows(page, "#cats-rail")).toHaveLength(1);
    const overflow = await rail.evaluate((ul) => ul.scrollWidth - ul.clientWidth);
    const more = page.getByRole("button", { name: "Más categorías" });
    if (overflow > 2) {
      // Con el teclado: Tab hasta la última la trae a la vista.
      await rail.locator("a").last().focus();
      await expect.poll(() => rail.evaluate((ul) => ul.scrollLeft)).toBeGreaterThan(0);
      if (width >= 640) {
        await rail.evaluate((ul) => ul.scrollTo({ left: 0 }));
        await expect(more).toBeVisible();
        await expect(page.getByRole("button", { name: "Categorías anteriores" })).toBeHidden();
        // Se avanza según la posición del riel: el control se desvanece en 300 ms y mientras tanto todavía se ve.
        const atEnd = () => rail.evaluate((ul) => ul.scrollLeft >= ul.scrollWidth - ul.clientWidth - 2);
        for (let k = 0; k < 6 && !(await atEnd()); k++) await more.click();
        expect(await atEnd()).toBe(true);
        await expect(more).toBeHidden();
        await expect(page.getByRole("button", { name: "Categorías anteriores" })).toBeVisible();
      }
    } else {
      await expect(more).toBeHidden();
    }
    await page.goto("categorias/");
    const counts = await rows(page, "ul[aria-label='Todas las categorías']");
    expect(counts.slice(0, -1).every((c) => c === counts[0]), `filas ${counts}`).toBe(true);
    expect(counts.at(-1)!, `filas ${counts}`).toBeGreaterThan(1);
    if (width >= 1024) expect(counts).toHaveLength(1);
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
