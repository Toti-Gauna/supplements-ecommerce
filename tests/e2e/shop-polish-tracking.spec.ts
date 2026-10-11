import { expect, test, type Page } from "@playwright/test";

/** Polish 8.2 · Lote 6 (8.2.11): seguimiento con el viajero de la temática y zona para probar los estados. */
const preview = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);

const STATES = [
  ["Esperando comprobante", "Esperando tu comprobante"],
  ["En producción", "En producción"],
  ["Listo", "Listo"],
  ["En camino", "En camino"],
  ["Entregado", "Entregado"],
] as const;

test("8.2.11 Original: los cinco estados se prueban, cambian la vista y la entrega se ve clara", async ({ page }) => {
  await page.goto("pedido/demo-volta/");
  const zone = page.getByRole("region", { name: "Probá los estados del pedido — Demostración" });
  await expect(zone).toBeVisible();
  await expect(zone.getByText("Solo cambia esta vista")).toBeVisible();
  const map = page.getByRole("img", { name: /del camino entre el taller y tu casa|llegó a tu casa/ });
  // Original conserva el seguimiento de siempre: el punto dorado, sin viajero.
  await expect(page.locator("[data-trk-traveler]")).toHaveCount(0);
  for (const [label, title] of STATES) {
    await zone.getByText(label, { exact: true }).click();
    await expect(zone.getByRole("radio", { name: label })).toBeChecked();
    await expect(page.getByRole("heading", { level: 2, name: title, exact: true })).toBeVisible();
  }
  // Entregado: el chip de la casa lo dice y todas las etapas quedan hechas.
  await expect(map).toHaveAttribute("aria-label", /llegó a tu casa/);
  await expect(page.getByText("Llegó a tu casa", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Etapas del pedido" }).locator("[aria-current=step]")).toHaveCount(0);
  await zone.getByText("En camino", { exact: true }).click();
  await expect(page.getByText("Llegó a tu casa", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Etapas del pedido" }).locator("[aria-current=step]")).toContainText("Enviado");
});

for (const [id, who] of [["navidad", "Papá Noel en su trineo"], ["halloween", "una bruja en su escoba"], ["dia-del-padre", /Lola|Pancho/], ["san-valentin", "una carta de amor"], ["pascuas", "un huevo de Pascua"], ["dia-de-la-independencia", "la bandera"]] as const) {
  test(`8.2.11 temática ${id}: el pedido lo lleva su personaje`, async ({ page }) => {
    await preview(page, id);
    await page.goto("pedido/demo-volta/");
    const traveler = page.locator("[data-trk-traveler]");
    await expect(traveler).toHaveCount(1);
    await expect(traveler).toHaveAttribute("data-trk-traveler", who);
    await expect(page.getByRole("img", { name: /lleva el pedido/ })).toBeVisible();
  });
}

test("8.2.11 con movimiento: el viajero avanza por el recorrido y al entregar estalla la temática junto a tu casa", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await preview(page, "navidad");
  await page.goto("pedido/demo-volta/");
  await page.keyboard.press("Escape");
  const traveler = page.locator("[data-trk-traveler]");
  const x = async () => (await traveler.boundingBox())!.x;
  const zone = page.getByRole("region", { name: /Probá los estados/ });
  await zone.getByText("Esperando comprobante", { exact: true }).click();
  await page.waitForTimeout(1900);
  const start = await x();
  await zone.getByText("Entregado", { exact: true }).click();
  await expect(page.locator("[data-trk-burst]")).toHaveCount(1);
  await page.waitForTimeout(1900);
  expect(await x()).toBeGreaterThan(start + 100);
});

test("8.2.11 con movimiento reducido: todo queda en su lugar y no hay estallido", async ({ page }) => {
  await preview(page, "navidad");
  await page.goto("pedido/demo-volta/");
  await page.getByRole("region", { name: /Probá los estados/ }).getByText("Entregado", { exact: true }).click();
  await expect(page.getByText("Llegó a tu casa", { exact: true })).toBeVisible();
  await expect(page.locator("[data-trk-burst]")).toHaveCount(0);
});
