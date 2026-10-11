import { normalize } from "../../engine/search";
import { formatARS } from "@/lib/money";
import type { Category, Product } from "../../types";
import { cellText, parseMoney, parseStock, parseYesNo, slugify, type Cell } from "./cells";
import type { ColumnMapping } from "./columns";

/**
 * Plan de importación: qué hace cada fila de la planilla (crear, actualizar, nada o error) y cómo queda el
 * catálogo. Se calcula sobre copias; el panel aplica `next` de una vez y guarda el estado anterior para deshacer.
 */
export type RowAction = "create-product" | "create-variant" | "update" | "unchanged" | "error";

export interface PlanRow {
  line: number;
  product: string;
  variant: string;
  action: RowAction;
  changes: string[];
  errors: string[];
  warnings: string[];
}

export interface ImportPlan {
  rows: PlanRow[];
  newCategories: string[];
  counts: Record<RowAction, number>;
  next: { products: Product[]; categories: Category[] };
}

interface Work { products: Product[]; categories: Category[]; newCategories: string[] }

const same = (a: string, b: string) => normalize(a) === normalize(b);

function uniqueSlug(base: string, taken: (s: string) => boolean): string {
  let slug = slugify(base);
  for (let n = 2; taken(slug); n++) slug = `${slugify(base)}-${n}`;
  return slug;
}

function resolveCategory(w: Work, name: string): Category {
  const found = w.categories.find((c) => same(c.name, name) || c.slug === slugify(name));
  if (found) return found;
  const created: Category = {
    slug: uniqueSlug(name, (s) => w.categories.some((c) => c.slug === s)), name: name.trim(), description: "",
    art: "dachshund", featured: false, sortOrder: Math.max(0, ...w.categories.map((c) => c.sortOrder)) + 1,
  };
  w.categories = [...w.categories, created];
  w.newCategories.push(created.name);
  return created;
}

function readRow(row: Cell[], m: ColumnMapping) {
  const at = (i: number | null) => (i === null ? undefined : row[i]);
  const has = (i: number | null) => i !== null && cellText(row[i]) !== "";
  return {
    code: cellText(at(m.code)), product: cellText(at(m.product)), variant: cellText(at(m.variant)), category: cellText(at(m.category)), description: cellText(at(m.description)),
    price: has(m.price) ? parseMoney(at(m.price)) : null,
    stock: has(m.stock) ? parseStock(at(m.stock)) : null,
    visible: has(m.visible) ? parseYesNo(at(m.visible)) : null,
  };
}

const stockText = (s: number) => (s < 0 ? "a pedido" : String(s));

