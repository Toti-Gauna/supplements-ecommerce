"use client";
import { unitPrice } from "@/demo/engine/catalog";
import { choiceCandidates, choiceOptions, cleanOpenChoice, openChoiceAnchor } from "@/demo/engine/gift-choice";
import type { Product, Variant } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useGiftDraft } from "@/stores/giftDraft";

/**
 * "Dejá que elija" (R3b): sabor o tamaño abiertos para quien recibe, solo si el producto los tiene. Debajo, la regla
 * del precio en palabras: se cobra la opción más cara de las que puede elegir, y quien recibe nunca ve el precio.
 */
export function OpenChoiceFields({ product, variant, quantity }: { product: Product; variant: Variant; quantity: number }) {
  const { draft, patch } = useGiftDraft();
  const can = choiceOptions(product);
  if (!can.flavor && !can.size) return null;
  const open = cleanOpenChoice(product, draft.openChoice);
  const anchor = openChoiceAnchor(product, variant, open, quantity);
  const options = choiceCandidates(product, variant, open).length;
  const toggle = (key: "flavor" | "size", on: boolean) => patch({ openChoice: { ...draft.openChoice, [key]: on } });
  const box = "flex min-h-12 cursor-pointer items-center gap-3 rounded-sm border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold has-[:checked]:border-volt-ink has-[:checked]:shadow-[inset_3px_0_0_var(--color-volt-ink)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary";
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-bold">Que lo elija quien lo recibe</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {can.flavor && (
          <label className={box}><input type="checkbox" checked={Boolean(open?.flavor)} onChange={(e) => toggle("flavor", e.target.checked)} className="h-5 w-5 accent-[var(--color-primary)]" />Que elija el sabor</label>
        )}
        {can.size && (
          <label className={box}><input type="checkbox" checked={Boolean(open?.size)} onChange={(e) => toggle("size", e.target.checked)} className="h-5 w-5 accent-[var(--color-primary)]" />Que elija el tamaño</label>
        )}
      </div>
      <p className="text-xs text-muted" aria-live="polite">
        {open
          ? <>Puede elegir entre {options} opciones. Se cobra <strong className="text-ink">{formatARS(unitPrice(product, anchor) * quantity)}</strong> ({anchor.label}, la más cara de las que puede elegir): no paga diferencia ni ve el precio.</>
          : <>Va {variant.label}. Si dejás algo abierto, elige después de abrirlo.</>}
      </p>
    </fieldset>
  );
}
