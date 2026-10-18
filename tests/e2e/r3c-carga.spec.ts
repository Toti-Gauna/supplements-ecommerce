import { expect, test } from "@playwright/test";
import { horizontalOverflow } from "./helpers";
import { holdSplash, logoClear, previewTheme, recordEnds } from "./splash-helpers";

/**
 * R3c · Pantallas de carga por fecha: una escena mecánica propia por fecha (fase 1: Black Friday, Hot Sale, Vuelta al
 * gym y Navidad, más la original). Las animaciones necesitan "no-preference" (la config usa "reduce").
 */
const REFERENCES = { "black-friday": 4, "hot-sale": 5, "vuelta-al-gym": 4, navidad: 7 } as const;

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "no-preference" }); });

test("Black Friday: sale su escena y se retira cuando termina su animación, con solo el arte de su fecha", async ({ page }) => {
  await recordEnds(page);
  const art: string[] = [];
  page.on("response", (r) => { if (r.url().includes("/splash/")) art.push(`${r.status()} ${new URL(r.url()).pathname}`); });
  await previewTheme(page, "black-friday");
  await page.goto("", { waitUntil: "domcontentloaded" });
  const splash = page.locator("#volta-splash");
  // Sin mirarla en pleno movimiento (dura menos de 2 s y con la máquina cargada puede terminar antes): se mide lo que pasó.
  await expect(page.locator("html")).toHaveAttribute("data-splash-scene", "black-friday");
  await expect(splash).toBeHidden({ timeout: 5000 });
  await expect(page.locator("html")).toHaveClass(/splash-done/);
  const t = await page.evaluate(() => { const w = window as unknown as { ends: [string, number][]; splashDone: number }; return { ends: w.ends, splashDone: w.splashDone }; });
  const at = (name: string) => t.ends.find(([n]) => n === name)?.[1];
  expect(at("bf-shutter")).toBeDefined();
  expect(at("splash-curtain")).toBeGreaterThanOrEqual(at("bf-shutter")! - 20);
  expect(t.splashDone).toBeGreaterThanOrEqual(at("splash-curtain")!);
  // Solo bajó el arte de su fecha, entero y sin errores.
  expect(art.sort()).toEqual([1, 2, 3, 4].map((n) => `200 /supplements-ecommerce/splash/black-friday/${n}.svg`));
});

test("Black Friday quieta: la persiana es su propia capa (arte y animación), sin barra, y el logo libre", async ({ page }) => {
  await holdSplash(page);
  await previewTheme(page, "black-friday");
  await page.goto("");
  const splash = page.locator("#volta-splash");
  const stage = splash.locator(".splash-stage[data-scene='black-friday']");
  await expect(stage).toBeVisible();
  const shutter = await stage.locator(".s3").evaluate((el) => {
    const cs = getComputedStyle(el, "::before");
    return { image: cs.backgroundImage, animation: cs.animationName };
  });
  expect(shutter.image).toContain("/splash/black-friday/3.svg");
  expect(shutter.animation).toBe("bf-shutter");
  await expect(splash.locator(".splash-barbell")).toBeHidden();
  await logoClear(page);
});

test("dura entre 1,5 y 2 s: el telón cae a los 1,6 s y la mecánica termina antes", async ({ page }) => {
  await holdSplash(page);
  await previewTheme(page, "black-friday");
  await page.goto("");
  const timing = await page.locator("#volta-splash").evaluate((s) => {
    const all = s.getAnimations({ subtree: true }).map((a) => a.effect!.getComputedTiming());
    const curtain = getComputedStyle(s);
    return { delay: curtain.animationDelay, duration: curtain.animationDuration, last: Math.max(...all.map((c) => Number(c.endTime))) };
  });
  expect(timing).toMatchObject({ delay: "1.6s", duration: "0.25s" });
  expect(timing.last).toBeLessThanOrEqual(1850);
  expect(timing.last).toBeGreaterThanOrEqual(1500);
});

