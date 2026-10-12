import type { CartLine } from "../../engine/cart-types";
import { getProduct } from "../../engine/catalog";
import type { OrderStatus } from "../../engine/orders";
import type { EmailTemplate, EmailToken, EmailTrigger, Inline } from "../../fixtures/emails";
import type { FulfillmentType } from "../../types";
import { addDays } from "../../engine/workdays";
import { formatDay, toDayKey } from "@/lib/date";
import { formatARS } from "@/lib/money";
import type { AdminOrder } from "../types";

/** Datos con los que se arma un email: el cliente y, según el disparador, un pedido o el producto que se termina. */
export interface EmailContext {
  customerName: string;
  email: string;
  order?: {
    code: string;
    total: number;
    deliveryDate?: string;
    fulfillment: FulfillmentType;
    status: OrderStatus;
    lines: CartLine[];
    /** Motivo con el que se rechazó el comprobante (si se rechazó). */
    rejectReason?: string;
  };
  /** Aviso de recompra: el producto y el día (AAAA-MM-DD) en que se le termina. */
  refill?: { slug: string; variantId?: string; date: string };
}

export const FULFILLMENT_LABEL: Record<FulfillmentType, string> = { PICKUP: "Retiro en el local", LOCAL_DELIVERY: "Cadete en Mar del Plata", SHIPPING: "Envío por correo" };

/** Estado como lo lee el cliente (no el nombre interno del panel). */
export function customerStatus(status: OrderStatus, fulfillment: FulfillmentType): string {
  const pickup = fulfillment === "PICKUP";
  const map: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "Esperando el pago", PAYMENT_REVIEW: "Revisando tu pago", PAID: "Pago aprobado", IN_PRODUCTION: "Preparando tu pedido",
    READY: pickup ? "Listo para retirar" : "Listo para salir", SHIPPED: "En camino", DELIVERED: pickup ? "Retirado" : "Entregado",
    CANCELLED: "Cancelado", IN_CLAIM: "En revisión", RETURNED: "Devuelto",
  };
  return map[status];
}

export function contextForOrder(order: AdminOrder): EmailContext {
  return {
    customerName: order.customer.name, email: order.customer.email,
    order: {
      code: order.code, total: order.total, deliveryDate: order.promisedDate, fulfillment: order.fulfillment, status: order.status, lines: order.lines,
      ...(order.proof?.rejectReason ? { rejectReason: order.proof.rejectReason } : {}),
    },
  };
}

/** ¿La plantilla corresponde a esta forma de entrega? (sin `only`, a todas). */
export function fitsFulfillment(template: Pick<EmailTemplate, "only">, fulfillment: FulfillmentType | undefined): boolean {
  return !template.only || !fulfillment || template.only.includes(fulfillment);
}

const RELEVANT: Partial<Record<EmailTrigger, OrderStatus[]>> = {
  "proof-received": ["PAYMENT_REVIEW"], "proof-rejected": ["PENDING_PAYMENT"], "payment-approved": ["PAID"], preparing: ["IN_PRODUCTION"],
  ready: ["READY"], shipped: ["SHIPPED"], delivered: ["DELIVERED"],
};

/** Pedido para la vista previa: uno que encaje con la forma de entrega de la plantilla y, si hay, en su estado. */
export function sampleOrderFor(template: Pick<EmailTemplate, "trigger" | "only">, orders: AdminOrder[]): AdminOrder | undefined {
  const fit = orders.filter((o) => o.status !== "CANCELLED" && fitsFulfillment(template, o.fulfillment));
  const states = RELEVANT[template.trigger] ?? [];
  return fit.find((o) => states.includes(o.status)) ?? fit.find((o) => o.status === "IN_PRODUCTION") ?? fit[0] ?? orders[0];
}

/** Recompra de muestra: el primer producto con servicios de un pedido pagado; se termina a un servicio por día. */
export function refillContextFor(order: AdminOrder): EmailContext | null {
  for (const line of order.lines) {
    const variant = getProduct(line.productSlug)?.variants.find((v) => v.id === line.variantId);
    if (!variant?.servings || variant.servings < 2) continue;
    return { customerName: order.customer.name, email: order.customer.email, refill: { slug: line.productSlug, variantId: line.variantId, date: addDays(toDayKey(order.createdAt), variant.servings * line.quantity) } };
  }
  return null;
}

