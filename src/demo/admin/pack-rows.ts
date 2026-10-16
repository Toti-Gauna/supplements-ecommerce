import { quotePack, type PackQuote } from "../engine/packs";
import type { Subscription } from "../engine/subscriptions";
import type { Pack } from "../types";

/** Lo que muestra la lista de packs del panel: precios de la primera entrega y del mes, y cuánta gente lo recibe. */
export interface PackRow {
  pack: Pack;
  quote: PackQuote;
  products: number;
  /** Suscripciones activas a este pack (las pausadas y canceladas no cuentan). */
  activeSubs: number;
  visible: boolean;
}

export const activeSubscriptions = (subs: Subscription[], packId?: string): number =>
  subs.filter((s) => s.status === "active" && (packId === undefined || s.packId === packId)).length;

export function packRows(packs: Pack[], subs: Subscription[]): PackRow[] {
  return packs.map((pack) => ({
    pack, quote: quotePack(pack), products: pack.items.length, activeSubs: activeSubscriptions(subs, pack.id), visible: pack.active !== false,
  }));
}

/** "−10 %" o "−10 % + 5 % por mes": lo que se descuenta por llevar el pack y por recibirlo todos los meses. */
export function discountLabel(pack: Pick<Pack, "discountPct" | "monthlyPct">): string {
  return pack.monthlyPct > 0 ? `${pack.discountPct} % + ${pack.monthlyPct} % por mes` : `${pack.discountPct} %`;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Dato vivo de la tarjeta de Marketing: "9 packs · 3 suscripciones activas". */
export function packsHubMeta(packs: Pack[], subs: Subscription[]): string {
  return `${plural(packs.length, "pack", "packs")} · ${plural(activeSubscriptions(subs), "suscripción activa", "suscripciones activas")}`;
}
