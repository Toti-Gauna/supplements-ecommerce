import { quotePack } from "../engine/packs";
import { deliveriesWithin, monthlyAmount, nextDelivery, type Subscription, type SubscriptionStatus } from "../engine/subscriptions";
import type { WorkCalendar } from "../engine/workdays";
import type { Pack } from "../types";

/** Ventana de "Qué preparar": las entregas de los próximos 30 días. */
export const PREPARE_DAYS = 30;

export interface SubscriptionRow {
  sub: Subscription;
  customer: string;
  /** Nombre del pack, o "Pack quitado" si ya no existe. */
  packName: string;
  packFound: boolean;
  next: string | null;
  /** Lo que sale cada entrega (suplementos con los dos descuentos); null si el pack ya no existe. */
  amount: number | null;
  /** La compró alguien en la tienda de este navegador (si no, es una suscripción de muestra). */
  fromShop: boolean;
}

export function subscriptionRows(subs: Subscription[], packs: Pack[], today: string, cal: WorkCalendar): SubscriptionRow[] {
  return subs.map((sub) => {
    const pack = packs.find((p) => p.id === sub.packId);
    return {
      sub, customer: sub.customer ?? "Cliente sin nombre", packName: pack?.name ?? "Pack quitado", packFound: !!pack,
      next: nextDelivery(sub, today, cal), amount: monthlyAmount(sub, packs), fromShop: !sub.seed,
    };
  });
}

export interface SubscriptionStats {
  active: number;
  paused: number;
  cancelled: number;
  /** Suma de lo que sale cada entrega de las suscripciones activas: una estimación, en la demo no se cobra nada. */
  monthlyIncome: number;
  /** Entregas que hay que armar en los próximos 30 días. */
  deliveries: number;
}

export function subscriptionStats(subs: Subscription[], packs: Pack[], today: string, cal: WorkCalendar): SubscriptionStats {
  const count = (status: SubscriptionStatus) => subs.filter((s) => s.status === status).length;
  return {
    active: count("active"), paused: count("paused"), cancelled: count("cancelled"),
    monthlyIncome: subs.filter((s) => s.status === "active").reduce((sum, s) => sum + (monthlyAmount(s, packs) ?? 0), 0),
    deliveries: deliveriesWithin(subs, today, PREPARE_DAYS, cal).length,
  };
}

export interface PrepareLine { productSlug: string; name: string; variantLabel: string; qty: number }
export interface PrepareDelivery { sub: Subscription; customer: string; packName: string; lines: PrepareLine[] }
export interface PrepareDay { date: string; deliveries: PrepareDelivery[]; units: number }
export interface PrepareTotal extends PrepareLine { key: string }
export interface PrepareList { days: PrepareDay[]; totals: PrepareTotal[]; units: number; deliveries: number }

/**
 * Qué armar en los próximos 30 días: por fecha, las entregas con lo que se repite (el equipamiento viaja solo en la
 * primera entrega) y, para comprarle al proveedor, el total de unidades por producto de todo el período.
 */
export function prepareList(subs: Subscription[], packs: Pack[], today: string, cal: WorkCalendar): PrepareList {
  const byDate = new Map<string, PrepareDelivery[]>();
  const totals = new Map<string, PrepareTotal>();
  for (const { sub, date } of deliveriesWithin(subs, today, PREPARE_DAYS, cal)) {
    const pack = packs.find((p) => p.id === sub.packId);
    const lines: PrepareLine[] = pack
      ? quotePack(pack, sub.choices).lines.filter((l) => l.recurring).map((l) => ({ productSlug: l.product.slug, name: l.product.name, variantLabel: l.variant.label, qty: l.item.qty }))
      : [];
    for (const l of lines) {
      const key = `${l.productSlug}::${l.variantLabel}`;
      totals.set(key, { ...l, key, qty: (totals.get(key)?.qty ?? 0) + l.qty });
    }
    byDate.set(date, [...(byDate.get(date) ?? []), { sub, customer: sub.customer ?? "Cliente sin nombre", packName: pack?.name ?? "Pack quitado", lines }]);
  }
  const days = [...byDate].map(([date, deliveries]) => ({ date, deliveries, units: deliveries.reduce((s, d) => s + d.lines.reduce((n, l) => n + l.qty, 0), 0) }));
  const list = [...totals.values()].sort((a, b) => a.name.localeCompare(b.name, "es") || a.variantLabel.localeCompare(b.variantLabel, "es"));
  return { days, totals: list, units: list.reduce((s, t) => s + t.qty, 0), deliveries: days.reduce((s, d) => s + d.deliveries.length, 0) };
}
