import { clearancePrice, daysToExpiry, EXPIRY_WINDOW_DAYS, expiryState, fefo, firstOutLot, lotUnits, type ExpiryState } from "../engine/lots";
import type { Lot, Product, Variant } from "../types";

/** Lotes en el panel: avisos de vencimiento, liquidación y stock que se reparte entre lotes. Puro y testeado. */
export type LotState = ExpiryState;

export const LOT_STATE_LABEL: Record<LotState, string> = { expired: "Vencido", soon: "Vence pronto", ok: "Vigente" };

export function lotState(lot: Lot, today: string, window = EXPIRY_WINDOW_DAYS): LotState {
  return expiryState(lot.expires, today, window);
}

/** Un lote con su producto y variante: la fila del aviso de vencimientos y de la liquidación. */
export interface LotRow {
  key: string;
  productSlug: string;
  productName: string;
  brand: string;
  variantId: string;
  variantLabel: string;
  lot: Lot;
  days: number;
  state: LotState;
  /** Es el lote que sale primero: la liquidación se ve en la tienda ya mismo. */
  firstOut: boolean;
  listPrice: number;
  /** Costo del proveedor de la variante, si está cargado. */
  cost?: number;
  /** Precio de liquidación si el lote está liquidado. */
  clearance: number | null;
}

/** Lotes con unidades de una variante, en orden FEFO. */
export function variantLotRows(p: Product, v: Variant, today: string): LotRow[] {
  const first = firstOutLot(v);
  const listPrice = p.basePrice + v.priceDelta;
  return fefo(v.lots ?? []).filter((l) => l.units > 0).map((lot) => ({
    key: `${p.slug}::${v.id}::${lot.code}`, productSlug: p.slug, productName: p.name, brand: p.brand, variantId: v.id, variantLabel: v.label,
    lot, days: daysToExpiry(lot.expires, today), state: lotState(lot, today), firstOut: lot === first, listPrice, cost: v.cost,
    clearance: lot.clearancePct ? clearancePrice(listPrice, lot.clearancePct) : null,
  }));
}

/** Lotes vencidos o que vencen en menos de 60 días (con unidades), el más urgente primero. Solo productos visibles. */
export function expiringLots(products: Product[], today: string): LotRow[] {
  return products.filter((p) => p.active !== false)
    .flatMap((p) => p.variants.flatMap((v) => variantLotRows(p, v, today)))
    .filter((r) => r.state !== "ok")
    .sort((a, b) => a.days - b.days || a.productName.localeCompare(b.productName, "es"));
}

export function hasExpiring(v: Variant, today: string): boolean {
  return (v.lots ?? []).some((l) => l.units > 0 && lotState(l, today) !== "ok");
}

export function hasClearance(v: Variant): boolean {
  return (v.lots ?? []).some((l) => l.units > 0 && !!l.clearancePct);
}

/**
 * Cambia el stock de una variante y lo reparte entre sus lotes: lo que entra suma al lote más nuevo; lo que sale,
 * descuenta del que vence primero (FEFO). "A pedido" (-1) no toca los lotes. Sin lotes, solo cambia el número.
 */
export function withStock(v: Variant, stock: number): Variant {
  if (stock < 0 || !v.lots?.length) return { ...v, stock };
  let diff = stock - lotUnits(v.lots);
  const order = fefo(v.lots);
  if (diff > 0) {
    const newest = order[order.length - 1]!;
    return { ...v, stock, lots: v.lots.map((l) => (l === newest ? { ...l, units: l.units + diff } : l)) };
  }
  const taken = new Map<Lot, number>();
  for (const l of order) {
    if (diff >= 0) break;
    const t = Math.min(l.units, -diff);
    taken.set(l, t);
    diff += t;
  }
  const lots = v.lots.map((l) => ({ ...l, units: l.units - (taken.get(l) ?? 0) })).filter((l) => l.units > 0);
  return { ...v, stock, lots: lots.length ? lots : undefined };
}

/** Lotes editados a mano: el stock pasa a ser la suma (salvo "a pedido"). */
export function setVariantLots(v: Variant, lots: Lot[]): Variant {
  return { ...v, lots: lots.length ? lots : undefined, stock: v.stock < 0 ? v.stock : lotUnits(lots) };
}

/** Al guardar el producto: se descartan los lotes que quedaron vacíos (sin código ni unidades). */
export function withoutEmptyLots(p: Product): Product {
  return { ...p, variants: p.variants.map((v) => (v.lots ? setVariantLots(v, v.lots.filter((l) => l.code.trim() || l.units > 0)) : v)) };
}

/** Lotes con unidades a los que les falta el código o un vencimiento AAAA-MM. */
export function invalidLots(p: Product): Lot[] {
  return p.variants.flatMap((v) => v.lots ?? []).filter((l) => l.units > 0 && (!l.code.trim() || !/^\d{4}-\d{2}$/.test(l.expires)));
}

/** Pone (o quita, con `pct` null) la liquidación de un lote. La lista no cambia: quitarla deja el precio exacto de antes. */
export function setClearance(products: Product[], slug: string, variantId: string, code: string, pct: number | null): Product[] {
  return products.map((p) => (p.slug !== slug ? p : {
    ...p,
    variants: p.variants.map((v) => (v.id !== variantId ? v : {
      ...v,
      lots: v.lots?.map((l) => {
        if (l.code !== code) return l;
        const next = { ...l };
        if (pct) next.clearancePct = pct; else delete next.clearancePct;
        return next;
      }),
    })),
  }));
}
