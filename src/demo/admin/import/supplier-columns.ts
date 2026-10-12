import { normalize } from "../../engine/search";
import { cellText, type Cell } from "./cells";

/**
 * Columnas de una lista de precios de distribuidor (Fase 6): marca, producto, presentación y/o sabor, costo y precio
 * sugerido o margen. Cada distribuidor las llama distinto; se reconocen por sinónimos y se pueden corregir a mano.
 */
export const SUPPLIER_FIELDS = ["brand", "product", "size", "flavor", "variant", "cost", "price", "margin"] as const;
export type SupplierField = (typeof SUPPLIER_FIELDS)[number];
export type SupplierMapping = Record<SupplierField, number | null>;

export const SUPPLIER_LABEL: Record<SupplierField, string> = {
  brand: "Marca",
  product: "Producto",
  size: "Presentación",
  flavor: "Sabor",
  variant: "Variante (sabor y presentación juntos)",
  cost: "Costo",
  price: "Precio sugerido",
  margin: "Margen sugerido (%)",
};

export const SUPPLIER_REQUIRED: SupplierField[] = ["product", "cost"];

const SYNONYMS: Record<SupplierField, string[]> = {
  brand: ["marca", "marcas", "fabricante", "laboratorio", "linea", "brand"],
  product: ["producto", "productos", "articulo", "descripcion", "nombre", "item", "detalle", "product"],
  size: ["presentacion", "presentaciones", "tamano", "peso", "contenido", "envase", "medida", "formato", "size"],
  flavor: ["sabor", "sabores", "gusto", "variedad", "flavor"],
  variant: ["variante", "variantes", "modelo", "opcion"],
  cost: ["costo", "costo unitario", "precio costo", "precio de costo", "costo neto", "precio distribuidor", "precio mayorista", "mayorista", "neto", "cost"],
  price: ["precio sugerido", "pvp", "pvp sugerido", "precio publico", "precio al publico", "precio de venta", "venta sugerida", "sugerido", "precio venta"],
  margin: ["margen", "margen sugerido", "margen de ganancia", "rentabilidad", "margin"],
};

export function matchSupplierField(header: string): SupplierField | null {
  const h = normalize(header);
  if (!h) return null;
  for (const f of SUPPLIER_FIELDS) if (SYNONYMS[f].includes(h)) return f;
  for (const f of SUPPLIER_FIELDS) if (SYNONYMS[f].some((s) => h.startsWith(`${s} `) || h.endsWith(` ${s}`))) return f;
  return null;
}

export function emptySupplierMapping(): SupplierMapping {
  return Object.fromEntries(SUPPLIER_FIELDS.map((f) => [f, null])) as SupplierMapping;
}

export function detectSupplierMapping(header: Cell[]): SupplierMapping {
  const mapping = emptySupplierMapping();
  header.forEach((c, i) => {
    const f = matchSupplierField(cellText(c));
    if (f && mapping[f] === null) mapping[f] = i;
  });
  return mapping;
}

/** Fila de títulos: la primera de las 8 primeras con al menos dos columnas reconocibles (las listas traen membrete). */
export function findSupplierHeader(rows: Cell[][]): number {
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    if (rows[i]!.filter((c) => matchSupplierField(cellText(c)) !== null).length >= 2) return i;
  }
  return 0;
}

export type SheetKind = "catalog" | "supplier";

/** Es una lista de proveedor si tiene una columna de costo; si no, es el catálogo de la tienda. */
export function detectSheetKind(rows: Cell[][]): SheetKind {
  return detectSupplierMapping(rows[findSupplierHeader(rows)] ?? []).cost !== null ? "supplier" : "catalog";
}
