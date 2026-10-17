"use client";
import { useState } from "react";
import { findVariant, variantOptions } from "@/demo/engine/catalog";
import type { Product, Variant } from "@/demo/types";

export function useVariantSelection(product: Product, initialVariantId?: string | null) {
  const initial = product.variants.find((v) => v.id === initialVariantId) ?? product.variants.find((v) => v.stock !== 0) ?? product.variants[0]!;
  const [color, setColor] = useState(initial.color);
  const [size, setSize] = useState(initial.size);
  const options = variantOptions(product);
  const variant: Variant = findVariant(product, color, size) ?? findVariant(product, color) ?? initial;

  // Otro sabor o color: se queda con el tamaño si existe y tiene stock; si no, pasa al primero con stock de ese sabor.
  const chooseColor = (c: string) => {
    setColor(c);
    const same = findVariant(product, c, size);
    if (same && same.stock !== 0) return;
    setSize((product.variants.find((v) => v.color === c && v.stock !== 0) ?? same ?? findVariant(product, c))?.size);
  };

  const colorOptions = options.colors.map((c) => ({
    value: c.name, label: c.name, hex: c.hex, disabled: product.variants.filter((v) => v.color === c.name).every((v) => v.stock === 0),
  }));
  const sizeOptions = options.sizes.map((s) => ({
    value: s, label: s, disabled: (findVariant(product, color, s)?.stock ?? 0) === 0,
  }));

  return { variant, color, size, chooseColor, chooseSize: setSize, colorOptions, sizeOptions };
}
