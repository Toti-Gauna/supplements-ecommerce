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
