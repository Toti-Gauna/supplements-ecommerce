import type { OrderStatus } from "../../engine/orders";
import type { CartLine } from "../../engine/cart-types";
import type { Material, MaterialUnit, Recipe } from "../../fixtures/workshop";

/** Insumos de embalaje y regalo con stock propio: lo comprometido por los pedidos por preparar y lo que queda para reponer. */

/** La cinta se mide en metros (con coma decimal); el resto, por unidad. */
export const usesDecimals = (unit: MaterialUnit) => unit === "m";

interface OrderLike {
  code: string;
  status: OrderStatus;
  lines: CartLine[];
}

/** Pedidos que todavía no se empezaron a preparar: su embalaje está comprometido pero no descontado. */
export const COMMITTED_STATUSES: OrderStatus[] = ["PAID"];

/** Insumos que lleva un pedido según el embalaje de cada producto (por unidad × cantidad). */
export function orderNeeds(lines: CartLine[], recipes: Record<string, Recipe>): Map<string, number> {
  const needs = new Map<string, number>();
  for (const line of lines) {
    for (const item of recipes[line.productSlug]?.items ?? []) needs.set(item.materialId, (needs.get(item.materialId) ?? 0) + item.qty * line.quantity);
  }
  return needs;
}

export function committedNeeds(orders: OrderLike[], recipes: Record<string, Recipe>): Map<string, number> {
  const total = new Map<string, number>();
  for (const o of orders) {
    if (!COMMITTED_STATUSES.includes(o.status)) continue;
    for (const [id, qty] of orderNeeds(o.lines, recipes)) total.set(id, (total.get(id) ?? 0) + qty);
  }
  return total;
}

/** Descuenta del stock lo que usa un pedido al empezar a prepararlo (puede quedar negativo: falta comprar). */
export function consumeMaterials(materials: Material[], needs: Map<string, number>): Material[] {
  return materials.map((m) => (needs.has(m.id) ? { ...m, stock: round(m.stock - needs.get(m.id)!) } : m));
}

const round = (n: number) => Math.round(n * 100) / 100;

export type MaterialState = "ok" | "low" | "short";

export const MATERIAL_STATE_LABEL: Record<MaterialState, string> = { ok: "Alcanza", low: "Reponer", short: "No alcanza" };

export interface MaterialRow extends Material {
  committed: number;
  /** Stock que queda después de preparar los pedidos pagados. */
  available: number;
  state: MaterialState;
  value: number;
}

export function materialState(available: number, minStock: number): MaterialState {
  if (available < 0) return "short";
  return available <= minStock ? "low" : "ok";
}

export function materialRows(materials: Material[], orders: OrderLike[], recipes: Record<string, Recipe>): MaterialRow[] {
  const committed = committedNeeds(orders, recipes);
  return materials.map((m) => {
    const c = round(committed.get(m.id) ?? 0);
    const available = round(m.stock - c);
    return { ...m, committed: c, available, state: materialState(available, m.minStock), value: Math.round(Math.max(0, m.stock) * m.costPerUnit) };
  });
}

/** Cuánto comprar para volver al doble del mínimo (cubriendo lo comprometido). */
export function reorderQty(row: MaterialRow): number {
  return row.state === "ok" ? 0 : Math.ceil(row.minStock * 2 - row.available);
}

export type MaterialOp = { kind: "add"; qty: number } | { kind: "set"; stock: number };

export function applyMaterialOp(materials: Material[], ids: string[], op: MaterialOp): Material[] {
  const set = new Set(ids);
  return materials.map((m) => (!set.has(m.id) ? m : { ...m, stock: op.kind === "set" ? op.stock : round(m.stock + op.qty) }));
}
