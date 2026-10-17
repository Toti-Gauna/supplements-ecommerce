"use client";
import { Suspense, useState, type ReactNode } from "react";
import { slotOptions } from "@/demo/engine/stack-builder";
import { sportInfo } from "@/demo/engine/sports";
import { STACK_SLOTS, type StackSlotId } from "@/demo/fixtures/stack-builder";
import { SlotCard } from "./SlotCard";
import { SlotPickerSheet } from "./SlotPickerSheet";
import { SportGearRow } from "./SportGearRow";
import { StackGoalsPanel } from "./StackGoalsPanel";
import { StackShelf, shelfItems } from "./shelf/StackShelf";
import { StackSummaryPanel } from "./StackSummaryPanel";
import { StackUrlLoader } from "./StackUrlLoader";
import { useStackActions } from "./useStackActions";
import { useStackBuilder } from "./useStackBuilder";

/**
 * Armador "Armá tu stack". Celular: título, objetivos y deporte, estante, lugares (con el equipamiento del deporte) y
 * resumen, en ese orden. Escritorio: título, objetivos y lugares a la izquierda; estante y resumen fijos a la derecha desde arriba (el botón de
 * agregar entra en la primera pantalla). El estante no tiene nada enfocable: el orden de foco coincide con el visual en los dos tamaños.
 */
export function StackBuilder({ intro }: { intro: ReactNode }) {
  const b = useStackBuilder();
  const { addToCart, copyLink } = useStackActions(b.summary, b.shareUrl);
  const [sheet, setSheet] = useState<{ slot: StackSlotId; open: boolean }>({ slot: "base", open: false });
  const sheetIndex = STACK_SLOTS.findIndex((s) => s.id === sheet.slot);
  const lineFor = (slot: StackSlotId) => b.summary.lines.find((l) => l.slot === slot);
  const closeSheet = () => setSheet((s) => ({ ...s, open: false }));
  const pick = (slug: string) => { b.pickProduct(sheet.slot, slug); closeSheet(); };
  const discountPct = b.summary.stack.discount > 0 ? b.summary.stack.pct : 0;
  const sport = b.sport ? sportInfo(b.sport) : undefined;
  return (
    <div data-stack-ready={b.ready || undefined} className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] xl:gap-x-14">
      <Suspense fallback={null}><StackUrlLoader onLoad={b.load} /></Suspense>
      <div className="min-w-0 lg:col-start-1 lg:row-start-1 [&>div]:mb-0">{intro}</div>
      <div className="order-1 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
        <StackGoalsPanel goals={b.goals} sport={b.sport} added={b.added} capped={b.capped} onToggleGoal={b.toggleGoal} onSport={b.pickSport} />
      </div>
      <section aria-labelledby="stack-slots-title" className="order-3 min-w-0 lg:order-none lg:col-start-1 lg:row-start-3">
        <h2 id="stack-slots-title" className="eyebrow mb-3 text-volt-ink">3 · Ajustá cada lugar</h2>
        <ol className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
          {STACK_SLOTS.map((s, i) => (
            <SlotCard key={s.id} slot={s} index={i} line={lineFor(s.id)} onOpen={() => setSheet({ slot: s.id, open: true })}
              onClear={() => b.clearSlot(s.id)} onVariant={(variantId) => b.pickVariant(s.id, variantId)} />
          ))}
        </ol>
        {sport && <SportGearRow sport={sport} items={b.gear} />}
      </section>
      <div className="contents lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:flex lg:flex-col lg:gap-3 lg:self-start">
        <StackShelf className="order-2 lg:order-none" items={shelfItems(b.summary.lines)} discountPct={discountPct} />
        <StackSummaryPanel className="order-4 lg:order-none" summary={b.summary} onAdd={addToCart} onCopy={() => void copyLink()} />
      </div>
      <SlotPickerSheet open={sheet.open} slot={STACK_SLOTS[sheetIndex]!} index={sheetIndex} goals={b.goals}
        options={slotOptions(sheet.slot, b.goals, b.catalog)} current={lineFor(sheet.slot)?.product.slug} onPick={pick} onClose={closeSheet} />
    </div>
  );
}
