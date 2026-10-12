"use client";
import { ArrowRight } from "lucide-react";
import type { PriceLine } from "@/demo/admin/bulk-price";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

const diffText = (d: number) => (d === 0 ? "sin cambio" : `${d > 0 ? "+" : "−"}${formatARS(Math.abs(d))}`);

/** Vista previa del aumento: precio actual → nuevo de cada variante alcanzada, con el total de lo que cambia. */
export function PricePreview({ lines }: { lines: PriceLine[] }) {
  const products = new Set(lines.map((l) => l.productSlug)).size;
  const changed = lines.filter((l) => l.to !== l.from).length;
  if (!lines.length) return <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">No hay productos en lo que elegiste.</p>;
  return (
    <section aria-label="Vista previa de los precios" className="flex flex-col gap-2">
      <p role="status" className="text-sm"><strong className="tabular-nums">{changed}</strong> {changed === 1 ? "variante cambia" : "variantes cambian"} de precio, en {products} {products === 1 ? "producto" : "productos"}.</p>
      <ul className="flex max-h-[min(40dvh,22rem)] flex-col divide-y divide-line overflow-y-auto rounded-2xl bg-surface ring-1 ring-ink/[0.06]">
        {lines.map((l) => (
          <li key={l.key} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2.5 text-sm">
            <span className="min-w-0 flex-1 basis-44"><span className="block font-bold leading-tight">{l.productName}</span><span className="text-xs text-muted">{l.variantLabel} · {l.brand}</span></span>
            <span className="flex items-center gap-2 tabular-nums">
              <span className="text-muted"><span className="sr-only">Precio actual </span>{formatARS(l.from)}</span>
              <ArrowRight size={14} aria-hidden="true" className="text-muted" />
              <strong><span className="sr-only">Precio nuevo </span>{formatARS(l.to)}</strong>
              <span className={cn("w-20 text-right text-xs font-bold", l.to > l.from ? "text-success" : l.to < l.from ? "text-danger" : "text-muted")}>{diffText(l.to - l.from)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
