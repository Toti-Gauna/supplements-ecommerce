"use client";
import { listPrice } from "@/demo/engine/catalog";
import { lowestPrice30 } from "@/demo/engine/price-history";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { Product, Variant } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";

/**
 * "Descuento real" en la ficha (R3): el precio más bajo de los últimos 30 días de la variante elegida, para que una
 * rebaja se pueda comparar contra un precio que existió de verdad. Lo ubica el integrador junto al precio.
 */
export function LowestPrice30({ product, variant, className }: { product: Product; variant: Variant; className?: string }) {
  const changes = useDemoData((d) => d.priceChanges);
  const lowest = lowestPrice30(product.slug, variant.id, listPrice(product, variant), changes ?? [], DEMO_TODAY);
  return (
    <p data-lowest-30 className={cn("text-xs text-muted", className)}>
      Precio más bajo de los últimos 30 días: <strong className="font-semibold tabular-nums text-ink">{formatARS(lowest)}</strong>
    </p>
  );
}
