import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * Shaker Rush en el celular. La partida usa el modo determinista (semilla fija + autopiloto) que solo se activa desde la
 * prueba, y el reloj de Playwright para jugar los 45 s en un instante: cada cuadro avanza 16 ms exactos.
 */
const CODE = /^SHAKER[A-Z0-9]{5}$/;

async function deterministic(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __voltaGameTest: object; __voltaSounds: string[]; __vibes: unknown[] };
    w.__voltaGameTest = { seed: 11, autopilot: true };
    w.__voltaSounds = [];
    w.__vibes = [];
    Object.defineProperty(navigator, "vibrate", { configurable: true, value: (p: unknown) => { w.__vibes.push(p); return true; } });
  });
  await page.clock.install({ time: new Date("2026-10-12T12:00:00-03:00") });
}

test("inicio: instrucciones, premios, teclado, pausa y salida sin mover la página", async ({ page }) => {
  await page.goto("club/juego/");
  await expect(page.getByRole("heading", { level: 1, name: /Shaker\s*Rush/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cómo se juega" })).toBeVisible();
  for (const item of ["Scoop de proteína", "Cápsula", "Rayo ×2", "Scoop dorado", "Hamburguesa", "Gaseosa", "Dona"]) {
    await expect(page.getByText(item, { exact: true }).first()).toBeVisible();
  }
  const prizes = page.getByRole("region", { name: /ganá un cupón/ }).getByRole("listitem");
  await expect(prizes.filter({ hasText: /5\s%\sOFF/ }).first()).toContainText("desde 300 pts");
  await expect(page.getByText(/el cupón se gana una vez por día/)).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

  // Con teclado: Enter en "Jugar" abre la partida; Escape pausa y vuelve a seguir; el botón de pausa también.
  const play = page.getByRole("button", { name: "Jugar", exact: true });
  await play.focus();
  await page.keyboard.press("Enter");
  const stage = page.getByRole("dialog", { name: "Shaker Rush" });
  await expect(stage).toBeVisible();
  // El campo no deja que el gesto mueva la página y el documento queda sin scroll.
  expect(await stage.locator("canvas").evaluate((c) => getComputedStyle(c.parentElement!).touchAction)).toBe("none");
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await expect(stage.getByRole("img", { name: "Vidas: 3 de 3" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(stage.getByRole("heading", { name: "Pausa" })).toBeVisible();
  await expect(stage.getByRole("button", { name: "Seguir" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(stage.getByRole("heading", { name: "Pausa" })).toBeHidden();
  // Perder el foco de la ventana (otra app, otra pestaña) pausa solo.
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(stage.getByRole("heading", { name: "Pausa" })).toBeVisible();
  await stage.getByRole("button", { name: "Salir del juego" }).click();
  await expect(stage).toBeHidden();
  await expect(play).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
});

test("partida hasta el premio, uno solo por día y «Usar cupón ahora» lo aplica en el carrito", async ({ page }) => {
  test.setTimeout(150_000);
  const assertNoExternal = guardNetwork(page);
  await deterministic(page);
  await page.goto("p/bcaa-211/");
  await page.getByRole("button", { name: "Agregar al carrito" }).last().click();
  await page.keyboard.press("Escape");
  await page.goto("club/juego/");
  const play = page.getByRole("button", { name: "Jugar", exact: true });
  await expect(play).toBeEnabled();
  await expect(page.getByText("Disponible")).toBeVisible();
  // Desde acá el tiempo solo corre cuando la prueba lo pide: la partida es siempre la misma.
  await page.clock.pauseAt(new Date("2026-10-12T12:05:00-03:00"));
  await play.click();
  const stage = page.getByRole("dialog", { name: "Shaker Rush" });
  await expect(stage.getByRole("button", { name: /Pausar/ })).toBeVisible();
  await page.clock.runFor(50_000);
  await expect(stage.getByText("¡Tiempo!")).toBeVisible();
  await expect(stage.getByRole("heading", { name: /puntos/ })).toBeFocused();
  await expect(stage.getByText(/^Ganaste/)).toBeVisible();
  const code = (await stage.getByText(CODE).textContent())!.trim();
  // El resultado se anuncia en la región en vivo, con el código.
  await expect(stage.locator("[aria-live=polite]")).toContainText(`cupón ${code}`);
  const sounds = await page.evaluate(() => (window as unknown as { __voltaSounds: string[] }).__voltaSounds);
  expect(sounds).toEqual(expect.arrayContaining(["catch", "gameover"]));
  expect(await page.evaluate(() => (window as unknown as { __vibes: unknown[] }).__vibes)).toContainEqual([30, 50, 70]);
  await expect(stage.getByRole("button", { name: "Usar cupón ahora" })).toBeVisible();

  // Segunda partida el mismo día: se juega igual, pero no hay otro cupón (el de hoy se puede usar desde acá).
  await stage.getByRole("button", { name: "Jugar de nuevo" }).click();
  await page.clock.runFor(50_000);
  await expect(stage.getByText("Hoy ya ganaste tu cupón", { exact: true })).toBeVisible();
  await expect(stage.getByText(code, { exact: true })).toBeVisible();
  await expect(stage.getByText(CODE)).toHaveCount(1);
  await page.clock.resume();
  // "Usar cupón ahora" lo aplica al carrito y lleva al carrito.
  await stage.getByRole("button", { name: "Usar cupón ahora" }).click();
  await expect(page).toHaveURL(/carrito\/$/);
  await expect(page.getByText(new RegExp(`${code}: Shaker Rush`))).toBeVisible();
  await page.goto("club/juego/");
  await expect(page.getByText(/^Ganado:/)).toBeVisible();

  await page.goto("cupones/");
  await expect(page.getByText(CODE)).toHaveCount(1);
  await expect(page.getByText("Ganado en Shaker Rush")).toBeVisible();
  await page.goto("admin-demo/cupones/lista/");
  await expect(page.getByText(code, { exact: true })).toBeVisible();
  assertNoExternal();
});
