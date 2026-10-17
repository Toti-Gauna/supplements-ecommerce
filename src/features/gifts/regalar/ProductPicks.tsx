"use client";
import { Gift } from "lucide-react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { fromPrice, isPurchasable } from "@/demo/engine/catalog";
import { choiceOptions } from "@/demo/engine/gift-choice";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import type { GiftSubject } from "../builder/types";

const PICKS = 8;

/** Los más regalables (R3b): los más vendidos con stock, con un rótulo si se puede dejar el sabor o el tamaño abierto. */
export function ProductPicks({ onPick }: { onPick: (s: GiftSubject) => void }) {
  const products = useDemoData((d) => d.products);
  const picks = products
    .filter((p) => p.active !== false && p.variants.some((v) => isPurchasable(v, 1)))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.soldCount - a.soldCount)
    .slice(0, PICKS);
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Productos para regalar">
      {picks.map((p) => {
        const variant = p.variants.find((v) => isPurchasable(v, 1))!;
        const can = choiceOptions(p);
        const open = can.flavor && can.size ? "Sabor y tamaño a elección" : can.flavor ? "Sabor a elección" : can.size ? "Tamaño a elección" : null;
        return (
          <li key={p.slug} className="flex flex-col overflow-hidden rounded-sm border border-line bg-surface shadow-[var(--shadow-card)]">
            <div aria-hidden="true" className="relative aspect-[4/3] bg-night">
              <ProductArt art={p.art} pack={p.pack} tint={variant.colorHex} label={p.name} className="h-full w-full [&>svg]:h-full" />
              {open && <span className="absolute left-2 top-2 rounded-xs bg-volt px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wide text-night">{open}</span>}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <p className="eyebrow text-muted">{p.brand}</p>
              <p className="font-bold leading-tight">{p.name}</p>
              <p className="text-sm text-muted">Desde {formatARS(fromPrice(p))}</p>
              <button type="button" onClick={() => onPick({ kind: "producto", product: p, variant, quantity: 1 })} aria-label={`Regalar ${p.name}`}
                className="plate mt-auto flex min-h-11 items-center justify-center gap-2 rounded-sm border border-line font-mono text-[12px] font-bold uppercase tracking-[0.08em] hover:border-ink/50">
                <Gift size={16} aria-hidden="true" className="text-volt-ink" /> Regalar
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
