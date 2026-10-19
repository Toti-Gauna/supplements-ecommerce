import { expect, test, type Page } from "@playwright/test";

/**
 * Aviso del trailer (pedido de Ignacio): después de la pantalla de carga, "Tenemos algo para ti…" con "Ver trailer" y
 * "No por ahora". En cada carga de la página; la invitación al quiz sale después ("No por ahora" o al volver del trailer).
 */
const origin = `http://localhost:${process.env.E2E_PORT ?? 4173}`;
const invite = (page: Page) => page.getByRole("dialog", { name: "Tenemos algo para ti…" });

test.describe("aviso del trailer (sesión nueva)", () => {
  test.use({ storageState: { cookies: [], origins: [{ origin, localStorage: [
    { name: "volta-demo:theme-preview", value: JSON.stringify({ state: { previewId: "original" }, version: 0 }) },
    { name: "volta-quiz-invite", value: "seen" },
  ] }] } });

  test("sale después de la carga; “No por ahora” lo cierra y al recargar vuelve a salir", async ({ page }) => {
    await page.goto("");
    await expect(invite(page)).toBeVisible();
    await expect(invite(page)).toContainText("Tenemos algo para ti…");
    await expect(invite(page).getByRole("link", { name: "Ver trailer" })).toBeFocused();
    await invite(page).getByRole("button", { name: "No por ahora" }).click();
    await expect(invite(page)).toHaveCount(0);
    await page.waitForTimeout(400);
    await expect(invite(page)).toHaveCount(0);
    await page.reload();
    await expect(invite(page)).toBeVisible();
  });

  test("“Ver trailer” abre la pieza más nueva (T1)", async ({ page }) => {
    await page.goto("");
    await invite(page).getByRole("link", { name: "Ver trailer" }).click();
    await expect(page).toHaveURL(/trailer\/t1\/$/);
    await page.waitForFunction(() => window.__trailer?.ready === true);
    await expect(page.locator("[data-trailer-controls]")).toBeVisible();
  });

  test("no sale en el panel ni en la compra", async ({ page }) => {
    for (const route of ["admin-demo/", "checkout/"]) {
      await page.goto(route);
      await page.waitForTimeout(400);
      await expect(invite(page)).toHaveCount(0);
    }
  });
});

test.describe("aviso del trailer y después el quiz", () => {
  test.use({ storageState: { cookies: [], origins: [{ origin, localStorage: [
    { name: "volta-demo:theme-preview", value: JSON.stringify({ state: { previewId: "original" }, version: 0 }) },
  ] }] } });
  const quiz = (page: Page) => page.getByRole("dialog", { name: "¿Armamos tu rutina en 1 minuto?" });

  test("“No por ahora” abre enseguida la invitación al quiz (nunca los dos juntos)", async ({ page }) => {
    await page.goto("");
    await expect(invite(page)).toBeVisible();
    await expect(quiz(page)).toHaveCount(0);
    await invite(page).getByRole("button", { name: "No por ahora" }).click();
    await expect(invite(page)).toHaveCount(0);
    await expect(quiz(page)).toBeVisible();
  });

  test("al volver del trailer aparece la invitación al quiz", async ({ page }) => {
    await page.goto("");
    await invite(page).getByRole("link", { name: "Ver trailer" }).click();
    await expect(page).toHaveURL(/trailer\/t1\/$/);
    await page.goBack();
    await expect(quiz(page)).toBeVisible();
    await expect(invite(page)).toHaveCount(0);
  });
});
