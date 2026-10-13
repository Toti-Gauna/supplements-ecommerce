"use client";
import { CheckCircle2, Gift } from "lucide-react";
import { LoadBar } from "@/components/molecules/LoadBar";
import { formatMissionValue, previewMission } from "@/demo/engine/missions";
import type { Mission } from "@/demo/types";
import { cn } from "@/lib/cn";

/**
 * Misión con su barra de carga, avance, premio y estado (texto + ícono, nunca solo color). El título va a lo
 * ancho de la tarjeta para que no se parta en columnas angostas (tablet con tres por fila).
 */
export function MissionCard({ mission, progress, dark }: { mission: Mission; progress: number; dark?: boolean }) {
  const p = previewMission(mission, progress, { units: 0, total: 0 });
  const done = p.alreadyComplete;
  return (
    <article className={cn("flex h-full flex-col gap-5 rounded-sm p-5 sm:p-6", dark ? "bg-white/[0.06] text-on-night ring-1 ring-white/10" : "bg-surface shadow-[var(--shadow-card)]")}>
      <div className="flex items-center justify-between gap-3">
        <span className={cn("eyebrow", dark ? "text-night-muted" : "text-muted")}>Misión</span>
        <span className={cn("whitespace-nowrap rounded-xs px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em]", done ? "bg-success/15 text-success" : dark ? "bg-white/10" : "bg-accent")}>
          {done ? "Completada" : p.after > 0 ? "En curso" : "Por empezar"}
        </span>
      </div>
      <div>
        <h3 className="font-display text-2xl leading-tight">{mission.title}</h3>
        <p className={cn("mt-1 text-sm", dark ? "text-night-muted" : "text-muted")}>{mission.description}</p>
        <p className="mt-2 text-xs font-bold tabular-nums">Avance: {formatMissionValue(mission, p.after)} / {formatMissionValue(mission, mission.threshold)}</p>
        <LoadBar pct={p.pctAfter} tone={done ? "success" : "volt"} label={`Progreso de ${mission.title}`} className="mt-3">
          {done ? <CheckCircle2 size={18} aria-label="Completa" className="text-success" /> : `${p.pctAfter}%`}
        </LoadBar>
      </div>
      <div className={cn("mt-auto flex items-start gap-3 rounded-sm px-4 py-3", dark ? "bg-white/5" : "bg-accent/50")}>
        <Gift size={17} aria-hidden="true" className={cn("mt-0.5 shrink-0", dark ? "text-volt" : "text-volt-ink")} />
        <span className="min-w-0">
          <span className={cn("block text-[11px] font-bold uppercase tracking-wider", dark ? "text-night-muted" : "text-muted")}>Premio</span>
          <span className="block text-sm font-bold">{mission.reward}</span>
        </span>
      </div>
    </article>
  );
}
