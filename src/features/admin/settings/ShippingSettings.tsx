"use client";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/atoms/Field";
import { Switch } from "@/components/atoms/Switch";
import { checkShipping, zoneDraft, zoneFromDraft, type ShippingDraft, type ZoneDraft } from "@/demo/admin/settings-form";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { SubpageHeader } from "../marketing/SubpageHeader";
import { NumberField } from "../NumberField";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";

const isDraft = (x: unknown): x is ShippingDraft => { const d = x as ShippingDraft | null; return !!d && typeof d.free === "number" && Array.isArray(d.zones) && d.zones.every((z) => typeof z?.id === "string" && typeof z.cps === "string"); };

/**
 * Ajustes → Envíos y retiro (8.3.29): envío gratis desde un monto y cada forma de entrega en un solo borrador, con un
 * guardar. Solo se graban las zonas que cambiaron; un código postal mal escrito se avisa en vez de descartarse.
 */
export function ShippingSettings() {
  const zones = useAdmin((s) => s.data.zones);
  const freeFrom = useAdmin((s) => s.data.settings.freeShippingFrom);
  const saveZone = useAdmin((s) => s.saveZone);
  const saveSettings = useAdmin((s) => s.saveSettings);
  const push = useToasts((s) => s.push);
  const saved: ShippingDraft = { free: freeFrom, zones: zones.map(zoneDraft) };
  const session = useSessionDraft<ShippingDraft>("volta-ui:settings-draft:envios", saved, isDraft);
  const d = session.draft;
  const [errors, setErrors] = useState<ReturnType<typeof checkShipping>>({ zones: {} });
  const patch = (id: string, p: Partial<ZoneDraft>) => { session.setDraft({ ...d, zones: d.zones.map((z) => (z.id === id ? { ...z, ...p } : z)) }); setErrors({ zones: {} }); };
  const submit = () => {
    const found = checkShipping(d);
    setErrors(found);
    if (found.free || Object.keys(found.zones).length) return;
    if (d.free !== freeFrom) saveSettings({ freeShippingFrom: d.free });
    for (const z of d.zones) {
      const before = saved.zones.find((x) => x.id === z.id);
      if (JSON.stringify(before) !== JSON.stringify(z)) saveZone(zoneFromDraft(z));
    }
    push({ tone: "success", title: "Envíos guardados", description: "Se aplican al carrito y al checkout de este navegador (solo en esta demo)." });
  };
  return (
    <div>
      <SubpageHeader title="Envíos y retiro" intro="Lo que ve el comprador al elegir cómo recibe su pedido." />
      {session.restored && <p role="status" className="mb-4 rounded-sm bg-warning-soft px-4 py-3 text-sm font-bold text-warning">Recuperamos los cambios de envíos que quedaron sin guardar.</p>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] items-start gap-4">
        <section aria-labelledby="free-title" className="flex flex-col gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
          <h2 id="free-title" className="font-extrabold">Envío gratis</h2>
          <NumberField id="free" label="Envío gratis desde" suffix="ARS" value={d.free} onChange={(free) => { session.setDraft({ ...d, free }); setErrors({ zones: {} }); }} hint="El carrito muestra cuánto falta." />
          {errors.free && <p role="alert" className="text-sm font-semibold text-danger">{errors.free}</p>}
        </section>
        {d.zones.map((z) => (
          <section key={z.id} aria-labelledby={`${z.id}-title`} className="flex flex-col gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h2 id={`${z.id}-title`} className="font-extrabold">{z.name}</h2>
            {errors.zones[z.id] && (
              <div role="alert" className="flex gap-2 rounded-sm bg-danger-soft p-3 text-sm font-semibold text-danger">
                <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" /><ul>{errors.zones[z.id]!.map((e) => <li key={e}>{e}</li>)}</ul>
              </div>
            )}
            <Switch checked={z.active !== false} onChange={(v) => patch(z.id, { active: v })} label={z.active === false ? "No disponible en el checkout" : "Disponible en el checkout"} ariaLabel={`${z.name}: disponible en el checkout`} />
            {z.type !== "PICKUP" && <NumberField id={`${z.id}-price`} label="Precio" suffix="ARS" value={z.price ?? 0} onChange={(n) => patch(z.id, { price: n })} />}
            <label className="flex flex-col gap-1 text-sm font-bold">Plazo que ve el comprador<Input value={z.etaText} onChange={(e) => patch(z.id, { etaText: e.target.value })} /></label>
            {z.type === "LOCAL_DELIVERY" && (
              <label className="flex flex-col gap-1 text-sm font-bold">Códigos postales con cadete
                <Input value={z.cps} onChange={(e) => patch(z.id, { cps: e.target.value })} />
                <span className="text-xs font-normal text-muted">Separados por coma, 4 dígitos.</span>
              </label>
            )}
          </section>
        ))}
      </div>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar envíos" discardText="Envío gratis y formas de entrega vuelven a como están guardados." onDiscard={() => { session.reset(); setErrors({ zones: {} }); }} />
    </div>
  );
}
