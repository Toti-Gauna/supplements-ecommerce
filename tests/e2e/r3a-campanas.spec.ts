import { expect, test } from "@playwright/test";
import { CALENDAR, FIXED_NOW, paintOf, resolveColor, setThemeMode } from "./campaign-helpers";
import { guardNetwork, horizontalOverflow } from "./helpers";
import { holdSplash, previewTheme } from "./splash-helpers";

/**
 * R3a · campañas en la tienda (plan-rediseno §6): el drop de Black Friday, la sala de espera, la pantalla de carga de
 * campaña, el modo vitrina sin recargar, la franja "Próxima campaña" y la regla "la fecha no pinta la compra".
 */
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test("Black Friday: drop con el descuento en marcador, cuenta regresiva y ticket que copia y aplica el cupón", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.clock.setFixedTime(FIXED_NOW);
  await previewTheme(page, "black-friday");
  await page.goto("");
  const drop = page.locator("[data-theme-banner='black-friday']");
  await expect(drop.getByRole("heading", { level: 2, name: "Negro total, precios en volt" })).toBeVisible();
  // El descuento sale del cupón (30 %) y la vista previa simula el primer día: faltan 7 d 8 h 17 m para el cierre.
  await expect(drop.getByRole("img", { name: "30 % de descuento" })).toBeVisible();
  await expect(drop.getByRole("timer")).toHaveAttribute("aria-label", "Termina en 7 días, 8 horas y 17 minutos");
  // El rack con los productos reales de la campaña.
  await expect(drop.getByRole("img", { name: /Isolate Zero, Ionic Whey 100% y Mass Gainer 3 kg/ })).toBeVisible();
  const ticket = drop.locator("[data-access-ticket='BLACK30']");
  await expect(ticket).toContainText("Desde $40.000 de compra");
  await ticket.getByRole("button", { name: "Copiar el código BLACK30" }).click();
  await expect(page.getByText("Código copiado")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("BLACK30");
  await ticket.getByRole("button", { name: "Usar BLACK30" }).click();
  await expect(ticket.getByRole("button", { name: "Cupón en tu carrito" })).toBeDisabled();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  // En el carrito, el ticket de la fecha dice cuánto falta para el mínimo.
  await page.goto("p/creatina-monohidrato/");
  await page.locator("[data-buy-bar]").getByRole("button", { name: /Agregar al carrito/ }).click();
  await page.goto("carrito/");
  await expect(page.locator("[data-season-ticket='carrito']")).toContainText("Te faltan $ 10.100 para el 30 %");
  assertNoExternal();
});

test("día del deporte: habla de entrenar, no de regalar", async ({ page }) => {
  await previewTheme(page, "dia-del-running");
  await page.goto("");
  const drop = page.locator("[data-theme-banner='dia-del-running']");
  await expect(drop).toContainText("Día del deporte");
  await expect(drop.locator("a", { hasText: "Ver el equipo del día" })).toBeAttached();
  await expect(drop).toContainText("Pase del día");
  await expect(drop).not.toContainText(/regal/i);
});

