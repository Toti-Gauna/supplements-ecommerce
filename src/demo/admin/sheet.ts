import { normalize } from "../engine/search";
import type { Category, Product } from "../types";
import { parseMoney, parseStock, parseYesNo, type Parsed } from "./import/cells";
import type { StockRow } from "./stock";

/** Planilla nativa del panel: columnas editables, validación, borrador con deshacer/rehacer y TSV de Excel. */
export const SHEET_COLUMNS = ["productName", "variantLabel", "categorySlug", "price", "stock", "active"] as const;
export type SheetColumn = (typeof SHEET_COLUMNS)[number];
export type SheetValue = string | number | boolean;

export const COLUMN_LABEL: Record<SheetColumn, string> = {
  productName: "Producto", variantLabel: "Variante", categorySlug: "Categoría", price: "Precio", stock: "Stock", active: "Visible",
};

/** Columnas que cambian el producto entero (todas sus variantes) y no una sola variante. */
const PRODUCT_LEVEL: SheetColumn[] = ["productName", "categorySlug", "active"];

export const cellKey = (rowKey: string, col: string) => `${rowKey}|${col}`;

/**
 * Columna de una vista Excel (8.3.4). Sin `parse` es de solo lectura: se ve, se ordena y se copia, pero no se
 * edita. Los estados críticos (pagos, etapas de pedidos) nunca tienen `parse`: cambian solo por el engine.
 */
export interface SheetSpecColumn<R> {
  id: string;
  label: string;
  get: (row: R) => SheetValue;
  /** Texto para mostrar y copiar (por defecto, el valor; sí/no para casillas). */
  text?: (value: SheetValue, row: R) => string;
  numeric?: boolean;
  money?: boolean;
  parse?: (input: string, row: R) => Parsed<SheetValue>;
  /** Editar con un select (`options`) o como casilla que se tilda con un toque. */
  input?: "select" | "toggle";
  options?: { value: string; label: string }[];
  /** Ancho mínimo de la columna (clases de Tailwind). */
  width?: string;
}

export interface SheetSpec<R> {
  rowKey: (row: R) => string;
  columns: SheetSpecColumn<R>[];
  /** Una edición que también cambia otras filas (el nombre de un producto, en todas sus variantes). */
  expand?: (rows: R[], rowKey: string, col: string, value: SheetValue) => Draft;
}

export function specText<R>(col: SheetSpecColumn<R>, value: SheetValue, row: R): string {
  if (col.text) return col.text(value, row);
  if (typeof value === "boolean") return value ? "sí" : "no";
  return String(value ?? "");
}

/** Descarta del borrador lo que volvió a su valor original (o ya no existe). */
export function specPrune<R>(spec: SheetSpec<R>, rows: R[], draft: Draft): Draft {
  const byKey = new Map(rows.map((r) => [spec.rowKey(r), r]));
  return Object.fromEntries(Object.entries(draft).filter(([k, v]) => {
    const i = k.lastIndexOf("|");
    const row = byKey.get(k.slice(0, i));
    const col = spec.columns.find((c) => c.id === k.slice(i + 1));
    return row && col?.parse && col.get(row) !== v;
  }));
}

export function parseCellInput(col: SheetColumn, input: string, categories: Category[]): Parsed<SheetValue> {
  const text = input.trim();
  switch (col) {
    case "productName":
    case "variantLabel":
      return text ? { ok: true, value: text } : { ok: false, error: "No puede quedar vacío" };
    case "categorySlug": {
      const c = categories.find((x) => x.slug === text || normalize(x.name) === normalize(text));
      return c ? { ok: true, value: c.slug } : { ok: false, error: `No existe la categoría “${text}”` };
    }
    case "price":
      return parseMoney(text);
    case "stock": {
      const p = parseStock(text);
      return !p.ok ? p : p.value === null ? { ok: false, error: "Escribí un número o “a pedido”" } : { ok: true, value: p.value };
    }
    case "active": {
      const p = parseYesNo(text);
      return !p.ok ? p : p.value === null ? { ok: false, error: "Escribí sí o no" } : { ok: true, value: p.value };
    }
  }
}

