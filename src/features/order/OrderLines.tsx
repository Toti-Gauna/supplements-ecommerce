"use client";
import type { ReactNode } from "react";
import { GiftTag } from "@/components/organisms/CartLineItem";
import { LineThumb } from "@/components/organisms/LineThumb";
import type { CartLine } from "@/demo/engine/cart-types";
import { quoteLines } from "@/demo/engine/pricing";
import { getProduct } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

interface OrderLinesProps {
  lines: CartLine[];
  /** En el celular se ocultan las que exceden el límite (se ven en un modal). */
  mobileLimit?: number;
  /** Lista corta del ticket: pote chico, sin fondo. */
  compact?: boolean;
  /** Lo que va debajo de cada producto (el lote controlado en el seguimiento). */
  extra?: (line: CartLine) => ReactNode;
}

/** Líneas del pedido: pote, cantidad, presentación y total de cada una. */
export function OrderLines({ lines, mobileLimit, compact = false, extra }: OrderLinesProps) {
  return (
    <ul className={cn("flex flex-col", compact ? "gap-1 border-t border-line pt-3" : "gap-2")}>
      {quoteLines(lines).map((q, i) => {
        const product = getProduct(q.line.productSlug)!;
        const variant = product.variants.find((v) => v.id === q.line.variantId);
        return (
          <li key={q.line.id} className={cn("flex items-center gap-3", compact ? "py-1" : "rounded-sm bg-bg p-2.5", mobileLimit !== undefined && i >= mobileLimit && "max-sm:hidden")}>
            <div className={cn("shrink-0", compact ? "w-10" : "w-16")}><LineThumb art={product.art} pack={product.pack} tint={variant?.colorHex} name={product.name} /></div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-bold">{q.line.quantity} × {product.name}</p>
              <p className="text-muted">{variant?.label}</p>
              {q.line.gift && <GiftTag gift={q.line.gift} />}
              {extra?.(q.line)}
            </div>
            <span className="font-mono text-sm font-bold tabular-nums">{formatARS(q.lineTotal)}</span>
          </li>
        );
      })}
    </ul>
  );
}
