import type { Lot, Product } from "../types";

/**
 * Lotes de MUESTRA por variante (códigos inventados: marca + AAMM de elaboración + línea). La fecha de la demo es
 * `DEMO_TODAY` (2026-10-04): los que vencen en 10/2026 y 11/2026 quedan a menos de 60 días; 12/2026 queda afuera.
 * La suma de unidades de cada variante es su stock (el mismo que tenía antes de los lotes).
 */
export const variantLots: Record<string, Lot[]> = {
  "iw-chocolate-2lb": [{ code: "VL-2606-W", expires: "2027-06", units: 6 }, { code: "VL-2609-W", expires: "2027-11", units: 12 }],
  "iw-vainilla-2lb": [{ code: "VL-2603-W", expires: "2026-11", units: 5 }, { code: "VL-2609-W", expires: "2027-11", units: 13 }],
  "bp-chocolate-u": [{ code: "VL-2605-B", expires: "2026-11", units: 16 }, { code: "VL-2609-B", expires: "2027-03", units: 24 }],
  "bp-mani-x12": [{ code: "VL-2604-B", expires: "2026-10", units: 3 }],
  "ap-chocolate-blanco-x6": [{ code: "BS-2603-A", expires: "2026-11", units: 6 }, { code: "BS-2609-A", expires: "2027-01", units: 9 }],
  "ge-tropical-x6": [{ code: "FJ-2602-G", expires: "2026-11", units: 4 }, { code: "FJ-2607-G", expires: "2027-02", units: 6 }],
  "o3-120": [{ code: "OZ-2511-O", expires: "2026-11", units: 5 }],
  "co-natural-300": [{ code: "KR-2601-K", expires: "2026-12", units: 4 }],
  "nc-vainilla-2lb": [{ code: "BS-2601-C", expires: "2027-01", units: 4 }],
};

/**
 * Le pone lotes a cada variante con stock: los de `variantLots` o, si no hay, uno solo con el lote del producto.
 * Accesorios sin vencimiento (shaker, tiza) y variantes sin stock o a pedido quedan sin lotes.
 */
export function withLots(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    variants: p.variants.map((v) => {
      const lots = variantLots[v.id] ?? (p.lot && v.stock > 0 ? [{ code: p.lot.code, expires: p.lot.expires, units: v.stock }] : undefined);
      return lots ? { ...v, lots, stock: lots.reduce((s, l) => s + l.units, 0) } : v;
    }),
  }));
}
