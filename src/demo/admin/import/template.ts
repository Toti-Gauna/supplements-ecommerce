import type { Category, Product } from "../../types";
import { stockRows } from "../stock";
import type { Cell } from "./cells";

/** Encabezado de la plantilla oficial (el importador también entiende sinónimos y otro orden). */
export const TEMPLATE_HEADER = ["Código", "Categoría", "Producto", "Variante", "Precio", "Stock", "Visible", "Descripción corta"];

/** Plantilla con el catálogo actual: se baja, se edita en Excel y se vuelve a subir. El código identifica al producto aunque se renombre. */
export function catalogSheet(products: Product[], categories: Category[]): Cell[][] {
  const descriptions = new Map(products.map((p) => [p.slug, p.short]));
  return [
    TEMPLATE_HEADER,
    ...stockRows(products, categories).map((r) => [
      r.productSlug, r.categoryName, r.productName, r.variantLabel, r.price, r.stock < 0 ? "a pedido" : r.stock, r.active ? "sí" : "no", descriptions.get(r.productSlug) ?? "",
    ]),
  ];
}

/**
 * Planilla de ejemplo como la que Volta tiene hoy en Excel: columnas con otros nombres, montos con "$" y
 * puntos, productos nuevos, cambios de stock y una fila con error para mostrar la validación.
 */
export const SAMPLE_SHEET: Cell[][] = [
  ["Rubro", "Artículo", "Modelo", "Precio de venta", "Cantidad", "Activo"],
  ["Comederos", "Comedero perro globo", "Rosa · Mediano", "$ 18.500", "a pedido", "sí"],
  ["Comederos", "Comedero elevado hueso", "Natural", "$ 33.500", 9, "sí"],
  ["Velas", "Vela caniche", "Vainilla", "$ 11.900", 14, "sí"],
  ["Velas", "Vela caniche", "Lavanda", "$ 11.900", 4, "sí"],
  ["Velas", "Vela en lata pintada", "Navidad (rojo y oro)", "$ 9.900", 20, "sí"],
  ["Mates y cocina", "Tabla de picada con nombre", "Grande (40 cm)", "$ 24.000", 6, "sí"],
  ["Mates y cocina", "Tabla de picada con nombre", "Chica (30 cm)", "$ 19.500", 10, "sí"],
  ["Placas NFC", "Placa NFC con tu imagen", "Cuadrada 6 cm", "$ 13.500", 30, "sí"],
  ["Deco", "Perro salchicha geométrico", "", "$ 15.990,50", 3, "sí"],
];
