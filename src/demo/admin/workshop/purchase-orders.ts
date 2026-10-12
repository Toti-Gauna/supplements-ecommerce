import { formatARS } from "@/lib/money";
import type { StockLevel, Supplier } from "../../fixtures/suppliers";
import type { Product } from "../../types";
import { parseMoney } from "../import/cells";
import { withStock } from "../lots";
import type { PurchaseGroup, PurchaseOrder } from "./purchasing";

/** Pedido al proveedor (Fase 7): el texto para mandar por WhatsApp, el registro "pedido" y la mercadería recibida. */

const shortDay = (day: string) => `${Number(day.slice(8))}/${Number(day.slice(5, 7))}`;

/** Mensaje listo para pegar en WhatsApp: saludo, una línea por producto, total al costo y día de entrega. */
export function whatsappText(group: PurchaseGroup, store: string, deliveryDay: string | null): string {
  const firstName = group.supplier?.contact.split(" ")[0];
  const lines = group.lines.map((l) => `• ${l.qty} × ${l.name}`);
  return [
    `Hola${firstName ? ` ${firstName}` : ""}, ¿cómo va? Te paso el pedido de ${store}:`,
    ...lines,
    ...(group.total > 0 ? [`Total estimado al costo: ${formatARS(group.total)}${group.withoutCost ? " (sin contar los productos sin costo cargado)" : ""}.`] : []),
    deliveryDay ? `¿Lo podemos recibir el ${shortDay(deliveryDay)}? ¡Gracias!` : "¿Cuándo lo podemos recibir? ¡Gracias!",
  ].join("\n");
}

let seq = 0;

/** Registra el pedido hecho al proveedor: lo pedido deja de sugerirse hasta que se recibe. */
export function purchaseOrderFrom(group: PurchaseGroup, now: string, expectedOn: string | null): PurchaseOrder {
  if (!group.supplier) throw new Error("Un pedido necesita proveedor.");
  const lines = group.lines.map(({ key, productSlug, variantId, name, qty, unitCost }) => ({ key, productSlug, variantId, name, qty, unitCost }));
  return { id: `oc-${Date.now().toString(36)}-${++seq}`, supplierId: group.supplier.id, createdAt: now, expectedOn, lines, total: group.total, status: "ordered" };
}

/** Suma al stock lo que llegó, en el lote más nuevo si la variante tiene lotes (las variantes "a pedido" no cambian). */
export function receiveStock(products: Product[], order: PurchaseOrder): Product[] {
  const qty = new Map(order.lines.map((l) => [l.key, l.qty]));
  return products.map((p) => (!order.lines.some((l) => l.productSlug === p.slug) ? p : {
    ...p,
    variants: p.variants.map((v) => {
      const add = qty.get(`${p.slug}::${v.id}`);
      return add && v.stock >= 0 ? withStock(v, v.stock + add) : v;
    }),
  }));
}

/** Mínimo y objetivo: enteros, 0 o más, y el objetivo no menor que el mínimo. */
export function checkLevel(level: StockLevel): string | null {
  if (![level.min, level.target].every((n) => Number.isInteger(n) && n >= 0)) return "Usá números enteros, 0 o más.";
  return level.target < level.min ? "El objetivo no puede ser menor que el mínimo." : null;
}

/** Datos editables de un proveedor, como texto hasta guardar. */
export interface SupplierDraft { contact: string; phone: string; minOrder: string; days: number[] }
export type SupplierField = "contact" | "phone" | "minOrder" | "days";

export const supplierDraft = (s: Supplier): SupplierDraft => ({ contact: s.contact, phone: s.phone, minOrder: String(s.minOrder), days: [...s.deliveryWeekdays] });

/** Contacto y teléfono obligatorios, pedido mínimo en pesos enteros (vacío = sin mínimo) y al menos un día de reparto. */
export function checkSupplier(d: SupplierDraft): { errors: Partial<Record<SupplierField, string>>; value?: Pick<Supplier, "contact" | "phone" | "minOrder" | "deliveryWeekdays"> } {
  const errors: Partial<Record<SupplierField, string>> = {};
  if (d.contact.trim().length < 2) errors.contact = "Escribí con quién hablás.";
  if (!/^[\d\s()+-]{6,}$/.test(d.phone.trim())) errors.phone = "Escribí un teléfono (números, espacios y guiones).";
  const min = d.minOrder.trim() ? parseMoney(d.minOrder) : ({ ok: true, value: 0 } as const);
  if (!min.ok) errors.minOrder = min.error;
  if (!d.days.length) errors.days = "Elegí al menos un día de reparto.";
  if (Object.keys(errors).length || !min.ok) return { errors };
  return { errors, value: { contact: d.contact.trim(), phone: d.phone.trim(), minOrder: min.value, deliveryWeekdays: [...d.days].sort((a, b) => a - b) } };
}
