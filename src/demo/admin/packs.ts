import { packId } from "../engine/packs";
import type { Category, Pack, PackItem, Product } from "../types";

/**
 * Packs del panel (L3): armado del borrador y operaciones sobre la lista. Funciones puras; las acciones del store
 * (`packs-slice.ts`) solo las aplican y dejan la línea de auditoría.
 */
export const MAX_QTY = 5;

/** Un pack nuevo: sin productos, con el descuento de muestra y visible en la tienda. */
export function newPackDraft(): Pack {
  return { id: "", name: "", tagline: "", description: "", focus: "", items: [], discountPct: 10, monthlyPct: 5, featured: false, active: true };
}

/** Texto sin espacios de más y números enteros: lo que se guarda es lo que se valida. */
export function cleanPack(pack: Pack): Pack {
  const items = pack.items.map((i): PackItem => ({
    productSlug: i.productSlug, qty: Math.round(i.qty), ...(i.variantId ? { variantId: i.variantId } : {}),
  }));
  return {
    ...pack, name: pack.name.trim(), tagline: pack.tagline.trim(), description: pack.description.trim(), focus: pack.focus.trim(),
    discountPct: Math.round(pack.discountPct), monthlyPct: Math.round(pack.monthlyPct), items,
  };
}

/** Guarda el pack: reemplaza el de su id o, si es nuevo, lo suma al final (con id nuevo a partir del nombre). */
export function upsertPack(list: Pack[], pack: Pack): { packs: Pack[]; pack: Pack; created: boolean } {
  const clean = cleanPack(pack);
  const exists = clean.id !== "" && list.some((p) => p.id === clean.id);
  if (exists) return { packs: list.map((p) => (p.id === clean.id ? clean : p)), pack: clean, created: false };
  const saved = { ...clean, id: clean.id || packId(clean.name, list) };
  return { packs: [...list, saved], pack: saved, created: true };
}

/** "Pack X (copia)", "Pack X (copia 2)"… sin repetir el nombre de otro pack. */
export function copyName(name: string, packs: Pack[]): string {
  const taken = new Set(packs.map((p) => p.name.trim().toLowerCase()));
  let candidate = `${name} (copia)`;
  for (let n = 2; taken.has(candidate.toLowerCase()); n++) candidate = `${name} (copia ${n})`;
  return candidate;
}

/** Copia del pack: mismos productos y descuentos, oculta y sin destacar hasta que se revise. Queda junto al original. */
export function duplicatePackIn(list: Pack[], id: string): { packs: Pack[]; copy: Pack } | null {
  const index = list.findIndex((p) => p.id === id);
  if (index < 0) return null;
  const source = list[index]!;
  const name = copyName(source.name, list);
  const copy: Pack = { ...structuredClone(source), id: packId(name, list), name, featured: false, active: false };
  return { packs: [...list.slice(0, index + 1), copy, ...list.slice(index + 1)], copy };
}

export const removePackFrom = (list: Pack[], id: string): Pack[] => list.filter((p) => p.id !== id);
export const setActiveIn = (list: Pack[], id: string, active: boolean): Pack[] => list.map((p) => (p.id === id ? { ...p, active } : p));

export function addItem(items: PackItem[], productSlug: string): PackItem[] {
  return items.some((i) => i.productSlug === productSlug) ? items : [...items, { productSlug, qty: 1 }];
}

export const removeItem = (items: PackItem[], productSlug: string): PackItem[] => items.filter((i) => i.productSlug !== productSlug);

export function patchItem(items: PackItem[], productSlug: string, patch: Partial<PackItem>): PackItem[] {
  return items.map((i) => {
    if (i.productSlug !== productSlug) return i;
    const next = { ...i, ...patch };
    if (!next.variantId) delete next.variantId;
    return next;
  });
}

/** Sube (-1) o baja (1) un producto en la lista; en los bordes no hace nada. */
export function moveItem(items: PackItem[], productSlug: string, dir: -1 | 1): PackItem[] {
  const from = items.findIndex((i) => i.productSlug === productSlug);
  const to = from + dir;
  if (from < 0 || to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[from], next[to]] = [next[to]!, next[from]!];
  return next;
}

export interface ProductGroup { category: Category; products: Product[] }

/** Productos activos que todavía no están en el pack, agrupados por categoría (en el orden de la tienda). */
export function productChoices(products: Product[], categories: Category[], used: string[]): ProductGroup[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      category,
      products: products.filter((p) => p.categorySlug === category.slug && p.active !== false && !used.includes(p.slug)).sort((a, b) => a.name.localeCompare(b.name, "es")),
    }))
    .filter((g) => g.products.length > 0);
}
