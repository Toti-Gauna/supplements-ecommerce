import type { Product } from "../types";
import type { PrizeKind, PrizeTemplate, WheelConfig, WheelPrize, WheelSegment } from "../fixtures/wheel";

/**
 * Catálogo de premios de la ruleta (8.3.25). Las plantillas son solo las que el engine ya convierte en cupón
 * (porcentaje, monto fijo, envío gratis; el grabado y el producto de regalo se entregan como monto fijo). No se
 * inventan stock ni reglas: el cupón sigue saliendo de `prizeCoupon` con los datos del gajo.
 */
export const PRIZE_TEMPLATES: { id: PrizeTemplate; label: string; hint: string; kind: PrizeKind }[] = [
  { id: "percent", label: "Porcentaje de descuento", hint: "Un % sobre los productos del carrito.", kind: "PERCENT" },
  { id: "fixed", label: "Monto fijo de descuento", hint: "Pesos que se descuentan del carrito.", kind: "FIXED" },
  { id: "shipping", label: "Envío gratis", hint: "El envío no se cobra.", kind: "FREE_SHIPPING" },
  { id: "engraving", label: "Grabado gratis", hint: "Se descuenta el valor del grabado.", kind: "FIXED" },
  { id: "gift", label: "Producto de regalo", hint: "Se descuenta el precio de un producto del catálogo.", kind: "FIXED" },
];

export interface PrizeDraft { template: PrizeTemplate; value: number; minSubtotal: number; productSlug: string }

export const prizeDraft = (template: PrizeTemplate = "percent"): PrizeDraft =>
  ({ template, value: template === "percent" ? 10 : template === "engraving" ? 2500 : template === "fixed" ? 3000 : 0, minSubtotal: 0, productSlug: "" });

const pesos = (n: number) => `$${n.toLocaleString("es-AR")}`;

/** Nombre visible, armado con la plantilla y los datos. */
export function prizeName(d: PrizeDraft, products: Product[]): string {
  if (d.template === "percent") return `${d.value}% OFF`;
  if (d.template === "fixed") return `${pesos(d.value)} OFF`;
  if (d.template === "shipping") return "Envío gratis";
  if (d.template === "engraving") return "Grabado gratis";
  return `${products.find((p) => p.slug === d.productSlug)?.name ?? "Producto"} de regalo`;
}

/** Precio "desde" de un producto: lo que vale regalarlo. */
export const giftValue = (p: Product) => p.basePrice + Math.min(0, ...p.variants.map((v) => v.priceDelta));

/** Mismas reglas que un cupón del panel: % de 1 a 100, montos en pesos enteros mayores a 0, mínimo 0 o más. */
export function checkPrize(d: PrizeDraft, products: Product[], prizes: WheelPrize[]): Record<string, string> {
  const errors: Record<string, string> = {};
  if (d.template === "percent" && (!Number.isInteger(d.value) || d.value < 1 || d.value > 100)) errors.value = "El porcentaje va de 1 a 100.";
  if ((d.template === "fixed" || d.template === "engraving") && (!Number.isInteger(d.value) || d.value < 1)) errors.value = "Un monto en pesos enteros, mayor a 0.";
  if (d.template === "gift" && !products.some((p) => p.slug === d.productSlug)) errors.productSlug = "Elegí el producto que se regala.";
  if (!Number.isInteger(d.minSubtotal) || d.minSubtotal < 0) errors.minSubtotal = "La compra mínima es 0 o más pesos enteros.";
  const name = prizeName(d, products);
  if (!Object.keys(errors).length && prizes.some((p) => p.name === name && (p.minSubtotal ?? 0) === d.minSubtotal)) errors.template = `Ya existe “${name}” con esa compra mínima.`;
  return errors;
}

export const newPrizeId = () => `p-${Date.now().toString(36)}`;

export function makePrize(d: PrizeDraft, products: Product[], id: string): WheelPrize {
  const product = products.find((p) => p.slug === d.productSlug);
  const kind = PRIZE_TEMPLATES.find((t) => t.id === d.template)!.kind;
  const value = d.template === "gift" && product ? giftValue(product) : kind === "FREE_SHIPPING" ? 0 : d.value;
  return { id, template: d.template, name: prizeName(d, products), kind, value, ...(d.minSubtotal ? { minSubtotal: d.minSubtotal } : {}), ...(d.template === "gift" ? { productSlug: d.productSlug } : {}) };
}

export const prizeCondition = (p: Pick<WheelPrize, "minSubtotal">) => (p.minSubtotal ? `con compras desde ${pesos(p.minSubtotal)}` : "sin compra mínima");

/** El gajo toma el premio elegido: su nombre y sus datos (lo que usan el sorteo, el disco y el cupón). */
export function assignPrize(s: WheelSegment, p: WheelPrize): WheelSegment {
  const { minSubtotal: _drop, ...rest } = s;
  void _drop;
  return { ...rest, prizeId: p.id, label: p.name, kind: p.kind, value: p.value, ...(p.minSubtotal ? { minSubtotal: p.minSubtotal } : {}) };
}

function inferTemplate(s: WheelSegment): PrizeTemplate {
  if (s.kind === "FREE_SHIPPING") return "shipping";
  if (s.kind === "PERCENT") return "percent";
  if (/grabado/i.test(s.label)) return "engraving";
  return /de regalo$/i.test(s.label) ? "gift" : "fixed";
}

/**
 * Ruletas guardadas antes de 8.3.25 no tienen catálogo: se arma con los gajos (un premio por combinación distinta) y
 * cada gajo queda apuntando a su premio. Los IDs de los gajos no cambian.
 */
export function withPrizeCatalog(w: WheelConfig): WheelConfig {
  if (Array.isArray(w.prizes) && w.segments.every((s) => s.prizeId && w.prizes!.some((p) => p.id === s.prizeId))) return w;
  const prizes: WheelPrize[] = [...(Array.isArray(w.prizes) ? w.prizes : [])];
  const segments = w.segments.map((s) => {
    const same = prizes.find((p) => p.id === s.prizeId) ?? prizes.find((p) => p.name === s.label && p.kind === s.kind && p.value === s.value && (p.minSubtotal ?? 0) === (s.minSubtotal ?? 0));
    if (same) return { ...s, prizeId: same.id };
    const prize: WheelPrize = { id: `p-${s.id}`, template: inferTemplate(s), name: s.label, kind: s.kind, value: s.value, ...(s.minSubtotal ? { minSubtotal: s.minSubtotal } : {}) };
    prizes.push(prize);
    return { ...s, prizeId: prize.id };
  });
  return { ...w, prizes, segments };
}

/** Para guardar: vigencia y pesos válidos, cada gajo con un premio del catálogo y, si la ruleta está visible, peso total positivo. */
export function checkWheel(w: WheelConfig): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(w.validDays) || w.validDays < 1 || w.validDays > 90) errors.push("La vigencia del premio va de 1 a 90 días.");
  if (w.segments.some((s) => !Number.isInteger(s.weight) || s.weight < 0)) errors.push("Los pesos son números enteros de 0 en adelante.");
  if (w.segments.some((s) => !w.prizes?.some((p) => p.id === s.prizeId))) errors.push("Cada gajo tiene que tener un premio del catálogo.");
  if (w.active && w.segments.filter((s) => s.active).reduce((sum, s) => sum + s.weight, 0) <= 0) errors.push("Con la ruleta visible, al menos un gajo activo tiene que tener peso mayor a 0.");
  return errors;
}
