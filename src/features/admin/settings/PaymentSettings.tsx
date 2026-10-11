"use client";
import { useState } from "react";
import { checkPayments, type PaymentsDraft } from "@/demo/admin/settings-form";
import type { PaymentMethod } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { SubpageHeader } from "../marketing/SubpageHeader";
import { NumberField } from "../NumberField";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";
import { SETTINGS_SECTION } from "./SettingsHub";

const METHODS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: "CHECKOUT_PRO", label: "Mercado Pago (Checkout Pro)", hint: "En la demo es una simulación: no se cobra nada." },
  { value: "BANK_TRANSFER", label: "Transferencia", hint: "El comprador sube el comprobante y lo aprobás a mano (simulado)." },
  { value: "QR_MANUAL", label: "QR estático", hint: "Igual que la transferencia: aprobación manual simulada." },
];
const isDraft = (x: unknown): x is PaymentsDraft => { const d = x as PaymentsDraft | null; return !!d && Array.isArray(d.methods) && typeof d.pct === "number" && typeof d.hours === "number"; };

/** Ajustes → Medios de pago (8.3.29): medios activos, descuento por transferencia/QR y reserva sin comprobante. */
export function PaymentSettings() {
  const settings = useAdmin((s) => s.data.settings);
  const saveSettings = useAdmin((s) => s.saveSettings);
  const push = useToasts((s) => s.push);
  const saved: PaymentsDraft = { methods: settings.enabledMethods, pct: settings.transferDiscountPct, hours: settings.pendingTransferHours };
  const session = useSessionDraft<PaymentsDraft>("volta-ui:settings-draft:pagos", saved, isDraft);
  const d = session.draft;
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<PaymentsDraft>) => { session.setDraft({ ...d, ...p }); setError(null); };
  const submit = () => {
    const problem = checkPayments(d);
    setError(problem);
    if (problem) return;
    saveSettings({ enabledMethods: d.methods, transferDiscountPct: d.pct, pendingTransferHours: d.hours });
    push({ tone: "success", title: "Medios de pago guardados", description: "Se aplican a las compras nuevas del checkout de este navegador (solo en esta demo)." });
  };
  return (
    <div>
      <SubpageHeader trail={[SETTINGS_SECTION]} back={SETTINGS_SECTION} title="Medios de pago" intro="Lo que ve el comprador al pagar. Transferencia y QR requieren aprobación manual simulada: subir el comprobante no confirma el pago." />
      <section aria-label="Medios de pago" className="flex max-w-2xl flex-col gap-4 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        {session.restored && <p role="status" className="rounded-2xl bg-warning-soft px-3 py-2 text-sm font-bold text-warning">Recuperamos los cambios que quedaron sin guardar.</p>}
        <fieldset className="flex flex-col gap-1"><legend className="mb-1 text-sm font-bold">Activos en el checkout</legend>
          {METHODS.map((m) => (
            <label key={m.value} className="flex min-h-11 items-start gap-3 py-1 text-sm">
              <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]" checked={d.methods.includes(m.value)}
                onChange={(e) => set({ methods: e.target.checked ? [...d.methods, m.value] : d.methods.filter((x) => x !== m.value) })} />
              <span><span className="block font-bold">{m.label}</span><span className="block text-xs text-muted">{m.hint}</span></span>
            </label>
          ))}
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField id="pct" label="Descuento transferencia/QR" suffix="%" value={d.pct} onChange={(pct) => set({ pct })} hint="De 0 a 50 %." />
          <NumberField id="hours" label="Reserva sin comprobante" suffix="horas" min={1} value={d.hours} onChange={(hours) => set({ hours })} hint="De 1 a 168 horas." />
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      </section>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar medios de pago" discardText="Los medios de pago vuelven a como están guardados." onDiscard={() => { session.reset(); setError(null); }} />
    </div>
  );
}
