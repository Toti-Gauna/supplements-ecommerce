import type { CounterSale } from "../engine/counter-sale";
import { suggestedClearance } from "../engine/today-stock";
import type { Product } from "../types";
import { variantSupplierCost } from "./workshop/costs";
import { coverage, COST_STALE_DAYS, costAge, costSince, dailySales, liquidationProfit, type Coverage, type Liquidation } from "./live-costs";
import { variantLotRows, type LotRow } from "./lots";
import { variantPrice } from "./stock";
import { landedCost, type CostBook } from "./supplier-list/costs";
import type { AdminOrder } from "./types";

/** Una variante en "Costos vivos": su costo con fecha, cuántos días alcanza el stock y qué pasa con su lote por vencer. */
export interface LiveCostRow {
  key: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  brand: string;
  supplierCost: number;
  /** El costo se estimó en proporción al precio (no está cargado para esta presentación). */
  estimated: boolean;
  /** Proveedor más embalaje. */
  landed: number;
  price: number;
  since: string;
  age: number;
  stale: boolean;
  stock: number;
  perDay: number;
  coverage: Coverage;
  /** El lote que vence primero si está vencido o vence en menos de 60 días. */
  lot: LotRow | null;
  /** Qué pasa si se liquida (con el descuento ya cargado o el propuesto). null: sin lote por vencer, vencido o sin costo. */
  liquidation: Liquidation | null;
}

export function liveCostRows(products: Product[], book: CostBook, orders: AdminOrder[], counterSales: CounterSale[], today: string): LiveCostRow[] {
  const sales = dailySales(orders, counterSales, today);
  return products.filter((p) => p.active !== false).flatMap((p) => p.variants.flatMap((v): LiveCostRow[] => {
    const supplier = variantSupplierCost(p, v, book.recipes[p.slug]);
    const landed = supplier && landedCost(p, v, book, supplier.cost);
    if (!supplier || landed === null) return [];
    const key = `${p.slug}::${v.id}`;
    const since = costSince(p, v, book.recipes[p.slug]);
    const perDay = sales.get(key) ?? 0;
    const price = variantPrice(p, v);
    const lot = variantLotRows(p, v, today).find((r) => r.state !== "ok") ?? null;
    const pct = lot && lot.days >= 0 ? lot.lot.clearancePct ?? suggestedClearance(lot.days) : null;
    return [{
      key, productSlug: p.slug, productName: p.name, variantId: v.id, variantLabel: v.label, brand: p.brand, supplierCost: supplier.cost, estimated: supplier.estimated, landed, price,
      since, age: costAge(since, today), stale: costAge(since, today) > COST_STALE_DAYS, stock: v.stock, perDay, coverage: coverage(v.stock, perDay), lot,
      liquidation: lot && pct ? liquidationProfit(lot.lot.units, price, landed, pct) : null,
    }];
  }));
}
