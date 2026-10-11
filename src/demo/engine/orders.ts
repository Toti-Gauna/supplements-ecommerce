import type { FulfillmentType } from "../types";

/** Estados y transiciones del pedido (spec 5.2). En producción: una sola función transition() en el servidor. */
export type OrderStatus =
  | "PENDING_PAYMENT" | "PAYMENT_REVIEW" | "PAID" | "IN_PRODUCTION" | "READY"
  | "SHIPPED" | "DELIVERED" | "CANCELLED" | "IN_CLAIM" | "RETURNED";

export type TransitionTrigger = "proof-received" | "proof-approved" | "proof-rejected" | "provider-confirmed" | "admin";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  PAYMENT_REVIEW: "Comprobante en revisión",
  PAID: "Pagado",
  IN_PRODUCTION: "En producción",
  READY: "Listo",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  IN_CLAIM: "En reclamo",
  RETURNED: "Devuelto",
};

export const ORDER_STATUSES = Object.keys(STATUS_LABEL) as OrderStatus[];
const AFTER_PAID: OrderStatus[] = ["PAID", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED"];

export interface TransitionContext {
  fulfillment: FulfillmentType;
  trigger: TransitionTrigger;
  /** Estado previo al reclamo, para volver si se resuelve sin devolución. */
  prevStatus?: OrderStatus | null;
}

export function canTransition(from: OrderStatus, to: OrderStatus, ctx: TransitionContext): boolean {
  const { trigger, fulfillment } = ctx;
  switch (from) {
    case "PENDING_PAYMENT":
      if (to === "PAYMENT_REVIEW") return trigger === "proof-received";
      if (to === "PAID") return trigger === "provider-confirmed";
      return to === "CANCELLED" && trigger === "admin";
    case "PAYMENT_REVIEW":
      if (to === "PAID") return trigger === "proof-approved";
      if (to === "PENDING_PAYMENT") return trigger === "proof-rejected";
      return false;
    case "IN_CLAIM":
      return trigger === "admin" && (to === "RETURNED" || to === ctx.prevStatus);
    case "CANCELLED":
    case "RETURNED":
      return false;
    default:
      if (trigger !== "admin") return false;
      if (to === "IN_CLAIM") return true;
      if (from === "PAID") return to === "IN_PRODUCTION";
      if (from === "IN_PRODUCTION") return to === "READY";
      if (from === "READY") return fulfillment === "PICKUP" ? to === "DELIVERED" : to === "SHIPPED";
      if (from === "SHIPPED") return to === "DELIVERED";
      return false;
  }
}

/** Acciones manuales que el panel ofrece para un pedido (sin las de cobro, que tienen su propia cola). */
export function manualNextStatuses(from: OrderStatus, fulfillment: FulfillmentType, prevStatus?: OrderStatus | null): OrderStatus[] {
  return ORDER_STATUSES.filter((to) => to !== from && canTransition(from, to, { fulfillment, trigger: "admin", prevStatus }));
}

export function isPaidOrLater(status: OrderStatus): boolean {
  return AFTER_PAID.includes(status);
}
