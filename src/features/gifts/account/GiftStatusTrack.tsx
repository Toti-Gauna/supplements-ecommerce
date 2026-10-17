import { Check } from "lucide-react";
import { GIFT_STATUS_ORDER, giftStatusLabel, type GiftStatus } from "@/demo/engine/gift-status";
import type { OpenChoice } from "@/demo/engine/gift-options";
import { cn } from "@/lib/cn";

/**
 * Estado de un regalo enviado (R3b) como una barra de carga en cuatro placas: enviado, abierto, sabor elegido y
 * canjeado. Sin nada abierto para elegir, ese paso no aparece. La lectura completa va en el texto (no solo en color).
 */
export function GiftStatusTrack({ status, openChoice, className }: { status: GiftStatus; openChoice?: OpenChoice; className?: string }) {
  const steps = GIFT_STATUS_ORDER.filter((s) => s !== "elegido" || openChoice?.flavor || openChoice?.size);
  const at = steps.indexOf(status);
  return (
    <div className={className}>
    {/* En el celular, el paso actual en una línea; desde sm, el rótulo de cada placa. */}
    <p aria-hidden="true" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide sm:hidden">
      <Check size={12} strokeWidth={3} className="text-volt-ink" />{giftStatusLabel(status, openChoice)} <span className="font-normal normal-case tracking-normal text-muted">· paso {at + 1} de {steps.length}</span>
    </p>
    <ol aria-label={`Estado: ${giftStatusLabel(status, openChoice)}`} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => {
        const done = i <= at;
        return (
          <li key={s} aria-current={i === at ? "step" : undefined} className="flex min-w-0 flex-col gap-1">
            <span aria-hidden="true" className={cn("h-1.5 rounded-xs", done ? "bg-volt-ink" : "bg-ink/10")} />
            <span className="sr-only sm:hidden">{giftStatusLabel(s, openChoice)}</span>
            <span className={cn("hidden items-center gap-1 truncate text-[11px] font-bold uppercase tracking-wide sm:flex", done ? "text-ink" : "text-muted")}>
              {done && <Check size={12} strokeWidth={3} aria-hidden="true" className="shrink-0 text-volt-ink" />}
              <span className="truncate">{giftStatusLabel(s, openChoice)}</span>
            </span>
          </li>
        );
      })}
    </ol>
    </div>
  );
}
