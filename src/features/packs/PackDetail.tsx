"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { RackShot } from "@/components/illustrations/RackShot";
import { packCartLines, quotePack } from "@/demo/engine/packs";
import type { Pack } from "@/demo/types";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { PackBuyPanel } from "./PackBuyPanel";
import { PackItemRow } from "./PackItemRow";
import { packRack } from "./packRack";

/**
 * Detalle de un pack: los productos con sus selectores (recotizan el pack en vivo con `quotePack`) y, al costado en
 * escritorio y debajo en el celular, la compra: una vez o todos los meses. Ambas ponen el pack en el carrito y lo abren.
 */
export function PackDetail({ pack }: { pack: Pack }) {
  const [choices, setChoices] = useState<Record<string, string>>({});
  const addPack = useCart((s) => s.addPack);
  const openCart = useUi((s) => s.openCart);
  const quote = quotePack(pack, choices);
  const buy = (monthlyDay?: number) => {
    if (!quote.available) return;
    addPack(pack.id, packCartLines(quote, monthlyDay));
    openCart();
  };
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
      <div className="flex flex-col gap-8">
        <header className="grid grid-cols-[minmax(0,1fr)] items-center gap-5 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <Link href="/packs/" className="mb-4 inline-flex min-h-11 items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-volt-ink hover:underline">
              <ArrowLeft size={16} aria-hidden="true" />Todos los packs
            </Link>
            <p className="eyebrow text-volt-ink">{pack.focus}</p>
            <h1 className="font-display mt-2 text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.02]">{pack.name}</h1>
            <p className="mt-2 text-lg font-semibold">{pack.tagline}</p>
            <p className="mt-3 max-w-prose text-muted">{pack.description}</p>
          </div>
          <div className="rack-bay relative aspect-[5/4] overflow-hidden border border-line"><RackShot items={packRack(quote)} label={pack.name} /></div>
        </header>
        <section aria-labelledby="pack-items-title">
          <h2 id="pack-items-title" className="eyebrow mb-3 text-muted">Qué trae · elegí sabor, tamaño o talle</h2>
          <ul className="flex flex-col gap-3" aria-label="Productos del pack">
            {quote.lines.map((l) => (
              <PackItemRow key={l.product.slug} line={l} onVariant={(id) => setChoices((c) => ({ ...c, [l.product.slug]: id }))} />
            ))}
          </ul>
        </section>
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start"><PackBuyPanel quote={quote} onBuy={buy} /></div>
    </div>
  );
}
