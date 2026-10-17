import { potsInUse, type Pot } from "../engine/repurchase";
import type { CustomerProfile, NoticeChannel, RepurchaseNotice } from "../fixtures/customers";
import type { Product } from "../types";
import type { CustomerRow } from "./customers";

/**
 * Recompra calculada en el panel (Fase 6): los potes de cada cliente con su nombre y su teléfono. El cálculo vive en
 * el engine (`engine/repurchase.ts`) y lo comparte "Mi box" de la tienda.
 */
export { lastingDays, OVERDUE_DAYS, remainingPct, startOf, stateOf, WEEK_DAYS, type RepurchaseState } from "../engine/repurchase";

export interface RepurchaseItem extends Pot {
  /** `${slug}:${runsOutOn}`: identifica el pote, así el mismo aviso no sale dos veces. */
  key: string;
  email: string;
  name: string;
  phone?: string;
}

/** Lo que se le termina a un cliente, del más próximo al más lejano (ver `potsInUse`). */
export function repurchaseItems(customer: CustomerRow, products: Product[], today: string): RepurchaseItem[] {
  return potsInUse(customer.orders, products, today).map((p) => ({ key: `${p.slug}:${p.runsOutOn}`, email: customer.email, name: customer.name, phone: customer.phone, ...p }));
}

/** Recompras de todos los clientes (sin los bloqueados) en un estado, por fecha y nombre. */
export function repurchasesIn(customers: { blocked: boolean; repurchases: RepurchaseItem[] }[], state: RepurchaseItem["state"]): RepurchaseItem[] {
  return customers
    .filter((c) => !c.blocked)
    .flatMap((c) => c.repurchases.filter((i) => i.state === state))
    .sort((a, b) => a.runsOutOn.localeCompare(b.runsOutOn) || a.name.localeCompare(b.name));
}

export function noticeFor(profile: CustomerProfile | undefined, item: Pick<RepurchaseItem, "key">): RepurchaseNotice | undefined {
  return profile?.notices?.find((n) => n.key === item.key);
}

/** Suma el aviso a la ficha; si ese pote ya tenía aviso, la ficha queda igual. */
export function withNotice(profile: CustomerProfile, key: string, channel: NoticeChannel, at: string): CustomerProfile {
  if (profile.notices?.some((n) => n.key === key)) return profile;
  return { ...profile, notices: [{ key, channel, at }, ...(profile.notices ?? [])] };
}
