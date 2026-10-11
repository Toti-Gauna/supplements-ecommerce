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
  ["Proteínas", "Ionic Whey 100%", "Chocolate · 2 lb (907 g)", "$ 54.900", 30, "sí"],
  ["Proteínas", "Ionic Whey 100%", "Vainilla · 2 lb (907 g)", "$ 54.900", 18, "sí"],
  ["Creatinas", "Creatina monohidrato micronizada", "Sin sabor · 300 g", "$ 29.900", 40, "sí"],
  ["Pre-entrenos", "Overvolt pre-entreno", "Sandía", "$ 36.900", 12, "sí"],
  ["Barras y snacks", "Barra de cereal proteica", "Coco", "$ 2.400", "a pedido", "sí"],
  ["Accesorios", "Guantes de entrenamiento", "Talle M", "$ 14.500", 6, "sí"],
  ["Accesorios", "Guantes de entrenamiento", "Talle L", "$ 14.500", 4, "sí"],
  ["Vitaminas y salud", "Vitamina D3 2000 UI", "60 cápsulas", "$ 12.990,50", 10, "sí"],
];
