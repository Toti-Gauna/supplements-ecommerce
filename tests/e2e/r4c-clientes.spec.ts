import { expect, test, type Page } from "@playwright/test";
import { guardNetwork, horizontalOverflow } from "./helpers";

/**
 * R4c · Clientes: a quién escribirle hoy (calculado por servicios) con el mensaje armado y el link de recompra que carga
 * el bolso, y el regalo de cumpleaños (ficha y "Hoy"). El link se abre de verdad, con el basePath de Pages.
 */
const toast = (page: Page, text: string | RegExp) => page.getByRole("status").filter({ hasText: text }).first();
const profile = (email: string) => `admin-demo/usuarios/ficha/?email=${encodeURIComponent(email)}`;

/** El texto del mensaje de un link de WhatsApp (wa.me/…?text=…). */
const waText = (href: string) => new URL(href).searchParams.get("text") ?? "";
/** El primer link http(s) que aparece en el mensaje. */
const linkIn = (text: string) => text.match(/https?:\/\/\S+/)![0].replace(/[.,]$/, "");

test("Clientes dice a quién escribirle hoy, con el mensaje armado y el link wa.me", async ({ page }) => {
  const noExternal = guardNetwork(page);
  await page.goto("admin-demo/usuarios/");
  const panel = page.getByRole("region", { name: "A quién escribirle hoy" });
  await expect(panel).toBeVisible();
  const first = panel.locator("[data-write]").first();
  await expect(first).toContainText(/se (te )?termin|terminó/i);
  await expect(first).toContainText("Te dejé el bolso armado con lo mismo");
  const wa = first.getByRole("link", { name: /^WhatsApp a / });
  const href = (await wa.getAttribute("href"))!;
  expect(href).toMatch(/^https:\/\/wa\.me\/549223555\d+\?text=/);
  expect(waText(href)).toContain("/recompra/?bolso=");
  await panel.getByRole("button", { name: /Ver las \d+ personas/ }).click();
  expect(await panel.locator("[data-write]").count()).toBeGreaterThan(3);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  noExternal();
});

test("el link de recompra abre la tienda con el bolso cargado, con el basePath de Pages", async ({ page }) => {
  await page.goto("admin-demo/usuarios/");
  const card = page.locator("[data-write]").first();
  const name = (await card.getByRole("link").first().textContent())!;
  const link = linkIn(waText((await card.getByRole("link", { name: /^WhatsApp a / }).getAttribute("href"))!));
  // El link sale con el mismo prefijo con el que se sirve la demo.
  const base = new URL(page.url()).pathname.split("/admin-demo/")[0]!;
  expect(new URL(link).pathname.startsWith(`${base}/recompra/`)).toBe(true);
  await page.evaluate(() => localStorage.removeItem("volta-demo:cart"));
  await page.goto(link);
  await expect(page).toHaveURL(/\/carrito\/$/);
  await expect(toast(page, "Tu bolso está armado")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Tu carrito" })).toBeVisible();
  // Lo mismo que compró (el nombre de la persona viene del panel; los productos, del pedido).
  expect(name.length).toBeGreaterThan(0);
  const products = new URL(link).searchParams.get("bolso")!.split(",").map((p) => p.split(".")[0]!);
  expect(products.length).toBeGreaterThan(0);
  await expect(page.locator("main").getByRole("listitem").first()).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("volta-demo:cart") ?? "{}").state.lines as { productSlug: string; quantity: number }[]);
  expect(stored.map((l) => l.productSlug).sort()).toEqual(products.sort());
  expect(stored.every((l) => l.quantity >= 1)).toBe(true);
});

