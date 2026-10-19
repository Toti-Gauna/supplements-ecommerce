import { createHash } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { t1 } from "@/trailer/pieces/t1";

// El config fuerza movimiento reducido para toda la suite; acá se prueba la versión animada (la reducida, con `?reduced=1`).
test.use({ contextOptions: { reducedMotion: "no-preference" } });

/**
 * T1 (las 19 escenas de docs/trailer/t1/storyboard.md): el mismo segundo da el mismo cuadro por tres caminos en los
 * dos formatos (también con la pantalla de carga real, la bolsa, la ruleta, Shaker Rush y las placas), cada escena muestra su
 * super o rótulo, nunca otra marca, y el movimiento reducido deja la lámina final.
 */
const B = 60 / 128;
const at = (beats: number) => Math.round(beats * B * 1000) / 1000;
/** Segundo de una escena (por id) más unos tiempos adentro: el montaje cambia y los tests lo siguen. */
const START = Object.fromEntries(t1.scenes.map((x) => [x.id, x.start / B]));
const TOTAL = t1.duration / B;
const rel = (id: string, beats: number) => at(START[id]! + beats);
const ready = (page: Page) => page.waitForFunction(() => window.__trailer?.ready === true);
const hash = async (page: Page) => createHash("sha256").update(await page.locator("[data-trailer-stage]").screenshot()).digest("hex");
const seek = (page: Page, t: number) => page.evaluate((s) => window.__trailer!.seek(s), t);
const scene = (page: Page, id: string) => page.locator(`[data-escena='${id}']`);

for (const ratio of ["16x9", "9x16"] as const) {
  test(`${ratio}: las escenas del problema dan el mismo cuadro por tres caminos`, async ({ page }) => {
    test.setTimeout(200_000); // 16 cuadros, cada uno con su carga y tres capturas a 2,6×.
    await page.setViewportSize(ratio === "16x9" ? { width: 960, height: 540 } : { width: 405, height: 720 });
    for (const t of [rel("apertura", 2.5), rel("calcadas", 1.3), rel("potes", 2.1), rel("latido", 0.7), rel("w1-carga", 2.5), rel("w2-tema", 4.5), rel("w3-regalo", 5.2), rel("w4-shaker", 5.4), rel("w5-ruleta", 5), rel("w6-mostrador", 5.2), rel("w7-proveedor", 5.1), rel("software", 4), rel("asesoria", 2.2), rel("promesa", 2.3), rel("sistema", 4), rel("en-vivo", 8), rel("oferta", 10), rel("mantenimiento", 6), rel("piezas", 6), rel("cierre", 4)]) {
      await page.goto(`trailer/t1/?export=1&ratio=${ratio}&t=${t}`);
      await ready(page);
      await seek(page, t);
      const byUrl = await hash(page);
      await seek(page, 0);
      await seek(page, t);
      const fromStart = await hash(page);
      await seek(page, at(TOTAL - 6));
      await seek(page, t);
      const fromLater = await hash(page);
      expect([fromStart, fromLater], `t=${t}`).toEqual([byUrl, byUrl]);
    }
  });
}

test("cada escena del problema muestra su super y el cierre abre el marco de la tienda", async ({ page }) => {
  await page.goto("trailer/t1/?export=1&t=7");
  await ready(page);
  for (const [beats, id, text] of [[1.5, "calcadas", "Mismo template."], [1, "veinte", "Mismo 20 % OFF."], [1, "potes", "Misma tienda."], [1.5, "plano", "Y después de comprar, nada."], [1.5, "latido", "Tu negocio,"]] as const) {
    await seek(page, rel(id, beats));
    await expect(scene(page, id)).toBeVisible();
    await expect(scene(page, id)).toContainText(text);
  }
  await expect(page.locator("[data-trailer-stage]")).not.toContainText(/volta/i);
});

