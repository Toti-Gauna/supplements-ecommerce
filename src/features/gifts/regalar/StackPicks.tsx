"use client";
import { Layers } from "lucide-react";
import { quotePack } from "@/demo/engine/packs";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import type { GiftSubject } from "../builder/types";

/** Stacks para regalar (R3b): los packs armados de la tienda, con lo que lleva cada uno y el precio con su descuento. */
export function StackPicks({ onPick }: { onPick: (s: GiftSubject) => void }) {
  const packs = useDemoData((d) => d.packs);
  const list = packs.filter((p) => p.active !== false && !p.custom).map((p) => quotePack(p)).filter((q) => q.available)
    .sort((a, b) => Number(b.pack.featured) - Number(a.pack.featured));
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Stacks para regalar">
      {list.map((q) => {
        const names = q.lines.map((l) => l.product.name);
        return (
          <li key={q.pack.id} className="edge-volt flex flex-col gap-3 rounded-sm p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-night text-volt"><Layers size={20} aria-hidden="true" /></span>
              <div className="min-w-0">
                <p className="eyebrow text-muted">{q.pack.focus}</p>
                <p className="font-display text-2xl uppercase leading-none">{q.pack.name}</p>
              </div>
            </div>
            <p className="text-sm text-muted">{names.join(" · ")}</p>
            <p className="mt-auto flex items-baseline justify-between gap-2 border-t border-dashed border-line pt-3">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">{names.length} productos · −{q.pack.discountPct} %</span>
              <strong className="font-mono text-lg tabular-nums">{formatARS(q.price)}</strong>
            </p>
            <button type="button" onClick={() => onPick({ kind: "stack", pack: q.pack, names })} aria-label={`Regalar ${q.pack.name}`}
              className="plate flex min-h-11 items-center justify-center gap-2 rounded-sm border border-line font-mono text-[12px] font-bold uppercase tracking-[0.08em] hover:border-ink/50">
              Regalar este stack
            </button>
          </li>
        );
      })}
    </ul>
  );
}
