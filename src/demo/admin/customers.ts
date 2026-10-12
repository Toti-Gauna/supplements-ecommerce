import { isPaidOrLater } from "../engine/orders";
import type { CustomerProfile } from "../fixtures/customers";
import { goals } from "../fixtures/goals";
import type { Goal, Product } from "../types";
import { repurchaseItems, type RepurchaseItem } from "./repurchase";
import type { AdminOrder, AdminUser } from "./types";

/** Clientes del CRM: cuentas registradas más compradores invitados, unidos por email. */
export type CustomerSegment = "VIP" | "Frecuente" | "Nuevo" | "Sin compras";

export interface CustomerRow {
  key: string;
  name: string;
  email: string;
  phone?: string;
  userId: string | null;
  registered: boolean;
  blocked: boolean;
  orders: AdminOrder[];
  /** Pedidos pagados o posteriores. */
  paidCount: number;
  totalSpent: number;
  avgTicket: number;
  lastOrderAt: string | null;
  segment: CustomerSegment;
}

/** VIP desde este monto acumulado (pesos). */
export const VIP_FROM = 100_000;

function counts(o: AdminOrder): boolean {
  return isPaidOrLater(o.status) || (o.status === "IN_CLAIM" && !!o.prevStatus && isPaidOrLater(o.prevStatus));
}

export function segmentOf(paidCount: number, totalSpent: number): CustomerSegment {
  if (paidCount === 0) return "Sin compras";
  if (totalSpent >= VIP_FROM) return "VIP";
  return paidCount > 1 ? "Frecuente" : "Nuevo";
}

export function customerRows(users: AdminUser[], orders: AdminOrder[]): CustomerRow[] {
  const byEmail = new Map<string, CustomerRow>();
  const ensure = (email: string, init: () => Omit<CustomerRow, "orders" | "paidCount" | "totalSpent" | "avgTicket" | "lastOrderAt" | "segment">) => {
    const key = email.trim().toLowerCase();
    if (!byEmail.has(key)) byEmail.set(key, { ...init(), orders: [], paidCount: 0, totalSpent: 0, avgTicket: 0, lastOrderAt: null, segment: "Sin compras" });
    return byEmail.get(key)!;
  };
  for (const u of users) ensure(u.email, () => ({ key: u.id, name: u.name, email: u.email, userId: u.id, registered: true, blocked: u.blocked }));
  for (const o of orders) {
    const userEmail = o.userId ? users.find((u) => u.id === o.userId)?.email : undefined;
    const row = ensure(userEmail ?? o.customer.email, () => ({ key: `g-${o.customer.email}`, name: o.customer.name, email: o.customer.email, userId: null, registered: false, blocked: false }));
    row.phone ??= o.customer.phone;
    row.orders.push(o);
  }
  return [...byEmail.values()].map((r) => {
    const paid = r.orders.filter(counts);
    const totalSpent = paid.reduce((s, o) => s + o.total, 0);
    const lastOrderAt = r.orders.reduce<string | null>((max, o) => (!max || o.createdAt > max ? o.createdAt : max), null);
    return {
      ...r,
      orders: [...r.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      paidCount: paid.length,
      totalSpent,
      avgTicket: paid.length ? Math.round(totalSpent / paid.length) : 0,
      lastOrderAt,
      segment: segmentOf(paid.length, totalSpent),
    };
  });
}

/** Objetivo del cliente: el de su ficha o, si no tiene, el que más se repite en lo que compró (sin cancelados). */
export function customerGoal(profile: CustomerProfile | undefined, customer: CustomerRow, products: Product[]): { goal: Goal | null; fromPurchases: boolean } {
  if (profile?.goal) return { goal: profile.goal, fromPurchases: false };
  const score = new Map<Goal, number>();
  for (const o of customer.orders) {
    if (o.status === "CANCELLED") continue;
    for (const l of o.lines) for (const g of products.find((p) => p.slug === l.productSlug)?.goals ?? []) score.set(g, (score.get(g) ?? 0) + l.quantity);
  }
  // Empate: gana el que va primero en la lista de objetivos de la tienda.
  const best = goals.map((g) => g.id).filter((id) => score.has(id)).sort((a, b) => score.get(b)! - score.get(a)!)[0];
  return { goal: best ?? null, fromPurchases: !!best };
}

/** Cliente con lo que el panel calcula para él: objetivo y lo que se le termina. */
export interface CustomerView extends CustomerRow {
  goal: Goal | null;
  goalFromPurchases: boolean;
  repurchases: RepurchaseItem[];
}

export function customerViews(rows: CustomerRow[], profiles: Record<string, CustomerProfile>, products: Product[], today: string): CustomerView[] {
  return rows.map((c) => {
    const { goal, fromPurchases } = customerGoal(profiles[c.email.toLowerCase()], c, products);
    return { ...c, goal, goalFromPurchases: fromPurchases, repurchases: repurchaseItems(c, products, today) };
  });
}
