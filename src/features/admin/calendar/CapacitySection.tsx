"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import { hasImpact, scheduleImpact } from "@/demo/admin/workshop/schedule";
import type { WorkshopSettings } from "@/demo/fixtures/workshop";
import { useAdmin } from "@/stores/admin";
import { NumberField } from "../NumberField";
import { useDemoSave } from "../useDemoSave";
import { ImpactConfirm } from "./ImpactConfirm";

type Draft = Pick<WorkshopSettings, "dailyCapacity" | "closedWeekdays">;
const WORKDAYS = "de lunes a viernes";

export const scheduleText = (s: Draft) =>
  `${s.dailyCapacity} ${s.dailyCapacity === 1 ? "pedido" : "pedidos"} con cadete por día · ${WORKDAYS}${s.closedWeekdays.includes(6) ? "" : ", sábados"}${s.closedWeekdays.includes(0) ? "" : ", domingos"}`;

/**
 * Cupo del cadete y días de despacho (8.3.14, Fase 7): borrador hasta "Guardar". Si el cambio deja pedidos en un día
 * cerrado o con el cadete sobrecargado, se confirma antes, y esos pedidos no se mueven.
 */
export function CapacitySection({ today, onDirty }: { today: string; onDirty: (dirty: boolean) => void }) {
  const settings = useAdmin((s) => s.workshop.settings);
  const orders = useAdmin((s) => s.orders);
  const saveWorkshopSettings = useAdmin((s) => s.saveWorkshopSettings);
  const save = useDemoSave();
  const [draft, setDraftState] = useState<Draft>({ dailyCapacity: settings.dailyCapacity, closedWeekdays: settings.closedWeekdays });
  const [asking, setAsking] = useState(false);
  const changed = (d: Draft) => d.dailyCapacity !== settings.dailyCapacity || [...d.closedWeekdays].sort().join() !== [...settings.closedWeekdays].sort().join();
  const impact = scheduleImpact(orders, settings, { ...settings, ...draft }, today);
  const dirty = changed(draft);
  const setDraft = (d: Draft) => { setDraftState(d); setAsking(false); onDirty(changed(d)); };
  const works = (wd: number) => !draft.closedWeekdays.includes(wd);
  const toggle = (wd: number, on: boolean) => setDraft({ ...draft, closedWeekdays: on ? draft.closedWeekdays.filter((d) => d !== wd) : [...draft.closedWeekdays, wd] });
  const commit = () => {
    const title = draft.dailyCapacity !== settings.dailyCapacity ? `Cupo del cadete: ${draft.dailyCapacity} por día` : "Días de despacho actualizados";
    save(title, () => saveWorkshopSettings(draft), hasImpact(impact) ? "Los pedidos afectados quedaron marcados en el calendario. Cambio guardado solo en esta demo." : undefined);
    setAsking(false);
    onDirty(false);
  };
  return (
    <form id="despachos-cupo" aria-label="Cupo del cadete y días de despacho" noValidate className="flex flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5"
      onSubmit={(e) => { e.preventDefault(); if (!dirty) return; if (hasImpact(impact)) setAsking(true); else commit(); }}>
      <NumberField id="w-capacity" label="Pedidos que reparte el cadete por día" min={1} value={draft.dailyCapacity}
        onChange={(n) => setDraft({ ...draft, dailyCapacity: Math.min(50, Math.max(1, n)) })} hint="Solo los pedidos con cadete en Mar del Plata. Cuando un día se llena, la tienda ofrece el siguiente día hábil con lugar." />
      <div className="flex flex-wrap gap-x-6">
        <Switch checked={works(6)} onChange={(v) => toggle(6, v)} label="Despacho los sábados" />
        <Switch checked={works(0)} onChange={(v) => toggle(0, v)} label="Despacho los domingos" />
      </div>
      <div className="rounded-sm bg-bg p-3 text-sm">
        <p className="font-bold">Reglas que usa el calendario</p>
        <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-5 text-muted">
          <li>Los plazos de preparación cuentan solo días hábiles: sin días cerrados ni feriados.</li>
          <li>Cada pedido con cadete ocupa un lugar en su fecha de despacho desde que se confirma la compra hasta que sale. Retiro y envío al país no tienen cupo.</li>
          <li>Un día cerrado no se puede elegir; un día con el cadete completo se puede sobrecargar solo desde Reprogramar, confirmándolo.</li>
        </ul>
      </div>
      {asking ? <ImpactConfirm impact={impact} action="Guardar igual" onConfirm={commit} onCancel={() => setAsking(false)} /> : (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {dirty && <Button variant="ghost" onClick={() => setDraft({ dailyCapacity: settings.dailyCapacity, closedWeekdays: settings.closedWeekdays })}>Deshacer cambios</Button>}
          <Button type="submit" disabled={!dirty}>Guardar cupo y días</Button>
        </div>
      )}
    </form>
  );
}
