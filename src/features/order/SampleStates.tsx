"use client";
import { cn } from "@/lib/cn";
import { SAMPLE_STATES, type SampleStateId } from "./tracking-states";

/** Zona de demostración del seguimiento: probar otro estado solo cambia esta vista, nunca el pedido. */
export function SampleStates({ current, onPick }: { current: SampleStateId; onPick: (id: SampleStateId) => void }) {
  return (
    <section aria-labelledby="estados-demo" className="flex flex-col gap-3 rounded-sm border border-dashed border-line p-4 sm:p-5">
      <div>
        <h2 id="estados-demo" className="font-display text-2xl">Probá los estados del pedido — Demostración</h2>
        <p className="text-sm text-muted">Solo cambia esta vista: no modifica pedidos ni simula pagos de ningún proveedor.</p>
      </div>
      <fieldset>
        <legend className="sr-only">Estado del pedido de muestra</legend>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_STATES.map((s) => (
            <label key={s.id} className={cn("min-h-11 cursor-pointer content-center rounded-sm border px-4 font-mono text-[12px] font-bold uppercase tracking-[0.06em] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50",
              s.id === current ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink")}>
              <input type="radio" name="sample-state" className="sr-only" checked={s.id === current} onChange={() => onPick(s.id)} />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
