"use client";
import { Plus, RefreshCw, X } from "lucide-react";
import { useId } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import type { StackLineView } from "@/demo/engine/stack-builder";
import type { StackSlot } from "@/demo/fixtures/stack-builder";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { slotNumber } from "./slot-labels";
import { SlotVariantSelects } from "./SlotVariantSelects";

interface SlotCardProps {
  slot: StackSlot;
  index: number;
  line?: StackLineView;
  onOpen: () => void;
  onClear: () => void;
  onVariant: (variantId: string) => void;
  className?: string;
}

const slotLower = (slot: StackSlot) => slot.name.toLowerCase();

/** Un lugar del estante: lo elegido (envase, precio y precio por servicio, sabor y tamaño) o el botón para sumar algo. */
export function SlotCard({ slot, index, line, onOpen, onClear, onVariant, className }: SlotCardProps) {
  const titleId = useId();
  return (
    <li aria-labelledby={titleId} className={cn("rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5", className)}>
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={cn("font-lab grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-bold", line ? "bg-night text-volt ring-1 ring-volt/30" : "bg-accent text-muted")}>
          {slotNumber(index)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="font-display text-lg leading-tight">{slot.name}</h3>
          <p className="text-[13px] leading-snug text-muted">{slot.hint}</p>
        </div>
        {line && (
          <button type="button" onClick={onClear} aria-label={`Vaciar ${slotLower(slot)}`}
            className="-mr-1 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {line ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <span aria-hidden="true" className="w-[4.5rem] shrink-0">
              <ProductArt art={line.product.art} pack={line.product.pack} tint={line.variant.colorHex} label="" showBadge={false} className="aspect-square rounded-2xl" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-tight">{line.product.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{line.product.brand}{line.variant.servings ? ` · ${line.variant.servings} servicios` : ""}</p>
              <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                <span className="font-lab text-base font-bold">{formatARS(line.price)}</span>
                {line.perServing !== null && <span className="font-lab text-xs font-semibold text-volt-ink">{formatARS(line.perServing)} por servicio</span>}
              </p>
            </div>
          </div>
          <SlotVariantSelects product={line.product} variant={line.variant} onChange={onVariant} />
          <button type="button" onClick={onOpen} aria-label={`Cambiar ${slotLower(slot)}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/15 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
            <RefreshCw size={15} aria-hidden="true" />Cambiar
          </button>
        </div>
      ) : (
        <button type="button" onClick={onOpen}
          className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/20 text-sm font-bold text-muted transition-colors hover:border-primary hover:text-primary">
          <Plus size={18} aria-hidden="true" />Elegir {slotLower(slot)}
        </button>
      )}
    </li>
  );
}
