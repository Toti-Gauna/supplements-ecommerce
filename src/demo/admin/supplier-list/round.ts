/**
 * Redondeo comercial de un precio de venta propuesto (R4c). Siempre hacia ARRIBA: el precio redondeado nunca deja menos
 * margen que el pedido. Pesos enteros. "900" es el estilo del catálogo ($ 54.900, $ 2.900): el siguiente precio que
 * termina en 900; por debajo de $ 1.000 se sube al múltiplo de $ 50.
 */
export type PriceEnding = "900" | "100" | "500";

export const ENDING_LABEL: Record<PriceEnding, string> = { "900": "Terminado en 900", "100": "A $100", "500": "A $500" };
export const ENDINGS: PriceEnding[] = ["900", "100", "500"];

export function commercialPrice(raw: number, ending: PriceEnding = "900"): number {
  const amount = Math.max(0, Math.ceil(raw));
  if (ending === "100") return Math.ceil(amount / 100) * 100;
  if (ending === "500") return Math.ceil(amount / 500) * 500;
  if (amount < 1000) return Math.max(50, Math.ceil(amount / 50) * 50);
  return Math.ceil((amount + 100) / 1000) * 1000 - 100;
}

/** Precio que deja el margen pedido (sobre el precio de venta, de 1 a 90 %) sobre un costo, sin redondear. */
export function priceForMargin(cost: number, marginPct: number): number {
  const pct = Math.min(90, Math.max(1, marginPct));
  return Math.ceil((cost * 100) / (100 - pct));
}

/** Precio de venta propuesto: el margen de la marca sobre el costo, con el redondeo comercial. */
export function proposedPrice(cost: number, marginPct: number, ending: PriceEnding = "900"): number {
  return commercialPrice(priceForMargin(cost, marginPct), ending);
}
