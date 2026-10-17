import { DEMO_TODAY } from "../fixtures/admin-orders";
import { appendPriceChanges, priceChangesBetween } from "../engine/price-history";
import type { DemoData } from "../engine/source";
import type { Product } from "../types";

/**
 * Productos nuevos de `data` con su cambio de precio registrado ("Descuento real"): cada variante que cambió de precio
 * en el panel (aumento masivo, deshacer o editor) suma una entrada a la historia, fechada el día de la demo.
 */
export function withPriceLog(data: DemoData, products: Product[], day = DEMO_TODAY): Pick<DemoData, "products" | "priceChanges"> {
  return { products, priceChanges: appendPriceChanges(data.priceChanges, priceChangesBetween(data.products, products, day)) };
}
