import type { CartLine } from "../../engine/cart-types";
import { collarLineDetail, getProduct } from "../../engine/catalog";
import { STATUS_LABEL, type OrderStatus } from "../../engine/orders";
import type { ButtonLink, EmailBlock, EmailTemplate, EmailToken, Inline } from "../../fixtures/emails";
import { DEMO_TRACKING_TOKEN } from "../../fixtures/commerce";
import type { ArtKey, FulfillmentType } from "../../types";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { whatsappLink } from "@/lib/whatsapp";
import type { AdminOrder } from "../types";

/** Datos con los que se arma un email: el cliente y, según el disparador, un pedido o una mascota. */
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
  };
  pet?: { name: string };
}

const FULFILLMENT: Record<FulfillmentType, string> = { PICKUP: "Retiro en Mar del Plata", LOCAL_DELIVERY: "Cadete en Mar del Plata", SHIPPING: "Envío por correo" };

export function contextForOrder(order: AdminOrder): EmailContext {
  return {
    customerName: order.customer.name, email: order.customer.email,
    order: { code: order.code, total: order.total, deliveryDate: order.promisedDate, fulfillment: order.fulfillment, status: order.status, lines: order.lines },
  };
}

/** Pedido de muestra para la vista previa: el primero en producción (tiene fecha, productos y personalización). */
export function sampleOrder(orders: AdminOrder[]): AdminOrder | undefined {
  return orders.find((o) => o.status === "IN_PRODUCTION") ?? orders.find((o) => o.status !== "CANCELLED") ?? orders[0];
}

