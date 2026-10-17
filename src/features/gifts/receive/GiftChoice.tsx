"use client";
import { Check } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { isPurchasable, unitPrice } from "@/demo/engine/catalog";
import { choiceCandidates, openChoiceNoun } from "@/demo/engine/gift-choice";
import { giftAnchor } from "@/demo/engine/gift-receive";
import type { Gift } from "@/demo/engine/gifts";
import type { Variant } from "@/demo/types";
import { cn } from "@/lib/cn";
import { useDemoData } from "@/stores/admin";

interface Props {
  gift: Gift;
  /** Vista previa de quien regala: valida igual, pero no guarda nada. */
  preview: boolean;
  onChoose: (variant: Variant) => string | null;
  onBack: () => void;
}

/**
 * Quien recibe elige el sabor o el tamaño que quedó abierto (R3b): las opciones del regalo con su color, las que no
 * tienen stock apagadas, y el envase que cambia con lo elegido. El motor valida contra el catálogo y el stock.
 */
export function GiftChoice({ gift, preview, onChoose, onBack }: Props) {
  const products = useDemoData((d) => d.products);
  const found = giftAnchor(products, gift);
  const [picked, setPicked] = useState<string | null>(gift.chosenVariantId ?? null);
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.focus({ preventScroll: true }); }, []);
  if (!found) return <p role="alert" className="max-w-sm text-center text-night-muted">Ese producto ya no está en la tienda. Escribinos y lo resolvemos.</p>;
  const { product, anchor } = found;
  // Las que entran en lo pagado; las sin stock se ven apagadas.
  const options = choiceCandidates(product, anchor, gift.openChoice).filter((v) => unitPrice(product, v) <= unitPrice(product, anchor));
  const current = options.find((v) => v.id === picked);
  const noun = openChoiceNoun(gift.openChoice);
  const confirm = () => {
    if (!current) { setError(`Elegí ${noun === "sabor" ? "un sabor" : noun === "tamaño" ? "un tamaño" : "una opción"}.`); return; }
    setError(onChoose(current));
  };
  return (
    <div ref={box} tabIndex={-1} className="flex max-h-full w-full max-w-lg flex-col items-center gap-5 overflow-y-auto px-1 pb-4 text-center outline-none">
      <div>
        <p className="eyebrow text-volt-soft">{preview ? "Vista previa · así elige" : `Regalo de ${gift.from}`}</p>
        <h2 className="mt-2 font-display text-[clamp(1.8rem,7vw,2.6rem)] uppercase italic leading-[0.95]">Elegí tu {noun}</h2>
        <p className="mt-1 text-sm text-night-muted">{gift.item.name}. Lo que elijas ya está pago.</p>
      </div>
      <div aria-hidden="true" className="aspect-square w-[min(44vw,26dvh,200px)] overflow-hidden rounded-sm ring-1 ring-white/15">
        <ProductArt art={product.art} pack={product.pack} tint={(current ?? anchor).colorHex} label={product.name} className="h-full w-full [&>svg]:h-full" />
      </div>
      <fieldset className="w-full">
        <legend className="sr-only">Opciones de {noun}</legend>
        <div className="grid grid-cols-2 gap-2">
          {options.map((v) => {
            const out = !isPurchasable(v, 1);
            const on = v.id === picked;
            return (
              <label key={v.id} className={cn("relative flex min-h-14 items-center gap-2.5 rounded-sm px-3 py-2 text-left text-sm font-bold ring-1 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-on-night",
                out ? "cursor-not-allowed text-night-muted opacity-60 ring-white/10" : on ? "cursor-pointer bg-volt-soft text-night ring-volt-soft" : "cursor-pointer bg-white/5 ring-white/15 hover:bg-white/10")}>
                <input type="radio" name="gift-choice" value={v.id} checked={on} disabled={out} onChange={() => { setPicked(v.id); setError(null); }} className="sr-only" />
                <span aria-hidden="true" style={{ "--sw": v.colorHex ?? "transparent" } as CSSProperties} className="h-6 w-6 shrink-0 rounded-full bg-(--sw) ring-2 ring-white/30" />
                <span className="min-w-0 leading-tight">{v.label}{out && <span className="block text-xs font-semibold">Sin stock</span>}</span>
                {on && <Check size={16} aria-hidden="true" className="ml-auto shrink-0" />}
              </label>
            );
          })}
        </div>
      </fieldset>
      {error && <p role="alert" className="text-sm font-bold text-volt-soft">{error}</p>}
      <div className="grid w-full gap-2">
        <button type="button" onClick={confirm} className="min-h-12 rounded-sm bg-volt-soft px-6 font-bold text-night hover:brightness-105">Confirmar {current ? current.label : noun}</button>
        <button type="button" onClick={onBack} className="text-sm font-semibold text-night-muted hover:text-on-night">Volver al regalo</button>
      </div>
    </div>
  );
}
