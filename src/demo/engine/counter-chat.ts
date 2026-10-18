import type { AdminOrder, StatusLogEntry } from "../admin/types";
import type { FulfillmentType, PaymentMethod, Product } from "../types";
import type { CounterLine } from "./counter";
import { METHOD_LABEL, type CounterMethod } from "./counter-pay";
import { canTransition, type OrderStatus } from "./orders";

/**
 * Pedido cerrado por chat (R4b, "Canal WhatsApp/Instagram en el mostrador"): el dueño lo carga y entra como un pedido
 * más del panel, con su origen a la vista. Nunca queda pagado solo: con transferencia o QR espera el comprobante (y un
 * comprobante mandado por chat queda en revisión), con Mercado Pago espera la confirmación, y "en mano" exige que el
 * dueño confirme que ya cobró. Las transiciones salen de `orders.ts`. Puro y testeado.
 */
export type OrderChannel = "WHATSAPP" | "INSTAGRAM";
export const CHANNEL_LABEL: Record<OrderChannel, string> = { WHATSAPP: "WhatsApp", INSTAGRAM: "Instagram" };

/** Cómo paga: los medios de la tienda o en mano (efectivo o tarjeta en el local). */
export type ChatPay = PaymentMethod | "IN_HAND";

export interface ChatOrderDraft {
  channel: OrderChannel;
  name: string;
  /** Teléfono o usuario del chat. */
  phone: string;
  email: string;
  lines: CounterLine[];
  fulfillment: FulfillmentType;
  address: string;
  pay: ChatPay;
  inHandMethod: CounterMethod;
  /** El dueño confirma que ya cobró en mano. */
  collected: boolean;
  /** Transferencia o QR: el cliente ya mandó el comprobante por el chat (queda en revisión, no pagado). */
  proofSent: boolean;
}

export const emptyChatDraft = (): ChatOrderDraft => ({
  channel: "WHATSAPP", name: "", phone: "", email: "", lines: [], fulfillment: "PICKUP", address: "", pay: "BANK_TRANSFER", inHandMethod: "CASH", collected: false, proofSent: false,
});

export type ChatField = "name" | "phone" | "email" | "lines" | "address" | "collected";
export type ChatErrors = Partial<Record<ChatField, string>>;

export function checkChatOrder(d: ChatOrderDraft, products: readonly Product[]): ChatErrors {
  const e: ChatErrors = {};
  if (d.name.trim().length < 2) e.name = "Escribí el nombre del cliente.";
  if (d.phone.replace(/[^\p{L}\p{N}]/gu, "").length < 3) e.phone = d.channel === "WHATSAPP" ? "Escribí el teléfono del chat." : "Escribí el usuario o el teléfono.";
  if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = "Revisá el email (o dejalo vacío).";
  const known = d.lines.filter((l) => l.qty > 0 && products.some((p) => p.slug === l.productSlug && p.variants.some((v) => v.id === l.variantId)));
  if (!known.length) e.lines = "Sumá al menos un producto.";
  if (d.fulfillment !== "PICKUP" && d.address.trim().length < 5) e.address = "Escribí la dirección de entrega.";
  if (d.pay === "IN_HAND" && !d.collected) e.collected = "Confirmá que ya lo cobraste. Si paga después, elegí transferencia, QR o Mercado Pago.";
  return e;
}

/** Próximo código libre con el prefijo de la tienda ("VOL-000127"). */
export function nextOrderCode(orders: readonly Pick<AdminOrder, "code">[], prefix: string): string {
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  const last = Math.max(0, ...orders.map((o) => Number(re.exec(o.code)?.[1] ?? 0)));
  return `${prefix}-${String(last + 1).padStart(6, "0")}`;
}

/** Medio del pedido para la tienda y el panel. "En mano" no tiene uno propio: se marca con `inHand`. */
export const chatPaymentMethod = (pay: ChatPay): PaymentMethod => (pay === "IN_HAND" ? "BANK_TRANSFER" : pay);

/** Sin email, una dirección que no existe (`.invalid`) con el teléfono: el cliente no se mezcla con otros. */
export function chatEmail(d: Pick<ChatOrderDraft, "email" | "phone">): string {
  return d.email.trim().toLowerCase() || `${d.phone.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() || "cliente"}@sin-email.invalid`;
}

export interface ChatOrderContext {
  code: string;
  at: string;
  total: number;
  promisedDate?: string;
}

export function buildChatOrder(d: ChatOrderDraft, ctx: ChatOrderContext): AdminOrder {
  const channel = CHANNEL_LABEL[d.channel];
  const paymentMethod = chatPaymentMethod(d.pay);
  const log: StatusLogEntry[] = [{ at: ctx.at, from: null, to: "PENDING_PAYMENT", note: `Pedido por ${channel} cargado en el mostrador` }];
  const step = (to: OrderStatus, trigger: "in-hand" | "proof-received", note: string) => {
    if (canTransition("PENDING_PAYMENT", to, { fulfillment: d.fulfillment, trigger })) log.push({ at: ctx.at, from: "PENDING_PAYMENT", to, note });
  };
  const inHand = d.pay === "IN_HAND" && d.collected;
  const proof = (d.pay === "BANK_TRANSFER" || d.pay === "QR_MANUAL") && d.proofSent;
  if (inHand) step("PAID", "in-hand", `Cobro en mano confirmado por el dueño (${METHOD_LABEL[d.inHandMethod]})`);
  if (proof) step("PAYMENT_REVIEW", "proof-received", `Comprobante recibido por ${channel}: queda en revisión`);
  return {
    code: ctx.code, createdAt: ctx.at, customer: { name: d.name.trim(), email: chatEmail(d), phone: d.phone.trim() }, userId: null,
    status: log.at(-1)!.to, fulfillment: d.fulfillment, paymentMethod, ...(d.fulfillment !== "PICKUP" ? { address: d.address.trim() } : {}),
    lines: d.lines.filter((l) => l.qty > 0).map((l, i) => ({ id: String.fromCharCode(97 + (i % 26)) + (i >= 26 ? i : ""), productSlug: l.productSlug, variantId: l.variantId, quantity: l.qty })),
    total: ctx.total, notes: [], log, channel: d.channel, ...(ctx.promisedDate ? { promisedDate: ctx.promisedDate } : {}),
    ...(inHand ? { inHand: d.inHandMethod } : {}),
    ...(proof ? { proof: { fileName: `comprobante-por-${channel.toLowerCase()}.jpg`, receivedAt: ctx.at, status: "IN_REVIEW" as const } } : {}),
  };
}
