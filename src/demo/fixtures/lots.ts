import type { Lot, Product } from "../types";

/**
 * Lotes de MUESTRA por variante (códigos inventados: marca + AAMM de elaboración + línea). La fecha de la demo es
 * `DEMO_TODAY` (2026-10-05): los que vencen en 10/2026 y 11/2026 quedan a menos de 60 días; 12/2026 queda afuera.
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
 * Día de ingreso al local de cada lote (MUESTRA): unas semanas después de elaborado y nunca después de la fecha de la
 * demo. Lo muestra "Verificá tu lote" en la ficha.
 */
export const lotReceipts: Record<string, string> = {
  "BS-2601-C": "2026-02-09", "BS-2603-A": "2026-04-14", "BS-2605-C": "2026-06-10", "BS-2606-C": "2026-07-08",
  "BS-2607-P": "2026-08-12", "BS-2609-A": "2026-09-29", "FJ-2602-G": "2026-03-11", "FJ-2603-T": "2026-04-07",
  "FJ-2607-G": "2026-08-19", "FJ-2608-P": "2026-09-09", "FJ-2610-M": "2026-10-02", "KR-2601-K": "2026-02-18",
  "KR-2605-L": "2026-06-03", "KR-2606-B": "2026-07-15", "KR-2607-K": "2026-08-05", "KR-2608-I": "2026-09-16",
  "OZ-2511-O": "2025-12-10", "OZ-2604-O": "2026-05-13", "OZ-2607-V": "2026-08-26", "OZ-2608-G": "2026-09-23",
  "OZ-2609-N": "2026-09-30", "VL-2603-W": "2026-04-02", "VL-2604-B": "2026-05-06", "VL-2604-L": "2026-05-20",
  "VL-2605-B": "2026-06-17", "VL-2605-M": "2026-06-24", "VL-2606-W": "2026-07-01", "VL-2608-E": "2026-09-02",
  "VL-2609-B": "2026-09-24", "VL-2609-G": "2026-09-28", "VL-2609-W": "2026-09-25", "VL-2610-C": "2026-10-01",
};

/**
 * RNPA de MUESTRA, inventados: el "00" de jurisdicción no existe, así que nunca coinciden con un registro real.
 * Los accesorios (shaker, tiza) no son alimentos y no llevan.
 */
export const productRnpa: Record<string, string> = {
  "ionic-whey": "00-071204", "isolate-zero": "00-071388", "proteina-vegana": "00-071415", "night-casein": "00-071502",
  "mass-gainer": "00-071617", "creatina-monohidrato": "00-072033", "creatina-gomitas": "00-072140", "creatina-brava": "00-072256",
  "overvolt-pre": "00-072391", "pump-flow": "00-072408", "bcaa-211": "00-072519", glutamina: "00-072624",
  "l-carnitina": "00-072735", "termo-cut": "00-072846", multivitaminico: "00-073051", "omega-3": "00-073162",
  "magnesio-bisglicinato": "00-073273", colageno: "00-073384", "barra-proteica": "00-073495", "alfajor-proteico": "00-073506",
  "mantequilla-mani": "00-073617", electrolitos: "00-073728", "gel-energetico": "00-073839",
};

const received = (lot: Lot): Lot => (lotReceipts[lot.code] ? { ...lot, receivedOn: lotReceipts[lot.code] } : lot);

/**
 * Le pone lotes a cada variante con stock: los de `variantLots` o, si no hay, uno solo con el lote del producto.
 * Accesorios sin vencimiento (shaker, tiza) y variantes sin stock o a pedido quedan sin lotes. Suma el RNPA y el día de
 * ingreso de cada lote.
 */
export function withLots(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    ...(productRnpa[p.slug] ? { rnpa: productRnpa[p.slug] } : {}),
    variants: p.variants.map((v) => {
      const lots = (variantLots[v.id] ?? (p.lot && v.stock > 0 ? [{ code: p.lot.code, expires: p.lot.expires, units: v.stock }] : undefined))?.map(received);
      return lots ? { ...v, lots, stock: lots.reduce((s, l) => s + l.units, 0) } : v;
    }),
  }));
}
