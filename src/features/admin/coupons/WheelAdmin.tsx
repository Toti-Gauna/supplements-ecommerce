"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { assignPrize, checkWheel, prizeCondition } from "@/demo/admin/wheel-prizes";
import { probability } from "@/demo/engine/wheel";
import type { WheelConfig } from "@/demo/fixtures/wheel";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { WheelDial } from "../../club/WheelDial";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { useDemoSave } from "../useDemoSave";
import { useSessionDraft } from "../useSessionDraft";
import { COUPONS_SECTION } from "./CouponsHub";
import { PrizeDialog } from "./PrizeDialog";

type Draft = Pick<WheelConfig, "active" | "validDays" | "segments">;
const isDraft = (x: unknown): x is Draft => {
  const d = x as Draft | null;
  return !!d && typeof d.active === "boolean" && typeof d.validDays === "number" && Array.isArray(d.segments) && d.segments.every((s) => typeof s?.id === "string" && typeof s.weight === "number");
};

/**
 * Configuración de la ruleta (8.3.25): la vista previa arriba y centrada; debajo, visibilidad, vigencia y cada gajo
 * con su premio (elegido del catálogo por ID, nunca escrito a mano) y su peso. La probabilidad se calcula sobre los
 * gajos activos. Guardar no toca los cupones ya entregados.
 */
