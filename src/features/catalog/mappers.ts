import type { ProductCardData } from "@/components/molecules/ProductCard";
import { fromPrice, productHref } from "@/demo/engine/catalog";
import type { Product } from "@/demo/types";

function stockNote(product: Product): string {
  const stocks = product.variants.map((v) => v.stock);
  if (stocks.every((s) => s < 0)) return product.madeToOrderDays ? `Hecho a pedido · ${product.madeToOrderDays} días` : "Hecho a pedido";
  const units = stocks.filter((s) => s > 0).reduce((a, b) => a + b, 0);
  if (units === 0 && stocks.every((s) => s >= 0)) return "Sin stock por ahora";
  if (units > 0 && units <= 3) return `¡Últimas ${units} unidades!`;
  return product.short;
}

export function toCard(product: Product): ProductCardData {
  const deltas = new Set(product.variants.map((v) => v.priceDelta));
  return {
    slug: product.slug,
    href: productHref(product.slug),
    photoUrl: product.photoDataUrl,
    alt: product.imageAlt || product.name,
    name: product.name,
    short: product.short,
    art: product.art,
    secondView: product.gallery.find((v) => v !== "front"),
    tint: product.variants[0]?.colorHex,
    colors: [...new Set(product.variants.map((v) => v.colorHex).filter((c): c is string => Boolean(c)))],
    fromPrice: fromPrice(product),
    hasRange: deltas.size > 1 || Boolean(product.personalization?.surcharge),
    isNew: product.isNew,
    madeToOrder: product.variants.every((v) => v.stock < 0),
    personalizable: Boolean(product.personalization),
    stockNote: stockNote(product),
  };
}
