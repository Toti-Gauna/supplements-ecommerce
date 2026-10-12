import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * Fase 6 · Clientes y recompra: la ficha dice cuándo se le termina cada pote, "Avisarle" deja el email de recompra en
 * la bandeja (una sola vez) y el segmento "Se le termina esta semana" junta a quién escribirle. Celular y escritorio.
 */

const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text });

for (const [label, width, height, touch] of [["celular", 390, 844, true], ["escritorio", 1440, 900, false]] as const) {
  test.describe(label, () => {
    test.use({ viewport: { width, height }, isMobile: touch, hasTouch: touch });
    // Con mouse, lejos de la barra lateral (se abre al pasar por encima).
    test.beforeEach(async ({ page }) => { if (!touch) await page.mouse.move(width - 20, 500); });

    test("ficha: a Juan se le termina la whey el jueves; Avisarle deja el email en la bandeja y no se repite", async ({ page }) => {
      const assertNoExternal = guardNetwork(page);
      await page.goto("admin-demo/usuarios/ficha/?email=juan.i@ejemplo.com");
      await expect(page.getByRole("heading", { level: 1, name: /Juan Ibarra/ })).toBeVisible();
      await expect(page.getByLabel("Objetivo", { exact: true })).toHaveValue("masa-muscular");
      const whey = page.getByRole("region", { name: "Se le termina" }).getByRole("listitem").filter({ hasText: "Ionic Whey 100%" });
      await expect(whey).toContainText("Se le termina el jueves 8 de octubre (en 4 días)");
      await expect(whey.getByRole("progressbar", { name: /Le queda cerca del 13 %/ })).toBeVisible();
      // El WhatsApp va al celular del cliente con el mensaje escrito (no se abre en el test: es un sitio externo).
      const whatsapp = whey.getByRole("link", { name: /WhatsApp a Juan Ibarra/ });
      await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/5492235550103\?text=.*jueves%208%20de%20octubre/);
      await whey.getByRole("button", { name: /Avisarle por email/ }).click();
      await expect(toast(page, "Email de recompra en la bandeja de salida")).toBeVisible();
      await expect(whey).toContainText("Avisado por email");
      await expect(whey.getByRole("button", { name: /Avisarle/ })).toHaveCount(0);
      await expect(whey.getByRole("link", { name: /WhatsApp/ })).toHaveCount(0);
      // Lo que se termina más adelante no se puede avisar todavía.
      await expect(page.getByRole("region", { name: "Se le termina" }).getByRole("listitem").filter({ hasText: "Creatina monohidrato" })).toContainText("Avisale desde el");
      await page.reload();
      await expect(whey).toContainText("Avisado por email");
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
      await page.goto("admin-demo/emails/enviados/");
      const outbox = page.getByRole("region", { name: "Bandeja de salida" });
      await expect(outbox.getByRole("button", { name: /Juan, tu Ionic Whey 100% se está por terminar/ })).toHaveCount(1);
      assertNoExternal();
    });

    test("segmento “Se le termina esta semana”: a quién avisarle y con qué; abre la ficha", async ({ page }) => {
      await page.goto("admin-demo/usuarios/");
      await expect(page.getByRole("searchbox")).toBeVisible();
      const more = page.getByRole("button", { name: /Más filtros/ });
      if (await more.isVisible()) await more.click();
      await page.getByRole("combobox", { name: "Segmento" }).selectOption("semana");
      await expect(page).toHaveURL(/segmento=semana/);
      const list = page.getByRole("region", { name: "Clientes" });
      for (const name of ["Juan Ibarra", "Florencia Medina", "Nicolás Romero", "Tomás Herrera"]) await expect(list.getByText(name).filter({ visible: true }).first()).toBeVisible();
      for (const name of ["Valentina Sosa", "Paula Castro", "Diego Álvarez"]) await expect(list.getByText(name)).toHaveCount(0);
      const juan = touch ? list.getByRole("button", { name: /Juan Ibarra/ }) : list.getByRole("row").filter({ hasText: "Juan Ibarra" });
      await expect(juan).toContainText(touch ? "Se le termina el jueves 8 de octubre: Ionic Whey 100%" : "jue, 8 oct");
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
      await (touch ? juan : juan.getByRole("cell").nth(2)).click();
      await expect(page.getByRole("heading", { level: 1, name: /Juan Ibarra/ })).toBeVisible();
    });
  });
}