/** Cliente con mascota de las fichas, para la vista previa y la prueba del email de cumpleaños (sin pedido). */
export function petSampleContext(profiles: Record<string, { pets: { name: string }[] }>, orders: AdminOrder[], users: { email: string; name: string }[]): EmailContext {
  const [email, profile] = Object.entries(profiles).find(([, p]) => p.pets.length > 0) ?? ["", { pets: [] }];
  const name = users.find((u) => u.email.toLowerCase() === email)?.name ?? orders.find((o) => o.customer.email.toLowerCase() === email)?.customer.name ?? "Cliente";
  return { customerName: name, email, pet: profile.pets[0] ? { name: profile.pets[0].name } : undefined };
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** Valor de una ficha. Si falta el dato se usa un texto natural (nunca queda la ficha vacía ni un código). */
export function tokenValue(token: EmailToken, ctx: EmailContext): string {
  const o = ctx.order;
  switch (token) {
    case "customer.firstName": return firstName(ctx.customerName) || "¡hola";
    case "customer.name": return ctx.customerName;
    case "order.code": return o?.code ?? "tu pedido";
    case "order.total": return o ? formatARS(o.total) : "";
    case "order.deliveryDate": return o?.deliveryDate ? formatDay(o.deliveryDate, "long") : "la fecha que te confirmemos";
    case "order.fulfillment": return o ? FULFILLMENT[o.fulfillment] : "";
    case "order.status": return o ? STATUS_LABEL[o.status] : "";
    case "pet.name": return ctx.pet?.name ?? "tu mascota";
  }
}

export function resolveInline(content: Inline, ctx: EmailContext): string {
  return content.map((p) => (p.kind === "text" ? p.text : tokenValue(p.token, ctx))).join("");
}

export interface RenderedLine { name: string; variant: string; quantity: number; art: ArtKey; tint?: string; detail?: string }
export interface TrackingStep { label: string; state: "done" | "current" | "next" }

export type RenderedBlock =
  | { id: string; type: "header" | "divider" | "footer" }
  | { id: string; type: "heading" | "text"; text: string }
  | { id: string; type: "image"; art: ArtKey; caption: string }
  | { id: string; type: "button"; label: string; href: string }
  | { id: string; type: "order-card"; code: string; total: string; deliveryDate: string; fulfillment: string; status: string }
  | { id: string; type: "products"; lines: RenderedLine[] }
  | { id: string; type: "tracking"; steps: TrackingStep[] };

export interface RenderedEmail {
  subject: string;
  preheader: string;
  blocks: RenderedBlock[];
}

/** Bloques que necesitan un pedido: en un disparador sin pedido (cumpleaños) no se muestran. */
export const ORDER_BLOCKS: EmailBlock["type"][] = ["order-card", "products", "tracking"];

export function needsOrder(block: EmailBlock): boolean {
  return ORDER_BLOCKS.includes(block.type);
}

export function linkHref(link: ButtonLink, ctx: EmailContext): string {
  if (link === "tracking") return `/pedido/${DEMO_TRACKING_TOKEN}/`;
  if (link === "whatsapp") return whatsappLink(ctx.order ? `Hola! Te escribo por mi pedido ${ctx.order.code}.` : "Hola! Te escribo por el email que me mandaron.");
  return link === "club" ? "/club/" : "/";
}

const PATH: OrderStatus[] = ["PAID", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED"];

export function trackingSteps(status: OrderStatus, fulfillment: FulfillmentType): TrackingStep[] {
  const labels = ["Recibido", "Pagado", "En producción", "Listo", fulfillment === "PICKUP" ? "Retirado" : "Enviado"];
  const at = status === "PENDING_PAYMENT" || status === "PAYMENT_REVIEW" ? 0 : status === "DELIVERED" ? 4 : Math.max(0, PATH.indexOf(status) + 1);
  return labels.map((label, i) => ({ label, state: i < at ? "done" : i === at ? "current" : "next" }));
}

function renderLines(lines: CartLine[]): RenderedLine[] {
  return lines.map((l) => {
    const p = getProduct(l.productSlug);
    const v = p?.variants.find((x) => x.id === l.variantId);
    const per = l.personalization;
    const detail = per?.kind === "TEXT" && per.text ? `“${per.text}”${per.font ? ` · ${per.font}` : ""}` : per?.kind === "PHOTO" ? "Con tu foto" : per?.kind === "PHOTO_REFERENCE" ? "Pintado desde tu foto" : undefined;
    const collar = collarLineDetail(l);
    return { name: p?.name ?? l.productSlug, variant: v?.label ?? "", quantity: l.quantity, art: p?.art ?? "dachshund", tint: v?.colorHex, detail: [detail, collar].filter(Boolean).join(" · ") || undefined };
  });
}

/** Arma el email listo para mostrar o "enviar": fichas resueltas, bloques del pedido completos. */
export function renderEmail(template: Pick<EmailTemplate, "subject" | "preheader" | "blocks">, ctx: EmailContext): RenderedEmail {
  const blocks: RenderedBlock[] = [];
  for (const b of template.blocks) {
    if (needsOrder(b) && !ctx.order) continue;
    const o = ctx.order;
    switch (b.type) {
      case "header": case "divider": case "footer": blocks.push({ id: b.id, type: b.type }); break;
      case "heading": case "text": blocks.push({ id: b.id, type: b.type, text: resolveInline(b.content, ctx) }); break;
      case "image": blocks.push({ id: b.id, type: "image", art: b.art, caption: resolveInline(b.caption, ctx) }); break;
      case "button": blocks.push({ id: b.id, type: "button", label: resolveInline(b.label, ctx), href: linkHref(b.link, ctx) }); break;
      case "order-card":
        blocks.push({ id: b.id, type: "order-card", code: o!.code, total: formatARS(o!.total), deliveryDate: tokenValue("order.deliveryDate", ctx), fulfillment: FULFILLMENT[o!.fulfillment], status: STATUS_LABEL[o!.status] });
        break;
      case "products": blocks.push({ id: b.id, type: "products", lines: renderLines(o!.lines) }); break;
      case "tracking": blocks.push({ id: b.id, type: "tracking", steps: trackingSteps(o!.status, o!.fulfillment) }); break;
    }
  }
  return { subject: resolveInline(template.subject, ctx), preheader: resolveInline(template.preheader, ctx), blocks };
}

/** Texto plano del email (versión sin formato que acompaña al HTML; también sirve para buscar en la bandeja). */
export function plainText(email: RenderedEmail): string {
  return email.blocks.map((b) => {
    if (b.type === "heading" || b.type === "text") return b.text;
    if (b.type === "button") return `${b.label}: ${b.href}`;
    if (b.type === "image") return b.caption;
    if (b.type === "order-card") return `Pedido ${b.code} · ${b.total} · entrega ${b.deliveryDate}`;
    if (b.type === "products") return b.lines.map((l) => `${l.quantity} × ${l.name}`).join("\n");
    if (b.type === "tracking") return b.steps.map((s) => `${s.state === "done" ? "✓" : s.state === "current" ? "→" : "·"} ${s.label}`).join("  ");
    return "";
  }).filter(Boolean).join("\n\n");
}
