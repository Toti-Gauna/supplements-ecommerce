import { formatARS } from "@/lib/money";
import type { Product, ProductBadge, Variant } from "../types";
import { activeProducts, isGear } from "./catalog";
import { productMetrics } from "./catalog-sort";
import { daysToExpiry, firstOutLot, formatExpiry } from "./lots";
import { rackFacts } from "./rack";
import { BADGE_LABELS } from "./search-lexicon";
import { daysLasting } from "./servings";

/**
 * Comparador (R2a): 2 o 3 productos lado a lado con lo que decide la compra. Cada renglón marca el mejor valor (el
 * más barato, el que más rinde, el que vence más lejos). Si se mezcla equipamiento con suplementos, los datos por
 * servicio comparan solo los suplementos y se avisa. Puro y testeado; en producción, src/server/services.
 */
export const COMPARE_MAX = 3;

export type CompareRowKey = "price" | "perServing" | "protein" | "servings" | "days" | "expiry" | "badges" | "brand";

export interface CompareCell {
  /** Número para comparar (null: no aplica o no hay dato). */
  value: number | null;
  text: string;
  best: boolean;
  badges?: ProductBadge[];
}

export interface CompareRow {
  key: CompareRowKey;
  label: string;
  /** "low": gana el menor; "high": el mayor; null: no se marca. */
  better: "low" | "high" | null;
  cells: CompareCell[];
}

export interface CompareColumn {
  product: Product;
  /** La presentación que se compara: la de la tarjeta (mejor precio por servicio entre las que hay). */
  variant: Variant;
  presentation: string;
  gear: boolean;
}

/** "full": todos suplementos; "mixed": suplementos y equipamiento; "price": solo equipamiento (se compara el precio). */
export type Comparability = "full" | "mixed" | "price";

export interface CompareTable {
  columns: CompareColumn[];
  rows: CompareRow[];
  comparability: Comparability;
}

const ars = formatARS;

function marked(cells: Omit<CompareCell, "best">[], better: CompareRow["better"]): CompareCell[] {
  const values = cells.map((c) => c.value).filter((v): v is number => v !== null);
  const target = better === "low" ? Math.min(...values) : Math.max(...values);
  // Se marca solo si hay al menos dos con dato y no son todos iguales.
  const decides = better !== null && values.length >= 2 && new Set(values).size > 1;
  return cells.map((c) => ({ ...c, best: decides && c.value === target }));
}

/** La tabla del comparador. `today` (AAAA-MM-DD) para los días al vencimiento; `perDay` servicios por día. */
export function compareTable(products: Product[], today: string, perDay = 1): CompareTable {
  const columns: CompareColumn[] = products.map((product) => {
    const variant = rackFacts(product).lead;
    return { product, variant, presentation: [variant.color, variant.size].filter(Boolean).join(" · "), gear: isGear(product) };
  });
  const data = columns.map(({ product, variant, gear }) => {
    const m = productMetrics(product);
    const lot = gear ? undefined : (firstOutLot(variant) ?? product.lot);
    return { m, gear, lot, product };
  });
  const row = (key: CompareRowKey, label: string, better: CompareRow["better"], cell: (d: (typeof data)[number]) => Omit<CompareCell, "best">): CompareRow =>
    ({ key, label, better, cells: marked(data.map(cell), better) });
  const none = (d: (typeof data)[number]) => ({ value: null, text: d.gear ? "No aplica" : "—" });
  const rows = [
    row("price", "Precio", "low", (d) => ({ value: d.m.price, text: ars(d.m.price) })),
    row("perServing", "Precio por servicio", "low", (d) => (d.m.perServing ? { value: d.m.perServing, text: ars(d.m.perServing) } : none(d))),
    row("protein", "Proteína por servicio", "high", (d) => (d.m.protein ? { value: d.m.protein, text: `${d.m.protein.toLocaleString("es-AR")} g` } : none(d))),
    row("servings", "Servicios", "high", (d) => (d.m.servings ? { value: d.m.servings, text: String(d.m.servings) } : none(d))),
    row("days", `Te dura (${perDay} por día)`, "high", (d) => {
      const days = d.m.servings ? daysLasting(d.m.servings, perDay) : null;
      return days ? { value: days, text: `${days} días` } : none(d);
    }),
    row("expiry", "Vence (lote que sale primero)", "high", (d) =>
      d.lot ? { value: daysToExpiry(d.lot.expires, today), text: formatExpiry(d.lot.expires) } : { value: null, text: d.gear ? "No vence" : "—" }),
    row("badges", "Sellos", null, (d) => {
      const badges = d.product.badges ?? [];
      return { value: badges.length, text: badges.length ? badges.map((b) => BADGE_LABELS[b]).join(" · ") : "Sin sellos", badges };
    }),
    row("brand", "Marca", null, (d) => ({ value: null, text: d.product.brand || "—" })),
  ];
  const gears = columns.filter((c) => c.gear).length;
  const comparability: Comparability = gears === 0 ? "full" : gears === columns.length ? "price" : "mixed";
  // Solo equipamiento: los renglones por servicio no dicen nada y se sacan.
  const shown = comparability === "price" ? rows.filter((r) => ["price", "badges", "brand"].includes(r.key)) : rows;
  return { columns, rows: shown, comparability };
}

