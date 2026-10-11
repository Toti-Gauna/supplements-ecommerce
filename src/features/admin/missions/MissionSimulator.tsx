"use client";
import { Gift } from "lucide-react";
import { useState } from "react";
import { Select } from "@/components/atoms/Select";
import { Celebration } from "@/components/molecules/Celebration";
import { MissionProgress } from "@/components/molecules/MissionProgress";
import { formatMissionValue } from "@/demo/engine/missions";
import type { Mission } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { MISSIONS_SECTION } from "./MissionsAdmin";

/** Simular progreso (8.3.24: subpágina de Misiones y premios). */
export function MissionSimulatorPage() {
  const missions = useAdmin((s) => s.data.missions);
  return (
    <>
      <SubpageHeader trail={[MARKETING, MISSIONS_SECTION]} back={MISSIONS_SECTION} title="Simular progreso y premio" intro="Un cliente de ejemplo avanza en la misión elegida. No guarda nada ni genera premios reales." />
      <MissionSimulator missions={missions} />
    </>
  );
}

/** Simula a un cliente de ejemplo avanzando en la misión: al llegar al umbral se ve el premio (y el excedente encadenado). */
export function MissionSimulator({ missions }: { missions: Mission[] }) {
  const [id, setId] = useState(missions[0]?.id ?? "");
  const mission = missions.find((m) => m.id === id) ?? missions[0];
  const [value, setValue] = useState(0);
  if (!mission) return null;
  const max = mission.threshold * 2;
  const v = Math.min(value, max);
  const done = v >= mission.threshold;
  const next = mission.nextMissionId ? missions.find((m) => m.id === mission.nextMissionId) : undefined;
  const overflow = Math.max(0, v - mission.threshold);
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-surface shadow-[var(--shadow-card)] p-4">
      <label className="flex flex-col gap-1 text-sm font-bold">Misión<Select value={mission.id} onChange={(e) => { setId(e.target.value); setValue(0); }}>{missions.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</Select></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Progreso del cliente de ejemplo: {formatMissionValue(mission, v)}{v > mission.threshold ? ` (+${formatMissionValue({ ...mission, threshold: Infinity }, overflow)} de excedente)` : ""}
        <input type="range" min={0} max={max} step={mission.type === "SPEND_TOTAL" ? 1000 : 1} value={v} onChange={(e) => setValue(Number(e.target.value))} className="accent-[var(--color-primary)]" />
      </label>
      <MissionProgress key={`${mission.id}-${done}`} title={mission.title} reward={mission.reward} pctFrom={0} pctTo={Math.min(100, Math.round((v / mission.threshold) * 100))}
        valueLabel={`${formatMissionValue(mission, v)} / ${formatMissionValue(mission, mission.threshold)}`} status={done ? "complete" : "progress"} compact />
      {done && (
        <div role="status" className="animate-fade-up relative flex items-start gap-3 rounded-2xl bg-success-soft p-4 text-sm">
          <Gift className="shrink-0 text-success" aria-hidden="true" />
          <p><strong className="text-success">Premio de ejemplo generado: {mission.reward}.</strong> En producción se crea un premio de un uso con vencimiento y se avisa por email.
            {next && overflow > 0 && <> El excedente pasa a “{next.title}”.</>}</p>
          <Celebration />
        </div>
      )}
    </div>
  );
}
