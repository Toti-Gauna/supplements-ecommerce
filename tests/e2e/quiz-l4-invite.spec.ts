import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";
import { holdSplash } from "./splash-helpers";

/** L4 · invitación al quiz en la primera visita (celular, 375 px). El quiz y "Tu programa" van en quiz-l4.spec.ts. */
const origin = `http://localhost:${Number(process.env.E2E_PORT ?? 4173)}`;
const KEY = "volta-quiz-invite";
const invite = (page: Page) => page.getByRole("dialog", { name: "¿Armamos tu rutina en 1 minuto?" });
const stored = (page: Page) => page.evaluate((k) => localStorage.getItem(k), KEY);

test.describe("invitación al quiz (primera visita, sin nada guardado)", () => {
  // Sin la marca de "vista" que el resto de los tests trae de playwright.config.ts (la temática sigue en Original).
  test.use({ storageState: { cookies: [], origins: [{ origin, localStorage: [
    { name: "volta-demo:theme-preview", value: JSON.stringify({ state: { previewId: "original" }, version: 0 }) },
  ] }] } });

  test("sale una sola vez: foco adentro, “Ahora no” la cierra y no vuelve ni al recargar ni en otra página", async ({ page }) => {
    const assertNoExternal = guardNetwork(page);
    await page.goto("");
    const dialog = invite(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Contestá 5 preguntas y te recomendamos qué suplementos y qué equipamiento te sirven para tu objetivo o tu deporte. Sin registrarte.")).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Hacer el quiz" })).toBeFocused();
    // El foco queda atrapado: con Tab da la vuelta dentro del modal.
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await dialog.getByRole("button", { name: "Ahora no" }).click();
    await expect(dialog).toHaveCount(0);
    expect(await stored(page)).toBe("no");
    await page.reload();
    await expect(page.locator("main")).toBeVisible();
    await page.waitForTimeout(800);
    await expect(invite(page)).toHaveCount(0);
    await page.goto("packs/");
    await expect(page.getByRole("heading", { level: 1, name: "Packs" })).toBeVisible();
    await page.waitForTimeout(500);
    await expect(invite(page)).toHaveCount(0);
    assertNoExternal();
  });

  test("Escape es “Ahora no”", async ({ page }) => {
    await page.goto("packs/");
    await expect(invite(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(invite(page)).toHaveCount(0);
    expect(await stored(page)).toBe("no");
  });

  test("“Hacer el quiz” lleva al quiz y no vuelve a invitar", async ({ page }) => {
    await page.goto("p/overvolt-pre/");
    await invite(page).getByRole("link", { name: "Hacer el quiz" }).click();
    await expect(page).toHaveURL(/crear\/quiz\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "¿Qué necesitás?" })).toBeVisible();
    await expect(invite(page)).toHaveCount(0);
    expect(await stored(page)).toBe("quiz");
  });

  test("no aparece en el quiz ni en el checkout", async ({ page }) => {
    for (const path of ["crear/quiz/", "checkout/"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await page.waitForTimeout(600);
      await expect(invite(page)).toHaveCount(0);
    }
    expect(await stored(page)).toBeNull();
  });

  test.describe("con la pantalla de carga", () => {
    test("espera a que se retire la pantalla de carga", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await holdSplash(page);
      await page.goto("");
      await expect(page.locator("#volta-splash")).toBeVisible();
      await page.waitForTimeout(1500);
      await expect(invite(page)).toHaveCount(0);
      // Escape retira la pantalla de carga (y nada más): recién ahí invita.
      await page.keyboard.press("Escape");
      await expect(page.locator("#volta-splash")).toBeHidden();
      await expect(invite(page)).toBeVisible();
    });
  });
});