export function buildImportPlan(rows: Cell[][], headerIndex: number, mapping: ColumnMapping, data: { products: Product[]; categories: Category[] }): ImportPlan {
  const w: Work = { products: structuredClone(data.products), categories: structuredClone(data.categories), newCategories: [] };
  const out: PlanRow[] = [];
  rows.slice(headerIndex + 1).forEach((cells, i) => {
    if (!cells.some((c) => cellText(c) !== "")) return;
    const r = readRow(cells, mapping);
    const plan: PlanRow = { line: headerIndex + i + 2, product: r.product, variant: r.variant, action: "unchanged", changes: [], errors: [], warnings: [] };
    out.push(plan);
    for (const p of [r.price, r.stock, r.visible]) if (p && !p.ok) plan.errors.push(p.error);
    if (!r.product) plan.errors.push("Falta el nombre del producto");
    if (plan.errors.length) return void (plan.action = "error");
    const price = r.price?.ok ? r.price.value : null;
    const stock = r.stock?.ok ? r.stock.value : null;
    const visible = r.visible?.ok ? r.visible.value : null;
    const byName = w.products.filter((p) => same(p.name, r.product));
    if (!r.code && byName.length > 1) {
      plan.errors.push(`Hay ${byName.length} productos llamados así: agregá la columna Código para saber cuál es`);
      return void (plan.action = "error");
    }
    const product = r.code ? w.products.find((p) => p.slug === r.code) : byName[0] ?? w.products.find((p) => p.slug === r.product.trim());

    if (!product) {
      if (!r.category) plan.errors.push("Producto nuevo: falta la categoría");
      if (price === null) plan.errors.push("Producto nuevo: falta el precio");
      if (plan.errors.length) return void (plan.action = "error");
      const cat = resolveCategory(w, r.category);
      const slug = uniqueSlug(r.code || r.product, (s) => w.products.some((p) => p.slug === s));
      const label = r.variant || "Único";
      if (stock === null) plan.warnings.push("Sin stock indicado: queda a pedido");
      w.products.push({
        slug, name: r.product.trim(), short: r.description, description: r.description || r.product.trim(), categorySlug: cat.slug, basePrice: price!,
        art: cat.art, gallery: ["front"], variants: [{ id: `${slug}-${slugify(label)}`, label, priceDelta: 0, stock: stock ?? -1 }],
        faqs: [], featured: false, isNew: true, soldCount: 0, tags: [], active: visible ?? true, imageAlt: r.product.trim(),
      });
      plan.action = "create-product";
      plan.changes.push(`Nuevo en ${cat.name} · ${formatARS(price!)} · stock ${stockText(stock ?? -1)}`);
      return;
    }

    const idx = w.products.indexOf(product);
    const next: Product = { ...product, variants: [...product.variants] };
    const vi = r.variant ? next.variants.findIndex((v) => same(v.label, r.variant) || v.id === r.variant) : next.variants.length === 1 ? 0 : -1;
    if (vi < 0 && !r.variant && (price !== null || stock !== null)) {
      plan.errors.push(`Tiene ${next.variants.length} variantes: indicá cuál en la columna Variante`);
      return void (plan.action = "error");
    }
    if (r.category && !same(r.category, w.categories.find((c) => c.slug === product.categorySlug)?.name ?? "")) {
      const cat = resolveCategory(w, r.category);
      if (cat.slug !== product.categorySlug) { next.categorySlug = cat.slug; plan.changes.push(`Categoría → ${cat.name}`); }
    }
    if (r.code && !same(r.product, product.name)) { next.name = r.product.trim(); plan.changes.push(`Nombre → ${next.name}`); }
    if (visible !== null && visible !== (product.active !== false)) { next.active = visible; plan.changes.push(visible ? "Pasa a visible" : "Se pausa"); }
    if (r.description && r.description !== product.short) { next.short = r.description; plan.changes.push("Descripción corta actualizada"); }

    if (vi < 0 && r.variant) {
      if (stock === null) plan.warnings.push("Sin stock indicado: queda a pedido");
      next.variants.push({ id: uniqueSlug(`${next.slug}-${r.variant}`, (s) => next.variants.some((v) => v.id === s)), label: r.variant.trim(), priceDelta: price === null ? 0 : price - next.basePrice, stock: stock ?? -1 });
      plan.action = "create-variant";
      plan.changes.push(`Variante nueva · ${formatARS(price ?? next.basePrice)} · stock ${stockText(stock ?? -1)}`);
    } else if (vi >= 0) {
      const v = next.variants[vi]!;
      const current = next.basePrice + v.priceDelta;
      if (price !== null && price !== current) {
        if (next.variants.length === 1) { next.basePrice = price; next.variants[vi] = { ...v, priceDelta: 0 }; }
        else next.variants[vi] = { ...v, priceDelta: price - next.basePrice };
        plan.changes.push(`Precio ${formatARS(current)} → ${formatARS(price)}`);
      }
      const nv = next.variants[vi]!;
      if (stock !== null && stock !== nv.stock) { next.variants[vi] = { ...nv, stock }; plan.changes.push(`Stock ${stockText(nv.stock)} → ${stockText(stock)}`); }
      if (plan.changes.length) plan.action = "update";
    } else if (plan.changes.length) plan.action = "update";
    w.products[idx] = next;
  });
  const counts = { "create-product": 0, "create-variant": 0, update: 0, unchanged: 0, error: 0 } as Record<RowAction, number>;
  for (const r of out) counts[r.action] += 1;
  return { rows: out, newCategories: w.newCategories, counts, next: { products: w.products, categories: w.categories } };
}