test("sala de espera: antes de Black Friday cuenta al inicio, no muestra precios y el aviso es simulado", async ({ page }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto("campana/?id=black-friday&fase=espera");
  await page.evaluate(() => { (window as unknown as { campaignMark: number }).campaignMark = 1; });
  const room = page.locator("[data-waiting-room='black-friday']");
  await expect(room.getByRole("heading", { level: 1, name: "Black Friday" })).toBeVisible();
  await expect(room.getByRole("timer")).toHaveAttribute("aria-label", "Abre en 2 días, 8 horas y 17 minutos");
  await expect(room).toContainText("Isolate Zero");
  await expect(room).not.toContainText("$");
  await expect(room.getByRole("img", { name: "Descuento: se revela al abrir" })).toBeVisible();
  await room.getByRole("button", { name: "Avisame cuando abra" }).click();
  await expect(room.getByRole("status")).toHaveText("Listo: te avisamos (simulado)");
  // "En vivo" muestra el drop con sus precios, en la misma página.
  await page.getByRole("button", { name: "En vivo" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Negro total, precios en volt" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Ofertas de Black Friday/ })).toBeVisible();
  await expect(page).toHaveURL(/fase=vivo$/);
  expect(await page.evaluate(() => (window as unknown as { campaignMark?: number }).campaignMark)).toBe(1);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("modo automático: la semana antes de Black Friday el inicio abre con la sala de espera", async ({ page }) => {
  await setThemeMode(page, "auto");
  await page.clock.setFixedTime(new Date("2026-11-18T12:00:00-03:00"));
  await page.goto("");
  await expect(page.locator("[data-next-campaign='black-friday']")).toContainText("Sala de espera abierta · Black Friday · faltan 5 días");
  const slide = page.locator("[data-waiting-slide='black-friday']");
  await expect(slide.getByRole("heading", { level: 2, name: "Black Friday" })).toBeVisible();
  await expect(slide.getByRole("timer")).toHaveAttribute("aria-label", "Abre en 4 días, 12 horas y 0 minutos");
});

test("franja 'Próxima campaña': entre fechas en modo automático; nunca con una fecha en vivo ni en modo off", async ({ page }) => {
  await setThemeMode(page, "auto");
  await page.clock.setFixedTime(new Date("2026-11-11T12:00:00-03:00"));
  await page.goto("");
  const band = page.locator("[data-next-campaign]");
  await expect(band).toHaveText(/Se viene Black Friday · faltan 12 días/);
  await expect(page.locator("[data-theme-banner]")).toHaveCount(0);
  await band.click();
  await expect(page).toHaveURL(/campana\/\?id=black-friday$/);
  await expect(page.locator("[data-waiting-room='black-friday']")).toContainText("Próxima campaña");
  // Con el Día de la Madre en vivo, no hay franja (manda el drop).
  await page.clock.setFixedTime(new Date("2026-10-12T12:00:00-03:00"));
  await page.goto("");
  await expect(page.locator("[data-theme-banner='dia-de-la-madre']")).toBeVisible();
  await expect(band).toHaveCount(0);
  // Modo "off": nada de campañas.
  await page.goto("admin-demo/tematicas/");
  await page.getByLabel("Modo", { exact: true }).selectOption("off");
  await page.clock.setFixedTime(new Date("2026-11-11T12:00:00-03:00"));
  await page.goto("");
  await expect(page.getByRole("heading", { name: "Comprá por categoría" })).toBeVisible();
  await expect(band).toHaveCount(0);
});

test("pantalla de carga de campaña: discos de la fecha y marcador con el descuento debajo del logo, ~1,8 s", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await holdSplash(page);
  await previewTheme(page, "black-friday");
  await page.goto("");
  const splash = page.locator("#volta-splash");
  await expect(splash).toBeVisible();
  const score = splash.locator(".splash-score");
  await expect(score).toBeVisible();
  expect(await score.locator(".splash-score-name").evaluate((el) => getComputedStyle(el, "::before").content)).toBe('"Black Friday"');
  // El marcador cuenta hasta el descuento del cupón.
  await expect.poll(() => score.locator(".splash-score-off").evaluate((el) => getComputedStyle(el).getPropertyValue("--splash-count").trim())).toBe("30");
  // Nunca tapa el logo: va debajo de la barra.
  const mark = (await splash.locator(".splash-mark").boundingBox())!;
  const bar = (await splash.locator(".splash-bar").boundingBox())!;
  const box = (await score.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(bar.y + bar.height);
  expect(box.y).toBeGreaterThan(mark.y + mark.height);
  // Los discos toman el color de la fecha y el telón cae a los 1,55 s (termina a los 1,8 s).
  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--season-accent").trim());
  expect(await splash.locator(".splash-bar span").first().evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(await resolveColor(page, accent));
  expect(await splash.evaluate((el) => getComputedStyle(el).animationDelay)).toBe("1.55s");
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
});

test("pantalla de carga de campaña: sale sola cuando termina el telón", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await previewTheme(page, "hot-sale");
  await page.goto("", { waitUntil: "domcontentloaded" });
  const splash = page.locator("#volta-splash");
  await expect(splash).toBeVisible();
  await expect(splash).toBeHidden({ timeout: 5000 });
  await expect(page.locator("html")).toHaveClass(/splash-done/);
});

test("modo vitrina: recorre las 17 fechas sin recargar y al salir no deja nada", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("");
  await page.evaluate(() => { (window as unknown as { vitrinaMark: number }).vitrinaMark = 1; });
  // Sin recarga: la marca puesta en window sobrevive y la URL no cambia (Next puede reescribir el historial al hidratar).
  const url = page.url();
  const before = await page.evaluate(() => localStorage.getItem("volta-demo:theme-preview"));
  await page.getByRole("button", { name: "Probar temáticas" }).first().click();
  await page.getByRole("dialog", { name: "Probar temáticas" }).getByRole("button", { name: /Modo vitrina/ }).click();
  const bar = page.getByRole("region", { name: "Modo vitrina" });
  for (const [i, id] of CALENDAR.entries()) {
    await expect(bar).toContainText(`${i + 1} de 17`);
    await expect(page.locator("html")).toHaveAttribute("data-season", id);
    await expect(page.locator(`[data-theme-banner='${id}']`)).toBeVisible();
    await bar.getByRole("button", { name: "Fecha siguiente" }).click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-season", CALENDAR[0]);
  await bar.getByRole("button", { name: "Fecha anterior" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-season", CALENDAR.at(-1)!);
  await page.keyboard.press("Escape");
  await expect(bar).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-season", /.+/);
  await expect(page.locator("[data-theme-banner]")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("volta-demo:theme-preview"))).toBe(before);
  expect(await page.evaluate(() => (window as unknown as { vitrinaMark?: number }).vitrinaMark)).toBe(1);
  expect(page.url()).toBe(url);
  expect(await page.evaluate(() => performance.getEntriesByType("navigation").length)).toBe(1);
});

test("regla del tinte: con Black Friday la ficha, el carrito, el seguimiento y el club suman su ticket; la compra y los precios no cambian", async ({ page }) => {
  const shot = async () => {
    await page.goto("p/ionic-whey/");
    const sheet = { buy: await paintOf(page, "[data-buy-bar] button:has-text('Agregar al carrito')"), total: await paintOf(page, "[data-sheet-total]") };
    await page.locator("[data-buy-bar]").getByRole("button", { name: /Agregar al carrito/ }).click();
    await page.goto("carrito/");
    const cart = { pay: await paintOf(page, "[data-buy-bar] button:has-text('Ir a pagar')"), checkout: await paintOf(page, "button:has-text('Continuar al checkout')") };
    return { sheet, cart };
  };
  const base = await shot();
  await expect(page.locator("[data-season-ticket]")).toHaveCount(0);
  await previewTheme(page, "black-friday");
  const season = await shot();
  expect(season).toEqual(base);
  const accent = await resolveColor(page, "var(--season-accent)");
  for (const [path, where] of [["p/ionic-whey/", "ficha"], ["carrito/", "carrito"], ["pedido/demo-volta/", "seguimiento"], ["club/", "club"]] as const) {
    await page.goto(path);
    const ticket = page.locator(`[data-season-ticket='${where}']`);
    await expect(ticket, where).toBeVisible();
    expect(await ticket.locator("span").first().evaluate((el) => getComputedStyle(el).backgroundColor), where).toBe(accent);
  }
});
