import { nextWorkday } from "../../engine/workdays";
import { DEFAULT_STOCK_LEVEL, type StockLevel, type Supplier } from "../../fixtures/suppliers";
import type { Closure, Recipe } from "../../fixtures/workshop";
import type { Product } from "../../types";
import { variantSupplierCost } from "./costs";

/**
 * Compras sugeridas (Fase 7): cada variante tiene un stock mínimo y un objetivo; lo que está en el mínimo o debajo se
 * sugiere comprar hasta el objetivo (descontando lo que ya se pidió y no llegó), agrupado por el proveedor de su marca,
 * con el total al costo. Lo "a pedido" no se compra por stock.
 */
export interface PurchaseLine {
  /** `producto::variante` */
  key: string;
  productSlug: string;
  variantId: string;
  name: string;
  qty: number;
  /** Costo del proveedor por unidad (null si el producto no tiene costo cargado). */
  unitCost: number | null;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  /** ISO */
  createdAt: string;
  /** Próximo reparto del proveedor (AAAA-MM-DD). */
  expectedOn: string | null;
  lines: PurchaseLine[];
  total: number;
  status: "ordered" | "received";
  receivedAt?: string;
}

export type LevelState = "made-to-order" | "below" | "ok";

export interface LevelRow extends StockLevel {
  key: string;
  productSlug: string;
  variantId: string;
  name: string;
  brand: string;
  supplier: Supplier | null;
  stock: number;
  /** Pedido al proveedor y todavía sin recibir. */
  onOrder: number;
  /** Tiene un nivel propio (si no, usa el general). */
  own: boolean;
  state: LevelState;
}

export const LEVEL_LABEL: Record<LevelState, string> = { "made-to-order": "A pedido", below: "Para comprar", ok: "Alcanza" };

export const levelKey = (productSlug: string, variantId: string) => `${productSlug}::${variantId}`;

export const supplierOf = (suppliers: Supplier[], brand: string) => suppliers.find((s) => s.brands.includes(brand)) ?? null;

/** Unidades pedidas y sin recibir, por variante. */
export function onOrderByKey(purchases: PurchaseOrder[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of purchases) if (p.status === "ordered") for (const l of p.lines) map.set(l.key, (map.get(l.key) ?? 0) + l.qty);
  return map;
}

/** Una fila por variante de los productos visibles, con su nivel, su proveedor y su estado. */
export function levelRows(products: Product[], suppliers: Supplier[], levels: Record<string, StockLevel>, purchases: PurchaseOrder[]): LevelRow[] {
  const onOrder = onOrderByKey(purchases);
  return products.filter((p) => p.active !== false).flatMap((p) => p.variants.map((v) => {
    const key = levelKey(p.slug, v.id);
    const level = levels[key] ?? DEFAULT_STOCK_LEVEL;
    const state: LevelState = v.stock < 0 ? "made-to-order" : v.stock <= level.min ? "below" : "ok";
    return { key, productSlug: p.slug, variantId: v.id, name: `${p.name} · ${v.label}`, brand: p.brand, supplier: supplierOf(suppliers, p.brand), stock: v.stock, onOrder: onOrder.get(key) ?? 0, own: !!levels[key], ...level, state };
  }));
}

/** Unidades a comprar para llegar al objetivo (0 si alcanza o si ya está pedido). */
export const buyQty = (r: LevelRow) => (r.state === "below" ? Math.max(0, r.target - r.stock - r.onOrder) : 0);

/** Línea sugerida: lo que se pide, con el stock y el objetivo que la explican. */
export interface SuggestedLine extends PurchaseLine {
  stock: number;
  target: number;
}

export interface PurchaseGroup {
  supplier: Supplier | null;
  lines: SuggestedLine[];
  /** Total al costo de las líneas con costo cargado. */
  total: number;
  /** Líneas sin costo del proveedor. */
  withoutCost: number;
  /** El total no llega al pedido mínimo del proveedor. */
  underMinimum: boolean;
}

export function suggestedPurchases(rows: LevelRow[], products: Product[], recipes: Record<string, Recipe>): PurchaseGroup[] {
  const groups = new Map<string, PurchaseGroup>();
  for (const r of rows) {
    const qty = buyQty(r);
    if (!qty) continue;
    const product = products.find((p) => p.slug === r.productSlug)!;
    const variant = product.variants.find((v) => v.id === r.variantId)!;
    const unitCost = variantSupplierCost(product, variant, recipes[r.productSlug])?.cost ?? null;
    const id = r.supplier?.id ?? "";
    const g = groups.get(id) ?? { supplier: r.supplier, lines: [], total: 0, withoutCost: 0, underMinimum: false };
    g.lines.push({ key: r.key, productSlug: r.productSlug, variantId: r.variantId, name: r.name, qty, unitCost, stock: r.stock, target: r.target });
    if (unitCost === null) g.withoutCost++;
    else g.total += unitCost * qty;
    groups.set(id, g);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, underMinimum: !!g.supplier && g.total < g.supplier.minOrder }))
    .sort((a, b) => (a.supplier ? 0 : 1) - (b.supplier ? 0 : 1) || b.total - a.total);
}

/** Próximo día de reparto del proveedor después de `today`, salteando feriados y cierres. */
export function nextDelivery(supplier: Supplier, today: string, closures: Closure[]): string | null {
  if (!supplier.deliveryWeekdays.length) return null;
  const closedWeekdays = [0, 1, 2, 3, 4, 5, 6].filter((d) => !supplier.deliveryWeekdays.includes(d));
  return nextWorkday(today, { closedWeekdays, closures });
}

const WEEKDAY = ["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"];

/** "martes y jueves", "miércoles". */
export function deliveryDaysText(weekdays: number[]): string {
  const names = [...weekdays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => WEEKDAY[d]!);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} y ${names.at(-1)}` : (names[0] ?? "sin días cargados");
}
