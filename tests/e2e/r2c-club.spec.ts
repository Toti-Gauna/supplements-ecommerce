import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { checkoutAsGuest, guardNetwork, horizontalOverflow } from "./helpers";

/**
 * R2c · Club, liga, disco y Shaker Rush. Lo que depende de la fecha (semana, mes, cupón del día) corre con el reloj de
 * Playwright: jueves 15/10/2026 al mediodía. El disco y la partida avanzan solo cuando la prueba lo pide.
 */
const NOW = new Date("2026-10-15T12:00:00-03:00");
const ACCOUNT = { state: { user: { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" }, usedRewards: [], sort: "relevance", wheelPrize: null }, version: 0 };
const signedIn = (page: Page) => page.addInitScript((a) => {
  if (!localStorage.getItem("volta-demo:account")) localStorage.setItem("volta-demo:account", JSON.stringify(a));
}, ACCOUNT);
const seedCart = (page: Page) => page.addInitScript(() => {
  if (sessionStorage.getItem("seeded")) return;
  sessionStorage.setItem("seeded", "1");
  localStorage.setItem("volta-demo:cart", JSON.stringify({ state: { lines: [{ id: "l1", productSlug: "colageno", variantId: "co-limon-300", quantity: 2 }], couponCode: null }, version: 0 }));
});

test("anillo del invitado: invita a crear la cuenta demo y nunca dice «¡Desbloqueás!»", async ({ page }) => {
  await seedCart(page);
  await page.goto("club/");
  const hero = page.getByRole("region", { name: "Sumá carga. Subí de nivel." });
  await expect(hero.getByRole("progressbar", { name: "Tu carga: sin cuenta no suma" })).toHaveAttribute("aria-valuenow", "0");
  await expect(hero.getByText("Como invitado, todavía no sumás.")).toBeVisible();
  await expect(page.getByText(/Desbloque/)).toHaveCount(0);
  await page.goto("carrito/");
  await expect(page.getByRole("list", { name: "Productos en el carrito" })).toBeVisible();
  await expect(page.getByText(/Desbloque/)).toHaveCount(0);
  // Con la cuenta demo el anillo ya muestra un premio real.
  await page.goto("club/");
  await expect(async () => {
    await hero.getByRole("button", { name: "Crear la cuenta demo" }).first().click({ timeout: 1000 });
    await expect(hero.getByText(/Progreso de Sofía/)).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(hero.getByRole("progressbar", { name: /^Progreso hacia/ })).not.toHaveAttribute("aria-valuenow", "0");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("tabla de niveles: cuatro medallas de metal y tu nivel encendido solo con cuenta", async ({ page }) => {
  await page.goto("club/");
  const table = page.getByRole("list", { name: "Tabla de niveles" });
  await expect(table.locator(":scope > li")).toHaveCount(4);
  for (const metal of ["bronce", "plata", "oro", "platino"]) await expect(table.getByRole("img", { name: `Medalla de ${metal}` })).toBeVisible();
  await expect(table.locator("[aria-current]")).toHaveCount(0);
  await expect(page.getByText("Para todos los socios:")).toBeVisible();
  await signedIn(page);
  await page.reload();
  const current = table.locator("[aria-current=step]");
  await expect(current).toContainText("Atleta");
  await expect(current).toContainText("Tu nivel");
  await expect(current.getByRole("img", { name: "Medalla de plata" })).toBeVisible();
});

test("liga: elegir gimnasio suma tu aporte resaltado en el ranking y el panel lo ve", async ({ page }) => {
  await page.clock.install({ time: NOW });
  await signedIn(page);
  await page.goto("club/liga/");
  const ranking = page.getByRole("list", { name: "Ranking mensual de gimnasios" });
  await expect(ranking.getByRole("listitem")).toHaveCount(8);
  await expect(ranking.getByText(/Tu aporte/)).toHaveCount(0);
  const radio = page.getByRole("radio", { name: /Hierro Norte/ });
  await expect(async () => {
    await radio.check({ force: true, timeout: 1000 });
    await expect(radio).toBeChecked({ timeout: 1000 });
  }).toPass();
  // Aporte de la cuenta demo el 15/10: $42.000 del mes (42) + 2 entrenos de la semana (40) = 82 puntos.
  const mine = ranking.locator("[aria-current=true]");
  await expect(mine).toContainText("Hierro Norte");
  await expect(mine).toContainText("Tu aporte: +82 pts");
  await expect(mine).toContainText("3.352");
  await expect(page.getByText("Sumás para Hierro Norte.")).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  // En el panel, la misma tabla en solo lectura.
  await page.goto("admin-demo/misiones/liga/");
  await expect(page.getByRole("heading", { level: 1, name: "Liga de gimnasios" })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Hierro Norte" })).toContainText("Cuenta demo +82");
});

test("misión de entrenamiento: el premio se reclama una vez y el segundo reclamo queda bloqueado", async ({ page }) => {
  await page.clock.install({ time: NOW });
  await signedIn(page);
  await page.goto("club/");
  const card = page.getByRole("article", { name: "Entrená 3 veces esta semana" });
  await expect(card.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "67");
  await expect(async () => {
    await card.getByRole("button", { name: "Marcar el entreno de hoy" }).click({ timeout: 1000 });
    await expect(card.getByRole("button", { name: "Hoy ya entrenaste" })).toBeDisabled({ timeout: 1000 });
  }).toPass();
  await expect(card.getByRole("listitem", { name: "jueves: entrenaste" })).toBeVisible();
  await card.getByRole("button", { name: "Reclamar premio: Entrená 3 veces esta semana" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Premio reclamado: Sachet de pre-entreno de regalo" })).toBeVisible();
  const claimed = card.getByRole("button", { name: "Premio reclamado: Entrená 3 veces esta semana" });
  await expect(claimed).toBeDisabled();
  const code = (/CLUB[0-9A-Z]{5}/.exec((await claimed.textContent())!) ?? [])[0]!;
  // Recargar no devuelve el botón; forzar el clic en el bloqueado tampoco emite otro cupón.
  await page.reload();
  await expect(claimed).toBeDisabled();
  await expect(card.getByRole("button", { name: /^Reclamar premio/ })).toHaveCount(0);
  await claimed.dispatchEvent("click");
  await page.goto("cupones/");
  await expect(page.getByText(code, { exact: true })).toHaveCount(1);
  await expect(page.getByText("Premio de misión del Club")).toHaveCount(1);
  await page.goto("admin-demo/cupones/lista/");
  await expect(page.getByText(code, { exact: true })).toHaveCount(1);
});

test("el disco no está en los pasos del checkout: se ofrece como placa opcional en el carrito", async ({ page }) => {
  await seedCart(page);
  await page.goto("carrito/");
  await expect(page.getByRole("region", { name: "Disco olímpico" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar al checkout" }).click();
  await expect(page).toHaveURL(/checkout\/$/);
  const wheel = page.getByRole("dialog", { name: "Ruleta de cupones" });
  await expect(wheel).toHaveCount(0);
  await checkoutAsGuest(page);
  await expect(wheel).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Confirmar pedido" })).toBeVisible();
});

test("disco olímpico: «Cargá la barra» se carga mientras apretás y al soltar gira hasta el premio (reloj controlado)", async ({ page }) => {
  await page.clock.install({ time: NOW });
  await page.goto("club/");
  await expect(page.getByRole("button", { name: "Girar la ruleta" })).toBeEnabled();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Girar la ruleta" }).click();
  const stage = page.getByRole("dialog", { name: "Ruleta de cupones" });
  const bar = stage.getByRole("button", { name: "Cargá la barra" });
  await expect(bar).toBeVisible();
  await page.clock.pauseAt(new Date(NOW.getTime() + 60_000));
  const box = (await bar.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const meter = stage.getByRole("progressbar", { name: "Carga de la barra" });
  await page.clock.runFor(500);
  const half = Number(await meter.getAttribute("aria-valuenow"));
  expect(half).toBeGreaterThan(30);
  expect(half).toBeLessThan(70);
  await page.clock.runFor(800);
  await expect(meter).toHaveAttribute("aria-valuenow", "100");
  await expect(stage.getByRole("button", { name: "¡Soltá!" })).toBeVisible();
  await page.mouse.up();
  await expect(stage.getByText("Girando…").first()).toBeVisible();
  await page.clock.runFor(12_000);
  await expect(stage.getByText("¡Ganaste!")).toBeVisible();
  await expect(stage.getByRole("button", { name: "Aplicar ahora" })).toBeFocused();
});

test("Shaker Rush: resultado arcade con tarjeta 9:16 descargable, «Usar cupón ahora» y el ranking semanal", async ({ page }) => {
  test.setTimeout(120_000);
  const assertNoExternal = guardNetwork(page);
  await seedCart(page);
  await page.addInitScript(() => {
    (window as unknown as { __voltaGameTest: object }).__voltaGameTest = { seed: 11, autopilot: true };
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  });
  await page.clock.install({ time: NOW });
  await page.goto("club/juego/");
  await expect(page.getByRole("list", { name: "Ranking semanal de Shaker Rush" }).locator("[aria-current]")).toHaveCount(0);
  const play = page.getByRole("button", { name: "Jugar", exact: true });
  await expect(play).toBeEnabled();
  await page.clock.pauseAt(new Date(NOW.getTime() + 60_000));
  await play.click();
  const stage = page.getByRole("dialog", { name: "Shaker Rush" });
  await page.clock.runFor(50_000);
  await expect(stage.getByText("¡Tiempo!")).toBeVisible();
  const heading = stage.getByRole("heading", { name: /puntos$/ });
  await expect(heading).toBeFocused();
  const score = Number((await heading.getAttribute("aria-label"))!.replace(/\D/g, ""));
  await expect(stage.getByText(/Puesto \d+\.º de la semana/)).toBeVisible();
  const code = (await stage.getByText(/^SHAKER[A-Z0-9]{5}$/).textContent())!.trim();
  // La tarjeta 9:16 se arma en el navegador y, sin hoja de compartir, se descarga como PNG de 1080 × 1920.
  await page.clock.resume();
  const [download] = await Promise.all([page.waitForEvent("download"), stage.getByRole("button", { name: "Compartir puntaje" }).click()]);
  expect(download.suggestedFilename()).toBe(`shaker-rush-${score}.png`);
  const png = readFileSync((await download.path())!);
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1080, 1920]);
  await stage.getByRole("button", { name: "Usar cupón ahora" }).click();
  await expect(page).toHaveURL(/carrito\/$/);
  await expect(page.getByText(new RegExp(`${code}: Shaker Rush`))).toBeVisible();
  // Tu partida entra al ranking de la semana, encendida.
  await page.goto("club/juego/");
  const mine = page.getByRole("list", { name: "Ranking semanal de Shaker Rush" }).locator("[aria-current=true]");
  await expect(mine).toContainText("VOS");
  await expect(mine).toContainText(score.toLocaleString("es-AR"));
  assertNoExternal();
});
