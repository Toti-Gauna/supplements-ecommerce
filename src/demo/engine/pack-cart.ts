import type { Pack } from "../types";
import type { CartLine } from "./cart-types";
import type { PackDiscountEntry } from "./packs";
import { packCartLines, quotePack } from "./packs";

/**
 * Packs en el carrito (L3): agrupar sus líneas, completar un pack al que le quitaron un producto y rotular el descuento.
 * Reglas puras; el descuento en sí lo calcula `packDiscount` (engine/packs.ts).
 */
export interface CartGroup<T> {
  /** Id del pack, o undefined si son líneas sueltas. */
  packId?: string;
  items: T[];
}

/** Ordena el carrito en grupos: cada pack junto, en el lugar de su primera línea; lo suelto, una línea por grupo. */
export function groupByPack<T extends { line: CartLine }>(items: T[]): CartGroup<T>[] {
  const groups: CartGroup<T>[] = [];
  for (const item of items) {
    const id = item.line.packId;
    const into = id ? groups.find((g) => g.packId === id) : undefined;
    if (into) into.items.push(item);
    else groups.push(id ? { packId: id, items: [item] } : { items: [item] });
  }
  return groups;
}

/** Día mensual de un grupo de líneas de pack (undefined si es compra única). */
export const monthlyDayOf = (lines: CartLine[]): number | undefined => lines.find((l) => l.monthlyDay !== undefined)?.monthlyDay;

/**
 * Líneas que faltan para completar un pack del carrito, con la variante por defecto de cada producto y el mismo día
 * mensual que las demás. `[]` si el pack no está en el carrito o ya está completo.
 */
export function completePackLines(lines: CartLine[], pack: Pack): Omit<CartLine, "id">[] {
  const group = lines.filter((l) => l.packId === pack.id);
  if (!group.length) return [];
  const byProduct = new Map(packCartLines(quotePack(pack), monthlyDayOf(group)).map((l) => [l.productSlug, l]));
  return pack.items.flatMap((it) => {
    const have = group.filter((l) => l.productSlug === it.productSlug).reduce((s, l) => s + l.quantity, 0);
    const base = byProduct.get(it.productSlug);
    return have < it.qty && base ? [{ ...base, quantity: it.qty - have }] : [];
  });
}

/** Renglones de descuento para los resúmenes: "Descuento pack (10 %)" o "Descuento pack mensual (15 %)". */
export function packDiscountRows(entries: PackDiscountEntry[] | undefined): { label: string; amount: number; negative: true }[] {
  const list = entries ?? [];
  return list.filter((e) => e.discount > 0).map((e) => ({
    label: `${list.length > 1 ? `Descuento ${e.name}` : e.monthly ? "Descuento pack mensual" : "Descuento pack"} (${e.pct} %)`,
    amount: e.discount,
    negative: true as const,
  }));
}
