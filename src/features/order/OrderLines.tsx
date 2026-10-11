"use client";
import { GiftTag } from "@/components/organisms/CartLineItem";
import { LineThumb } from "@/components/organisms/LineThumb";
import type { CartLine } from "@/demo/engine/cart-types";
import { quoteLines } from "@/demo/engine/pricing";
import { collarLineDetail, getProduct } from "@/demo/engine/catalog";
import { demoData } from "@/demo/engine/source";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

/** Líneas del pedido. Con `mobileLimit`, en el celular se ocultan las que exceden el límite (se ven en un modal). */
export function OrderLines({ lines, mobileLimit }: { lines: CartLine[]; mobileLimit?: number }) {
  return (
    <ul className="flex flex-col gap-2">
      {quoteLines(lines).map((q, i) => {
        const product = getProduct(q.line.productSlug)!;
        const variant = product.variants.find((v) => v.id === q.line.variantId);
        const p = q.line.personalization;
        return (
          <li key={q.line.id} className={cn("flex items-center gap-3 rounded-2xl bg-bg p-2.5", mobileLimit !== undefined && i >= mobileLimit && "max-sm:hidden")}>
            <div className="w-16 shrink-0"><LineThumb art={product.art} tint={variant?.colorHex} name={product.name} personalization={p} zone={demoData().textZones[product.art]} /></div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-bold">{q.line.quantity} × {product.name}</p>
              <p className="text-muted">{variant?.label}{p?.text ? ` · “${p.text}”` : ""}{p ? " · vista previa aprobada" : ""}</p>
              {p?.collar && <p className="text-xs text-muted">{collarLineDetail(q.line)}</p>}
              {q.line.gift && <GiftTag gift={q.line.gift} />}
            </div>
            <span className="font-bold tabular-nums">{formatARS(q.lineTotal)}</span>
          </li>
        );
      })}
    </ul>
  );
}