test("un link de recompra que ya no sirve avisa y no deja el bolso a medias", async ({ page }) => {
  await page.goto("recompra/?bolso=producto-que-no-existe.x.1");
  await expect(page.getByText("Este link no tiene productos disponibles")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ir a la tienda" })).toBeVisible();
  await page.goto("recompra/");
  await expect(page.getByText("Este link no tiene productos disponibles")).toBeVisible();
  const lines = await page.evaluate(() => JSON.parse(localStorage.getItem("volta-demo:cart") ?? '{"state":{"lines":[]}}').state.lines.length);
  expect(lines).toBe(0);
});

test("avisar por WhatsApp desde Clientes anota el aviso y saca a la persona de la lista", async ({ page }) => {
  await page.goto("admin-demo/usuarios/");
  const panel = page.getByRole("region", { name: "A quién escribirle hoy" });
  const card = panel.locator("[data-write]").first();
  const email = (await card.getAttribute("data-write"))!;
  const before = await panel.locator("[data-write]").count();
  // El clic abre WhatsApp en otra pestaña (no hay red en el test): se frena la navegación.
  await page.route("https://wa.me/**", (route) => route.abort());
  await card.getByRole("link", { name: /^WhatsApp a / }).click();
  await expect(toast(page, "WhatsApp listo para mandar")).toBeVisible();
  await expect(panel.locator(`[data-write='${email}']`)).toHaveCount(0);
  await page.goto(profile(email));
  await expect(page.getByText(/Avisado por WhatsApp/).first()).toBeVisible();
  expect(before).toBeGreaterThan(0);
});

test("regalo de cumpleaños: la ficha lo arma con un toque y deja el mensaje con el link", async ({ page }) => {
  await page.goto(profile("tomas.h@ejemplo.com"));
  const box = page.locator("[data-birthday-gift]");
  await expect(box).toContainText("Cumple hoy (lunes 5 de octubre)");
  await box.getByRole("button", { name: "Mandarle el regalo de cumpleaños" }).click();
  const dialog = page.getByRole("dialog", { name: "Armar el regalo de cumpleaños" });
  await expect(dialog).toContainText(/gift card de la casa de\s+\$\s10\.000/);
  await dialog.getByRole("button", { name: "Sí, armar el regalo" }).click();
  await expect(toast(page, "Regalo de cumpleaños armado")).toBeVisible();
  await expect(box).toContainText("Regalo armado: gift card de $ 10.000");
  await expect(box.getByRole("button", { name: "Mandarle el regalo de cumpleaños" })).toHaveCount(0);
  const wa = box.getByRole("link", { name: /WhatsApp con el regalo de cumpleaños/ });
  const href = (await wa.getAttribute("href"))!;
  expect(href).toMatch(/^https:\/\/wa\.me\/549223555\d+\?text=/);
  const text = waText(href);
  expect(text).toContain("¡Feliz cumple, Tomás!");
  const link = linkIn(text);
  expect(new URL(link).pathname).toMatch(/\/regalo\/$/);
  // Está en Promos → Regalos, como cualquier gift card, y sale de "Hoy".
  const code = (await box.textContent())!.match(/REGALO-[A-Z0-9-]+/)![0];
  await page.goto(`admin-demo/regalos/?ver=regalos&q=${code}`);
  await expect(page.getByText(/Gift card de \$\s10\.000/).first()).toBeVisible();
  await page.goto("admin-demo/");
  await expect(page.locator("[data-action='birthday:tomas.h@ejemplo.com']")).toHaveCount(0);
  await expect(page.locator("[data-action='birthday:flor.m@ejemplo.com']")).toBeVisible();
  // El link abre el regalo (sin pedido ni pago).
  await page.goto(link);
  await expect(page).toHaveURL(/\/regalo\/\?g=/);
  await expect(page.getByText("No pudimos abrir ese regalo")).toHaveCount(0);
});

test("el cumpleaños aparece en Hoy en su día y la ficha avisa cuánto falta", async ({ page }) => {
  await page.goto("admin-demo/");
  const today = page.locator("[data-action='birthday:tomas.h@ejemplo.com']");
  await expect(today).toContainText("Tomás Herrera cumple años hoy");
  await expect(today).toContainText("gift card de $ 10.000");
  const soon = page.locator("[data-action='birthday:flor.m@ejemplo.com']");
  await expect(soon).toContainText("cumple años en 3 días");
  await soon.getByRole("link", { name: "Mandarle el regalo" }).click();
  await expect(page).toHaveURL(/usuarios\/ficha\/\?email=flor\.m%40ejemplo\.com/);
  await expect(page.locator("[data-birthday-gift]")).toContainText("Cumple en 3 días");
  await expect(page.locator("[data-birthday-gift]").getByRole("button", { name: "Mandarle el regalo de cumpleaños" })).toBeVisible();
  // Lejos del cumpleaños no se ofrece todavía.
  await page.goto(profile("lucia.f@ejemplo.com"));
  await expect(page.locator("[data-birthday-gift]")).toContainText("El regalo se puede armar desde 7 días antes");
  await expect(page.getByRole("button", { name: "Mandarle el regalo de cumpleaños" })).toHaveCount(0);
});

for (const [label, width, height] of [["escritorio", 1440, 900], ["celular", 375, 812]] as const) {
  test(`a ${width} px (${label}): Clientes y la ficha con el regalo sin desborde`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("admin-demo/usuarios/");
    await expect(page.getByRole("region", { name: "A quién escribirle hoy" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await page.goto(profile("tomas.h@ejemplo.com"));
    await expect(page.locator("[data-birthday-gift]")).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
}
