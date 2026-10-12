"use client";
import { FULFILLMENT_LABEL } from "@/demo/admin/emails/context";
import type { FulfillmentType } from "@/demo/types";

const ALL = Object.keys(FULFILLMENT_LABEL) as FulfillmentType[];

/**
 * Para qué pedidos sale el email: retiro, cadete o correo. Con las tres marcadas no se guarda restricción (`undefined`);
 * sin ninguna, el editor avisa al guardar.
 */
export function FulfillmentPicker({ value, onChange }: { value: FulfillmentType[] | undefined; onChange: (v: FulfillmentType[] | undefined) => void }) {
  const on = value ?? ALL;
  const toggle = (f: FulfillmentType, checked: boolean) => {
    const next = ALL.filter((x) => (x === f ? checked : on.includes(x)));
    onChange(next.length === ALL.length ? undefined : next);
  };
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-sm font-bold">Sale en pedidos con</legend>
      <div className="flex flex-wrap gap-2">
        {ALL.map((f) => (
          <label key={f} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bg px-3.5 text-sm font-semibold ring-1 ring-ink/10 has-[:checked]:ring-primary/50">
            <input type="checkbox" checked={on.includes(f)} onChange={(e) => toggle(f, e.target.checked)} className="h-5 w-5 accent-[var(--color-primary)]" />
            {FULFILLMENT_LABEL[f]}
          </label>
        ))}
      </div>
      <p className="text-xs font-normal text-muted">Por ejemplo, “Listo para retirar” solo en los retiros y “Listo para salir” en los envíos.</p>
    </fieldset>
  );
}
