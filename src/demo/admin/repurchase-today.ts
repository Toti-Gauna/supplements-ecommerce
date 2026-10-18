import { DISPATCH_PROMISE } from "../engine/lead-time";
import { cartLinkPath, type LinkLine } from "../engine/cart-link";
import type { CustomerProfile } from "../fixtures/customers";
import type { Product } from "../types";
import type { CustomerView } from "./customers";
import { noticeFor, type RepurchaseItem } from "./repurchase";
import { customerWhatsappLink, dayText } from "./repurchase-text";
import type { AdminOrder } from "./types";

/**
 * "A quién escribirle hoy" (R4c): los clientes a los que se les terminó (hace menos de un mes) o se les termina en la
 * semana, calculado con los servicios del envase (ver `engine/repurchase.ts`), uno por persona aunque tenga varios
 * potes, sin los que ya recibieron el aviso. Cada uno trae su mensaje de WhatsApp y el link a la tienda con el bolso ya
 * cargado con lo mismo que compró.
 */
export interface WriteToday {
  email: string;
  name: string;
  phone?: string;
  /** Sus potes sin avisar, el que se termina primero primero. */
  items: RepurchaseItem[];
  /** Lo que se vuelve a comprar (la misma variante y cantidad de la última compra) y que hoy se puede comprar. */
  lines: LinkLine[];
  /** Ruta del link de recompra (sin el origen). */
  path: string;
  /** Alguno ya se terminó o se termina hoy. */
  urgent: boolean;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** La misma variante y cantidad que compró en el pedido del pote, si hoy hay stock; si no, queda afuera del link. */
export function repurchaseLines(orders: Pick<AdminOrder, "code" | "lines">[], items: RepurchaseItem[], products: Product[]): LinkLine[] {
  const out: LinkLine[] = [];
  for (const item of items) {
    const line = orders.find((o) => o.code === item.orderCode)?.lines.find((l) => l.productSlug === item.slug);
    const variant = products.find((p) => p.slug === item.slug && p.active !== false)?.variants.find((v) => v.id === (item.variantId ?? line?.variantId));
    if (line && variant && variant.stock !== 0 && !out.some((l) => l.variantId === variant.id)) out.push({ slug: item.slug, variantId: variant.id, qty: line.quantity });
  }
  return out;
}

export function writeToday(views: CustomerView[], profiles: Record<string, CustomerProfile>, products: Product[]): WriteToday[] {
  return views.filter((c) => !c.blocked).flatMap((c) => {
    const items = c.repurchases.filter((i) => i.state !== "later" && !noticeFor(profiles[c.email.toLowerCase()], i));
    if (!items.length) return [];
    const lines = repurchaseLines(c.orders, items, products);
    return [{ email: c.email, name: c.name, phone: c.phone, items, lines, path: cartLinkPath(lines), urgent: items.some((i) => i.inDays <= 0) }];
  }).sort((a, b) => a.items[0]!.runsOutOn.localeCompare(b.items[0]!.runsOutOn) || a.name.localeCompare(b.name, "es"));
}

/** Cuándo se termina cada uno, en una frase: "ya se te terminó tu Ionic Whey" / "el jueves 8 de octubre se te termina tu BCAA". */
const phrase = (i: RepurchaseItem) => (i.inDays < 0 ? `ya se te terminó tu ${i.product}` : `${i.inDays === 0 ? "hoy" : `el ${dayText(i.runsOutOn)}`} se te termina tu ${i.product}`);

/** Mensaje de WhatsApp para la persona (uno o varios potes), con el link al bolso si hay algo para volver a comprar. */
export function writeMessage(w: Pick<WriteToday, "name" | "items" | "lines">, store: string, link?: string): string {
  const when = w.items.length === 1 ? phrase(w.items[0]!) : w.items.map(phrase).join("; ");
  const cart = link && w.lines.length ? ` Te dejé el bolso armado con lo mismo, para que confirmes cuando quieras: ${link}` : "";
  return `¡Hola ${firstName(w.name)}! Te escribimos de ${store}. Calculamos que ${when}. ¿Te preparamos otro? En Mar del Plata te lo llevamos con cadete ${DISPATCH_PROMISE}.${cart}`;
}

export const writeLink = (w: Pick<WriteToday, "name" | "items" | "lines" | "phone">, store: string, link?: string) => customerWhatsappLink(w.phone, writeMessage(w, store, link));
