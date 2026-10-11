"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { Sheet } from "@/components/motion/Sheet";
import { checkMission, MISSION_TYPES } from "@/demo/admin/mission-form";
import type { Mission } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";
import { clearMissionDraft, loadMissionDraft, saveMissionDraft } from "./missionDraft";

interface Props {
  /** Misión a editar (o una vacía para "Nueva misión"); null = cerrado. */
  mission: Mission | null;
  /** Clave del borrador: "nueva" o el ID de la misión. */
  draftKey: string;
  onClose: () => void;
}

/**
 * "Nueva misión" y "Editar" en un modal centrado (8.3.23), con los mismos campos y reglas que el formulario anterior.
 * Los errores van junto a cada campo; cerrar o cancelar no guarda y conserva el borrador para la próxima vez.
 */
export function MissionDialog({ mission, draftKey, onClose }: Props) {
  return (
    <Sheet open={!!mission} onClose={onClose} title={draftKey === "nueva" ? "Nueva misión" : "Editar misión"} side="dialog" className="bg-bg sm:w-[min(94vw,760px)]">
      {mission && <MissionBody key={draftKey} initial={mission} draftKey={draftKey} onClose={onClose} />}
    </Sheet>
  );
}

function MissionBody({ initial, draftKey, onClose }: { initial: Mission; draftKey: string; onClose: () => void }) {
  const missions = useAdmin((s) => s.data.missions);
  const saveMission = useAdmin((s) => s.saveMission);
  const save = useDemoSave();
  const [start] = useState(() => loadMissionDraft(draftKey));
  const [m, setM] = useState<Mission>(start ?? initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const restored = !!start && JSON.stringify(start) !== JSON.stringify(initial);
  const [showRestored, setShowRestored] = useState(restored);
  const set = (p: Partial<Mission>) => { const next = { ...m, ...p }; setM(next); setErrors({}); saveMissionDraft(draftKey, next); };
  const unit = MISSION_TYPES.find((t) => t.value === m.type)?.unit;
  const submit = () => {
    const found = checkMission(m);
    setErrors(found);
    if (Object.keys(found).length) return;
    save(draftKey === "nueva" ? "Misión creada" : "Misión guardada", () => saveMission({ ...m, title: m.title.trim(), reward: m.reward.trim(), description: m.description.trim() }), "Ya se ve en el Club de la tienda demo. Cambio guardado solo en esta demo.");
    clearMissionDraft(draftKey);
    onClose();
  };
  const discard = () => { clearMissionDraft(draftKey); setM(initial); setErrors({}); setShowRestored(false); };
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex max-h-[94dvh] flex-col sm:max-h-[90dvh]">
      <div className="flex flex-col gap-5 overflow-y-auto p-5 pt-7 sm:p-7">
        <div className="pr-12">
          <h2 className="font-display text-3xl">{draftKey === "nueva" ? "Nueva misión" : `Editar: ${initial.title}`}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">Completá qué tiene que hacer el cliente (tipo y umbral) y qué gana. Al guardar, la misión aparece en el Club de la tienda: solo cuentan pedidos pagados y el premio es de un uso con vencimiento.</p>
        </div>
        {showRestored && (
          <p role="status" className="flex flex-wrap items-center gap-2 rounded-2xl bg-warning-soft px-4 py-3 text-sm font-bold text-warning ring-1 ring-warning/30">
            <span className="flex-1">Recuperamos el borrador que dejaste sin guardar.</span>
            <Button size="sm" variant="secondary" onClick={discard}>Empezar de nuevo</Button>
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="ms-title" label="Título" error={errors.title}>
            <Input id="ms-title" value={m.title} onChange={(e) => set({ title: e.target.value })} placeholder="Comprá 3 productos" aria-invalid={!!errors.title} aria-describedby={describedBy("ms-title", errors.title)} />
          </Field>
          <Field id="ms-reward" label="Premio" error={errors.reward}>
            <Input id="ms-reward" value={m.reward} onChange={(e) => set({ reward: e.target.value })} placeholder="Llavero de regalo" aria-invalid={!!errors.reward} aria-describedby={describedBy("ms-reward", errors.reward)} />
          </Field>
          <Field id="ms-type" label="Tipo">
            <Select id="ms-type" value={m.type} onChange={(e) => set({ type: e.target.value as Mission["type"] })}>{MISSION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select>
          </Field>
          <Field id="ms-threshold" label={`Umbral${unit ? ` (${unit})` : ""}`} error={errors.threshold}>
            <Input id="ms-threshold" type="number" inputMode="numeric" min={1} step={1} value={Number.isFinite(m.threshold) ? m.threshold : ""} aria-invalid={!!errors.threshold} aria-describedby={describedBy("ms-threshold", errors.threshold)}
              onChange={(e) => set({ threshold: e.target.value === "" ? 0 : Number(e.target.value) })} />
          </Field>
          <Field id="ms-desc" label="Descripción" hint="Opcional. Se ve en el Club.">
            <Input id="ms-desc" value={m.description} onChange={(e) => set({ description: e.target.value })} placeholder="En uno o varios pedidos pagados." aria-describedby={describedBy("ms-desc", undefined, true)} />
          </Field>
          <Field id="ms-next" label="Encadenar con" hint="El excedente pasa a esa misión.">
            <Select id="ms-next" value={m.nextMissionId ?? ""} onChange={(e) => set({ nextMissionId: e.target.value || null })} aria-describedby={describedBy("ms-next", undefined, true)}>
              <option value="">Sin encadenar</option>
              {missions.filter((x) => x.id !== m.id).map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
            </Select>
          </Field>
        </div>
        <Switch checked={m.active !== false} onChange={(v) => set({ active: v })} label="Activa en la tienda" />
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Guardar misión</Button>
      </div>
    </form>
  );
}