test("la ráfaga: cada plano con su rótulo y lo real con la marca de la tienda", async ({ page }) => {
  await page.goto("trailer/t1/?export=1&t=15");
  await ready(page);
  const chips = [["w1-carga", "01 · Pantallas de carga por fecha"], ["w2-tema", "02 · Modo claro y oscuro"], ["w3-regalo", "03 · Regalos que se abren a golpes"],
    ["w4-shaker", "04 · Un juego propio"], ["w5-ruleta", "05 · Ruleta de cupones"], ["w6-mostrador", "06 · Mostrador en cuotas"], ["w7-proveedor", "07 · Lista del proveedor"]] as const;
  for (const [id, text] of chips) {
    await seek(page, rel(id, 4));
    await expect(scene(page, id).locator("[data-t='chip']").first(), id).toContainText(text);
  }
  await seek(page, rel("w1-carga", 2.5));
  await expect(scene(page, "w1-carga").locator(".splash-stage[data-scene='crossfit-open']")).toBeVisible();
  await expect(scene(page, "w1-carga")).toContainText("Tu tienda");
  await seek(page, rel("w3-regalo", 6.5));
  await expect(scene(page, "w3-regalo")).toContainText("¡La rompiste!");
  await expect(scene(page, "w3-regalo").locator("svg text", { hasText: "TU TIENDA" }).first()).toBeAttached();
  await seek(page, rel("w4-shaker", 6.5));
  await expect(scene(page, "w4-shaker")).toContainText("¡Tiempo!");
  await seek(page, rel("w6-mostrador", 6));
  await expect(scene(page, "w6-mostrador")).toContainText("$ 40.892");
  await seek(page, rel("w7-proveedor", 6));
  await expect(scene(page, "w7-proveedor").locator("[data-t='count']")).toHaveText("48");
  await expect(scene(page, "w7-proveedor")).toContainText("Tu proveedor te manda su lista de costos.");
  await expect(scene(page, "w7-proveedor")).toContainText("aplicás los precios con un toque");
  await expect(page.locator("[data-trailer-stage]")).not.toContainText(/volta/i);
});

test("cuando el cursor cae justo en el inicio de una escena se ve su estado inicial", async ({ page }) => {
  // `?t=0` (la apertura) y `?t=40.313` (el inicio del cierre) quedaban en negro: no se aplicaban los `set` de tiempo 0 de la escena.
  await page.goto("trailer/t1/?export=1&t=0");
  await ready(page);
  await expect(scene(page, "apertura")).toBeVisible();
  await page.goto(`trailer/t1/?export=1&t=${at(START.cierre!)}`);
  await ready(page);
  await expect(scene(page, "cierre")).toBeVisible();
  await expect(scene(page, "cierre").locator("[data-t='night']")).toHaveCSS("opacity", "0");
  // El cuadro de inicio de `plano` sale con la caja todavía abajo del cuadro (y = 760) y no tapando el pote.
  await page.goto(`trailer/t1/?export=1&t=${at(START.plano!)}`);
  await ready(page);
  await expect(scene(page, "plano").locator("[data-t='box']").first()).toHaveCSS("transform", /, 760\)$/);
});

