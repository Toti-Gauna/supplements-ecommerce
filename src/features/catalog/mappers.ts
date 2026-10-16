import type { ProductCardData } from "@/components/molecules/ProductCard";
import { fromPrice, isGear, productHref } from "@/demo/engine/catalog";
import { variantClearance } from "@/demo/engine/lots";
import { rackFacts, stockLine } from "@/demo/engine/rack";
import type { Product } from "@/demo/types";

/** Datos de la "ficha de rack" de un producto: todo sale del engine (precio por servicio, stock por variante, sellos). */
export function toCard(product: Product): ProductCardData {
  const f = rackFacts(product);
  // Equipamiento: no tiene precio por servicio, el talle de la primera variante no dice nada y las opciones son colores.
  const gear = isGear(product);
  const consumable = (f.lead.servings ?? 0) > 1;
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
    perServing: consumable ? f.perServing : null,
    from: f.from,
    servings: f.lead.servings,
    size: gear ? undefined : f.lead.size,
    price: f.price,
    fromPrice: fromPrice(product),
    badges: product.badges ?? [],
    lights: f.lights,
    state: f.state,
    stockText: stockLine(f),
    flavors: f.flavors,
    flavorWord: gear ? ["color", "colores"] : ["sabor", "sabores"],
    isNew: product.isNew,
    clearance: product.variants.some((v) => variantClearance(product, v)),
  };
}
