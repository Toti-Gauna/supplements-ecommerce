import type { AdminOrder } from "../admin/types";
import type { FulfillmentType, PaymentMethod } from "../types";
import { formatDay } from "@/lib/date";
import { plural } from "@/lib/plural";
import type { TodayAction, TodayTier } from "./today";
import { addDays } from "./workdays";

/**
 * Pedidos en la lista de hoy (R4a). Reglas:
 * - Comprobante en revisión → "Para hoy", uno por pedido: el que sale antes, primero. El botón aprueba solo después de
 *   confirmar que el ingreso se verificó; nunca se marca pagado sin esa confirmación.
 * - Pagado o en preparación con la fecha de despacho vencida → "Atrasado", uno por pedido.
 * - Pagado o en preparación que sale hoy → "Para hoy", uno por pedido.
 * - Listo con fecha de hoy (o vencida) → "Para hoy" ("Atrasado" si ya tenía que salir): se marca enviado o retirado.
 * - El resto para armar → una sola fila: "Esta semana" si alguno sale en los próximos 7 días; si no, "Más adelante".
 */
const PAY: Record<PaymentMethod, string> = { BANK_TRANSFER: "transferencia", QR_MANUAL: "QR", CHECKOUT_PRO: "Mercado Pago" };
const HOW: Record<FulfillmentType, string> = { LOCAL_DELIVERY: "cadete", PICKUP: "retira en el local", SHIPPING: "correo" };
const orderHref = (code: string) => `/admin-demo/pedidos/detalle/?codigo=${code}`;
export const PREPARATION_HREF = "/admin-demo/preparacion/";
const short = (day: string) => formatDay(day).replace(",", "");

/** Pagado o en preparación: falta armarlo. */
export const toPack = (o: Pick<AdminOrder, "status">) => o.status === "PAID" || o.status === "IN_PRODUCTION";
/** Comprobante subido que espera la revisión del dueño. */
export const inReview = (o: Pick<AdminOrder, "status" | "proof">) => o.status === "PAYMENT_REVIEW" && o.proof?.status === "IN_REVIEW";

function stageText(o: AdminOrder): string {
  if (o.status === "PAID") return "sin empezar";
  return o.stage === "lot-check" ? "en control de lote" : "armándose";
}

export function receiptActions(orders: AdminOrder[], today: string): TodayAction[] {
  return orders.filter(inReview).map((o) => {
    const day = o.promisedDate ?? today;
    const when = day <= today ? "hoy" : `el ${short(day)}`;
    const how = o.fulfillment === "PICKUP" ? `retira ${when}` : `${HOW[o.fulfillment]}, sale ${when}`;
    return {
      id: `receipt:${o.code}`, kind: "receipt", tier: "hoy", due: day < today ? today : day,
      title: `Comprobante de ${o.customer.name}`,
      detail: `${o.code} · ${PAY[o.paymentMethod]} · ${how}. Mirá tu cuenta antes de aprobar.`,
      metric: { value: o.total, money: true }, href: `/admin-demo/pagos/detalle/?codigo=${o.code}`,
      cta: { type: "approve", label: "Aprobar", code: o.code, amount: o.total },
    };
  });
}

export function lateAndTodayActions(orders: AdminOrder[], today: string): TodayAction[] {
  return orders.filter((o) => toPack(o) && o.promisedDate && o.promisedDate <= today).map((o) => {
    const late = o.promisedDate! < today;
    return {
      id: `${late ? "late" : "pack"}:${o.code}`, kind: late ? "late" : "pack", tier: late ? "atrasado" : "hoy", due: o.promisedDate!,
      title: late ? `${o.code} está atrasado` : `Armá ${o.code}: sale hoy`,
      detail: `${o.customer.name} · ${HOW[o.fulfillment]} · ${late ? `tenía que salir el ${short(o.promisedDate!)}` : "fecha de hoy"} · ${stageText(o)}`,
      metric: { value: 1, unit: "pedido" }, href: orderHref(o.code),
      cta: { type: "link", label: late ? "Terminar de armar" : "Armar", href: orderHref(o.code) },
    };
  });
}

export function dispatchActions(orders: AdminOrder[], today: string): TodayAction[] {
  return orders.filter((o) => o.status === "READY" && o.promisedDate && o.promisedDate <= today).map((o) => {
    const pickup = o.fulfillment === "PICKUP";
    const late = o.promisedDate! < today;
    const tier: TodayTier = late ? "atrasado" : "hoy";
    return {
      id: `dispatch:${o.code}`, kind: "dispatch", tier, due: o.promisedDate!,
      title: pickup ? `${o.customer.name} retira ${o.code}` : o.fulfillment === "LOCAL_DELIVERY" ? `${o.code} sale hoy con el cadete` : `${o.code} va al correo hoy`,
      detail: `${o.customer.name}${o.address ? ` · ${o.address}` : ""}${late ? ` · tenía que salir el ${short(o.promisedDate!)}` : ""} · listo y con el lote controlado`,
      metric: { value: 1, unit: "pedido" }, href: orderHref(o.code),
      cta: { type: "dispatch", label: pickup ? "Marcar retirado" : "Marcar enviado", code: o.code, to: pickup ? "DELIVERED" : "SHIPPED" },
    };
  });
}

/** El resto de lo que hay que armar, en una fila: el que sale antes manda. */
export function packAction(orders: AdminOrder[], today: string): TodayAction | null {
  const rest = orders.filter((o) => toPack(o) && !(o.promisedDate && o.promisedDate <= today))
    .sort((a, b) => (a.promisedDate ?? "9999").localeCompare(b.promisedDate ?? "9999") || a.code.localeCompare(b.code));
  const first = rest[0];
  if (!first) return null;
  const due = first.promisedDate ?? addDays(today, 30);
  return {
    id: "pack:rest", kind: "pack", tier: due <= addDays(today, 7) ? "semana" : "despues", due,
    title: `Armá ${plural(rest.length, "pedido", "pedidos")} de la semana`,
    detail: `El primero sale el ${short(due)} (${first.code}, ${HOW[first.fulfillment]}). ${rest.filter((o) => o.status === "PAID").length} sin empezar.`,
    metric: { value: rest.length }, href: PREPARATION_HREF,
    cta: { type: "link", label: "Abrir preparación", href: PREPARATION_HREF },
  };
}