test("el cierre: equipos, asesoría, promesa y el guiño con los precios del libro", async ({ page }) => {
  await page.goto("trailer/t1/?export=1&t=15");
  await ready(page);
  const stage = page.locator("[data-trailer-stage]");
  for (const [beats, id, texts] of [
    [rel("software", 6), "software", ["No es", "solo", "software.", "El panel, para vos", "La tienda, para tus clientes"]],
    [rel("asesoria", 2.5), "asesoria", ["Asesoría de", "Growth marketing", "y fidelización."]],
    [rel("sistema", 5), "sistema", ["Te arma un sistema", "de crecimiento."]],
    [rel("promesa", 2), "promesa", ["Para que", "tu negocio", "venda más.", "Tu tienda"]],
    [rel("en-vivo", 8), "en-vivo", ["Eclipse potencia tus ventas,", "crea tendencias y hace", "volver a tus clientes.", "Mirá un ejemplo de cómo podría verse tu negocio potenciado.", "223-446 7881"]],
    [rel("oferta", 10), "oferta", ["El precio de", "hacer crecer tu negocio.", "$ 750.000", "USD 500", "2 meses de mantenimiento bonificados", "100 mensajes automáticos de WhatsApp", "$ 375.000", "4 × $ 225.000", "Recargo del 20 % en cada cuota"]],
    [rel("mantenimiento", 6), "mantenimiento", ["siempre andando.", "2 meses de mantenimiento bonificados", "$ 45.000"]],
    [rel("piezas", 6), "piezas", ["Más mensajes automáticos de WhatsApp", "Chatbot IA (WhatsApp o web)"]],
  ] as const) {
    await seek(page, beats);
    for (const text of texts) await expect(scene(page, id), `${id}: ${text}`).toContainText(text);
    await expect(stage).not.toContainText(/volta/i);
  }
  // Las pantallas de los equipos son las de la app (el panel de hoy y el inicio de la tienda), prendidas después del trazo.
  await seek(page, rel("software", 5));
  await expect(scene(page, "software").locator("[data-t='nb-screen'] img")).toBeVisible();
  await expect(scene(page, "software").locator("[data-t='ph-screen'] img")).toBeVisible();
  // El escenario es imagen: los lectores de pantalla leen el resumen de la pieza.
  await expect(page.locator("[data-trailer-viewport]")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("[data-trailer-summary]")).toContainText("Para que tu negocio venda más.");
  // Al empezar la cta el eje de la promesa sigue ahí y se va con el amanecer.
  await seek(page, rel("en-vivo", 0.1));
  await expect(scene(page, "en-vivo").locator("[data-t='axis']")).toBeVisible();
  await seek(page, rel("en-vivo", 2));
  await expect(scene(page, "en-vivo").locator("[data-t='axis']")).toBeHidden();
});

test("9:16: los textos de cada escena entran en el escenario y las placas son las de celular", async ({ page }) => {
  await page.setViewportSize({ width: 405, height: 720 });
  await page.goto("trailer/t1/?export=1&ratio=9x16&t=15");
  await ready(page);
  const TEXTS = "[data-t='sup'], [data-t='super'], [data-t='line'], [data-t='chip'], [data-t='big'], [data-t='count'], [data-t='word'], [data-t='rest'], [data-t='note'], [data-t='title-line'], [data-t='item'], [data-t='price'], [data-t='fine'], [data-t='foot'], [data-t='prompt'], [data-t^='line-'], [data-t='inc'], [data-t='cash'], [data-t='cuotas'], li[data-t='row'], [data-t='sub'], [data-t='url'], [data-t='phone']";
  const times = [["calcadas", 1], ["veinte", 1], ["potes", 1.5], ["plano", 1.5], ["latido", 1.5], ["w1-carga", 2.5], ["w2-tema", 5], ["w3-regalo", 5.5],
    ["w4-shaker", 6.5], ["w5-ruleta", 6], ["w6-mostrador", 6], ["w7-proveedor", 6], ["software", 6], ["asesoria", 2.8], ["promesa", 2.5], ["sistema", 5], ["en-vivo", 8], ["oferta", 10], ["mantenimiento", 6], ["piezas", 6]] as const;
  for (const [id, beats] of times) {
    await seek(page, rel(id, beats));
    const out = await page.evaluate(({ id: sceneId, sel }) => {
      const stage = document.querySelector("[data-trailer-stage]")!.getBoundingClientRect();
      const bad: string[] = [];
      let seen = 0;
      for (const el of document.querySelectorAll<HTMLElement>(`[data-escena='${sceneId}'] :is(${sel})`)) {
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || +cs.opacity < 0.5 || !el.textContent?.trim()) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        seen++;
        if (r.left < stage.left - 1 || r.right > stage.right + 1) bad.push(`${el.dataset.t} «${el.textContent.trim().slice(0, 30)}» ${Math.round(r.left - stage.left)}..${Math.round(r.right - stage.left)} de ${Math.round(stage.width)}`);
      }
      return { bad, seen };
    }, { id, sel: TEXTS });
    expect(out.seen, `${id} a ${beats}: hay textos que medir`).toBeGreaterThan(0);
    expect(out.bad, `${id} a ${beats}`).toEqual([]);
  }
  await seek(page, rel("w2-tema", 1));
  await expect(scene(page, "w2-tema").locator("img[data-t='light']")).toHaveAttribute("src", /ficha-light-t\.jpg/);
  await seek(page, rel("w6-mostrador", 6));
  await expect(scene(page, "w6-mostrador").locator("img[data-t='after']")).toHaveAttribute("src", /cuotas-t\.jpg/);
  await expect(page.locator("[data-trailer-stage]")).not.toContainText(/volta/i);
});