export function WheelAdmin() {
  const current = useAdmin((s) => s.data.wheel);
  const saveWheel = useAdmin((s) => s.saveWheel);
  const save = useDemoSave();
  const prizes = current.prizes ?? [];
  const session = useSessionDraft<Draft>("volta-ui:wheel-draft", { active: current.active, validDays: current.validDays, segments: current.segments }, isDraft);
  const w = session.draft;
  const [errors, setErrors] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const config: WheelConfig = { ...w, prizes };
  const total = w.segments.filter((s) => s.active).reduce((sum, s) => sum + s.weight, 0);
  const dirty = session.dirty;
  const change = (next: Draft) => { session.setDraft(next); setErrors([]); };
  const patch = (i: number, p: Partial<Draft["segments"][number]>) => change({ ...w, segments: w.segments.map((s, k) => (k === i ? { ...s, ...p } : s)) });
  const pick = (i: number, id: string) => { const p = prizes.find((x) => x.id === id); if (p) change({ ...w, segments: w.segments.map((s, k) => (k === i ? assignPrize(s, p) : s)) }); };
  const submit = () => {
    const found = checkWheel(config);
    setErrors(found);
    if (!found.length) save("Ruleta guardada", () => saveWheel(config), "Los cupones que ya se entregaron no cambian. Cambio guardado solo en esta demo.");
  };
  return (
    <>
      <SubpageHeader trail={[MARKETING, COUPONS_SECTION]} back={COUPONS_SECTION} title="Configuración de ruleta"
        intro="Cada premio genera un cupón de un uso con vencimiento. En producción el sorteo se hace en el servidor (un giro por cuenta)." />
      {session.restored && (
        <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-sm bg-warning-soft px-4 py-3 text-sm ring-1 ring-warning/30">
          <p className="flex-1 font-bold text-warning">Recuperamos los cambios de la ruleta que quedaron sin guardar.</p>
          <ConfirmButton size="sm" variant="secondary" title="Descartar los cambios de la ruleta" confirmLabel="Descartar" description="La ruleta vuelve a como está guardada." onConfirm={() => session.reset()}>Descartar cambios</ConfirmButton>
        </div>
      )}
      <form noValidate className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <section aria-label="Vista previa de la ruleta" className="flex flex-col items-center gap-2 rounded-sm bg-night px-4 py-6 text-on-night">
          <WheelDial segments={w.segments} className="mt-2 w-[min(72vw,18rem)]" />
          <p className="text-sm font-semibold text-on-night/80">{w.active ? "Así se ve en la tienda" : "Pausada: no se muestra en la tienda"} · {w.segments.filter((s) => s.active).length} gajos activos</p>
        </section>
        <section aria-labelledby="w-config" className="flex flex-col gap-4 rounded-sm bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 id="w-config" className="font-bold">Visibilidad y vigencia</h2>
          <div className="flex flex-wrap items-end gap-6">
            <Switch checked={w.active} onChange={(active) => change({ ...w, active })} label={w.active ? "Ruleta visible en la tienda" : "Ruleta pausada"} />
            <div className="w-48">
              <Field id="wheel-days" label="Vigencia del premio (días)" hint="De 1 a 90.">
                <Input id="wheel-days" type="number" inputMode="numeric" min={1} max={90} step={1} value={w.validDays} aria-describedby={describedBy("wheel-days", undefined, true)}
                  onChange={(e) => change({ ...w, validDays: e.target.value === "" ? 0 : Number(e.target.value) })} />
              </Field>
            </div>
          </div>
        </section>
        <section aria-labelledby="w-slots" className="flex flex-col gap-3 rounded-sm bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="w-slots" className="font-bold">Premios y pesos</h2>
            <Button size="sm" variant="secondary" onClick={() => setAdding(true)}><Plus size={16} aria-hidden="true" /> Agregar premio</Button>
          </div>
          <p className="text-xs text-muted">El peso es relativo: la probabilidad de cada gajo es su peso sobre el total de los gajos activos ({total}).</p>
          <ul className="flex flex-col gap-2">
            {w.segments.map((s, i) => {
              const prize = prizes.find((p) => p.id === s.prizeId);
              const pct = probability(config, s);
              return (
                <li key={s.id} className={cn("grid grid-cols-[minmax(0,1fr)_5.5rem] items-end gap-2 rounded-sm bg-bg p-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_6rem_4.5rem_auto]", !s.active && "opacity-70")}>
                  <span className="col-span-2 text-sm font-extrabold sm:col-span-1 sm:pb-2.5">Gajo {i + 1}</span>
                  <Field id={`slot-${s.id}`} label="Premio" hint={prize ? prizeCondition(prize) : undefined} className="col-span-2 sm:col-span-1">
                    <Select id={`slot-${s.id}`} aria-label={`Premio del gajo ${i + 1}`} value={s.prizeId ?? ""} onChange={(e) => pick(i, e.target.value)}>
                      {!prize && <option value="">Elegí un premio…</option>}
                      {prizes.map((p) => <option key={p.id} value={p.id}>{p.name}{p.minSubtotal ? ` (desde $${p.minSubtotal.toLocaleString("es-AR")})` : ""}</option>)}
                    </Select>
                  </Field>
                  <Field id={`weight-${s.id}`} label="Peso">
                    <Input id={`weight-${s.id}`} aria-label={`Peso del gajo ${i + 1}`} type="number" inputMode="numeric" min={0} step={1} value={s.weight}
                      onChange={(e) => patch(i, { weight: e.target.value === "" ? 0 : Number(e.target.value) })} />
                  </Field>
                  <span className="pb-2.5 text-right text-sm font-bold tabular-nums sm:text-left" aria-label={`Probabilidad del gajo ${i + 1}`}>{total > 0 && s.active ? `${Math.round(pct * 100)}%` : "—"}</span>
                  <label className="col-span-2 flex items-center gap-2 pb-2 text-sm font-semibold sm:col-span-1">
                    <input type="checkbox" checked={s.active} onChange={(e) => patch(i, { active: e.target.checked })} className="h-5 w-5 accent-[var(--color-primary)]" />Activo
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
        {errors.length > 0 && <ul role="alert" className="flex flex-col gap-1 rounded-sm bg-danger-soft p-3 text-sm font-semibold text-danger">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!dirty}>Guardar ruleta</Button>
          {dirty && <p role="status" className="text-sm font-bold text-warning">Cambios sin guardar</p>}
        </div>
      </form>
      <PrizeDialog open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
