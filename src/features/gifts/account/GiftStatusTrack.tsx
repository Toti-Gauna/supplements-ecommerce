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
    <ol aria-label={`Estado: ${giftStatusLabel(status, openChoice)}`} className={cn("grid gap-1", className)} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => {
        const done = i <= at;
        return (
          <li key={s} aria-current={i === at ? "step" : undefined} className="flex min-w-0 flex-col gap-1">
            <span aria-hidden="true" className={cn("h-1.5 rounded-xs", done ? "bg-volt-ink" : "bg-ink/10")} />
            <span className={cn("flex items-center gap-1 truncate text-[11px] font-bold uppercase tracking-wide", done ? "text-ink" : "text-muted")}>
              {done && <Check size={12} strokeWidth={3} aria-hidden="true" className="shrink-0 text-volt-ink" />}
              <span className="truncate">{giftStatusLabel(s, openChoice)}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