test("t1 sale con sus MP4, el póster y el audio pre-armado, y se ofrecen para descargar", async ({ page }) => {
  const size = async (file: string) => (await (await page.request.get(`trailer/${file}`)).body()).length;
  for (const [file, min, max] of [["t1-16x9.mp4", 2e6, 40e6], ["t1-9x16.mp4", 2e6, 40e6], ["t1-email.mp4", 3e5, 10e6], ["t1-poster.jpg", 2e4, 5e6], ["t1.m4a", 3e5, 3e6]] as const) {
    const bytes = await size(file);
    expect(bytes, file).toBeGreaterThan(min);
    expect(bytes, file).toBeLessThan(max);
  }
  // En un celular vertical abre en 9:16 solo; acá se pide el 16:9 para comprobar el botón de la versión liviana.
  await page.goto("trailer/t1/?t=1&ratio=16x9");
  await ready(page);
  const controls = page.locator("[data-trailer-controls]");
  await expect(controls.locator("a[download]")).toHaveCount(1);
  await expect(controls.locator("a[data-download='Descargar MP4']")).toHaveAttribute("href", /\/trailer\/t1-email\.mp4$/);
  await page.goto("trailer/t1/?t=1&dev=1&ratio=16x9");
  await ready(page);
  await expect(controls.locator("a[data-download='Descargar MP4']")).toHaveAttribute("href", /\/trailer\/t1-16x9\.mp4$/);
  await expect(controls.locator("a[data-download='Para email']")).toHaveAttribute("href", /\/trailer\/t1-email\.mp4$/);
  await page.goto("trailer/t1/?t=1&ratio=9x16");
  await ready(page);
  await expect(controls.locator("a[data-download='Descargar MP4']")).toHaveAttribute("href", /\/trailer\/t1-9x16\.mp4$/);
});

test("la página pide el audio pre-armado de t1 (sin él, sintetiza la pista y la puerta tarda en habilitarse)", async ({ page }) => {
  // El Chromium de los tests no decodifica AAC: ahí la página igual sintetiza; lo que se comprueba es que el archivo exista y se pida.
  const pedido = page.waitForResponse((r) => r.url().endsWith("/trailer/t1.m4a"));
  await page.goto("trailer/t1/");
  expect((await pedido).status()).toBe(200);
});

test("con movimiento reducido cada escena queda en su lámina final", async ({ page }) => {
  await page.goto("trailer/t1/?export=1&reduced=1&t=5");
  await ready(page);
  await seek(page, rel("plano", 3.5));
  await expect(scene(page, "plano")).toBeVisible();
  await expect(scene(page, "plano").locator("[data-t='box']").first()).toBeHidden();
  await expect(scene(page, "plano").locator("[data-t='line']")).toBeVisible();
  await seek(page, rel("latido", 1.5));
  await expect(scene(page, "latido").locator("[data-t='seg-top']")).toBeVisible();
  await expect(scene(page, "latido").locator("[data-t='pulse']")).toBeHidden();
});
