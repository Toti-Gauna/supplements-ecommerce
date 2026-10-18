import type { Product } from "../../types";
import type { PriceUndo } from "../bulk-price";
import { inScope, type PriceLine, type PriceScope } from "../bulk-price";
import { variantPrice } from "../stock";
import { brandMargin, landedCost, type CostBook } from "./costs";
import { proposedPrice, type PriceEnding } from "./round";

/** Un cambio a una variante: costo nuevo del proveedor y/o precio de venta nuevo (pesos enteros). */
export interface ListUpdate { productSlug: string; variantId: string; cost?: number; price?: number }

/**
 * Aplica los cambios de la lista del proveedor (o del aumento por margen) y guarda lo de antes para deshacer: precios
 * y costos de cada producto tocado. El costo nuevo rige desde `since` (AAAA-MM-DD). Con una sola variante, el precio
 * vive en la base del producto.
 */
export function applyUpdates(products: Product[], updates: ListUpdate[], label: string, since: string, at: string): { products: Product[]; undo: PriceUndo } {
  const undo: PriceUndo = { at, label, count: 0, prices: {}, costs: {} };
  const bySlug = new Map<string, ListUpdate[]>();
  for (const u of updates) bySlug.set(u.productSlug, [...(bySlug.get(u.productSlug) ?? []), u]);
  const next = products.map((p) => {
    const mine = bySlug.get(p.slug);
    if (!mine) return p;
    undo.prices[p.slug] = { basePrice: p.basePrice, deltas: Object.fromEntries(p.variants.map((v) => [v.id, v.priceDelta])) };
    let out = p;
    for (const u of mine) {
      const v = out.variants.find((x) => x.id === u.variantId);
      if (!v) continue;
      undo.count += 1;
      undo.costs![`${p.slug}::${v.id}`] = { cost: v.cost, since: v.costSince };
      const single = out.variants.length === 1;
      const basePrice = single && u.price !== undefined ? u.price : out.basePrice;
      out = {
        ...out, basePrice,
        variants: out.variants.map((x) => (x.id !== v.id ? x : {
          ...x, ...(u.cost !== undefined ? { cost: u.cost, costSince: since } : {}),
          ...(u.price !== undefined ? { priceDelta: single ? 0 : u.price - basePrice } : {}),
        })),
      };
    }
    return out;
  });
  return { products: next, undo };
}

/** Aumento "al margen de la marca": cada variante con costo pasa al precio que deja el margen de su marca. */
export function previewMarginChange(products: Product[], scope: PriceScope, book: CostBook, ending: PriceEnding): { lines: PriceLine[]; withoutCost: number } {
  const lines: PriceLine[] = [];
  let withoutCost = 0;
  for (const p of products.filter((x) => inScope(x, scope))) {
    for (const v of p.variants) {
      const cost = landedCost(p, v, book);
      if (cost === null) { withoutCost += 1; continue; }
      lines.push({ key: `${p.slug}::${v.id}`, productSlug: p.slug, productName: p.name, variantLabel: v.label, brand: p.brand, from: variantPrice(p, v), to: proposedPrice(cost, brandMargin(p.brand, book.settings), ending) });
    }
  }
  return { lines, withoutCost };
}

export const linesToUpdates = (lines: PriceLine[]): ListUpdate[] =>
  lines.filter((l) => l.to !== l.from).map((l) => ({ productSlug: l.productSlug, variantId: l.key.split("::")[1]!, price: l.to }));
