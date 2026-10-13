"use client";
import { LineThumb } from "@/components/organisms/LineThumb";
import type { CartLine } from "@/demo/engine/cart-types";
import { lotFor } from "@/demo/admin/workshop/lots";
import { getProduct } from "@/demo/engine/catalog";
import { quoteLines } from "@/demo/engine/pricing";
import { formatARS } from "@/lib/money";

/**
 * Ítems del pedido con lo que hace falta para armarlo: sabor y presentación y el lote que sale (el que vence primero) o,
 * después del control de lote, el que quedó registrado.
 */
export function OrderItems({ lines, lotCheck }: { lines: CartLine[]; lotCheck?: Record<string, string> }) {
  return (
    <ul className="flex flex-col gap-3">
      {quoteLines(lines).map(({ line, lineTotal }) => {
        const product = getProduct(line.productSlug);
        const variant = product?.variants.find((v) => v.id === line.variantId);
        if (!product) return null;
        return (
          <li key={line.id} className="flex flex-wrap gap-3 rounded-sm bg-surface shadow-[var(--shadow-card)] p-3">
            <div className="w-20 shrink-0"><LineThumb art={product.art} pack={product.pack} tint={variant?.colorHex} name={product.name} /></div>
            <div className="min-w-0 flex-1 basis-40 text-sm">
              <p className="font-bold">{line.quantity} × {product.name}</p>
              <p className="text-muted">Variante: {variant?.label ?? "—"}</p>
              <p className="font-lab mt-1 text-xs text-muted">{lotCheck?.[line.id] ? `Lote controlado: ${lotCheck[line.id]}` : `Sale: lote ${lotFor(product, variant).text}`}</p>
              {variant?.servings && variant.servings > 1 && <p className="font-lab text-xs text-muted">{variant.servings} servicios</p>}
              {line.gift && (
                <p className="mt-2 rounded-sm bg-accent/60 px-3 py-2 text-[13px]">
                  <strong>Es un regalo</strong> para {line.gift.to}, de {line.gift.from}: envolver y no poner el precio.
                  {line.gift.message && <span className="mt-0.5 block text-muted">Mensaje: “{line.gift.message}”</span>}
                </p>
              )}
            </div>
            <span className="ml-auto font-bold tabular-nums">{formatARS(lineTotal)}</span>
          </li>
        );
      })}
    </ul>
  );
}
