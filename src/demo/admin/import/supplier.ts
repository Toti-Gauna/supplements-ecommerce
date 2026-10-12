import { normalize } from "../../engine/search";
import { formatARS } from "@/lib/money";
import type { Category, Product, Variant } from "../../types";
import { cellText, parseMoney, type Cell, type Parsed } from "./cells";
import type { ImportPlan, PlanRow, RowAction } from "./plan";
import type { SupplierMapping } from "./supplier-columns";

/**
 * Lista de precios del proveedor (Fase 6): actualiza costo y precio de las variantes que ya vendés. Nunca crea
 * productos: lo que no está en el catálogo se informa y se saltea. Una fila sin sabor vale para todos los sabores de
 * esa presentación. Sin precio sugerido, el precio sale del margen (sobre el precio de venta, redondeado a $100).
 */
const key = (s: string) => normalize(s).replace(/ /g, "");
const sameBrand = (a: string, b: string) => { const x = key(a), y = key(b); return !!x && !!y && (x.startsWith(y) || y.startsWith(x)); };
const sizeOf = (v: Variant) => v.size ?? "";
const sizeMatches = (v: Variant, size: string) => { const a = key(sizeOf(v)), b = key(size); return !!a && (a === b || a.startsWith(b) || b.startsWith(a)); };

/** Margen sobre el precio de venta: precio = costo / (1 − margen), redondeado hacia arriba a $100. */
export function priceFromMargin(cost: number, margin: number): number {
  return Math.ceil((cost * 100) / (100 - margin) / 100) * 100;
}

export function marginOf(price: number, cost: number): number {
  return Math.round(((price - cost) / price) * 100);
}

