import { normalize } from "../../engine/search";
import { cellText, type Cell } from "./cells";

/** Columnas que entiende el importador y cómo se reconocen en el encabezado de la planilla del cliente. */
export const IMPORT_FIELDS = ["code", "category", "product", "variant", "price", "stock", "visible", "description"] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];

export const FIELD_LABEL: Record<ImportField, string> = {
  code: "Código",
  category: "Categoría",
  product: "Producto",
  variant: "Variante",
  price: "Precio",
  stock: "Stock",
  visible: "Visible en la tienda",
  description: "Descripción corta",
};

export const REQUIRED_FIELDS: ImportField[] = ["product"];

const SYNONYMS: Record<ImportField, string[]> = {
  code: ["codigo", "cod", "sku", "id", "slug", "codigo de producto", "referencia"],
  category: ["categoria", "categorias", "rubro", "linea", "familia", "category"],
  product: ["producto", "productos", "nombre", "articulo", "item", "product", "name", "titulo"],
  variant: ["variante", "variantes", "modelo", "talle", "color", "tamano", "medida", "opcion", "variant"],
  price: ["precio", "precio final", "precio de venta", "pvp", "valor", "importe", "price"],
  stock: ["stock", "cantidad", "existencia", "existencias", "unidades", "disponible", "qty", "inventario"],
  visible: ["visible", "activo", "publicado", "estado", "mostrar", "active"],
  description: ["descripcion", "detalle", "descripcion corta", "description"],
};

/** Índice de columna por campo (null = no está en la planilla). */
export type ColumnMapping = Record<ImportField, number | null>;

export function emptyMapping(): ColumnMapping {
  return Object.fromEntries(IMPORT_FIELDS.map((f) => [f, null])) as ColumnMapping;
}

/** Fila de encabezado: la primera de las 5 primeras con al menos dos columnas reconocibles. */
export function findHeaderRow(rows: Cell[][]): number {
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const hits = rows[i]!.filter((c) => matchField(cellText(c)) !== null).length;
    if (hits >= 2) return i;
  }
  return 0;
}

export function matchField(header: string): ImportField | null {
  const h = normalize(header);
  if (!h) return null;
  for (const f of IMPORT_FIELDS) if (SYNONYMS[f].includes(h)) return f;
  for (const f of IMPORT_FIELDS) if (SYNONYMS[f].some((s) => h.startsWith(`${s} `) || h.endsWith(` ${s}`))) return f;
  return null;
}

/** Mapeo automático a partir del encabezado. Cada campo toma la primera columna que coincide. */
export function detectMapping(header: Cell[]): ColumnMapping {
  const mapping = emptyMapping();
  header.forEach((c, i) => {
    const f = matchField(cellText(c));
    if (f && mapping[f] === null) mapping[f] = i;
  });
  return mapping;
}
