import { defaultAdminData } from "@/demo/admin/defaults";
import { productStockTotal, stockState, type StockState } from "@/demo/admin/stock";
import { bestSellers, getCategory, getProduct, productHref, unitPrice } from "@/demo/engine/catalog";
import { estimateForProduct } from "@/demo/engine/delivery";
import { firstOutLot, formatExpiry } from "@/demo/engine/lots";
import { bestValueSize, pricePerServing, servingSavingsPct } from "@/demo/engine/servings";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { demoSettings } from "@/demo/fixtures/commerce";
import type { Product, ProductBadge, Variant } from "@/demo/types";
import { formatDay } from "@/lib/date";

/**
 * Datos de la maqueta B, todos del catálogo y del engine (precio, precio por servicio, stock, lote y despacho).
 * Acá solo se elige qué mostrar; ninguna regla de precio ni de stock se calcula en la UI.
 */

export const BADGE_LABEL: Record<ProductBadge, string> = {
  "sin-tacc": "Sin TACC", vegano: "Vegano", "sin-azucar": "Sin azúcar", keto: "Keto", "marca-propia": "Marca propia", "sin-cafeina": "Sin cafeína",
};

/** Renglones estándar del rótulo: lo que no está acá es un activo (creatina, cafeína…). */
const STANDARD_ROWS = new Set(["Valor energético", "Carbohidratos", "de los cuales azúcares", "Proteínas", "Grasas totales", "Grasas saturadas", "Grasas trans", "Fibra alimentaria", "Sodio"]);

export interface KeyFact { value: string; unit: string; label: string }

/** El activo que vende: la proteína si es una proteína, si no el primer activo del rótulo ("5 g creatina"). */
export function keyFact(p: Product): KeyFact | null {
  const rows = p.nutrition?.rows ?? [];
  const protein = rows.find((r) => r.label === "Proteínas");
  const pick = protein && parseFloat(protein.serving) >= 10 ? { ...protein, label: "Proteína" } : rows.find((r) => !STANDARD_ROWS.has(r.label));
  if (!pick) return null;
  const [value = pick.serving, unit = ""] = pick.serving.split(/\s+/);
  return { value, unit, label: pick.label.toLowerCase().split(" ")[0]! };
}

/** Variante de vidriera: la más barata con stock (o la primera). */
export function showcaseVariant(p: Product): Variant {
  const inStock = p.variants.filter((v) => v.stock !== 0);
  return [...(inStock.length ? inStock : p.variants)].sort((a, b) => unitPrice(p, a) - unitPrice(p, b))[0]!;
}

/** Texto de góndola para el stock de una variante (el estado sale de `stockState` del panel). */
function stockText(units: number): string {
  const state = stockState(units);
  if (state === "made-to-order") return "A pedido";
  if (state === "out") return "Sin stock";
  return state === "low" ? `Últimas ${units}` : `En stock · ${units} u.`;
}

/** Estado inicial del panel demo (pedidos, calendario del cadete y catálogo), el mismo que ve el dueño al abrirlo. */
export const adminSeed = defaultAdminData();

export interface ProductView {
  product: Product;
  variant: Variant;
  href: string;
  category: string;
  price: number;
  pps: number | null;
  fact: KeyFact | null;
  badges: { key: ProductBadge; label: string }[];
  /** Luces y texto de la variante de vidriera; `units`, el total del producto en el local. */
  stock: { state: StockState; text: string; units: number | null };
  lot: { code: string; expires: string } | null;
  /** "mar 6 oct": primer día que sale con cadete en Mar del Plata. */
  dispatch: string;
  bestSize: string | null;
  savingsPct: number | null;
  rank: number;
}

export function productView(slug: string): ProductView {
  const product = getProduct(slug);
  if (!product) throw new Error(`Producto de la maqueta inexistente: ${slug}`);
  const variant = showcaseVariant(product);
  const price = unitPrice(product, variant);
  const lot = firstOutLot(variant) ?? product.lot;
  const est = estimateForProduct(product, variant, DEMO_TODAY, adminSeed.orders, adminSeed.workshop.settings);
  return {
    product, variant, price,
    href: productHref(slug),
    category: getCategory(product.categorySlug)?.name ?? "",
    pps: pricePerServing(price, variant.servings),
    fact: keyFact(product),
    badges: (product.badges ?? []).map((key) => ({ key, label: BADGE_LABEL[key] })),
    stock: { state: stockState(variant.stock), text: stockText(variant.stock), units: productStockTotal(product) },
    lot: lot ? { code: lot.code, expires: formatExpiry(lot.expires) } : null,
    dispatch: formatDay(est.day),
    bestSize: bestValueSize(product),
    savingsPct: servingSavingsPct(product),
    rank: bestSellers(50).findIndex((p) => p.slug === slug) + 1,
  };
}

/** Precio con transferencia y envío gratis: valores de la configuración de la tienda (no se calculan acá). */
export const storeTerms = { transferPct: demoSettings.transferDiscountPct, freeShippingFrom: demoSettings.freeShippingFrom };
export const DEMO_DAY_LABEL = formatDay(DEMO_TODAY, "long");
