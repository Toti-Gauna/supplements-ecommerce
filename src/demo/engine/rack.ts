import { stockState, type StockState } from "../admin/stock";
import type { Goal, Product, Variant } from "../types";
import { activeProducts, productsInCategory, unitPrice } from "./catalog";
import { bestValueSize, pricePerServing } from "./servings";

/**
 * "Ficha de rack" (R1): los datos que venden, calculados una sola vez para la tarjeta, el hero y los estantes. Puro;
 * en producción lo arma el servidor con el mismo cálculo (precio por servicio, stock por variante).
 */
export interface VariantLight {
  id: string;
  /** "Chocolate · 2 lb" (lo que se lee con el lector de pantalla y al pasar el mouse). */
  label: string;
  state: StockState;
}

export interface RackFacts {
  /** La variante que manda: la de mejor precio por servicio entre las que hay (o la primera, si no hay ninguna). */
  lead: Variant;
  /** Precio del pote de esa variante (con liquidación, si su lote sale primero). */
  price: number;
  perServing: number | null;
  /** Hay otras variantes con otro precio por servicio: la tarjeta dice "desde". */
  from: boolean;
  /** Unidades en el local (las variantes a pedido no suman). */
  units: number;
  state: StockState;
  lights: VariantLight[];
  flavors: number;
  sizes: number;
  /** Variantes que se pueden agregar (con stock o a pedido). */
  buyable: Variant[];
  bestSize: string | null;
}

const LIGHTS_MAX = 8;
const label = (v: Variant) => [v.color, v.size].filter(Boolean).join(" · ") || v.label;
const score = (product: Product, v: Variant) => pricePerServing(unitPrice(product, v), v.servings) ?? unitPrice(product, v);

export function rackFacts(product: Product): RackFacts {
  const buyable = product.variants.filter((v) => v.stock !== 0);
  const pool = buyable.length ? buyable : product.variants;
  const lead = [...pool].sort((a, b) => score(product, a) - score(product, b))[0]!;
  const price = unitPrice(product, lead);
  const perServing = pricePerServing(price, lead.servings);
  const scores = new Set(pool.map((v) => score(product, v)));
  const inShop = product.variants.reduce((n, v) => n + Math.max(0, v.stock), 0);
  const onOrder = product.variants.some((v) => v.stock < 0);
  return {
    lead, price, perServing, from: scores.size > 1, units: inShop,
    state: onOrder && inShop === 0 ? "made-to-order" : stockState(inShop),
    lights: product.variants.slice(0, LIGHTS_MAX).map((v) => ({ id: v.id, label: label(v), state: stockState(v.stock) })),
    flavors: new Set(product.variants.map((v) => v.color).filter(Boolean)).size,
    sizes: new Set(product.variants.map((v) => v.size).filter(Boolean)).size,
    buyable, bestSize: bestValueSize(product),
  };
}

/** Cómo se lee el stock en la tarjeta: "En stock · 18 u", "Quedan 2", "Sin stock", "A pedido". */
export function stockLine(f: Pick<RackFacts, "state" | "units">): string {
  if (f.state === "made-to-order") return "A pedido";
  if (f.state === "out") return "Sin stock";
  if (f.state === "low") return `Quedan ${f.units}`;
  return `En stock · ${f.units} u`;
}

/** Estante de una categoría: los 3 potes más vendidos, el mejor precio por servicio y cuántas marcas hay. */
export interface CategoryShelf {
  products: Product[];
  count: number;
  brands: number;
  /** El precio por servicio más bajo de la categoría (null si ninguno informa servicios). */
  fromPerServing: number | null;
}

export function categoryShelf(slug: string, take = 3): CategoryShelf {
  const list = productsInCategory(slug);
  const pps = list.map((p) => rackFacts(p).perServing).filter((n): n is number => n !== null);
  return {
    products: [...list].sort((a, b) => b.soldCount - a.soldCount).slice(0, take),
    count: list.length,
    brands: new Set(list.map((p) => p.brand)).size,
    fromPerServing: pps.length ? Math.min(...pps) : null,
  };
}

/** El producto de un objetivo: el que eligió el dueño (si sigue visible y es de ese objetivo) o el más vendido. */
export function goalProduct(goal: Goal, chosen?: string): Product | undefined {
  const list = activeProducts().filter((p) => p.goals?.includes(goal)).sort((a, b) => b.soldCount - a.soldCount);
  return list.find((p) => p.slug === chosen) ?? list[0];
}
