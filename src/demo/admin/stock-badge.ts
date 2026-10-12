import type { Product } from "../types";
import { DEFAULT_LOW_STOCK, productStockState, productStockTotal, stockState, STOCK_LABEL, type StockState } from "./stock";

export interface StockBadge {
  state: StockState;
  text: string;
}

const variants = (n: number) => `${n} ${n === 1 ? "variante" : "variantes"}`;

/**
 * Insignia de stock de un producto, según su variante más baja: si una sola está baja, la suma de todas no lo dice
 * ("Stock bajo · 139" se contradecía). Con varias variantes cuenta cuántas faltan o están bajas; con una sola, sus unidades.
 */
export function productStockBadge(product: Product, low = DEFAULT_LOW_STOCK): StockBadge {
  const state = productStockState(product, low);
  const finite = product.variants.filter((v) => v.stock >= 0);
  const count = (s: StockState) => finite.filter((v) => stockState(v.stock, low) === s).length;
  if (state === "made-to-order") return { state, text: STOCK_LABEL[state] };
  if (state === "ok") {
    const total = productStockTotal(product);
    return { state, text: total === null ? STOCK_LABEL.ok : `${STOCK_LABEL.ok} · ${total}` };
  }
  const n = count(state);
  if (state === "out") return { state, text: n === product.variants.length ? STOCK_LABEL.out : `Sin stock en ${variants(n)}` };
  if (product.variants.length === 1) return { state, text: `${STOCK_LABEL.low} · ${finite[0]!.stock}` };
  return { state, text: `${variants(n)} ${n === 1 ? "baja" : "bajas"}` };
}
