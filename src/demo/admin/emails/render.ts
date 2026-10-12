import type { CartLine } from "../../engine/cart-types";
import { getProduct, productHref } from "../../engine/catalog";
import type { OrderStatus } from "../../engine/orders";
import type { ButtonLink, EmailBlock, EmailTemplate } from "../../fixtures/emails";
import { DEMO_TRACKING_TOKEN } from "../../fixtures/commerce";
import type { ArtKey, FulfillmentType, PackStyle } from "../../types";
import { lotLabel } from "../lot-label";
import { formatARS } from "@/lib/money";
import { whatsappLink } from "@/lib/whatsapp";
import { customerStatus, FULFILLMENT_LABEL, resolveInline, tokenValue, type EmailContext } from "./context";

export * from "./context";
export { lotLabel };

export interface RenderedLine { name: string; variant: string; quantity: number; art: ArtKey; pack?: PackStyle; tint?: string; detail?: string; lot?: string }
export interface UsageLine { name: string; dose?: string; text: string }
export interface TrackingStep { label: string; state: "done" | "current" | "next" }

export type RenderedBlock =
  | { id: string; type: "header" | "divider" | "footer" }
  | { id: string; type: "heading" | "text"; text: string }
  | { id: string; type: "image"; art: ArtKey; caption: string }
  | { id: string; type: "button"; label: string; href: string }
  | { id: string; type: "order-card"; code: string; total: string; deliveryDate: string; fulfillment: string; status: string }
  | { id: string; type: "products"; lines: RenderedLine[] }
  | { id: string; type: "usage"; lines: UsageLine[] }
  | { id: string; type: "tracking"; steps: TrackingStep[] }
  | { id: string; type: "refill"; line: RenderedLine; date: string };

export interface RenderedEmail {
  subject: string;
  preheader: string;
  blocks: RenderedBlock[];
}

/** Bloques que necesitan un pedido (no salen en la recompra) y el que necesita el producto que se termina. */
export const ORDER_BLOCKS: EmailBlock["type"][] = ["order-card", "products", "usage", "tracking"];

export const needsOrder = (block: Pick<EmailBlock, "type">) => ORDER_BLOCKS.includes(block.type);
export const needsRefill = (block: Pick<EmailBlock, "type">) => block.type === "refill";

export function linkHref(link: ButtonLink, ctx: EmailContext): string {
  if (link === "tracking") return `/pedido/${DEMO_TRACKING_TOKEN}/`;
  if (link === "whatsapp") return whatsappLink(ctx.order ? `Hola! Te escribo por mi pedido ${ctx.order.code}.` : "Hola! Te escribo por el email que me mandaron.");
  if (link === "product") return ctx.refill ? productHref(ctx.refill.slug) : "/";
  return link === "club" ? "/club/" : "/";
}

const PICKUP_STEPS: [string, OrderStatus[]][] = [["Recibido", ["PENDING_PAYMENT", "PAYMENT_REVIEW"]], ["Pagado", ["PAID"]], ["Preparando", ["IN_PRODUCTION"]], ["Listo para retirar", ["READY"]], ["Retirado", ["DELIVERED"]]];
const DELIVERY_STEPS: [string, OrderStatus[]][] = [["Recibido", ["PENDING_PAYMENT", "PAYMENT_REVIEW"]], ["Pagado", ["PAID"]], ["Preparando", ["IN_PRODUCTION"]], ["Listo", ["READY"]], ["En camino", ["SHIPPED"]], ["Entregado", ["DELIVERED"]]];

/** Recorrido del pedido como lo ve el cliente: retiro (5 pasos) o envío (6), marcado en el estado actual. */
export function trackingSteps(status: OrderStatus, fulfillment: FulfillmentType): TrackingStep[] {
  const steps = fulfillment === "PICKUP" ? PICKUP_STEPS : DELIVERY_STEPS;
  const at = Math.max(0, steps.findIndex(([, states]) => states.includes(status)));
  return steps.map(([label], i) => ({ label, state: i < at ? "done" : i === at ? "current" : "next" }));
}

/** El lote se informa recién cuando el pedido se armó y se controló (listo, en camino o entregado). */
const LOT_KNOWN: OrderStatus[] = ["READY", "SHIPPED", "DELIVERED"];

function renderLine(l: Pick<CartLine, "productSlug" | "variantId" | "quantity">, withLot: boolean): RenderedLine {
  const p = getProduct(l.productSlug);
  const v = p?.variants.find((x) => x.id === l.variantId);
  const detail = v?.servings && v.servings > 1 ? `${v.servings} servicios` : undefined;
  const lot = withLot ? lotLabel(p) : undefined;
  return { name: p?.name ?? l.productSlug, variant: v?.label ?? "", quantity: l.quantity, art: p?.art ?? "tub", pack: p?.pack, tint: v?.colorHex, ...(detail ? { detail } : {}), ...(lot ? { lot } : {}) };
}

