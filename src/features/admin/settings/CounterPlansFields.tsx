"use client";
import type { InstallmentPlan } from "@/demo/fixtures/counter";
import { NumberField } from "../NumberField";

/**
 * Ajustes → Medios de pago: el recargo de cada plan de cuotas del mostrador (R4b). Crédito en un pago va sin recargo.
 * Se guarda con el resto de los medios de pago.
 */
export function CounterPlansFields({ plans, onChange }: { plans: InstallmentPlan[]; onChange: (plans: InstallmentPlan[]) => void }) {
  const setPct = (count: number, pct: number) => onChange(plans.map((p) => (p.count === count ? { ...p, pct: Math.min(100, pct) } : p)));
  return (
    <section aria-labelledby="cuotas-mostrador" className="mt-4 flex max-w-2xl flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div>
        <h2 id="cuotas-mostrador" className="text-sm font-bold">Cuotas en el mostrador</h2>
        <p className="text-xs text-muted">Recargo sobre el total del ticket. Las cuotas quedan iguales y se redondean al peso. Crédito en un pago, sin recargo.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((p) => (
          <NumberField key={p.count} id={`cuotas-${p.count}`} label={`Recargo en ${p.count} cuotas`} suffix="%" value={p.pct} onChange={(pct) => setPct(p.count, pct)} hint="De 0 a 100 %." />
        ))}
      </div>
    </section>
  );
}
