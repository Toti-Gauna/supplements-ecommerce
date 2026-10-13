"use client";
import { Check, Target } from "lucide-react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { Sheet } from "@/components/motion/Sheet";
import { getCategory, unitPrice } from "@/demo/engine/catalog";
import { pricePerServing } from "@/demo/engine/servings";
import { firstInStock } from "@/demo/engine/stack-builder";
import type { StackSlot } from "@/demo/fixtures/stack-builder";
import type { Goal, Product } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { slotNumber } from "./slot-labels";

interface SlotPickerSheetProps {
  open: boolean;
  slot: StackSlot;
  index: number;
  goal: Goal | null;
  /** Opciones del motor (`slotOptions`): primero las del objetivo. */
  options: Product[];
  current?: string;
  onPick: (slug: string) => void;
  onClose: () => void;
}

/** Opción como tarjeta: envase, nombre, precio de la presentación con stock y su precio por servicio. */
function OptionTile({ product, goal, selected, onPick }: { product: Product; goal: Goal | null; selected: boolean; onPick: () => void }) {
  const variant = firstInStock(product)!;
  const price = unitPrice(product, variant);
  const perServing = pricePerServing(price, variant.servings);
  const forGoal = goal !== null && (product.goals ?? []).includes(goal);
  return (
    <button type="button" onClick={onPick} aria-pressed={selected}
      className={cn("relative flex h-full w-full flex-col gap-2 rounded-sm border bg-surface p-2 text-left transition-[border-color,box-shadow]", selected ? "border-primary shadow-[0_0_0_1px_var(--color-primary)]" : "border-line hover:border-ink/35")}>
      <span aria-hidden="true" className="relative block">
        <ProductArt art={product.art} pack={product.pack} tint={variant.colorHex} label="" showBadge={false} className="aspect-square rounded-sm" />
        {forGoal && <span className="font-lab absolute left-1.5 top-1.5 flex items-center gap-1 rounded-sm bg-volt px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-night"><Target size={10} />Tu objetivo</span>}
        {selected && <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-sm bg-primary text-on-primary"><Check size={14} /></span>}
      </span>
      <span className="flex flex-col gap-0.5 px-1">
        <span className="eyebrow text-[9.5px] text-muted">{getCategory(product.categorySlug)?.name}</span>
        <span className="line-clamp-2 text-[13px] font-bold leading-tight">{product.name}</span>
      </span>
      <span className="mt-auto flex flex-col px-1 pb-1">
        <span className="font-lab text-sm font-bold">{formatARS(price)}</span>
        <span className="font-lab text-[11px] text-muted">{perServing !== null ? `${formatARS(perServing)} por servicio` : product.brand}</span>
      </span>
      {forGoal && <span className="sr-only">Recomendado para tu objetivo.</span>}
    </button>
  );
}

/** Hoja para elegir qué va en un lugar: en el celular sube desde abajo, en escritorio es un modal ancho. */
export function SlotPickerSheet({ open, slot, index, goal, options, current, onPick, onClose }: SlotPickerSheetProps) {
  const title = `Elegí ${slot.name.toLowerCase()}`;
  return (
    <Sheet open={open} onClose={onClose} title={title} side="dialog">
      <div className="px-5 pb-3 pr-16 pt-6 sm:px-7">
        <p className="eyebrow text-volt-ink">Lugar {slotNumber(index)} del estante</p>
        <h2 className="font-display mt-1 text-2xl sm:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-muted">{slot.hint} {options.length} opciones con stock{goal ? ", primero las de tu objetivo" : ""}.</p>
      </div>
      <ul className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1 sm:grid-cols-3 sm:px-7 md:grid-cols-4">
        {options.map((p) => (
          <li key={p.slug}><OptionTile product={p} goal={goal} selected={p.slug === current} onPick={() => onPick(p.slug)} /></li>
        ))}
      </ul>
    </Sheet>
  );
}