/** Lo que dice el aviso de arriba de la tabla (null si se comparan solo suplementos). */
export function comparabilityNote(c: Comparability): string | null {
  if (c === "mixed") return "Mezclás equipamiento y suplementos: lo que es por servicio compara solo los suplementos.";
  if (c === "price") return "El equipamiento no tiene servicios ni vencimiento: se compara por precio, sellos y marca.";
  return null;
}

/**
 * Parecidos para comparar: de la misma categoría, con stock primero y del que más rinde al que menos (por servicio,
 * o por precio en equipamiento). Lo usa el riel "Comparalo con…" de la ficha.
 */
export function compareSuggestions(product: Product, n = COMPARE_MAX - 1, catalog: Product[] = activeProducts()): Product[] {
  const score = (p: Product) => { const m = productMetrics(p); return m.perServing ?? m.price; };
  const out = (p: Product) => rackFacts(p).buyable.length === 0;
  return catalog
    .filter((p) => p.slug !== product.slug && p.active !== false && p.categorySlug === product.categorySlug)
    .sort((a, b) => Number(out(a)) - Number(out(b)) || score(a) - score(b) || a.slug.localeCompare(b.slug))
    .slice(0, n);
}

/** `?p=` del comparador → slugs válidos, sin repetir, hasta 3. */
export function parseCompareParam(param: string | null, exists: (slug: string) => boolean): string[] {
  const slugs = (param ?? "").split(",").map((s) => s.trim()).filter((s) => s && exists(s));
  return [...new Set(slugs)].slice(0, COMPARE_MAX);
}

export function compareHref(slugs: string[]): string {
  return slugs.length ? `/comparar/?p=${slugs.join(",")}` : "/comparar/";
}

export type CompareToggle = { slugs: string[]; result: "added" | "removed" | "full" };

/** Suma o saca un producto de la bandeja (máximo 3: el cuarto no entra y se avisa). */
export function toggleCompare(slugs: string[], slug: string, max = COMPARE_MAX): CompareToggle {
  if (slugs.includes(slug)) return { slugs: slugs.filter((s) => s !== slug), result: "removed" };
  if (slugs.length >= max) return { slugs, result: "full" };
  return { slugs: [...slugs, slug], result: "added" };
}

/** Cambia el producto de una columna (si el nuevo ya estaba, intercambian lugar). */
export function replaceCompare(slugs: string[], index: number, slug: string): string[] {
  const next = [...slugs];
  const at = next.indexOf(slug);
  if (at >= 0) next[at] = next[index]!;
  next[index] = slug;
  return next;
}
