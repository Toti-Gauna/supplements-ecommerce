import { UNIT_LABEL, type Material } from "../fixtures/workshop";
import type { Category } from "../types";
import type { CategoryRow } from "./categories";
import { parseMoney, parseYesNo, type Parsed } from "./import/cells";
import { COLUMN_LABEL, expandEdit, parseCellInput, type Draft, type SheetColumn, type SheetSpec, type SheetValue } from "./sheet";
import type { StockRow } from "./stock";
import { MATERIAL_STATE_LABEL, reorderQty, type MaterialRow } from "./workshop/materials";

/** Vistas Excel de Productos y stock, Insumos y Categorías (8.3.18, 8.3.19, 8.3.22): qué se edita, cómo se valida y cómo se guarda. */

/** La planilla de Productos y stock: una fila por variante; nombre, categoría y visibilidad valen para todo el producto. */
export function productSheetSpec(categories: Category[]): SheetSpec<StockRow> {
  const parse = (col: SheetColumn) => (input: string) => parseCellInput(col, input, categories);
  return {
    rowKey: (r) => r.key,
    expand: (rows, rowKey, col, value) => expandEdit(rows, rowKey, col as SheetColumn, value),
    columns: [
      { id: "productName", label: COLUMN_LABEL.productName, get: (r) => r.productName, parse: parse("productName"), width: "min-w-[10.5rem] sm:min-w-[15rem]" },
      { id: "variantLabel", label: COLUMN_LABEL.variantLabel, get: (r) => r.variantLabel, parse: parse("variantLabel"), width: "min-w-[9rem] sm:min-w-[11rem]" },
      { id: "categorySlug", label: COLUMN_LABEL.categorySlug, get: (r) => r.categorySlug, parse: parse("categorySlug"), input: "select", options: categories.map((c) => ({ value: c.slug, label: c.name })),
        text: (v) => categories.find((c) => c.slug === v)?.name ?? String(v), width: "min-w-[9rem] sm:min-w-[10rem]" },
      { id: "price", label: COLUMN_LABEL.price, get: (r) => r.price, parse: parse("price"), numeric: true, money: true, width: "min-w-[7rem] sm:min-w-[8rem]" },
      { id: "stock", label: COLUMN_LABEL.stock, get: (r) => r.stock, parse: parse("stock"), numeric: true, text: (v) => (Number(v) < 0 ? "a pedido" : String(v)), width: "min-w-[6rem] sm:min-w-[7rem]" },
      { id: "active", label: COLUMN_LABEL.active, get: (r) => r.active, parse: parse("active"), input: "toggle", width: "min-w-[5rem]" },
    ],
  };
}

const required = (input: string): Parsed<SheetValue> => (input.trim() ? { ok: true, value: input.trim() } : { ok: false, error: "No puede quedar vacío" });

/** Cantidad de un insumo: 0 o más; con coma decimal solo en metros y planchas (como en la tabla). */
export function parseQty(input: string, decimals: boolean): Parsed<number> {
  const text = input.trim().replace(/\s/g, "");
  if (!text) return { ok: false, error: "Falta la cantidad" };
  if (text.startsWith("-")) return { ok: false, error: "No puede ser negativa" };
  const raw = decimals ? text.replace(",", ".") : text.replace(/\.(?=\d{3}(\D|$))/g, "");
  if (!(decimals ? /^\d+(\.\d+)?$/ : /^\d+$/).test(raw)) return { ok: false, error: decimals ? `“${input.trim()}” no es una cantidad válida` : `“${input.trim()}” no es una cantidad entera` };
  return { ok: true, value: Number(raw) };
}

const usesDecimals = (r: MaterialRow) => r.unit === "m" || r.unit === "plancha";

