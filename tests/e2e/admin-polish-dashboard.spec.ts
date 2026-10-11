import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow } from "./helpers";

/** Polish 8.3.1 (ventas por día con detalle) y 8.3.3 (cards del inicio a todo el ancho). */

const chart = (page: Page) => page.getByRole("group", { name: /Ventas por día: elegí un día/ });
const pesos = (s: string) => Number(s.replace(/[^\d]/g, ""));

test("8.3.1 cada barra abre su día: fecha, cantidad, total y pedidos; la tabla y el KPI suman lo mismo", async ({ page }) => {
  await page.goto("admin-demo/");
  const bars = chart(page).getByRole("button");
  await expect(bars).toHaveCount(7);
  await expect(page.getByText("Tocá una barra para ver los pedidos de ese día.")).toBeVisible();
  // Una barra con ventas: su detalle lista exactamente sus pedidos y su total.
  const labels = await bars.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? ""));
  const i = labels.findIndex((l) => !/ 0 pedidos/.test(l));
  const [, amount, count] = labels[i]!.match(/: (\$\s?[\d.]+), (\d+) pedidos?/)!;
  await bars.nth(i).click();
  await expect(bars.nth(i)).toHaveAttribute("aria-pressed", "true");
  const day = page.getByRole("region", { name: /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i });
  await expect(day.getByRole("link")).toHaveCount(Number(count));
  await expect(day).toContainText(amount!.replace(/\s/g, " "));
  const sum = (await day.getByRole("link").evaluateAll((els) => els.map((e) => e.textContent ?? ""))).reduce((t, txt) => t + pesos(txt.match(/\$\s?[\d.]+/)![0]), 0);
  expect(sum).toBe(pesos(amount!));
  // Un día sin ventas muestra su estado vacío.
  const empty = labels.findIndex((l) => / 0 pedidos/.test(l));
  await bars.nth(empty).press("Enter");
  await expect(bars.nth(empty)).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Sin ventas ese día", { exact: false })).toBeVisible();
  // "Ver como tabla": mismos días, mismo total que el KPI de la semana, y elegir un día desde la tabla.
  await page.getByText("Ver como tabla").click();
  const table = page.locator("figure table");
  const total = await table.locator("tfoot td").nth(1).textContent();
  const kpi = page.locator("section[aria-label='Indicadores (demo)'] > *").filter({ hasText: "Ventas últimos 7 días" });
  await expect(kpi).toContainText(total!.trim());
  await table.locator("tbody tr").nth(i).getByRole("button").click();
  await expect(bars.nth(i)).toHaveAttribute("aria-pressed", "true");
  // Recorrido A: barra → pedido del día → ficha → volver.
  await day.getByRole("link").first().click();
  await expect(page.getByRole("heading", { level: 1, name: /VEL-/ })).toBeVisible();
  await page.goBack();
  await expect(chart(page)).toBeVisible();
});

for (const [label, width, height, mobile] of [["escritorio", 1440, 900, false], ["iPad horizontal", 1024, 768, true], ["celular", 390, 844, true]] as const) {
  test(`8.3.3 a ${label} ${width}px: últimos pedidos, Club y actividad apilados a todo el ancho y legibles`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce", locale: "es-AR" });
    const page = await ctx.newPage();
    await page.goto("http://localhost:" + (process.env.E2E_PORT ?? "4173") + (process.env.PAGES_BASE_PATH ?? "") + "/admin-demo/");
    await expect(page.getByRole("heading", { name: "Actividad reciente" })).toBeVisible();
    // Posiciones en la página (no en la pantalla), para comparar sin depender del scroll.
    const boxes = await page.evaluate(() => ["ultimos", "club", "act"].map((id) => {
      const r = document.getElementById(id)!.closest("section")!.getBoundingClientRect();
      return { y: r.top + scrollY, height: r.height, width: r.width };
    }));
    const main = (await page.locator("main#contenido > *").first().boundingBox())!;
    for (let k = 0; k < boxes.length; k++) {
      // Cada una ocupa el ancho del contenido y empieza debajo de la anterior.
      expect(boxes[k]!.width).toBeGreaterThan(main.width - 2);
      if (k > 0) expect(boxes[k]!.y).toBeGreaterThan(boxes[k - 1]!.y + boxes[k - 1]!.height - 1);
    }
    // Cada pedido: el código en una sola línea, con su estado e importe a la vista.
    const rows = page.locator("section").filter({ has: page.getByRole("heading", { name: "Últimos pedidos" }) }).getByRole("link", { name: /VEL-/ });
    await expect(rows).toHaveCount(4);
    for (const row of await rows.all()) {
      const code = row.locator("span.font-extrabold").first();
      expect(await code.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(30);
      await expect(row.getByText(/Pendiente de pago|Comprobante en revisión|Pagado|En producción|Listo|Enviado|Entregado|Cancelado|En reclamo/).filter({ visible: true })).toHaveCount(1);
      await expect(row.getByText(/\$\s?[\d.]+/)).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await ctx.close();
  });
}

test("8.3.3 sin desborde a 360 px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("admin-demo/");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});
