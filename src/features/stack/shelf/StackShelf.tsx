"use client";
import { AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { useId } from "react";
import type { StackLineView } from "@/demo/engine/stack-builder";
import { STACK_SLOTS } from "@/demo/fixtures/stack-builder";
import { cn } from "@/lib/cn";
import { SLOT_SHORT, slotNumber } from "../slot-labels";
import { ShelfCone, ShelfPot, ShelfSilhouette, type ShelfItem } from "./ShelfBay";
import { ShelfBackdrop, ShelfDefs, ShelfPlank, shelfIds } from "./ShelfScene";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

export type { ShelfItem };

/** Las líneas del resumen del motor, como envases del estante. */
export function shelfItems(lines: StackLineView[]): ShelfItem[] {
  return lines.map((l) => ({ slot: l.slot, key: `${l.product.slug}:${l.variant.id}`, art: l.product.art, pack: l.product.pack, tint: l.variant.colorHex, name: l.product.name }));
}

const list = new Intl.ListFormat("es", { type: "conjunction" });

function describe(items: ShelfItem[]): string {
  if (items.length === 0) return "Estante de tu stack, vacío";
  const free = STACK_SLOTS.length - items.length;
  return `Estante de tu stack: ${list.format(items.map((i) => i.name))}${free > 0 ? `. ${free} ${free === 1 ? "lugar libre" : "lugares libres"}` : ""}`;
}

interface StackShelfProps {
  items: ShelfItem[];
  /** % del descuento stack si ya aplica: el filo de la repisa se enciende y aparece el sello. */
  discountPct?: number;
  /** Título de la vitrina (arriba a la izquierda). */
  title?: string;
  className?: string;
}

/**
 * Estante iluminado "en vivo": vitrina de laboratorio con luz voltio/plasma, un cono de luz por lugar y los envases
 * que caen y se acomodan al sumar o cambiar algo. Los lugares vacíos son siluetas punteadas. Siempre oscuro (como el
 * estudio de producto), en los dos modos.
 */
export function StackShelf({ items, discountPct = 0, title = "Tu estante", className }: StackShelfProps) {
  const ids = shelfIds(useId().replace(/[^a-zA-Z0-9]/g, ""));
  const reduce = useReducedMotionSafe();
  const bySlot = new Map(items.map((i) => [i.slot, i]));
  const complete = discountPct > 0;
  return (
    <figure className={cn("relative overflow-hidden rounded-sm bg-night p-2 text-on-night shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--brand-glow)_55%,transparent)] ring-1 ring-white/10", className)}>
      <figcaption className="flex min-h-8 items-center justify-between gap-2 px-2.5 pb-1.5 pt-0.5">
        <span className="eyebrow flex min-w-0 items-center gap-2 text-[10px] tracking-[0.12em] text-night-muted">
          <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-sm", items.length ? "bg-volt shadow-[0_0_8px_var(--color-volt)]" : "bg-white/25")} />
          <span className="truncate">{title} · {items.length} de {STACK_SLOTS.length}</span>
        </span>
        {complete && (
          <span key="stack-on" className="animate-pop font-lab flex shrink-0 items-center gap-1 whitespace-nowrap rounded-sm bg-volt px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-night">
            <Zap size={12} aria-hidden="true" className="fill-current" />Stack −{discountPct} %
          </span>
        )}
      </figcaption>
      <svg viewBox="0 0 800 400" role="img" aria-label={describe(items)} className="block h-auto w-full rounded-sm">
        <ShelfDefs ids={ids} />
        <ShelfBackdrop ids={ids} />
        {STACK_SLOTS.map((s, i) => <ShelfCone key={s.id} index={i} lit={bySlot.has(s.id)} ids={ids} reduce={reduce} />)}
        <ShelfPlank ids={ids} complete={complete} reduce={reduce} />
        {STACK_SLOTS.map((s, i) => {
          const item = bySlot.get(s.id);
          return (
            <AnimatePresence key={s.id} initial={false}>
              {item ? <ShelfPot key={item.key} index={i} item={item} ids={ids} reduce={reduce} /> : <ShelfSilhouette key="empty" index={i} slot={s.id} reduce={reduce} />}
            </AnimatePresence>
          );
        })}
      </svg>
      <ul aria-hidden="true" className="grid grid-cols-4 px-1 pb-0.5 pt-1.5 text-center">
        {STACK_SLOTS.map((s, i) => (
          <li key={s.id} className={cn("eyebrow text-[9.5px] tracking-[0.12em] transition-colors", bySlot.has(s.id) ? "text-volt" : "text-night-muted")}>
            {slotNumber(i)} {SLOT_SHORT[s.id]}
          </li>
        ))}
      </ul>
    </figure>
  );
}
