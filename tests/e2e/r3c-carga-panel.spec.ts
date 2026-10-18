import { expect, test } from "@playwright/test";
import { readySplashScene } from "../../src/demo/engine/splash-scenes";
import type { SeasonId } from "../../src/demo/types";

/** R3c · La pantalla de carga de cada fecha sin recargar: desde el modo vitrina y desde el editor de Campañas. */
test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "no-preference" }); });

test("modo vitrina: \"Pantalla de carga\" pasa la de la fecha a la vista, sin recargar", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("");
  const splash = page.locator("#volta-splash");
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  await page.evaluate(() => { (window as unknown as { vitrinaMark: number }).vitrinaMark = 1; });
  await page.getByRole("button", { name: "Probar temáticas" }).first().click();
  await page.getByRole("dialog", { name: "Probar temáticas" }).getByRole("button", { name: /Modo vitrina/ }).click();
  const bar = page.getByRole("region", { name: "Modo vitrina" });
  await bar.getByRole("button", { name: "Pausar la vitrina" }).click();
  for (let i = 0; i < 17 && (await page.locator("html").getAttribute("data-season")) !== "hot-sale"; i++) {
    await bar.getByRole("button", { name: "Fecha siguiente" }).click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-season", "hot-sale");
  await bar.getByRole("button", { name: "Ver la pantalla de carga de esta fecha" }).click();
  await expect(splash).toBeVisible();
  await expect(splash.locator(".splash-stage[data-scene='hot-sale']")).toBeVisible();
  expect(await splash.locator(".splash-stage .s4").evaluate((el) => getComputedStyle(el, "::before").animationName)).toBe("hs-needle");
  // Se retira sola al terminar el telón y la vitrina sigue en su fecha, sin recargar.
  await expect(splash).toBeHidden({ timeout: 5000 });
  await expect(bar).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-season", "hot-sale");
  // La fecha siguiente pasa su escena propia (o, si todavía no la tiene, su variante de campaña).
  await bar.getByRole("button", { name: "Fecha siguiente" }).click();
  const next = (await page.locator("html").getAttribute("data-season")) as SeasonId;
  await bar.getByRole("button", { name: "Ver la pantalla de carga de esta fecha" }).click();
  await expect(splash).toBeVisible();
  if (readySplashScene(next)) await expect(splash.locator(`.splash-stage[data-scene='${next}']`)).toBeVisible();
  else await expect(splash.locator(".splash-barbell")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  await expect(bar).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { vitrinaMark?: number }).vitrinaMark)).toBe(1);
  expect(await page.evaluate(() => performance.getEntriesByType("navigation").length)).toBe(1);
});

test("editor de Campañas: vista previa de la pantalla de carga con Repetir y Pantalla completa sobre el panel", async ({ page }) => {
  await page.goto("admin-demo/campanas/editar/?id=navidad");
  const splash = page.locator("#volta-splash");
  await page.keyboard.press("Escape");
  await expect(splash).toBeHidden();
  const card = page.locator("[data-splash-preview='navidad']");
  await expect(card.getByRole("heading", { name: "Pantalla de carga" })).toBeVisible();
  const stage = card.locator(".splash-stage[data-scene='navidad']");
  await expect(stage).toBeVisible();
  expect(await stage.locator(".s7").evaluate((el) => getComputedStyle(el, "::before").backgroundImage)).toContain("/splash/navidad/7.svg");
  expect(await stage.locator(".splash-odo b").nth(2).evaluate((el) => getComputedStyle(el).getPropertyValue("--d").trim())).toBe("5");
  await card.getByRole("button", { name: "Repetir" }).click();
  await expect(card.locator(".splash-stage[data-scene='navidad']")).toBeVisible();
  await card.getByRole("button", { name: "Pantalla completa" }).click();
  await expect(splash).toBeVisible();
  await expect(splash.locator(".splash-stage[data-scene='navidad']")).toBeVisible();
  await expect(splash).toBeHidden({ timeout: 5000 });
  // Una fecha sin escena propia: lo dice y muestra su variante de campaña a pantalla completa.
  await page.goto("admin-demo/campanas/editar/?id=halloween");
  await page.keyboard.press("Escape");
  const pending = page.locator("[data-splash-preview='halloween']");
  await expect(pending).toContainText("Escena propia en preparación");
  await pending.getByRole("button", { name: "Pantalla completa" }).click();
  await expect(splash).toBeVisible();
  await expect(splash.locator(".splash-barbell")).toBeVisible();
  await expect(splash.locator(".splash-score-name")).toBeVisible();
});

test("con reducir movimiento el editor muestra el cuadro final y no ofrece la pantalla completa", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("admin-demo/campanas/editar/?id=black-friday");
  const card = page.locator("[data-splash-preview='black-friday']");
  await expect(card.locator(".splash-stage[data-scene='black-friday']")).toBeVisible();
  await expect(card.getByRole("button", { name: "Pantalla completa" })).toBeDisabled();
  await expect(card.getByRole("button", { name: "Repetir" })).toHaveCount(0);
  // Cuadro final: la persiana ya subió.
  expect(await card.locator(".s3").evaluate((el) => getComputedStyle(el, "::before").transform)).not.toBe("none");
});
