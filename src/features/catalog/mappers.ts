import type { ProductCardData } from "@/components/molecules/ProductCard";
import { fromPrice, productHref } from "@/demo/engine/catalog";
import { variantClearance } from "@/demo/engine/lots";
import { rackFacts, stockLine } from "@/demo/engine/rack";
import type { Product } from "@/demo/types";

/** Datos de la "ficha de rack" de un producto: todo sale del engine (precio por servicio, stock por variante, sellos). */
export function toCard(product: Product): ProductCardData {
  const f = rackFacts(product);
  return {
    slug: product.slug,
    href: productHref(product.slug),
    photoUrl: product.photoDataUrl,
    alt: product.imageAlt || product.name,
    name: product.name,
    brand: product.brand || undefined,
    art: product.art,
    pack: product.pack,
    tint: f.lead.colorHex ?? product.variants[0]?.colorHex,
    perServing: f.perServing,
    from: f.from,
    servings: f.lead.servings,
    size: f.lead.size,
    price: f.price,
    fromPrice: fromPrice(product),
    badges: product.badges ?? [],
    lights: f.lights,
    state: f.state,
    stockText: stockLine(f),
    flavors: f.flavors,
    isNew: product.isNew,
    clearance: product.variants.some((v) => variantClearance(product, v)),
  };
}
