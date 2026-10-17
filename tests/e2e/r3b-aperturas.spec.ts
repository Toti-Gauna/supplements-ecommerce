import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { encodeGift } from "../../src/demo/engine/gift-link";
import type { Gift } from "../../src/demo/engine/gifts";
import { sampleGifts } from "../../src/demo/fixtures/gifts";
import { horizontalOverflow } from "./helpers";

/**
 * R3b · aperturas y revelación: la bolsa rehecha (cámara lenta en el último golpe), el locker con combinación, la
 * "tarjeta de atleta" con "Compartí en tu historia" y una apertura propia por fecha (punto 11 de Ignacio).
 */
const PRICE = /\$\s?\d/;
const sample = (occasion: string) => sampleGifts.find((g) => g.occasion === occasion)!;
const stageOf = (page: Page, g: { from: string; to: string }) => page.getByRole("dialog", { name: `Regalo de ${g.from} para ${g.to}` });
const LOCKED: Gift = {
  code: "REGALO-10CK-000H", from: "Ro", to: "Nacho", message: "Para el lunes: pierna y después batido.", occasion: "dia-del-padre", opening: "locker",
  item: { slug: "ionic-whey", name: "Ionic Whey 100%", variant: "Chocolate · 2 lb (907 g)" }, createdAt: "2026-10-02T15:30:00.000Z",
};

/** Deja un regalo en este navegador (como si se hubiera comprado acá) para abrirlo con su código. */
async function seed(page: Page, gifts: Gift[]) {
  await page.addInitScript((list) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("volta-demo:gifts", JSON.stringify({ state: { sent: list, saved: [], opened: [] }, version: 0 }));
  }, gifts);
}

/** El primer gesto puede perderse si la página todavía no hidrató: se reintenta hasta que cuenta. */
async function firstHit(button: Locator, scene: Locator) {
  await expect(async () => {
    if ((await scene.getAttribute("data-hits")) === "0") await button.click();
    await expect(scene).toHaveAttribute("data-hits", "1", { timeout: 1000 });
  }).toPass({ timeout: 15_000 });
}

test("bolsa rehecha: cinco golpes con la cámara que acompaña, cámara lenta en el último y después la tarjeta", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install({ time: new Date("2026-10-05T12:00:00-03:00") });
  const g = sample("volta");
  await page.goto(`regalo/?c=${g.code}`);
  await page.keyboard.press("Escape");
  const stage = stageOf(page, g);
  const scene = stage.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-scene", "original");
  const bag = stage.getByRole("button", { name: /Golpeá la bolsa para abrir el regalo/ });
  await firstHit(bag, scene);
  await page.clock.pauseAt(new Date("2026-10-05T12:01:00-03:00"));
  const camera = scene.locator(".op-camera");
  const zoom = async () => Number((await camera.getAttribute("style"))!.match(/scale\(([\d.]+)\)/)![1]);
  const first = await zoom();
  for (let i = 2; i <= 4; i++) { await bag.click(); await expect(scene).toHaveAttribute("data-hits", String(i)); }
  expect(await zoom()).toBeGreaterThan(first);
  await expect(bag).toHaveAccessibleName("Golpeá la bolsa para abrir el regalo. Falta 1 golpe.");
  await bag.click();
  // Último golpe: cámara lenta (todavía no se abrió) y la cámara se acerca más.
  await expect(scene).toHaveClass(/is-slowmo/);
  await expect(scene).toHaveAttribute("data-open", "false");
  await expect(stage.getByText("¡La rompiste!")).toBeVisible();
  await page.clock.runFor(1000);
  await expect(scene).toHaveAttribute("data-open", "true");
  await expect(scene.locator("[data-reveal='tub']")).toBeVisible();
  await expect(stage.getByRole("heading", { name: g.item.name })).toHaveCount(0);
  await page.clock.runFor(2000);
  await expect(stage.getByRole("heading", { name: g.item.name })).toBeVisible();
  await expect(stage.getByText(PRICE)).toHaveCount(0);
});