export const materialSheetSpec: SheetSpec<MaterialRow> = {
  rowKey: (r) => r.id,
  columns: [
    { id: "name", label: "Insumo", get: (r) => r.name, parse: required, width: "min-w-[11rem] sm:min-w-[14rem]" },
    { id: "unit", label: "Unidad", get: (r) => UNIT_LABEL[r.unit], width: "min-w-[7rem]" },
    { id: "costPerUnit", label: "Costo por unidad", get: (r) => r.costPerUnit, parse: (t) => parseMoney(t), numeric: true, money: true, width: "min-w-[8rem]" },
    { id: "stock", label: "En el taller", get: (r) => r.stock, parse: (t, r) => parseQty(t, usesDecimals(r)), numeric: true, width: "min-w-[7rem]" },
    { id: "minStock", label: "Mínimo", get: (r) => r.minStock, parse: (t, r) => parseQty(t, usesDecimals(r)), numeric: true, width: "min-w-[6rem]" },
    { id: "supplier", label: "Proveedor", get: (r) => r.supplier ?? "", parse: (t) => ({ ok: true, value: t.trim() }), width: "min-w-[9rem]" },
    { id: "committed", label: "Piden los pedidos", get: (r) => r.committed, numeric: true, width: "min-w-[8rem]" },
    { id: "available", label: "Queda", get: (r) => r.available, numeric: true, width: "min-w-[6rem]" },
    { id: "state", label: "Estado", get: (r) => MATERIAL_STATE_LABEL[r.state], width: "min-w-[7rem]" },
    { id: "reorder", label: "Comprar", get: (r) => reorderQty(r), numeric: true, width: "min-w-[6rem]" },
  ],
};

/** Aplica el borrador a los insumos en una pasada; lo calculado (comprometido, queda) no se toca. */
export function applyMaterialDraft(materials: Material[], draft: Draft): Material[] {
  const next = new Map(materials.map((m) => [m.id, { ...m }]));
  for (const [key, value] of Object.entries(draft)) {
    const i = key.lastIndexOf("|");
    const m = next.get(key.slice(0, i));
    const col = key.slice(i + 1);
    if (!m) continue;
    if (col === "name") m.name = String(value);
    if (col === "costPerUnit") m.costPerUnit = Number(value);
    if (col === "stock") m.stock = Number(value);
    if (col === "minStock") m.minStock = Number(value);
    if (col === "supplier") m.supplier = String(value) || undefined;
  }
  return materials.map((m) => next.get(m.id)!);
}

export const categorySheetSpec: SheetSpec<CategoryRow> = {
  rowKey: (r) => r.slug,
  columns: [
    { id: "position", label: "Orden", get: (r) => r.position, numeric: true, width: "min-w-[5rem]" },
    { id: "name", label: "Nombre", get: (r) => r.name, parse: required, width: "min-w-[12rem] sm:min-w-[16rem]" },
    { id: "featured", label: "Destacada", get: (r) => r.featured, input: "toggle",
      parse: (t) => { const p = parseYesNo(t); return !p.ok ? p : p.value === null ? { ok: false, error: "Escribí sí o no" } : { ok: true, value: p.value }; }, width: "min-w-[6rem]" },
    { id: "active", label: "Productos activos", get: (r) => r.active, numeric: true, text: (v, r) => `${v} / ${r.total}`, width: "min-w-[8rem]" },
    { id: "reorder", label: "Para reponer", get: (r) => r.reorder, numeric: true, width: "min-w-[7rem]" },
  ],
};

/** Nombre y destacada; el orden global no se edita desde la grilla (se mueve con Subir/Bajar). */
export function applyCategoryDraft(categories: Category[], draft: Draft): Category[] {
  const next = new Map(categories.map((c) => [c.slug, { ...c }]));
  for (const [key, value] of Object.entries(draft)) {
    const i = key.lastIndexOf("|");
    const c = next.get(key.slice(0, i));
    const col = key.slice(i + 1);
    if (!c) continue;
    if (col === "name") c.name = String(value);
    if (col === "featured") c.featured = Boolean(value);
  }
  return categories.map((c) => next.get(c.slug)!);
}