export type Draft = Record<string, SheetValue>;

/** Aplica el borrador: una sola pasada sobre el catálogo, sin tocar lo que no cambió. */
export function applyDraft(products: Product[], rows: StockRow[], draft: Draft): Product[] {
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const next = new Map(products.map((p) => [p.slug, { ...p, variants: [...p.variants] }]));
  for (const [key, value] of Object.entries(draft)) {
    const [rowKey, col] = key.split("|") as [string, SheetColumn];
    const row = byKey.get(rowKey);
    const p = row && next.get(row.productSlug);
    if (!row || !p) continue;
    if (PRODUCT_LEVEL.includes(col)) {
      if (col === "productName") p.name = String(value);
      if (col === "categorySlug") p.categorySlug = String(value);
      if (col === "active") p.active = Boolean(value);
      continue;
    }
    const vi = p.variants.findIndex((v) => v.id === row.variantId);
    if (vi < 0) continue;
    const v = p.variants[vi]!;
    if (col === "variantLabel") p.variants[vi] = { ...v, label: String(value) };
    if (col === "stock") p.variants[vi] = { ...v, stock: Number(value) };
    if (col === "price") {
      if (p.variants.length === 1) { p.basePrice = Number(value); p.variants[vi] = { ...v, priceDelta: 0 }; }
      else p.variants[vi] = { ...v, priceDelta: Number(value) - p.basePrice };
    }
  }
  return products.map((p) => next.get(p.slug)!);
}

/** Historial del borrador. Las columnas de producto se copian a todas las filas del mismo producto. */
export interface SheetHistory { draft: Draft; past: Draft[]; future: Draft[] }

export type SheetAction = { type: "set"; cells: Draft } | { type: "undo" } | { type: "redo" } | { type: "reset" };

export function sheetReducer(state: SheetHistory, action: SheetAction): SheetHistory {
  switch (action.type) {
    case "set":
      return { draft: { ...state.draft, ...action.cells }, past: [...state.past, state.draft].slice(-50), future: [] };
    case "undo":
      return state.past.length ? { draft: state.past.at(-1)!, past: state.past.slice(0, -1), future: [state.draft, ...state.future] } : state;
    case "redo":
      return state.future.length ? { draft: state.future[0]!, past: [...state.past, state.draft], future: state.future.slice(1) } : state;
    case "reset":
      return { draft: {}, past: [], future: [] };
  }
}

/** Expande una edición de columna de producto a todas las filas de ese producto, y descarta lo que vuelve al valor original. */
export function expandEdit(rows: StockRow[], rowKey: string, col: SheetColumn, value: SheetValue): Draft {
  const row = rows.find((r) => r.key === rowKey);
  if (!row) return {};
  const targets = PRODUCT_LEVEL.includes(col) ? rows.filter((r) => r.productSlug === row.productSlug) : [row];
  return Object.fromEntries(targets.map((r) => [cellKey(r.key, col), value]));
}

export function pruneDraft(rows: StockRow[], draft: Draft): Draft {
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return Object.fromEntries(Object.entries(draft).filter(([k, v]) => {
    const [rowKey, col] = k.split("|") as [string, SheetColumn];
    const row = byKey.get(rowKey);
    return row && row[col] !== v;
  }));
}

/**
 * Texto copiado de Excel o Google Sheets: celdas por tabulación y filas por salto de línea. Respeta las celdas
 * entre comillas (pueden traer tabulaciones o saltos de línea adentro, como las escribe Excel y toTsv).
 */
export function parseTsv(text: string): string[][] {
  const src = text.replace(/\r\n?/g, "\n").replace(/\n$/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === "\t") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

export function toTsv(cells: string[][]): string {
  return cells.map((r) => r.map((c) => (/[\t\n"]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join("\t")).join("\n");
}
