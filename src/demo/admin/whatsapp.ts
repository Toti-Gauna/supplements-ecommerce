import type { EmailToken, Inline } from "../fixtures/emails";
import { WA_MESSAGES, type WaMessage, type WaMessageId } from "../fixtures/whatsapp";
import { contextForOrder, resolveInline } from "./emails/context";
import { customerWhatsappLink } from "./repurchase-text";
import type { AdminOrder } from "./types";

/**
 * WhatsApp por estado del pedido (R4b): qué mensaje corresponde, el texto con los datos del pedido y el link wa.me al
 * teléfono del cliente. Puro: lo editado por el dueño llega como `overrides` (store `volta-demo:whatsapp`).
 */
export type WaOverrides = Partial<Record<WaMessageId, Inline>>;

const isInline = (x: unknown): x is Inline =>
  Array.isArray(x) && x.every((p) => p && typeof p === "object" && ((p.kind === "text" && typeof p.text === "string") || (p.kind === "token" && typeof p.token === "string")));

export const waMessage = (id: WaMessageId): WaMessage => WA_MESSAGES.find((m) => m.id === id)!;

/** Texto vigente de un mensaje: el editado (si es válido y no quedó vacío) o el de muestra. */
export function waInline(id: WaMessageId, overrides: WaOverrides = {}): Inline {
  const edited = overrides[id];
  return isInline(edited) && edited.some((p) => p.kind === "token" || p.text.trim()) ? edited : waMessage(id).text;
}

/** El mensaje que corresponde al estado del pedido (el rechazo y la forma de entrega cambian el texto). */
export function waMessageIdFor(order: Pick<AdminOrder, "status" | "fulfillment" | "proof">): WaMessageId {
  switch (order.status) {
    case "PENDING_PAYMENT": return order.proof?.status === "REJECTED" ? "proof-rejected" : "order-created";
    case "PAYMENT_REVIEW": return "proof-received";
    case "PAID": return "payment-approved";
    case "IN_PRODUCTION": return "preparing";
    case "READY": return order.fulfillment === "PICKUP" ? "ready-pickup" : "ready-delivery";
    case "SHIPPED": return "shipped";
    case "DELIVERED": return "delivered";
    case "IN_CLAIM": return "claim";
    case "CANCELLED": return "cancelled";
    case "RETURNED": return "returned";
  }
}

/** Fichas que se pueden usar en un mensaje de WhatsApp (el motivo, solo en el del rechazo). */
export function waTokens(id: WaMessageId): EmailToken[] {
  const base: EmailToken[] = ["customer.firstName", "customer.name", "order.code", "order.total", "order.deliveryDate", "order.fulfillment", "order.status"];
  return id === "proof-rejected" ? [...base, "order.rejectReason"] : base;
}

/** Texto listo para mandar a este cliente con este pedido. */
export function waTextFor(order: AdminOrder, overrides: WaOverrides = {}, id: WaMessageId = waMessageIdFor(order)): string {
  return resolveInline(waInline(id, overrides), contextForOrder(order));
}

export interface OrderWhatsapp {
  id: WaMessageId;
  label: string;
  text: string;
  /** wa.me con el número del cliente y el mensaje; null si el pedido no tiene un teléfono que sirva. */
  href: string | null;
}

export function orderWhatsapp(order: AdminOrder, overrides: WaOverrides = {}): OrderWhatsapp {
  const id = waMessageIdFor(order);
  const text = waTextFor(order, overrides, id);
  return { id, label: waMessage(id).label, text, href: customerWhatsappLink(order.customer.phone, text) };
}

/** Mensajes que acompañan a una plantilla de email (los dos "Listo" van cada uno con el suyo). */
export const waForEmail = (templateId: string): WaMessage[] => WA_MESSAGES.filter((m) => m.emailId === templateId);

/** Estados que solo tienen WhatsApp (sin email automático). */
export const waOnly = (): WaMessage[] => WA_MESSAGES.filter((m) => !m.emailId);

/** Pedido de muestra para ver un mensaje: uno en su estado (y con su forma de entrega), o el primero que haya. */
export function waSampleOrder(id: WaMessageId, orders: AdminOrder[]): AdminOrder | undefined {
  return orders.find((o) => waMessageIdFor(o) === id) ?? orders.find((o) => o.status === waMessage(id).status) ?? orders[0];
}