test("Escape la cierra en medio de la escena", async ({ page }) => {
  await holdSplash(page);
  await previewTheme(page, "black-friday");
  await page.goto("");
  const splash = page.locator("#volta-splash");
  await expect(splash.locator(".splash-stage[data-scene='black-friday']")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  await expect(page.locator("html")).toHaveClass(/splash-done/);
});

test("con reducir movimiento no hay pantalla de carga ni se baja el arte de la fecha", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const art: string[] = [];
  page.on("request", (r) => { if (r.url().includes("/splash/")) art.push(r.url()); });
  await previewTheme(page, "black-friday");
  await page.goto("");
  await expect(page.locator("#volta-splash")).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute("data-splash-scene", "black-friday");
  await page.waitForLoadState("networkidle");
  expect(art).toEqual([]);
});

test("la original sigue: barra olímpica que se carga, sin escenario ni arte para bajar, y se retira sola", async ({ page }) => {
  await recordEnds(page);
  const art: string[] = [];
  page.on("request", (r) => { if (r.url().includes("/splash/")) art.push(r.url()); });
  await page.goto("", { waitUntil: "domcontentloaded" });
  const splash = page.locator("#volta-splash");
  await expect(page.locator("html")).not.toHaveAttribute("data-splash-scene", /.*/);
  await expect(splash).toBeHidden({ timeout: 5000 });
  const ends = await page.evaluate(() => (window as unknown as { ends: [string, number][] }).ends.map(([n]) => n));
  expect(ends).toContain("splash-load");
  expect(ends).toContain("splash-curtain");
  expect(art).toEqual([]);
});

test("la original quieta: la barra con sus ocho discos, sin escenario, centrada debajo del logo", async ({ page }) => {
  await holdSplash(page);
  await page.goto("");
  const splash = page.locator("#volta-splash");
  await expect(splash.locator(".splash-barbell .bp")).toHaveCount(8);
  await expect(splash.locator(".splash-barbell")).toBeVisible();
  await expect(splash.locator(".splash-stage")).toBeHidden();
  const word = (await splash.locator(".splash-word").boundingBox())!;
  const bar = (await splash.locator(".splash-barbell").boundingBox())!;
  expect(bar.y).toBeGreaterThanOrEqual(word.y + word.height - 1);
  expect(Math.abs(bar.x + bar.width / 2 - page.viewportSize()!.width / 2)).toBeLessThan(2);
  expect(await splash.evaluate((s) => getComputedStyle(s).animationDelay)).toBe("1.15s");
});

for (const [id, layers] of Object.entries(REFERENCES)) {
  for (const width of [375, 1440]) {
    test(`${id} a ${width}px: escena propia con sus ${layers} capas, sin tapar el logo ni desbordar`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 600 ? 812 : 900 });
      await holdSplash(page);
      await previewTheme(page, id);
      await page.goto("");
      const stage = page.locator(`#volta-splash .splash-stage[data-scene='${id}']`);
      await expect(stage).toBeVisible();
      const images = await stage.locator(".sl").evaluateAll((els) => els.map((el) => getComputedStyle(el, "::before").backgroundImage));
      expect(images.filter((i) => i.includes(`/splash/${id}/`))).toHaveLength(layers);
      expect(images.filter((i) => i !== "none" && !i.includes(`/splash/${id}/`))).toEqual([]);
      await logoClear(page);
      await expect(stage.locator(".splash-caption")).toBeVisible();
      await page.keyboard.press("Escape");
    });
  }
}

/**
 * Fase 2 · las 13 fechas restantes: cada fecha con su escena propia (capas, y la capa que da la mecánica
 * con su animación), sin tapar el logo ni desbordar a 375 y 1440, y que se retira sola al terminar el telón.
 */
