"use client";
import type { Product, Variant } from "@/demo/types";
import { PackAlsoIn } from "./PackAlsoIn";
import { StackOffer } from "./StackOffer";

/** Lo que se puede sumar a este producto: el stack con otras categorías y, debajo, los packs que lo incluyen. */
export function ProductOffers({ product, variant }: { product: Product; variant: Variant }) {
  return (
    <div className="flex flex-col gap-4">
      <StackOffer product={product} variant={variant} />
      <PackAlsoIn slug={product.slug} />
    </div>
  );
}
