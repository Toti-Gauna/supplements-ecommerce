"use client";
import { ChevronRight, Package } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/motion/Sheet";
import type { CartLine } from "@/demo/engine/cart-types";
import { quoteLines } from "@/demo/engine/pricing";
import { formatARS } from "@/lib/money";
import { OrderLines } from "./OrderLines";

const VISIBLE = 3;

/** El pedido arriba de todo. En el celular muestra 3 productos y el resto en un modal. */
export function OrderItemsCard({ code, lines, sample }: { code: string; lines: CartLine[]; sample: boolean }) {
  const [open, setOpen] = useState(false);
  const quoted = quoteLines(lines);
  const units = quoted.reduce((n, q) => n + q.line.quantity, 0);
  const total = quoted.reduce((n, q) => n + q.lineTotal, 0);
  const extra = lines.length - VISIBLE;
  return (
    <section aria-labelledby="items" className="rounded-[2rem] bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-night text-brass"><Package size={20} aria-hidden="true" /></span>
          <div>
            <h2 id="items" className="font-bold leading-tight">{sample ? "Pedido de ejemplo" : "Tu pedido de demostración"}</h2>
            <p className="font-mono text-xs font-bold tracking-wider text-muted">{code}</p>
          </div>
        </div>
        <p className="text-right text-sm"><span className="block text-xs text-muted">{units} {units === 1 ? "producto" : "productos"}</span><strong className="tabular-nums">{formatARS(total)}</strong></p>
      </div>
      <OrderLines lines={lines} mobileLimit={VISIBLE} />
      {extra > 0 && (
        <button type="button" onClick={() => setOpen(true)} className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border border-line py-3 text-sm font-bold text-primary hover:bg-accent/40 sm:hidden">
          Ver {extra} {extra === 1 ? "producto más" : "productos más"} <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="Productos del pedido" side="bottom">
        <div className="overflow-y-auto px-5 pb-8 pt-6">
          <p className="eyebrow text-brass-ink">{code}</p>
          <h2 className="font-display mt-1 text-3xl">{units} productos</h2>
          <div className="mt-5"><OrderLines lines={lines} /></div>
          <p className="mt-4 flex justify-between border-t border-line pt-4 font-bold"><span>Total de productos</span><span className="tabular-nums">{formatARS(total)}</span></p>
        </div>
      </Sheet>
    </section>
  );
}
