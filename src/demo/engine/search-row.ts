import type { Product } from "../types";
import { unitPrice } from "./catalog";
import { pricePerServing } from "./servings";

/** Estado de stock del producto entero (suma de sus variantes), como luz de rack. */
export type ShelfStock = "ok" | "low" | "out" | "made-to-order";

/** Lo que muestra una fila de resultado del buscador: el dato que vende sin abrir la ficha. */
export interface SearchRowFacts {
  /** Precio por servicio de la presentación que manda; null si el producto no informa servicios. */
  perServing: number | null;
  /** Precio de esa presentación (el que se cobra: de lista o de liquidación). */
  price: number;
  servings?: number;
  size?: string;
  /** Las presentaciones a la venta cuestan distinto por servicio: el precio es "desde". */
  from: boolean;
  stock: ShelfStock;
  /** Unidades en el local (las variantes a pedido no suman). */
  units: number;
}

/** "Quedan pocas" desde este número de unidades para abajo (el mismo umbral del panel). */
export const LOW_UNITS = 3;

/**
 * La presentación que manda es la que está a la venta (con stock o a pedido) con mejor precio por servicio (o, sin
 * servicios, el más barato). Si no hay ninguna, la mejor de todas, para seguir mostrando el precio.
 */
export function searchRowFacts(product: Product): SearchRowFacts {
  const facts = product.variants.map((v) => {
    const price = unitPrice(product, v);
    return { v, price, pps: pricePerServing(price, v.servings) };
  });
  const forSale = facts.filter((f) => f.v.stock !== 0);
  const pool = forSale.length ? forSale : facts;
  const lead = [...pool].sort((a, b) => (a.pps ?? a.price) - (b.pps ?? b.price))[0]!;
  const units = product.variants.reduce((n, v) => n + Math.max(0, v.stock), 0);
  const toOrder = product.variants.some((v) => v.stock < 0);
  const stock: ShelfStock = units === 0 ? (toOrder ? "made-to-order" : "out") : units <= LOW_UNITS ? "low" : "ok";
  return {
    perServing: lead.pps,
    price: lead.price,
    servings: lead.v.servings,
    size: lead.v.size,
    from: new Set(pool.map((f) => f.pps ?? f.price)).size > 1,
    stock,
    units,
  };
}
