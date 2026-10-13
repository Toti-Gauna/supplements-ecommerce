"use client";
import { Check } from "lucide-react";
import { LoadBar } from "@/components/molecules/LoadBar";
import { cartLoad } from "@/demo/engine/cart-load";
import type { Quote } from "@/demo/engine/pricing";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { cn } from "@/lib/cn";
import { useDemoData } from "@/stores/admin";

/**
 * Carga del bolso (R2): un solo medidor. La barra va al envío gratis y las metas (envío gratis y stack) se leen como
 * placas que se encienden al cumplirse; reemplaza las dos baterías y el anillo del carrito heredado.
 */
export function BagLoad({ quote, className }: { quote: Pick<Quote, "subtotal" | "stack">; className?: string }) {
  const freeShippingFrom = useDemoData((d) => d.settings.freeShippingFrom);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  const load = cartLoad(quote.subtotal, quote.stack, { freeShippingFrom, stackPct: rule.pct });
  const done = load.next === null;
  return (
    <section aria-label="Carga del bolso" className={cn("plate rounded-sm border border-line p-3.5", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="eyebrow text-muted">Carga del bolso</p>
        <p className="font-mono text-[11px] font-bold tabular-nums text-muted">{load.pct} %</p>
      </div>
      <LoadBar pct={load.pct} label={done ? "Bolso completo: envío gratis" : "Avance hacia el envío gratis"} tone={load.goals[0]!.done ? "success" : "volt"} />
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Metas del bolso">
        {load.goals.map((g) => (
          <li key={g.id} className={cn("flex min-h-8 items-center gap-1.5 rounded-xs border px-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em]",
            g.done ? "border-success/40 bg-success-soft text-success" : "border-line text-muted")}>
            {g.done && <Check size={13} strokeWidth={3} aria-hidden="true" />}
            {g.label}
            <span className={g.done ? "sr-only" : "font-medium normal-case tracking-normal"}>{g.done ? " (listo)" : `· ${g.missing}`}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm font-semibold">{done ? (load.goals.length > 1 ? "¡Tenés envío gratis y el descuento stack!" : "¡Tenés envío gratis!") : load.next}</p>
    </section>
  );
}
