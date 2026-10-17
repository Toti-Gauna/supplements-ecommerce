import { expect, test, type Page } from "@playwright/test";
import { checkoutAsGuest, guardNetwork, horizontalOverflow, openCheckoutTicket } from "./helpers";

/** L3 · Packs mensuales: lista, detalle, carrito, suscripción simulada de punta a punta y Mi cuenta → Suscripciones. */
const base = new URL(process.env.PAGES_BASE_PATH ?? "", "http://x").pathname.replace(/\/$/, "");

const ledPrice = (page: Page) => page.getByRole("region", { name: "Comprar el pack" }).getByRole("img").first().getAttribute("aria-label");
const cart = (page: Page) => page.getByRole("dialog", { name: "Carrito" });

test("la lista muestra los packs activos y el detalle se abre y vuelve con “Todos los packs”", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("packs/");
  await expect(page.getByRole("heading", { level: 1, name: "Packs" })).toBeVisible();
  await expect(page.locator("[data-pack-card]")).toHaveCount(9);
  const card = page.locator("[data-pack-card='hipertrofia']");
  await expect(card.getByText("Masa muscular")).toBeVisible();
  await expect(card.getByText("10 % OFF")).toBeVisible();
  await expect(card.getByText("por mes suscripto")).toBeVisible();
  await expect(card.getByText(/^Te dura \d+ días$/)).toBeVisible();
  await expect(card.locator("s")).toHaveCount(1);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await card.getByRole("link", { name: /^Ver pack/ }).click();
  await expect(page).toHaveURL(/packs\/\?pack=hipertrofia$/);
  await expect(page.getByRole("heading", { level: 1, name: "Pack Hipertrofia" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Productos del pack" }).getByRole("listitem")).toHaveCount(4);
  await expect(page.getByText("Se repite cada mes").first()).toBeVisible();
  await expect(page.getByText("Solo en la primera entrega", { exact: true })).toHaveCount(1);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await page.getByRole("link", { name: "Todos los packs" }).click();
  await expect(page.locator("[data-pack-card]")).toHaveCount(9);
  // Un pack que no existe dice que no está disponible.
  await page.goto("packs/?pack=no-existe");
  await expect(page.getByRole("heading", { name: "Ese pack no está disponible" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver todos los packs" })).toBeVisible();
  assertNoExternal();
});

test("cambiar una variante cambia el precio del pack en vivo", async ({ page }) => {
  await page.goto("packs/?pack=hipertrofia");
  const before = await ledPrice(page);
  const whey = page.locator("[data-pack-item='ionic-whey']");
  await whey.getByText("5 lb (2,27 kg)", { exact: true }).click();
  await expect(whey.getByRole("radio", { name: /5 lb/ })).toBeChecked();
  await expect.poll(() => ledPrice(page)).not.toBe(before);
  const after = await ledPrice(page);
  const pesos = (label: string | null) => Number((label ?? "").replace(/\D/g, ""));
  expect(pesos(after)).toBeGreaterThan(pesos(before));
  // El equipamiento cambia por color y no es solo de suplementos: otro color, mismo precio de pack.
  await page.locator("[data-pack-item='straps-algodon']").getByRole("radio").nth(1).check({ force: true });
  await expect(page.locator("[data-pack-item='straps-algodon']").getByRole("radio").nth(1)).toBeChecked();
});

test("comprar el pack una vez: descuento en el carrito; quitar un producto lo saca, avisa y se completa con un botón", async ({ page }) => {
  await page.goto("packs/?pack=hipertrofia");
  const price = await ledPrice(page);
  await page.getByRole("button", { name: "Comprar el pack" }).click();
  const drawer = cart(page);
  await expect(drawer.getByRole("heading", { name: "Pack Hipertrofia" })).toBeVisible();
  await expect(drawer.getByText("Descuento pack (10 %)")).toBeVisible();
  await expect(drawer.getByText("Todos los meses")).toHaveCount(0);
  await expect(drawer.getByText("Cantidad: 1")).toHaveCount(4);
  await expect(drawer.getByRole("button", { name: "Quitar el pack" })).toBeVisible();
  await drawer.getByRole("link", { name: "Ver carrito completo" }).click();
  // El total del carrito (sin envío) es el precio de la primera entrega del pack.
  const main = page.locator("main");
  await expect(main.getByText("Descuento pack (10 %)")).toBeVisible();
  const total = page.getByRole("region", { name: "Resumen" }).locator("dd").last();
  expect(Number((await total.innerText()).replace(/\D/g, ""))).toBe(Number((price ?? "").replace(/\D/g, "")));
  await main.getByRole("button", { name: "Quitar Straps de levantamiento" }).click();
  await expect(main.getByText("Te falta Straps de levantamiento para el descuento del pack.")).toBeVisible();
  await expect(main.getByText(/Descuento pack/)).toHaveCount(0);
  await main.getByRole("button", { name: "Completar el pack" }).click();
  await expect(main.getByText("Descuento pack (10 %)")).toBeVisible();
  await expect(main.getByText(/Te falta/)).toHaveCount(0);
  await main.getByRole("button", { name: "Quitar el pack" }).click();
  await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
});

test("suscribirse (día 12) pasa por el checkout, crea la suscripción simulada y Mi cuenta permite saltear, pausar, reanudar y cancelar", async ({ page }) => {
  const assertNoExternal = guardNetwork(page);
  await page.goto("packs/?pack=futbol");
  await page.getByLabel("Día del mes en que lo querés recibir").selectOption("12");
  await expect(page.getByText(/^Cada mes: \$ [\d.]+ \(ahorrás/)).toBeVisible();
  await expect(page.getByText("Demo: no se cobra ni se debita nada. Pausás, salteás o cancelás cuando quieras desde Mi cuenta.")).toBeVisible();
  await page.getByRole("button", { name: "Quiero este pack todos los meses" }).click();
  await expect(cart(page).getByText("Todos los meses · día 12")).toBeVisible();
  await expect(cart(page).getByText("Descuento pack mensual (15 %)")).toBeVisible();
  await checkoutAsGuest(page);
  // Revisar: el ticket agrupa el pack bajo su nombre con el día del mes y su descuento.
  await openCheckoutTicket(page);
  const ticket = page.getByRole("region", { name: "Resumen de tu compra" });
  await expect(ticket.getByText("Pack Fútbol · todos los meses, día 12")).toBeVisible();
  await expect(ticket.getByText("Descuento pack mensual (15 %)")).toBeVisible();
  await expect(page.getByText("Se crea una suscripción simulada: la vas a ver en Mi cuenta.")).toBeVisible();
  await page.getByRole("checkbox", { name: /Acepto los/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page).toHaveURL(/checkout\/confirmacion\/$/);
  await page.getByRole("link", { name: "Mi cuenta → Suscripciones" }).click();
  await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click();
  const panel = page.locator("#cuenta-seccion");
  await expect(panel.getByRole("heading", { level: 2, name: "Suscripciones" })).toBeVisible();
  // Solo la propia: las de muestra del panel son de clientes inventados.
  const sub = panel.locator("[data-subscription]");
  await expect(sub).toHaveCount(1);
  await expect(sub.getByRole("heading", { name: "Pack Fútbol" })).toBeVisible();
  await expect(sub.getByText("Activa", { exact: true })).toBeVisible();
  // El 12/10 es feriado: la próxima entrega pasa al próximo día hábil, con el motivo.
  await expect(sub.getByText("martes, 13 de octubre")).toBeVisible();
  await expect(sub.getByText(/no hay despachos \(Día de la Diversidad Cultural\)/)).toBeVisible();
  await expect(sub.getByRole("img", { name: /^\$ [\d.]+$/ })).toBeVisible();
  await expect(sub.getByText("1 × Electro Volt sobres")).toBeVisible();
  await expect(sub.getByText(/Bolso|Botella/)).toHaveCount(0);
  // Cambiar el día.
  await sub.getByLabel("Cambiar el día").selectOption("20");
  await expect(sub.getByText("martes, 20 de octubre")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Ahora lo recibís el día 20" })).toBeVisible();
  await sub.getByLabel("Cambiar el día").selectOption("12");
  // Saltear la próxima.
  await sub.getByRole("button", { name: "Saltear la próxima" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Salteás la próxima entrega" })).toBeVisible();
  await expect(sub.getByText("jueves, 12 de noviembre")).toBeVisible();
  await expect(sub.getByText(/Salteás la del/)).toBeVisible();
  await sub.getByRole("button", { name: "No saltear la próxima" }).click();
  await expect(sub.getByText("martes, 13 de octubre")).toBeVisible();
  // Pausar y reanudar.
  await sub.getByRole("button", { name: "Pausar" }).click();
  await expect(sub.getByText("Pausada", { exact: true }).first()).toBeVisible();
  await expect(sub.getByText("No sale nada hasta que la reanudes.")).toBeVisible();
  await expect(sub.getByRole("button", { name: "Saltear la próxima" })).toHaveCount(0);
  await sub.getByRole("button", { name: "Reanudar" }).click();
  await expect(sub.getByText("Activa", { exact: true })).toBeVisible();
  // Cancelar pide confirmación.
  await sub.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByRole("dialog", { name: "¿Cancelar la suscripción?" }).getByRole("button", { name: "Sí, cancelar" }).click();
  await expect(sub.getByText("Cancelada", { exact: true })).toBeVisible();
  await expect(sub.getByText("Cancelaste esta suscripción: no te llega nada más.")).toBeVisible();
  await expect(sub.getByRole("button", { name: "Pausar" })).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Suscripción cancelada" })).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  assertNoExternal();
});

test("Mi cuenta → Suscripciones sin ninguna propia invita a ver los packs", async ({ page }) => {
  await page.goto("cuenta/#suscripciones");
  await page.getByRole("button", { name: "Entrar a la cuenta demo" }).click();
  await expect(page.getByText("Todavía no tenés suscripciones")).toBeVisible();
  await page.locator("#cuenta-seccion").getByRole("link", { name: "Ver los packs" }).click();
  await expect(page).toHaveURL(/packs\/$/);
});

test("el inicio tiene el bloque de packs destacados entre Recomendados y los objetivos", async ({ page }) => {
  await page.goto("");
  const section = page.locator("main section[aria-labelledby='packs-home-title']");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("heading", { level: 2, name: "Packs para tu objetivo o tu deporte" })).toBeVisible();
  await expect(section.locator("[data-pack-card]")).toHaveCount(4);
  await expect(section.locator("[data-pack-card='salud']")).toHaveCount(0);
  await section.getByRole("link", { name: "Ver todos los packs" }).click();
  await expect(page).toHaveURL(/packs\/$/);
});

test("“Packs” está en el header de escritorio y en el menú del celular, antes de “Armá tu stack”", async ({ page }) => {
  await page.goto("");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  const links = page.getByRole("dialog", { name: "Menú" }).getByRole("link");
  // textContent: el rótulo se dibuja en mayúsculas por CSS y innerText lo devolvería ya transformado.
  const names = (await links.evaluateAll((els) => els.map((e) => e.textContent?.trim()))) as string[];
  expect(names.indexOf("Packs")).toBeGreaterThanOrEqual(0);
  expect(names.indexOf("Packs")).toBeLessThan(names.indexOf("Armá tu stack"));
  await links.filter({ hasText: /^Packs$/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Packs" })).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  const nav = page.getByRole("navigation", { name: "Principal" }).getByRole("link");
  const labels = (await nav.evaluateAll((els) => els.map((e) => e.textContent?.trim()))) as string[];
  expect(labels.slice(0, 2)).toEqual(["Packs", "Armá tu stack"]);
  expect(labels).toHaveLength(5);
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Packs" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Packs" })).toHaveAttribute("href", `${base}/packs/`);
});

test("la ficha de un producto avisa en qué packs viene, con el descuento y el link", async ({ page }) => {
  await page.goto("p/ionic-whey/");
  const note = page.getByRole("list", { name: "Packs que incluyen este producto" });
  await expect(note.getByText(/También viene en/).first()).toBeVisible();
  await expect(note.getByText("(−10 %)").first()).toBeVisible();
  await note.getByRole("link", { name: "Pack Hipertrofia" }).click();
  await expect(page).toHaveURL(/packs\/\?pack=hipertrofia$/);
  await expect(page.getByRole("heading", { level: 1, name: "Pack Hipertrofia" })).toBeVisible();
});
