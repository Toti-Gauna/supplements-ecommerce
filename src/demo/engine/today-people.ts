import { BIRTHDAY_GIFT_AMOUNT, BIRTHDAY_TODAY_DAYS, birthdayState, birthdayWhen } from "../admin/birthday";
import { customerRows, customerViews } from "../admin/customers";
import { noticeFor, repurchasesIn, type RepurchaseItem } from "../admin/repurchase";
import { whenText } from "../admin/repurchase-text";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import type { TodayAction, TodaySnapshot } from "./today";

/**
 * Clientes y regalos en la lista de hoy (R4a). Reglas:
 * - Recompras (se le terminó o se le termina en 7 días) que todavía no se avisaron → una fila: "Para hoy" si a alguien
 *   ya se le terminó o se le termina hoy; si no, "Esta semana". Avisar (email o WhatsApp) lo saca de la cuenta.
 * - Regalos de producto o stack con el sabor o el tamaño ya elegido por quien lo recibe → "Esta semana", uno por regalo.
 * - Cumpleaños (R4c): quien cumple hoy → "Para hoy"; en 1 a 3 días → "Esta semana". Armar el regalo lo saca de la lista.
 */
export const REPURCHASE_HREF = "/admin-demo/usuarios/?segmento=semana";
export const giftHref = (code: string) => `/admin-demo/regalos/?ver=regalos&q=${code}`;

export interface DueRepurchase extends RepurchaseItem {
  /** Ya se le avisó (por email o WhatsApp). */
  notified: boolean;
}

/** Atrasadas y de la semana, de la más vieja a la más nueva, marcando las que ya se avisaron. */
export function dueRepurchases(snap: TodaySnapshot, today: string): DueRepurchase[] {
  const views = customerViews(customerRows(snap.users, snap.orders), snap.workshop.profiles, snap.data.products, today);
  return [...repurchasesIn(views, "overdue"), ...repurchasesIn(views, "week")]
    .map((i) => ({ ...i, notified: !!noticeFor(snap.workshop.profiles[i.email.toLowerCase()], i) }));
}

export function repurchaseAction(snap: TodaySnapshot, today: string): TodayAction | null {
  const items = dueRepurchases(snap, today).filter((i) => !i.notified);
  if (!items.length) return null;
  const people = [...new Set(items.map((i) => i.email))];
  const first = items[0]!;
  const others = people.length - 1;
  const firstWhen = first.inDays < 0 ? `se le terminó ${whenText(first.inDays)}` : `se le termina ${whenText(first.inDays)}`;
  return {
    id: "repurchase:due", kind: "repurchase", tier: items.some((i) => i.inDays <= 0) ? "hoy" : "semana", due: first.runsOutOn,
    title: people.length === 1 ? "Avisale a 1 cliente que se le termina el pote" : `Avisales a ${people.length} clientes que se les termina el pote`,
    detail: `${first.name} (${first.product}, ${firstWhen})${others > 0 ? ` y ${plural(others, "persona más", "personas más")}` : ""}. El mensaje ya está escrito.`,
    metric: { value: people.length }, href: REPURCHASE_HREF,
    cta: { type: "repurchase", label: "Avisarles", keys: items.map((i) => `${i.email}|${i.key}`) },
  };
}

export function giftActions(snap: TodaySnapshot): TodayAction[] {
  return (snap.data.giftRecords ?? []).filter((r) => r.kind !== "gift-card" && r.status === "elegido").map((r) => ({
    id: `gift:${r.code}`, kind: "gift", tier: "semana", due: (r.chosenAt ?? r.createdAt).slice(0, 10),
    title: `Armá el regalo para ${r.to}`,
    detail: `${r.itemName}${r.chosenLabel ? ` · ${r.chosenLabel}` : ""} · de ${r.from}${r.orderCode ? ` · pedido ${r.orderCode}` : ""}`,
    metric: { value: 1, unit: "regalo" }, href: giftHref(r.code),
    cta: { type: "link", label: "Ver el regalo", href: giftHref(r.code) },
  }));
}

export const profileLink = (email: string) => `/admin-demo/usuarios/ficha/?email=${encodeURIComponent(email)}`;

export function birthdayActions(snap: TodaySnapshot, today: string): TodayAction[] {
  return customerRows(snap.users, snap.orders).filter((c) => !c.blocked).flatMap((c): TodayAction[] => {
    const state = birthdayState(snap.workshop.profiles[c.email.toLowerCase()], today);
    if (!state || state.done || state.inDays > BIRTHDAY_TODAY_DAYS) return [];
    return [{
      id: `birthday:${c.email.toLowerCase()}`, kind: "birthday", tier: state.inDays === 0 ? "hoy" : "semana", due: state.date,
      title: `${c.name} cumple años ${birthdayWhen(state.inDays)}`,
      detail: `Mandale el regalo de cumpleaños: una gift card de ${formatARS(BIRTHDAY_GIFT_AMOUNT)} de la casa, con el mensaje de WhatsApp ya escrito.`,
      metric: { value: state.inDays, unit: state.inDays === 0 ? "hoy" : state.inDays === 1 ? "día" : "días" }, href: profileLink(c.email),
      cta: { type: "link", label: "Mandarle el regalo", href: `${profileLink(c.email)}#regalo-cumple` },
    }];
  });
}