function parseMargin(c: Cell): Parsed<number> {
  const n = Number(cellText(c).replace(/%|\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 1 && n <= 90 ? { ok: true, value: n } : { ok: false, error: `“${cellText(c)}” no es un margen válido (de 1 a 90 %)` };
}

/** El producto del catálogo para la fila: mismo nombre (o uno contiene al otro) y, si hay columna, la misma marca. */
export function findProduct(products: Product[], name: string, brand: string): Product | undefined {
  const pool = brand ? products.filter((p) => sameBrand(p.brand, brand)) : products;
  const n = key(name);
  return pool.find((p) => key(p.name) === n)
    ?? pool.filter((p) => n.startsWith(key(p.name)) || key(p.name).startsWith(n)).sort((a, b) => b.name.length - a.name.length)[0];
}

function pickVariants(p: Product, r: { size: string; flavor: string; variant: string }): Parsed<Variant[]> {
  if (r.variant) {
    const v = p.variants.find((x) => key(x.label) === key(r.variant) || x.id === r.variant);
    return v ? { ok: true, value: [v] } : { ok: false, error: `No encontramos la variante “${r.variant}”` };
  }
  let list = p.variants;
  if (r.flavor) list = list.filter((v) => key(v.color ?? v.label) === key(r.flavor));
  if (r.flavor && !list.length) return { ok: false, error: `No tiene el sabor “${r.flavor}”` };
  if (r.size) list = list.filter((v) => sizeMatches(v, r.size) || (!v.size && p.variants.length === 1));
  if (r.size && !list.length) return { ok: false, error: `No encontramos la presentación “${r.size}”` };
  const sizes = [...new Set(list.map(sizeOf))];
  if (sizes.length > 1) return { ok: false, error: `Tiene varias presentaciones (${sizes.join(", ")}): indicá cuál` };
  return { ok: true, value: list };
}

function setPrice(p: Product, id: string, price: number): Product {
  if (p.variants.length === 1) return { ...p, basePrice: price, variants: [{ ...p.variants[0]!, priceDelta: 0 }] };
  return { ...p, variants: p.variants.map((v) => (v.id === id ? { ...v, priceDelta: price - p.basePrice } : v)) };
}

const range = (list: number[]) => [...new Set(list)].map(formatARS).join(" / ");

export function buildSupplierPlan(rows: Cell[][], headerIndex: number, m: SupplierMapping, data: { products: Product[]; categories: Category[] }): ImportPlan {
  const products = structuredClone(data.products);
  const out: PlanRow[] = [];
  const at = (cells: Cell[], i: number | null) => (i === null ? "" : cellText(cells[i]));
  rows.slice(headerIndex + 1).forEach((cells, i) => {
    if (!cells.some((c) => cellText(c) !== "")) return;
    const r = { brand: at(cells, m.brand), product: at(cells, m.product), size: at(cells, m.size), flavor: at(cells, m.flavor), variant: at(cells, m.variant) };
    const label = [r.flavor || (r.size ? "Todos los sabores" : ""), r.size, r.variant].filter(Boolean).join(" · ");
    const row: PlanRow = { line: headerIndex + i + 2, product: [r.brand, r.product].filter(Boolean).join(" · "), variant: label, action: "unchanged", changes: [], errors: [], warnings: [] };
    out.push(row);
    const cost = at(cells, m.cost) ? parseMoney(cells[m.cost!]) : null;
    const price = at(cells, m.price) ? parseMoney(cells[m.price!]) : null;
    const margin = at(cells, m.margin) ? parseMargin(cells[m.margin!]) : null;
    if (!r.product) row.errors.push("Falta el nombre del producto");
    for (const p of [cost, price, margin]) if (p && !p.ok) row.errors.push(p.error);
    if (!cost && !price) row.errors.push("Sin costo ni precio: no hay nada para actualizar");
    if (row.errors.length) return void (row.action = "error");
    const product = findProduct(products, r.product, r.brand);
    if (!product) { row.action = "skip"; row.warnings.push("No lo vendés: se saltea"); return; }
    const picked = pickVariants(product, r);
    if (!picked.ok) { row.errors.push(picked.error); return void (row.action = "error"); }
    const newCost = cost?.ok ? cost.value : undefined;
    const newPrice = price?.ok ? price.value : margin?.ok && newCost ? priceFromMargin(newCost, margin.value) : undefined;
    const vs = picked.value;
    let next = product;
    for (const v of vs) {
      if (newCost !== undefined) next = { ...next, variants: next.variants.map((x) => (x.id === v.id ? { ...x, cost: newCost } : x)) };
      if (newPrice !== undefined) next = setPrice(next, v.id, newPrice);
    }
    const before = vs.map((v) => product.basePrice + v.priceDelta);
    if (newCost !== undefined && vs.some((v) => v.cost !== newCost)) row.changes.push(`Costo ${vs.some((v) => v.cost) ? `${range(vs.map((v) => v.cost ?? 0))} → ` : ""}${formatARS(newCost)}`);
    if (newPrice !== undefined && before.some((b) => b !== newPrice)) row.changes.push(`Precio ${range(before)} → ${formatARS(newPrice)}${margin?.ok && !price ? ` (margen ${margin.value} %)` : ""}`);
    const finalPrice = newPrice ?? before[0]!;
    if (newCost !== undefined && newCost >= finalPrice) row.warnings.push(`El costo (${formatARS(newCost)}) es igual o mayor que el precio de venta`);
    else if (newCost !== undefined) row.changes.push(`Margen ${marginOf(finalPrice, newCost)} %`);
    if (vs.length > 1) row.changes.unshift(`${vs.length} variantes: ${vs.map((v) => v.color ?? v.label).join(", ")}`);
    row.product = product.name;
    row.variant = vs.length === 1 ? vs[0]!.label : `${sizeOf(vs[0]!) || r.size} · todos los sabores`;
    if (next !== product) { products[products.indexOf(product)] = next; row.action = row.changes.some((c) => c.startsWith("Costo") || c.startsWith("Precio")) ? "update" : "unchanged"; }
  });
  const counts = { "create-product": 0, "create-variant": 0, update: 0, unchanged: 0, skip: 0, error: 0 } as Record<RowAction, number>;
  for (const r of out) counts[r.action] += 1;
  return { kind: "supplier", rows: out, newCategories: [], counts, next: { products, categories: data.categories }, summary: `${counts.update} filas con costo o precio nuevo` };
}
