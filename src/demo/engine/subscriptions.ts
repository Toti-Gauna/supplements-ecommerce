import type { Pack } from "../types";
import type { CartLine } from "./cart-types";
import { addDays, nextWorkday, type WorkCalendar } from "./workdays";
import { quotePack } from "./packs";

/**
 * Suscripciones a un pack (L3), SIMULADAS: no hay cobro ni débito automático en la demo. Reglas puras sobre fechas
 * AAAA-MM-DD. La primera entrega es el pedido; las siguientes salen el día elegido de cada mes, en el próximo día hábil.
 */
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface Subscription {
  id: string;
  packId: string;
  /** Producto → variante elegida para cada entrega. */
  choices: Record<string, string>;
  /** Día del mes (1–28) en que se recibe. */
  day: number;
  status: SubscriptionStatus;
  /** Día de la primera entrega (la del pedido). */
  startedOn: string;
  /** Código del pedido que la inició. */
  orderCode: string;
  /** La próxima entrega se saltea (viaje, todavía tenés stock). */
  skipNext: boolean;
  /** Nombre de quien compró (sale del pedido). */
  customer?: string;
  /** Suscripción de MUESTRA del panel: Mi cuenta no la muestra, es de un cliente inventado. */
  seed?: boolean;
}

export const SUBSCRIPTION_LABEL: Record<SubscriptionStatus, string> = { active: "Activa", paused: "Pausada", cancelled: "Cancelada" };
export const DELIVERY_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

export function validDay(day: number): boolean {
  return Number.isInteger(day) && day >= 1 && day <= 28;
}

export function createSubscription(input: { pack: Pack; choices: Record<string, string>; day: number; today: string; orderCode: string; id: string; customer?: string }): Subscription {
  if (!validDay(input.day)) throw new Error("El día de entrega va de 1 a 28.");
  return {
    id: input.id, packId: input.pack.id, choices: input.choices, day: input.day, status: "active", startedOn: input.today, orderCode: input.orderCode, skipNext: false,
    ...(input.customer ? { customer: input.customer } : {}),
  };
}

/** El día `day` del mes de `from`, o del mes siguiente si ya pasó (o es el mismo día). */
function occurrenceAfter(from: string, day: number): string {
  const [y, m] = from.split("-").map(Number) as [number, number];
  const thisMonth = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (thisMonth > from) return thisMonth;
  const next = m === 12 ? [y + 1, 1] : [y, m + 1];
  return `${next[0]}-${String(next[1]).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Próxima entrega: la primera fecha del día elegido posterior a hoy (y a la primera entrega), corrida al próximo día
 * hábil del local. Con "saltear la próxima", la del mes siguiente. null si está pausada o cancelada.
 */
export function nextDelivery(sub: Subscription, today: string, cal: WorkCalendar): string | null {
  if (sub.status !== "active") return null;
  let from = today > sub.startedOn ? today : sub.startedOn;
  let date = occurrenceAfter(from, sub.day);
  if (sub.skipNext) { from = date; date = occurrenceAfter(from, sub.day); }
  return nextWorkday(date, cal, true);
}

/** Entregas de los próximos `days` días (para el panel: qué hay que preparar). */
export function deliveriesWithin(subs: Subscription[], today: string, days: number, cal: WorkCalendar): { sub: Subscription; date: string }[] {
  const limit = addDays(today, days);
  return subs.flatMap((sub) => { const date = nextDelivery(sub, today, cal); return date && date <= limit ? [{ sub, date }] : []; })
    .sort((a, b) => a.date.localeCompare(b.date) || a.sub.id.localeCompare(b.sub.id));
}

type Change = (sub: Subscription) => Subscription;
const only = (from: SubscriptionStatus[], change: Change): Change => (sub) => (from.includes(sub.status) ? change(sub) : sub);

export const pauseSubscription: Change = only(["active"], (s) => ({ ...s, status: "paused", skipNext: false }));
export const resumeSubscription: Change = only(["paused"], (s) => ({ ...s, status: "active" }));
export const cancelSubscription: Change = only(["active", "paused"], (s) => ({ ...s, status: "cancelled", skipNext: false }));
export const toggleSkipNext: Change = only(["active"], (s) => ({ ...s, skipNext: !s.skipNext }));
export const changeDay = (sub: Subscription, day: number): Subscription => (sub.status !== "cancelled" && validDay(day) ? { ...sub, day } : sub);

/** Cuánto sale cada entrega (suplementos con los dos descuentos) con lo elegido, o null si el pack ya no existe. */
export function monthlyAmount(sub: Subscription, packs: Pack[]): number | null {
  const pack = packs.find((p) => p.id === sub.packId);
  return pack ? quotePack(pack, sub.choices).monthlyPrice : null;
}

/** Cuántas veces al año recibe y cuánto ahorra frente a comprar suelto: para el cartel "ahorrás $X por mes". */
export function monthlySavingOf(sub: Subscription, packs: Pack[]): number {
  const pack = packs.find((p) => p.id === sub.packId);
  return pack ? quotePack(pack, sub.choices).monthlySaving : 0;
}

/**
 * Suscripciones que arma un pedido: una por cada pack del carrito que se compró "todos los meses" y llegó completo
 * (si faltaba un producto no hubo descuento y no es el pack, así que tampoco se suscribe).
 */
export function subscriptionsFromLines(lines: CartLine[], packs: Pack[], ctx: { today: string; orderCode: string; newId: () => string; customer?: string }): Subscription[] {
  const ids = [...new Set(lines.filter((l) => l.packId && l.monthlyDay !== undefined).map((l) => l.packId!))];
  return ids.flatMap((packId) => {
    const pack = packs.find((p) => p.id === packId);
    const group = lines.filter((l) => l.packId === packId);
    const complete = pack && pack.items.every((it) => group.some((l) => l.productSlug === it.productSlug && l.quantity >= it.qty));
    if (!pack || !complete) return [];
    const choices = Object.fromEntries(group.map((l) => [l.productSlug, l.variantId]));
    return [createSubscription({ pack, choices, day: group[0]!.monthlyDay!, today: ctx.today, orderCode: ctx.orderCode, id: ctx.newId(), customer: ctx.customer })];
  });
}
