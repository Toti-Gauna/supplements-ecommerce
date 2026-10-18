"use client";
import { cashChange, cashSuggestions, installmentCharge, type PayOption } from "@/demo/engine/counter-pay";
import type { InstallmentPlan } from "@/demo/fixtures/counter";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

interface PayPickerProps {
  options: PayOption[];
  plans: InstallmentPlan[];
  value: string;
  onChange: (id: string) => void;
  total: number;
}

/** Formas de cobro como placas grandes (un toque): en las cuotas, el valor de cada una ya calculado. */
export function PayPicker({ options, plans, value, onChange, total }: PayPickerProps) {
  const hint = (o: PayOption) => {
    const plan = plans.find((p) => p.count === o.installments);
    return o.installments > 1 && plan ? `${o.installments} × ${formatARS(installmentCharge(total, plan).installment)} · +${plan.pct} %` : o.hint;
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="eyebrow mb-2 text-muted">Cómo paga</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => {
          const checked = o.id === value;
          return (
            <label key={o.id} className={cn("relative flex min-h-16 cursor-pointer flex-col justify-center gap-0.5 rounded-sm border bg-surface px-3 py-2.5 transition-[border-color,box-shadow] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
              checked ? "border-volt-ink shadow-[inset_3px_0_0_var(--color-volt-ink)]" : "bevel border-line hover:border-ink/40")}>
              <input type="radio" name="cobro" value={o.id} checked={checked} onChange={() => onChange(o.id)} className="sr-only" />
              <span className="font-bold leading-tight">{o.label}</span>
              <span className="text-xs text-muted">{hint(o)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

interface CashFieldProps {
  total: number;
  value: string;
  onChange: (value: string) => void;
}

/** Con cuánto paga y el vuelto, con los billetes de siempre a un toque. */
export function CashField({ total, value, onChange }: CashFieldProps) {
  const received = value === "" ? total : Number(value);
  const { change, missing } = cashChange(total, Number.isFinite(received) ? received : 0);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="cobro-recibido" className="eyebrow text-muted">Con cuánto paga</label>
      <input id="cobro-recibido" type="number" inputMode="numeric" min={0} step={1} value={value} placeholder={String(total)} onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-sm border border-line bg-surface px-4 font-lab text-2xl font-bold text-ink shadow-[inset_0_2px_0_rgb(0_0_0/0.12)] focus:border-volt-ink focus:outline-none focus-visible:shadow-[inset_0_-2px_0_var(--color-volt-ink)]" />
      <div role="group" aria-label="Billetes" className="flex flex-wrap gap-2">
        {cashSuggestions(total).map((n) => (
          <button key={n} type="button" onClick={() => onChange(String(n))} aria-pressed={received === n}
            className={cn("min-h-10 rounded-sm border px-3 font-lab text-sm font-bold", received === n ? "border-volt-ink bg-accent text-ink" : "border-line text-ink hover:border-ink/40")}>
            {n === total ? `Justo · ${formatARS(n)}` : formatARS(n)}
          </button>
        ))}
      </div>
      <p aria-live="polite" data-change className={cn("rounded-sm p-3 text-lg font-extrabold", missing ? "bg-danger-soft text-danger" : "bg-success-soft text-success")}>
        {missing ? `Faltan ${formatARS(missing)}` : `Vuelto: ${formatARS(change)}`}
      </p>
    </div>
  );
}
