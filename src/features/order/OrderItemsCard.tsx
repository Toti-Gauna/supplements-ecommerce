"use client";
import { ChevronRight, Package } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet } from "@/components/motion/Sheet";
import type { CartLine } from "@/demo/engine/cart-types";
import { quoteLines } from "@/demo/engine/pricing";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { OrderLines } from "./OrderLines";

const VISIBLE = 3;

interface OrderItemsCardProps {
  code: string;
  lines: CartLine[];
  sample: boolean;
  /** Nota debajo del título (lote y vencimiento). */
  note?: string;
  /** Lo que va debajo de cada producto (la etiqueta de lote). */
  extra?: (line: CartLine) => ReactNode;
  /** Total del pedido con descuentos y envío; sin él, la suma de los productos. */
  total?: number;
}

/** Lo que trae el pedido. En el celular muestra 3 productos y el resto en un modal. */
export function OrderItemsCard({ code, lines, sample, note, extra, total: orderTotal }: OrderItemsCardProps) {
  const [open, setOpen] = useState(false);
  const quoted = quoteLines(lines);
  const units = quoted.reduce((n, q) => n + q.line.quantity, 0);
  const linesTotal = quoted.reduce((n, q) => n + q.lineTotal, 0);
  const total = orderTotal ?? linesTotal;
  const more = lines.length - VISIBLE;
  return (
    <section aria-labelledby="items" className="rounded-sm border border-line bg-surface p-4 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-night text-volt"><Package size={20} aria-hidden="true" /></span>
          <div>
            <h2 id="items" className="font-bold leading-tight">{sample ? "Pedido de ejemplo" : "Tu pedido"}</h2>
            <p className="font-mono text-xs font-bold tracking-wider text-muted">{code}</p>
          </div>
        </div>
        <p className="text-right text-sm"><span className="block text-xs text-muted">{units} {units === 1 ? "producto" : "productos"}</span><strong className="font-mono tabular-nums">{formatARS(total)}</strong></p>
      </div>
      {note && <p className="mb-3 px-1 text-sm text-muted">{note}</p>}
      <OrderLines lines={lines} mobileLimit={VISIBLE} extra={extra} />
      {more > 0 && (
        <button type="button" onClick={() => setOpen(true)} className="mt-3 flex w-full items-center justify-center gap-1 rounded-sm border border-line py-3 text-sm font-bold text-volt-ink hover:bg-accent/40 sm:hidden">
          Ver {more} {more === 1 ? "producto más" : "productos más"} <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="Productos del pedido" side="bottom">
        <div className="overflow-y-auto px-5 pb-8 pt-6">
          <p className="eyebrow text-volt-ink">{code}</p>
          <h2 className="font-display mt-1 text-3xl">{plural(units, "producto", "productos")}</h2>
          <div className="mt-5"><OrderLines lines={lines} extra={extra} /></div>
          <p className="mt-4 flex justify-between border-t border-line pt-4 font-bold"><span>Total de productos</span><span className="tabular-nums">{formatARS(linesTotal)}</span></p>
        </div>
      </Sheet>
    </section>
  );
}