test("locker: una combinación equivocada avisa y la correcta (la fecha del regalo) lo abre", async ({ page }) => {
  await seed(page, [LOCKED, { ...LOCKED, code: "REGALO-10CK-001R", lockerCode: "4821" }]);
  await page.goto(`regalo/?c=${LOCKED.code}`);
  const stage = stageOf(page, LOCKED);
  const scene = stage.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-opening", "locker");
  await expect(scene).toHaveAttribute("data-variant", "dia-del-padre");
  const code = stage.getByLabel("Combinación del locker");
  await expect(stage.getByText("Pista: el día y el mes en que te lo regalaron, en 4 números (DDMM).")).toBeVisible();
  const open = stage.getByRole("button", { name: "Abrir", exact: true });
  await expect(async () => {
    await code.fill("02");
    await open.click();
    await expect(stage.getByRole("alert")).toHaveText(/Faltan números: la combinación tiene 4\./, { timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await code.fill("1234");
  await open.click();
  await expect(stage.getByRole("alert")).toHaveText(/Esa combinación no abre/);
  await expect(code).toHaveAttribute("aria-invalid", "true");
  await expect(scene).toHaveAttribute("data-locker", "wrong");
  await expect(scene).toHaveAttribute("data-open", "false");
  // Solo cuentan los dígitos: 02/10 es 0210.
  await code.fill("02/10");
  await expect(code).toHaveValue("0210");
  await open.click();
  await expect(scene).toHaveAttribute("data-open", "true");
  await expect(stage.getByRole("heading", { name: LOCKED.item.name })).toBeVisible();
  await expect(stage.getByText(LOCKED.message)).toBeVisible();

  // Con una combinación propia, la pista es que la pasó quien regala; tres intentos fallidos ofrecen abrirlo igual.
  await page.goto("regalo/?c=REGALO-10CK-001R");
  await expect(stage.getByText("Ro te pasó la combinación junto con el regalo.")).toBeVisible();
  await expect(async () => {
    await code.fill("0210");
    await open.click();
    await expect(stage.getByRole("alert")).toHaveText(/no abre/, { timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  for (const wrong of ["1111", "2222"]) { await code.fill(wrong); await open.click(); }
  await stage.getByRole("button", { name: "Abrirlo de una vez" }).click();
  await expect(stage.getByRole("heading", { name: LOCKED.item.name })).toBeVisible();
});

test("revelación: tarjeta de atleta en estudio neutro, cómo tomarlo, mensaje y quién lo manda; la historia baja como PNG 9:16", async ({ page }) => {
  const g = sample("dia-del-amigo");
  await page.goto(`regalo/?c=${g.code}`);
  const stage = stageOf(page, g);
  await stage.getByRole("button", { name: "Abrirlo de una vez" }).click();
  await expect(stage.getByRole("heading", { name: g.item.name })).toBeVisible();
  await expect(stage.getByText(`Regalo de ${g.from}`)).toBeVisible();
  await expect(stage.getByText(`Para ${g.to}`)).toBeVisible();
  await expect(stage.getByText(g.message, { exact: false })).toBeVisible();
  await expect(stage.getByText(`— ${g.from}`)).toBeVisible();
  await expect(stage.getByRole("region", { name: "Cómo tomarlo" })).toBeVisible();
  await expect(stage.getByText(PRICE)).toHaveCount(0);
  // Estudio neutro: ni el color de su fecha (Día del Amigo) ni el de otra.
  const studio = await stage.locator(".athlete-studio").evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(studio).not.toMatch(/rgb\(6, 48, 44\)|rgb\(15, 118, 110\)|rgb\(227, 255, 143\)/);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  const [download] = await Promise.all([page.waitForEvent("download"), stage.getByRole("button", { name: "Compartí en tu historia" }).click()]);
  expect(download.suggestedFilename()).toBe(`regalo-${g.code.toLowerCase()}.png`);
  const png = readFileSync((await download.path())!);
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1080, 1920]);
  await expect(page.getByText("Historia descargada")).toBeVisible();

  await stage.getByRole("button", { name: "Guardá tu regalo" }).click();
  await expect(stage.getByRole("link", { name: "Está en mis regalos" })).toBeVisible();
});

test("con \"reducir movimiento\": revelación tranquila y directa, sin cámara ni cámara lenta", async ({ page }) => {
  const g = sample("navidad");
  await page.goto(`regalo/?c=${g.code}`);
  const stage = stageOf(page, g);
  const scene = stage.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-scene", "navidad");
  await expect(scene.locator(".op-camera")).toHaveAttribute("style", /scale\(1\)/);
  await stage.getByRole("button", { name: "Abrirlo de una vez" }).click();
  await expect(scene).toHaveAttribute("data-open", "true");
  await expect(scene).not.toHaveClass(/is-slowmo/);
  await expect(scene.locator(".op-camera")).toHaveAttribute("style", /scale\(1\)/);
  await expect(stage.getByRole("heading", { name: g.item.name })).toBeVisible({ timeout: 2000 });
});

test("Día del Amigo: su fecha elige el spot del compañero; un día del deporte, su gesto", async ({ page }) => {
  const g = sample("dia-del-amigo");
  await page.goto(`regalo/?c=${g.code}`);
  const stage = stageOf(page, g);
  const scene = stage.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-scene", "dia-del-amigo");
  await expect(stage.getByText("¡Arriba, te cuido!")).toBeVisible();
  const bar = stage.getByRole("button", { name: "Empujá la barra para abrir el regalo. Faltan 4 repeticiones." });
  await firstHit(bar, scene);
  for (let i = 2; i <= 4; i++) await stage.locator("button.gift-hit").click();
  await expect(stage.getByText("¡Barra al rack!")).toBeVisible();
  await expect(stage.getByRole("heading", { name: g.item.name })).toBeVisible();

  await page.goto(`regalo/?g=${encodeGift({ ...g, code: "REGALO-B0X3-000E", occasion: "dia-del-boxeador" })}`);
  await expect(stage.locator("[data-scene]")).toHaveAttribute("data-scene", "dia-del-boxeador");
  await expect(stage.getByRole("button", { name: "Pegale a la manopla para abrir el regalo. Faltan 5 golpes." })).toBeVisible();
});
