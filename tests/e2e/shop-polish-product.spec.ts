import { expect, test, type Page } from "@playwright/test";

/** Polish 8.2 · Lotes 3 y 4: galería fija en la ficha, botones de compra en columna y navegación entre productos. */

/** Galería, header y fin de la sección de compra (la grilla que contiene a la galería). */
const measure = (page: Page) => page.evaluate(() => {
  const gallery = document.querySelector("[data-vt-hero]")!;
  const column = gallery.closest(".lg\\:sticky") ?? gallery.parentElement!;
  const section = column.parentElement!.getBoundingClientRect();
  const g = column.getBoundingClientRect();
  return { top: g.top, bottom: g.bottom, header: document.querySelector("[data-shop-header]")!.getBoundingClientRect().bottom, end: section.bottom, vh: innerHeight, position: getComputedStyle(column).position };
});

for (const [width, height] of [[1180, 740], [1440, 900], [1080, 700]] as const) {
  test(`8.2.6 a ${width}×${height}: la galería acompaña la compra, entra entera y se suelta al terminar la sección`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("p/collar-con-nombre/");
    const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    let stuck = 0;
    for (let y = 0; y <= Math.min(max, 2600); y += 150) {
      await page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), y);
      const m = await measure(page);
      expect(m.position).toBe("sticky");
      // Nunca pasa del final de la sección de compra (no invade detalles ni recomendaciones).
      expect(m.bottom, `a ${y} px`).toBeLessThanOrEqual(m.end + 1);
      if (m.bottom < m.end - 2) {
        // Mientras está fija: debajo del header y entera en la pantalla.
        expect(m.top, `a ${y} px`).toBeGreaterThanOrEqual(m.header - 1);
        expect(m.bottom, `a ${y} px`).toBeLessThanOrEqual(m.vh + 1);
        if (y > 0) stuck++;
      }
    }
    expect(stuck, "la galería quedó fija al bajar por las opciones").toBeGreaterThan(1);
  });
}

test("8.2.6 en el celular la galería va en el flujo normal (sin fijarse)", async ({ page }) => {
  await page.goto("p/collar-con-nombre/");
  expect((await measure(page)).position).toBe("static");
});

test("8.2.7 botones en columna, del mismo ancho y en orden; favoritos aparte; Regalar ahora abre el regalo", async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.goto("p/vela-en-lata/");
  const card = page.locator("#personalizar");
  const names = ["Agregar al carrito", "Comprar ahora", "Regalar ahora"];
  const boxes = [];
  for (const name of names) {
    const button = card.getByRole("button", { name });
    await expect(button).toBeVisible();
    // El texto entra entero (no se corta ni pasa a dos renglones).
    expect(await button.evaluate((b) => b.scrollWidth <= b.clientWidth && b.getBoundingClientRect().height < 64)).toBe(true);
    boxes.push((await button.boundingBox())!);
  }
  for (let i = 1; i < boxes.length; i++) {
    expect(Math.abs(boxes[i]!.x - boxes[0]!.x)).toBeLessThan(1);
    expect(Math.abs(boxes[i]!.width - boxes[0]!.width)).toBeLessThan(1);
    expect(boxes[i]!.y).toBeGreaterThan(boxes[i - 1]!.y + boxes[i - 1]!.height - 1);
  }
  await expect(card.getByRole("button", { name: /favoritos/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Guardar Vela en lata pintada en favoritos/ }).first().click();
  await expect(page.getByText("Guardado en favoritos")).toBeVisible();
  await card.getByRole("button", { name: "Regalar ahora" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("8.2.7 en el celular: Comprar y Regalar en la tarjeta, Agregar en la barra de abajo (uno solo visible)", async ({ page }) => {
  await page.goto("p/vela-en-lata/");
  const card = page.locator("#personalizar");
  await expect(card.getByRole("button", { name: "Comprar ahora" })).toBeVisible();
  await expect(card.getByRole("button", { name: "Regalar ahora" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Agregar al carrito/ }).filter({ visible: true })).toHaveCount(1);
});

test("8.2.8 ir de un producto a otro por las tarjetas reinicia la ficha: nombre, precio, cantidad y arriba de todo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.goto("p/vela-en-lata/");
  await page.keyboard.press("Escape");
  // Algo en el carrito y una cantidad distinta de 1: el carrito se conserva, la cantidad no.
  await page.getByLabel("Cantidad:").selectOption("2");
  await page.locator("#personalizar").getByRole("button", { name: "Agregar al carrito" }).click();
  await page.keyboard.press("Escape");
  const cart = page.locator("[data-shop-header]").getByRole("button", { name: /^Carrito, / });
  const label = await cart.getAttribute("aria-label");
  expect(label).not.toBe("Carrito, 0 productos");
  for (let k = 0; k < 4; k++) {
    const related = page.locator("#relacionados").locator("xpath=ancestor::section[1]");
    await related.scrollIntoViewIfNeeded();
    const link = related.locator("[data-product-card] h3 a").nth(k % 2);
    const name = (await link.textContent())!.trim();
    await link.click();
    await expect(page.locator("main h1")).toHaveText(name);
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByLabel("Cantidad:")).toHaveValue("1");
    // Nada de la ficha anterior: ni capturas de la transición flotando ni la galería con nombre de transición.
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => document.querySelectorAll(".vt-hero").length)).toBe(0);
    await expect(cart).toHaveAttribute("aria-label", label!);
  }
});
