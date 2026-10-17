import { expect, type Page } from "@playwright/test";

/** Falla si la página hace cualquier pedido fuera del propio servidor estático o con método distinto de GET/HEAD (prefetch de Next). */
export function guardNetwork(page: Page) {
  const offenders: string[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    const local = url.hostname === "localhost" || url.protocol === "data:" || url.protocol === "blob:";
    if (!local || !["GET", "HEAD"].includes(req.method())) offenders.push(`${req.method()} ${req.url()}`);
  });
  return () => expect(offenders, "la demo no debe llamar servicios externos ni enviar datos").toEqual([]);
}

/** Ancho de página que excede el viewport configurado (con emulación móvil Chrome agranda el layout, así que se compara contra el ancho pedido). */
export async function horizontalOverflow(page: Page): Promise<number> {
  const width = page.viewportSize()?.width ?? 375;
  return page.evaluate((w) => document.documentElement.scrollWidth - w, width);
}

/** PNG sólido generado en memoria (no es una foto real). */
export async function makePng(page: Page, color = "#c9a77a"): Promise<Buffer> {
  const dataUrl = await page.evaluate((c) => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = "#3d4a2a";
    ctx.beginPath();
    ctx.arc(320, 220, 120, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL("image/png");
  }, color);
  return Buffer.from(dataUrl.split(",")[1]!, "base64");
}

/**
 * El ticket del checkout va plegado debajo de 1024 px: se abre para leerlo. Espera el paso (el checkout ya hidrató)
 * antes de decidir, porque antes de React solo hay un esqueleto.
 */
export async function openCheckoutTicket(page: Page) {
  await expect(page.locator("#checkout-step")).toBeVisible();
  const toggle = page.getByRole("button", { name: /Ver ticket/ });
  if (await toggle.isVisible()) await toggle.click();
  await expect(page.getByRole("region", { name: "Resumen de tu compra" })).toBeVisible();
}

/** Del carrito al pedido listo para confirmar (checkout en 3 pasos): invitado, cadete en Mar del Plata, transferencia. */
export async function checkoutAsGuest(page: Page) {
  await page.goto("checkout/");
  await page.getByLabel("Nombre y apellido").fill("Juana Pérez");
  await page.getByLabel("Email").fill("juana@ejemplo.com");
  await page.getByLabel("Teléfono / WhatsApp").fill("223 555-1234");
  await page.getByText("Cadete en Mar del Plata").click();
  await page.getByLabel("Calle").fill("Güemes");
  await page.getByLabel("Altura").fill("2500");
  await page.getByLabel("Código postal").fill("7600");
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByText("Transferencia bancaria").click();
  await page.getByRole("button", { name: "Revisar pedido" }).click();
}
