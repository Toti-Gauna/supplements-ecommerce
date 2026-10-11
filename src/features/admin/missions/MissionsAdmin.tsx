"use client";
import { ArrowRight, FlaskConical, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import { emptyMission, newMissionId } from "@/demo/admin/mission-form";
import type { Mission } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { HubCard, HubGrid } from "../marketing/HubCard";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { useDemoSave } from "../useDemoSave";
import { MissionDialog } from "./MissionDialog";
import { NEW_DRAFT } from "./missionDraft";

export const MISSIONS_SECTION = { href: "/admin-demo/misiones/", label: "Misiones y premios" };

/**
 * Misiones y premios (8.3.23 y 8.3.24): las misiones como tarjetas y "Nueva misión" en un modal, sin formularios que
 * alarguen la pantalla. Simular progreso es otra tarea, con su propia página.
 */
export function MissionsAdmin() {
  const missions = useAdmin((s) => s.data.missions);
  const saveMission = useAdmin((s) => s.saveMission);
  const save = useDemoSave();
  const [editing, setEditing] = useState<{ mission: Mission; key: string } | null>(null);
  return (
    <>
      <SubpageHeader trail={[MARKETING]} back={MARKETING} title="Misiones y premios"
        intro="Solo cuentan pedidos pagados (en producción). Premios de un uso con vencimiento. Recomendado: hasta 3 activas."
        actions={<Button onClick={() => setEditing({ mission: emptyMission(newMissionId()), key: NEW_DRAFT })}><Plus size={18} aria-hidden="true" /> Nueva misión</Button>} />
      <ul aria-label="Misiones" className="mb-8 grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-2">
        {missions.map((m) => {
          const next = missions.find((x) => x.id === m.nextMissionId);
          return (
            <li key={m.id} className="flex flex-col gap-2 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-center gap-2"><p className="font-extrabold">{m.title}</p>{m.active === false && <Badge tone="warning">Pausada</Badge>}</div>
              <p className="text-sm text-muted">{m.description || "Sin descripción"} · umbral {m.type === "SPEND_TOTAL" ? `$${m.threshold.toLocaleString("es-AR")}` : m.threshold} · premio: {m.reward}</p>
              {next && <p className="flex items-center gap-1 text-sm font-semibold">Encadenada <ArrowRight size={14} aria-hidden="true" /> {next.title}</p>}
              <p className="text-sm"><strong className="tabular-nums">{m.completedCount ?? 0}</strong> clientes la completaron <span className="text-muted">(demo)</span></p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <Switch checked={m.active !== false} onChange={(v) => save(v ? "Misión activada" : "Misión pausada", () => saveMission({ ...m, active: v }))} label={m.active === false ? "Pausada" : "Activa"} ariaLabel={`Activa: ${m.title}`} />
                <Button variant="ghost" size="sm" onClick={() => setEditing({ mission: m, key: m.id })} aria-label={`Editar ${m.title}`}>Editar</Button>
              </div>
            </li>
          );
        })}
      </ul>
      <HubGrid label="Otras tareas de misiones">
        <HubCard href="/admin-demo/misiones/simular/" icon={FlaskConical} title="Simular progreso y premio" description="Mové a un cliente de ejemplo y mirá cuándo se genera el premio." action="Simular" />
      </HubGrid>
      <MissionDialog mission={editing?.mission ?? null} draftKey={editing?.key ?? NEW_DRAFT} onClose={() => setEditing(null)} />
    </>
  );
}