/** Pedidos con los que se puede ver la plantilla: los que la reciben por su forma de entrega o, en la recompra, los que traen un producto con servicios. */
export function previewOrders(template: Pick<EmailTemplate, "trigger" | "only">, orders: AdminOrder[]): AdminOrder[] {
  return orders.filter((o) => o.status !== "CANCELLED" && (template.trigger === "repurchase" ? refillContextFor(o) !== null : fitsFulfillment(template, o.fulfillment)));
}

/** El pedido elegido para la vista previa si sirve para esta plantilla; si no, el de muestra (o el primero que sirva). */
export function previewCode(template: Pick<EmailTemplate, "trigger" | "only">, orders: AdminOrder[], chosen: string): string {
  const valid = previewOrders(template, orders);
  if (valid.some((o) => o.code === chosen)) return chosen;
  const sample = sampleOrderFor(template, orders);
  return (sample && valid.includes(sample) ? sample : valid[0])?.code ?? "";
}

/** Contexto de la vista previa y de la prueba: con pedido o, en la recompra, con un producto que se termina. */
export function sampleContext(template: Pick<EmailTemplate, "trigger" | "only">, orders: AdminOrder[], orderCode?: string): EmailContext {
  const chosen = orders.find((o) => o.code === orderCode) ?? sampleOrderFor(template, orders);
  if (template.trigger === "repurchase") {
    const refill = (chosen && refillContextFor(chosen)) ?? orders.map(refillContextFor).find(Boolean);
    return refill ?? { customerName: "Cliente de muestra", email: "cliente@ejemplo.com" };
  }
  return chosen ? contextForOrder(chosen) : { customerName: "Cliente de muestra", email: "cliente@ejemplo.com" };
}

const CUSTOMER: EmailToken[] = ["customer.firstName", "customer.name"];
const ORDER: EmailToken[] = ["order.code", "order.total", "order.deliveryDate", "order.fulfillment", "order.status"];

/** Fichas que tienen sentido en cada disparador (sin pedido en la recompra; el motivo solo en el rechazo). */
export function tokensFor(trigger: EmailTrigger): EmailToken[] {
  if (trigger === "repurchase") return [...CUSTOMER, "refill.product", "refill.date"];
  return [...CUSTOMER, ...ORDER, ...(trigger === "proof-rejected" ? (["order.rejectReason"] as EmailToken[]) : [])];
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

const refillName = (slug: string) => getProduct(slug)?.name ?? "producto";

/** Valor de una ficha. Si falta el dato se usa un texto natural (nunca queda la ficha vacía ni un código). */
export function tokenValue(token: EmailToken, ctx: EmailContext): string {
  const o = ctx.order;
  switch (token) {
    case "customer.firstName": return firstName(ctx.customerName) || "¡hola";
    case "customer.name": return ctx.customerName;
    case "order.code": return o?.code ?? "tu pedido";
    case "order.total": return o ? formatARS(o.total) : "";
    case "order.deliveryDate": return o?.deliveryDate ? formatDay(o.deliveryDate, "long") : "la fecha que te confirmemos";
    case "order.fulfillment": return o ? FULFILLMENT_LABEL[o.fulfillment] : "";
    case "order.status": return o ? customerStatus(o.status, o.fulfillment) : "";
    case "order.rejectReason": return o?.rejectReason ?? "no pudimos encontrar el ingreso en la cuenta";
    case "refill.product": return ctx.refill ? refillName(ctx.refill.slug) : "producto";
    case "refill.date": return ctx.refill ? formatDay(ctx.refill.date, "long") : "los próximos días";
  }
}

export function resolveInline(content: Inline, ctx: EmailContext): string {
  return content.map((p) => (p.kind === "text" ? p.text : tokenValue(p.token, ctx))).join("");
}
