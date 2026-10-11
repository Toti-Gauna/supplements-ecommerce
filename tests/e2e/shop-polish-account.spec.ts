import { expect, test } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/** Polish 8.2 · Lote 6 (8.2.12 y pedido de Ignacio): ingreso premium de demostración y Mi cuenta por tarjetas. */

test("8.2.12 ingreso y registro: validación, estado de envío y la contraseña no se guarda ni se envía", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("cuenta/");
  const login = page.getByRole("button", { name: "Iniciar sesión", exact: true }).first();
  const signup = page.getByRole("group", { name: "Ingresar o crear cuenta" }).getByRole("button", { name: "Crear cuenta" });
  await expect(login).toHaveAttribute("aria-pressed", "true");
  // Vacío: avisa qué falta, campo por campo.
  await page.locator("form").getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("Escribí tu email.")).toBeVisible();
  await expect(page.getByText("Escribí una contraseña.")).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Email").fill("juana@");
  await expect(page.getByText("Escribí tu email.")).toHaveCount(0);
  await page.locator("form").getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("Ese email no parece válido.")).toBeVisible();
  // Crear cuenta pide nombre y una contraseña más larga.
  await signup.click();
  await expect(signup).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Email").fill("juana@ejemplo.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("corta");
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page.getByText("Escribí tu nombre.")).toBeVisible();
  await expect(page.getByText("Usá al menos 8 caracteres.")).toBeVisible();
  await page.getByLabel("Nombre").fill("Juana Pérez");
  await page.getByLabel("Contraseña", { exact: true }).fill("una-clave-de-prueba");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page.getByRole("button", { name: "Entrando…" })).toBeDisabled();
  await expect(page.getByText("Hola, Juana")).toBeVisible();
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(stored).toContain("juana@ejemplo.com");
  expect(stored).not.toContain("una-clave-de-prueba");
  assertNoExternal();
});

test("8.2.12 Continuar con Google es una simulación explícita y entra con la cuenta de ejemplo", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("cuenta/");
  const google = page.getByRole("button", { name: /Continuar con Google/ });
  await expect(google).toContainText("Simulado");
  await google.click();
  const sim = page.getByRole("region", { name: "Simulación de Google" });
  await expect(sim).toContainText("no se conecta con Google ni se comparte ningún dato");
  await sim.getByRole("button", { name: /Sofía Demo/ }).click();
  await expect(page.getByText("Hola, Sofía")).toBeVisible();
  assertNoExternal();
});

for (const [width, height] of [[1180, 820], [820, 1180], [390, 844]] as const) {
  test(`Mi cuenta por tarjetas a ${width}×${height}: una sección a la vez, con el hash y sin desbordes`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("cuenta/");
    await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click();
    const nav = page.getByRole("navigation", { name: "Secciones de la cuenta" });
    await expect(nav.getByRole("link")).toHaveCount(5);
    await expect(nav.getByRole("link", { name: /^Mis pedidos/ })).toHaveAttribute("aria-current", "true");
    await expect(page.getByRole("heading", { level: 2, name: "Mis pedidos" })).toBeVisible();
    for (const [tile, check] of [["Mis regalos", /de Lucía/], ["Misiones", /Comprá 2 productos/], ["Premios", "Grabado de nombre gratis"], ["Direcciones", "Casa"]] as const) {
      await nav.getByRole("link", { name: new RegExp(`^${tile}`) }).click();
      const panel = page.locator("#cuenta-seccion");
      await expect(panel.getByRole("heading", { level: 2, name: tile })).toBeVisible();
      await expect(panel.getByText(check).first()).toBeVisible();
      // Una sola sección a la vez: lo de las otras tarjetas no está en la página.
      await expect(page.locator("main").getByRole("heading", { level: 2 })).toHaveCount(1);
      // La sección elegida queda a la vista (en el celular se acerca sola).
      const box = (await panel.boundingBox())!;
      expect(box.y).toBeLessThan(height * 0.6);
    }
    expect(page.url()).toMatch(/#direcciones$/);
    await page.reload();
    await expect(page.getByRole("heading", { level: 2, name: "Direcciones" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}
