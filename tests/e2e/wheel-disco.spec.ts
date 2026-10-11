import { expect, test, type Locator, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Fase 4 · Ruleta "Disco olímpico": disco de pesas, luces, pausa al frenar, premios de suplementos y accesibilidad. */

const LABELS = ["5% OFF", "Envío gratis", "Muestra de regalo", "10% OFF", "$3.000 OFF", "Shaker VOLTA de regalo", "15% OFF", "Envío gratis"];
const DISC = "Ruleta: tocala o arrastrala para girar";

/** Gajo bajo el puntero para una rotación (la misma cuenta que `segmentAt` del engine). */
const underPointer = (deg: number) => {
  const m = (a: number) => ((a % 360) + 360) % 360;
  return LABELS[Math.floor(m(360 - m(deg)) / 45) % 8]!;
};
const rotation = async (stage: Locator) => {
  const style = (await stage.getByRole("button", { name: /^Ruleta/ }).getAttribute("style")) ?? "";
  return Number(/rotate\((-?[\d.]+)deg\)/.exec(style)?.[1] ?? 0);
};

/** El club con la animación encendida (la pantalla de carga ya pasó con "reducir movimiento"). */
async function openWithMotion(page: Page) {
  await page.goto("club/");
  await expect(page.getByRole("button", { name: "Girar la ruleta" })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Girar la ruleta" }).click();
  return page.getByRole("dialog", { name: "Ruleta de cupones" });
}

test("disco olímpico: nombre y premios para el lector, foco atrapado, Escape y sin desborde", async ({ page }) => {
  await page.goto("club/");
  const open = page.getByRole("button", { name: "Girar la ruleta" });
  await open.focus();
  await page.keyboard.press("Enter");
  const stage = page.getByRole("dialog", { name: "Ruleta de cupones" });
  const disc = stage.getByRole("button", { name: DISC });
  await expect(disc).toBeVisible();
  await expect(disc).toHaveAccessibleDescription("Premios posibles: 5% OFF, Envío gratis, Muestra de regalo, 10% OFF, $3.000 OFF, Shaker VOLTA de regalo, 15% OFF.");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  // Tab recorre solo el escenario (Salir, el disco y la maza "Girar") y no se escapa a la página de atrás.
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(await stage.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(stage).toBeHidden();
  await expect(open).toBeFocused();
});

test("disco olímpico: con animación, las luces corren, el gajo ganador queda bajo el puntero y después aparece el cupón", async ({ page }) => {
  const stage = await openWithMotion(page);
  await expect(stage.locator(".led-chase")).toHaveCount(0);
  await stage.getByRole("button", { name: "Girar la ruleta" }).click();
  await expect(stage.getByText("Girando…").first()).toBeVisible();
  await expect(stage.locator(".led-chase").first()).toBeAttached();
  // Mientras gira no se puede salir (ni con Escape).
  await expect(stage.getByRole("button", { name: "Salir" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(stage).toBeVisible();
  // Al frenar: el premio se anuncia, las luces titilan y el gajo bajo el puntero es el premio sorteado.
  const landed = stage.getByText(/^¡Te tocó /);
  await expect(landed).toBeVisible({ timeout: 12_000 });
  await expect(stage.locator(".led-win").first()).toBeAttached();
  await expect(stage.locator(".wheel-landed")).toHaveCount(1);
  const label = (await landed.textContent())!.replace(/^¡Te tocó /, "").replace(/!$/, "");
  expect(underPointer(await rotation(stage))).toBe(label);
  await expect(stage.locator("[aria-live=polite]")).toHaveText(`Te tocó: ${label}`);
  // Después de la pausa, el cupón con el foco en "Aplicar ahora".
  await expect(stage.getByText("¡Ganaste!")).toBeVisible({ timeout: 4_000 });
  await expect(stage.getByRole("heading", { name: label })).toBeVisible();
  await expect(stage.getByRole("button", { name: "Aplicar ahora" })).toBeFocused();
});

test("disco olímpico: un empujón hacia la izquierda lo gira en contra del reloj y frena en el premio", async ({ page }) => {
  const stage = await openWithMotion(page);
  const disc = stage.getByRole("button", { name: DISC });
  const box = (await disc.boundingBox())!;
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy - box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(cx - box.width * 0.3, cy - box.height * 0.3, { steps: 3 });
  await page.mouse.move(cx - box.width * 0.4, cy, { steps: 3 });
  await page.mouse.up();
  const landed = stage.getByText(/^¡Te tocó /);
  await expect(landed).toBeVisible({ timeout: 12_000 });
  const deg = await rotation(stage);
  expect(deg).toBeLessThan(-360);
  expect(underPointer(deg)).toBe((await landed.textContent())!.replace(/^¡Te tocó /, "").replace(/!$/, ""));
});

test("disco olímpico: con movimiento reducido no hay pausa ni giro largo", async ({ page }) => {
  await page.goto("club/");
  await page.getByRole("button", { name: "Girar la ruleta" }).click();
  const stage = page.getByRole("dialog", { name: "Ruleta de cupones" });
  const started = Date.now();
  await stage.getByRole("button", { name: "Girar la ruleta" }).click();
  await expect(stage.getByText("¡Ganaste!")).toBeVisible();
  expect(Date.now() - started).toBeLessThan(1_200);
  await expect(stage.locator(".wheel-landed")).toHaveCount(0);
});

test("muestra de regalo: se aplica en el carrito como descuento fijo y queda en el panel", async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("volta-demo:cart", JSON.stringify({ state: { lines: [{ id: "l1", productSlug: "colageno", variantId: "co-limon-300", quantity: 1 }], couponCode: null }, version: 0 }));
  });
  // Sorteo fijo: 0,5 cae en el gajo de la muestra (pesos 26 + 20 + 16).
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.goto("club/");
  await page.getByRole("button", { name: "Girar la ruleta" }).click();
  const stage = page.getByRole("dialog", { name: "Ruleta de cupones" });
  await stage.getByRole("button", { name: "Girar la ruleta" }).click();
  await expect(stage.getByRole("heading", { name: "Muestra de regalo" })).toBeVisible();
  const code = (await stage.getByRole("button", { name: /Copiar código/ }).textContent())!.trim();
  await stage.getByRole("button", { name: "Aplicar ahora" }).click();
  await page.goto("carrito/");
  await expect(page.getByText(`${code}: Ruleta: Muestra de regalo`)).toBeVisible();
  await expect(page.getByText(/^−\s?\$\s?2\.500$/).first()).toBeVisible();
  await page.goto("admin-demo/cupones/lista/");
  const item = page.getByRole("listitem").filter({ hasText: code });
  await expect(item).toContainText("Ruleta: Muestra de regalo");
  await expect(item).toContainText(/\$\s?2\.500/);
});

test.describe("panel con mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });

  test("premios de suplementos: muestra y shaker en el catálogo y en los gajos; una muestra nueva desde la plantilla", async ({ page }) => {
    await page.goto("admin-demo/cupones/premios/");
    const list = page.getByRole("list", { name: "Catálogo de premios" });
    await expect(list.getByRole("listitem").filter({ hasText: "Muestra de regalo" })).toContainText("sin compra mínima");
    await expect(list.getByRole("listitem").filter({ hasText: "Shaker VOLTA de regalo" })).toContainText("con compras desde $30.000");
    await expect(list).not.toContainText(/Grabado|Llavero/);
    await page.getByRole("button", { name: "Agregar premio" }).click();
    const dialog = page.getByRole("dialog", { name: "Agregar premio" });
    await dialog.getByRole("radio", { name: /Producto de regalo/ }).check();
    await dialog.getByLabel("Producto que se regala").selectOption({ label: "Mass Gainer 3 kg" });
    await expect(dialog).toContainText("Mass Gainer de regalo · cupón de un uso");
    await dialog.getByRole("radio", { name: /Muestra de regalo/ }).check();
    await expect(dialog.getByLabel("Valor de la muestra (ARS)")).toHaveValue("2500");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog.getByText("Ya existe “Muestra de regalo” con esa compra mínima.")).toBeVisible();
    await dialog.getByLabel("Valor de la muestra (ARS)").fill("1800");
    await dialog.getByLabel("Compra mínima (ARS)").fill("15000");
    await expect(dialog).toContainText("Muestra de regalo · cupón de un uso, vence a los 7 días, con compras desde $15.000.");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Premio “Muestra de regalo” creado" })).toBeVisible();
    await expect(list.getByRole("listitem").filter({ hasText: "con compras desde $15.000" })).toContainText("Muestra de regalo");
    await page.goto("admin-demo/cupones/ruleta/");
    await expect(page.getByLabel("Premio del gajo 3")).toHaveValue("p-muestra");
    await expect(page.getByLabel("Premio del gajo 6")).toHaveValue("p-shaker");
    await expect(page.getByRole("region", { name: "Vista previa de la ruleta" }).locator("svg").first()).toBeVisible();
  });
});
