"use client";
import { CheckCircle2, Gift } from "lucide-react";
import { ProgressRing } from "@/components/molecules/ProgressRing";
import { formatMissionValue, previewMission } from "@/demo/engine/missions";
import type { Mission } from "@/demo/types";
import { cn } from "@/lib/cn";

/**
 * Misión con anillo de progreso, avance, premio y estado (texto + ícono, nunca solo color). El título va a lo
 * ancho de la tarjeta para que no se parta en columnas angostas (tablet con tres por fila).
 */
export function MissionCard({ mission, progress, dark }: { mission: Mission; progress: number; dark?: boolean }) {
  const p = previewMission(mission, progress, { units: 0, total: 0 });
  const done = p.alreadyComplete;
  return (
    <article className={cn("flex h-full flex-col gap-5 rounded-[1.75rem] p-5 sm:p-6", dark ? "bg-white/[0.06] text-[#f6f1e8] ring-1 ring-white/10" : "bg-surface shadow-[var(--shadow-card)]")}>
      <div className="flex items-center justify-between gap-3">
        <ProgressRing pct={p.pctAfter} size={64} stroke={6} tone={done ? "success" : dark ? "brass" : "primary"} label={`Progreso de ${mission.title}`}>
          {done ? <CheckCircle2 size={22} aria-hidden="true" className="text-success" /> : <span className="text-[13px] font-extrabold tabular-nums">{p.pctAfter}%</span>}
        </ProgressRing>
        <span className={cn("whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold", done ? "bg-success/15 text-success" : dark ? "bg-white/10" : "bg-accent")}>
          {done ? "¡Completada!" : p.after > 0 ? "En curso" : "Por empezar"}
        </span>
      </div>
      <div>
        <h3 className="font-display text-2xl leading-tight">{mission.title}</h3>
        <p className={cn("mt-1 text-sm", dark ? "text-[#cfc6b3]" : "text-muted")}>{mission.description}</p>
        <p className="mt-2 text-xs font-bold tabular-nums">Avance: {formatMissionValue(mission, p.after)} / {formatMissionValue(mission, mission.threshold)}</p>
      </div>
      <div className={cn("mt-auto flex items-start gap-3 rounded-2xl px-4 py-3", dark ? "bg-white/5" : "bg-accent/50")}>
        <Gift size={17} aria-hidden="true" className={cn("mt-0.5 shrink-0", dark ? "text-brass" : "text-brass-ink")} />
        <span className="min-w-0">
          <span className={cn("block text-[11px] font-bold uppercase tracking-wider", dark ? "text-[#cfc6b3]" : "text-muted")}>Premio</span>
          <span className="block text-sm font-bold">{mission.reward}</span>
        </span>
      </div>
    </article>
  );
}
