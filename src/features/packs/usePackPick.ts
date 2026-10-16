import { findVariant, variantOptions } from "@/demo/engine/catalog";
import type { Product, Variant } from "@/demo/types";

/**
 * Selección de sabor/tamaño (o color/talle) de un producto dentro de un pack. Es controlada: la variante elegida vive
 * en el pack (para cotizarlo en vivo) y acá solo se derivan las opciones y se traduce cada toque a una variante con stock.
 */
export function usePackPick(product: Product, variantId: string, onVariant: (id: string) => void) {
  const variant: Variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0]!;
  const options = variantOptions(product);
  const inStock = (v: Variant) => v.stock !== 0;
  const pick = (v: Variant | undefined) => { if (v) onVariant(v.id); };
  const colorOptions = options.colors.map((c) => ({
    value: c.name, label: c.name, hex: c.hex, disabled: !product.variants.some((v) => v.color === c.name && inStock(v)),
  }));
  const sizeOptions = options.sizes.map((s) => ({
    value: s, label: s, disabled: !(findVariant(product, variant.color, s) && inStock(findVariant(product, variant.color, s)!)),
  }));
  return {
    variant, colorOptions, sizeOptions, color: variant.color, size: variant.size,
    chooseColor: (c: string) => pick(product.variants.find((v) => v.color === c && v.size === variant.size && inStock(v)) ?? product.variants.find((v) => v.color === c && inStock(v))),
    chooseSize: (s: string) => pick(product.variants.find((v) => v.size === s && v.color === variant.color && inStock(v))),
  };
}