const PHASE2 = {
  "dia-de-la-madre": { layers: 6, slot: 3, animation: "dm-sweep" },
  halloween: { layers: 5, slot: 3, animation: "hw-ignite" },
  "cyber-monday": { layers: 5, slot: 3, animation: "cm-bays" },
  "ano-nuevo": { layers: 5, slot: 2, animation: "an-fall" },
  "san-valentin": { layers: 5, slot: 2, animation: "sv-left" },
  "dia-del-padre": { layers: 7, slot: 4, animation: "dp-bar" },
  "dia-del-amigo": { layers: 5, slot: 2, animation: "da-left" },
  "operacion-verano": { layers: 5, slot: 2, animation: "ov-mercury" },
  "crossfit-open": { layers: 6, slot: 5, animation: "cf-go" },
  "dia-actividad-fisica": { layers: 6, slot: 5, animation: "af-step" },
  "dia-del-futbolista": { layers: 5, slot: 4, animation: "fu-shot" },
  "dia-del-running": { layers: 7, slot: 2, animation: "ru-left" },
  "dia-del-boxeador": { layers: 4, slot: 3, animation: "bx-hammer" },
} as const;

for (const [id, scene] of Object.entries(PHASE2)) {
  for (const width of [375, 1440]) {
    test(`${id} a ${width}px: su escena con sus ${scene.layers} capas y su mecánica, sin tapar el logo ni desbordar`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 600 ? 812 : 900 });
      await holdSplash(page);
      await previewTheme(page, id);
      await page.goto("");
      const stage = page.locator(`#volta-splash .splash-stage[data-scene='${id}']`);
      await expect(stage).toBeVisible();
      await expect(page.locator("#volta-splash .splash-barbell")).toBeHidden();
      const images = await stage.locator(".sl").evaluateAll((els) => els.map((el) => getComputedStyle(el, "::before").backgroundImage));
      expect(images.filter((i) => i.includes(`/splash/${id}/`))).toHaveLength(scene.layers);
      expect(images.filter((i) => i !== "none" && !i.includes(`/splash/${id}/`))).toEqual([]);
      const moving = await stage.locator(`.s${scene.slot}`).evaluate((el) => {
        const cs = getComputedStyle(el, "::before");
        return { image: cs.backgroundImage, animation: cs.animationName };
      });
      expect(moving.image).toContain(`/splash/${id}/${scene.slot}.svg`);
      expect(moving.animation).toBe(scene.animation);
      // Toda la mecánica (y el número) termina antes de que caiga el telón, a los 1,6 s.
      const ends = await stage.evaluate((s) => s.getAnimations({ subtree: true }).map((a) => Number(a.effect!.getComputedTiming().endTime)));
      expect(Math.max(...ends)).toBeLessThanOrEqual(1600);
      await logoClear(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(stage.locator(".splash-caption")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator("#volta-splash")).toBeHidden();
    });
  }

  test(`${id}: se retira sola cuando termina su animación, con solo el arte de su fecha`, async ({ page }) => {
    await recordEnds(page);
    const art: string[] = [];
    page.on("response", (r) => { if (r.url().includes("/splash/")) art.push(`${r.status()} ${new URL(r.url()).pathname}`); });
    await previewTheme(page, id);
    await page.goto("", { waitUntil: "domcontentloaded" });
    const splash = page.locator("#volta-splash");
    await expect(page.locator("html")).toHaveAttribute("data-splash-scene", id);
    await expect(splash).toBeHidden({ timeout: 5000 });
    await expect(page.locator("html")).toHaveClass(/splash-done/);
    const ends = await page.evaluate(() => (window as unknown as { ends: [string, number][] }).ends);
    const at = (name: string) => ends.find(([n]) => n === name)?.[1];
    expect(at(scene.animation)).toBeDefined();
    // Con la máquina cargada los dos `animationend` pueden salir en el mismo cuadro (en cualquier orden).
    expect(at("splash-curtain")).toBeGreaterThanOrEqual(at(scene.animation)! - 20);
    expect(art.sort()).toEqual(Array.from({ length: scene.layers }, (_, i) => `200 /supplements-ecommerce/splash/${id}/${i + 1}.svg`));
  });
}