export function renderLines(lines: CartLine[], status: OrderStatus): RenderedLine[] {
  return lines.map((l) => renderLine(l, LOT_KNOWN.includes(status)));
}

/** "Cómo tomarlo" de cada producto distinto del pedido (los que tienen indicación de uso). */
export function usageLines(lines: CartLine[]): UsageLine[] {
  const seen = new Set<string>();
  return lines.flatMap((l) => {
    const p = getProduct(l.productSlug);
    if (!p?.usage || seen.has(p.slug)) return [];
    seen.add(p.slug);
    return [{ name: p.name, text: p.usage.text, ...(p.usage.dose ? { dose: p.usage.dose } : {}) }];
  });
}

function renderBlock(b: EmailBlock, ctx: EmailContext): RenderedBlock | null {
  const o = ctx.order;
  if ((needsOrder(b) && !o) || (needsRefill(b) && !ctx.refill)) return null;
  switch (b.type) {
    case "header": case "divider": case "footer": return { id: b.id, type: b.type };
    case "heading": case "text": return { id: b.id, type: b.type, text: resolveInline(b.content, ctx) };
    case "image": return { id: b.id, type: "image", art: b.art, caption: resolveInline(b.caption, ctx) };
    case "button": return { id: b.id, type: "button", label: resolveInline(b.label, ctx), href: linkHref(b.link, ctx) };
    case "order-card":
      return { id: b.id, type: "order-card", code: o!.code, total: formatARS(o!.total), deliveryDate: tokenValue("order.deliveryDate", ctx), fulfillment: FULFILLMENT_LABEL[o!.fulfillment], status: customerStatus(o!.status, o!.fulfillment) };
    case "products": return { id: b.id, type: "products", lines: renderLines(o!.lines, o!.status) };
    case "usage": return { id: b.id, type: "usage", lines: usageLines(o!.lines) };
    case "tracking": return { id: b.id, type: "tracking", steps: trackingSteps(o!.status, o!.fulfillment) };
    case "refill": return { id: b.id, type: "refill", line: renderLine({ productSlug: ctx.refill!.slug, variantId: ctx.refill!.variantId ?? "", quantity: 1 }, false), date: tokenValue("refill.date", ctx) };
  }
}

/** Arma el email listo para mostrar o "enviar": fichas resueltas, bloques del pedido completos. */
export function renderEmail(template: Pick<EmailTemplate, "subject" | "preheader" | "blocks">, ctx: EmailContext): RenderedEmail {
  const blocks = template.blocks.flatMap((b) => renderBlock(b, ctx) ?? []);
  return { subject: resolveInline(template.subject, ctx), preheader: resolveInline(template.preheader, ctx), blocks };
}

/** Texto plano del email (versión sin formato que acompaña al HTML; también sirve para buscar en la bandeja). */
export function plainText(email: RenderedEmail): string {
  return email.blocks.map((b) => {
    if (b.type === "heading" || b.type === "text") return b.text;
    if (b.type === "button") return `${b.label}: ${b.href}`;
    if (b.type === "image") return b.caption;
    if (b.type === "order-card") return `Pedido ${b.code} · ${b.total} · entrega ${b.deliveryDate}`;
    if (b.type === "products") return b.lines.map((l) => `${l.quantity} × ${l.name}${l.lot ? ` (${l.lot})` : ""}`).join("\n");
    if (b.type === "usage") return b.lines.map((l) => `${l.name}: ${l.text}`).join("\n");
    if (b.type === "refill") return `${b.line.name}: se termina cerca del ${b.date}`;
    if (b.type === "tracking") return b.steps.map((s) => `${s.state === "done" ? "✓" : s.state === "current" ? "→" : "·"} ${s.label}`).join("  ");
    return "";
  }).filter(Boolean).join("\n\n");
}

/** Problemas para guardar una plantilla (asunto vacío, sin bloques o sin ninguna forma de entrega). */
export function checkTemplate(t: Pick<EmailTemplate, "name" | "subject" | "blocks" | "only">): string[] {
  const errors: string[] = [];
  if (!t.name.trim()) errors.push("Poné un nombre interno para reconocerla en la lista.");
  if (!t.subject.some((p) => p.kind === "token" || p.text.trim())) errors.push("Escribí el asunto: es lo primero que se lee en la casilla.");
  if (!t.blocks.some((b) => b.type !== "header" && b.type !== "footer" && b.type !== "divider")) errors.push("Agregá al menos un título, un texto o un bloque con datos.");
  if (t.only && t.only.length === 0) errors.push("Elegí al menos una forma de entrega para la que sale este email.");
  return errors;
}
