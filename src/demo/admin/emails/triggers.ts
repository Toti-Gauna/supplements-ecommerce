import type { OrderStatus } from "../../engine/orders";
import type { EmailTemplate, EmailTrigger } from "../../fixtures/emails";
import type { AdminOrder } from "../types";
import { contextForOrder, fitsFulfillment, type EmailContext } from "./context";
import { renderEmail, type RenderedEmail } from "./render";

/** Email "enviado" en la demo: queda en la bandeja de salida del panel con el contenido tal como salió. */
export interface OutboxEmail {
  id: string;
  at: string;
  to: string;
  name: string;
  templateId: string;
  templateName: string;
  trigger: EmailTrigger;
  orderCode?: string;
  /** Envío de prueba desde el editor (no lo dispara un evento). */
  test?: boolean;
  /** Clave del evento que lo originó (por ejemplo, la recompra de un producto) para no repetirlo. */
  key?: string;
  email: RenderedEmail;
}

export const OUTBOX_LIMIT = 60;

/**
 * Qué disparadores corresponden a un cambio de estado del pedido (los estados de `engine/orders`):
 * comprobante subido → revisión, pago aprobado (comprobante o Mercado Pago), comprobante rechazado, pagado →
 * preparación, preparación → listo, listo → en camino, en camino o listo (retiro) → entregado. Volver de un reclamo,
 * cancelar o devolver no manda ningún email.
 */
export function triggersForTransition(from: OrderStatus, to: OrderStatus): EmailTrigger[] {
  if (to === "PAYMENT_REVIEW" && from === "PENDING_PAYMENT") return ["proof-received"];
  if (to === "PAID" && (from === "PENDING_PAYMENT" || from === "PAYMENT_REVIEW")) return ["payment-approved"];
  if (to === "PENDING_PAYMENT" && from === "PAYMENT_REVIEW") return ["proof-rejected"];
  if (to === "IN_PRODUCTION" && from === "PAID") return ["preparing"];
  if (to === "READY" && from === "IN_PRODUCTION") return ["ready"];
  if (to === "SHIPPED" && from === "READY") return ["shipped"];
  if (to === "DELIVERED" && (from === "SHIPPED" || from === "READY")) return ["delivered"];
  return [];
}

/** Disparadores de una compra nueva (un solo email: la confirmación). */
export function triggersForNewOrder(): EmailTrigger[] {
  return ["order-created"];
}

let seq = 0;
const mailId = () => `mail-${Date.now().toString(36)}-${++seq}`;

/**
 * Un email por plantilla activa de cada disparador que corresponda a la forma de entrega del pedido (por ejemplo,
 * "Listo para retirar" solo en los retiros). `force` arma la prueba del editor aunque la plantilla no aplique.
 */
export function composeEmails(templates: EmailTemplate[], triggers: EmailTrigger[], ctx: EmailContext, at: string, opts: { orderCode?: string; key?: string; force?: boolean } = {}): OutboxEmail[] {
  const { orderCode, key, force } = opts;
  return triggers.flatMap((trigger) =>
    templates.filter((t) => t.trigger === trigger && (force || (t.active && fitsFulfillment(t, ctx.order?.fulfillment)))).map((t) => ({
      id: mailId(), at, to: ctx.email, name: ctx.customerName, templateId: t.id, templateName: t.name, trigger,
      ...(orderCode ? { orderCode } : {}), ...(key ? { key } : {}), email: renderEmail(t, ctx),
    })));
}

export function emailsForOrder(templates: EmailTemplate[], triggers: EmailTrigger[], order: AdminOrder, at: string): OutboxEmail[] {
  return composeEmails(templates, triggers, contextForOrder(order), at, { orderCode: order.code });
}

/** Emails de un pedido desde que se creó (el código del pedido demo se reusa en cada compra de prueba). */
export function emailsOfOrder(outbox: OutboxEmail[], code: string, createdAt: string): OutboxEmail[] {
  const since = Date.parse(createdAt);
  return outbox.filter((m) => m.orderCode === code && Date.parse(m.at) >= since);
}

/** Suma a la bandeja (lo más nuevo primero) sin pasar el límite. */
export function pushOutbox(outbox: OutboxEmail[], emails: OutboxEmail[]): OutboxEmail[] {
  return emails.length ? [...emails, ...outbox].slice(0, OUTBOX_LIMIT) : outbox;
}

/** Clave de un aviso de recompra (una vez por cliente, producto y fecha en que se termina). */
export const repurchaseKey = (email: string, slug: string, date: string) => `repurchase:${email.toLowerCase()}:${slug}:${date}`;
