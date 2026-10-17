"use client";
import { CheckCircle2, Gift, Lock } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { LoadBar } from "@/components/molecules/LoadBar";
import type { ClubClaim } from "@/demo/engine/club-claims";
import { trainingPct, type TrainingContext } from "@/demo/engine/club-training";
import type { TrainingMission } from "@/demo/fixtures/club";
import type { SportId } from "@/demo/types";
import { cn } from "@/lib/cn";
import { TrainingActions } from "./TrainingActions";

interface Props {
  mission: TrainingMission;
  progress: number;
  claim: ClubClaim | null;
  ctx: TrainingContext;
  signedIn: boolean;
  onCheckIn: () => void;
  onSport: (id: SportId) => void;
  onClaim: () => void;
}

/**
 * Misión de entrenamiento: qué hacer, el avance, el premio y "Reclamar premio" cuando se completa. Reclamado, el botón
 * queda bloqueado hasta el período siguiente (el engine tampoco deja reclamar dos veces). Estado con texto e ícono.
 */
export function TrainingCard({ mission, progress, claim, ctx, signedIn, onCheckIn, onSport, onClaim }: Props) {
  const pct = trainingPct(mission, progress);
  const complete = progress >= mission.threshold;
  const status = claim ? "Reclamada" : complete ? "Completa" : progress > 0 ? "En curso" : "Por empezar";
  return (
    <article aria-labelledby={`tm-${mission.id}`} className="edge-volt flex h-full flex-col gap-4 rounded-sm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow text-muted">Entrenamiento · {mission.period === "week" ? "semanal" : "una vez"}</span>
        <span className={cn("whitespace-nowrap rounded-xs px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em]", claim || complete ? "bg-success/15 text-success" : "bg-accent")}>{status}</span>
      </div>
      <div>
        <h3 id={`tm-${mission.id}`} className="font-display text-2xl leading-tight">{mission.title}</h3>
        <p className="mt-1 text-sm text-muted">{mission.description}</p>
      </div>
      {signedIn ? <TrainingActions mission={mission} ctx={ctx} onCheckIn={onCheckIn} onSport={onSport} /> : (
        <p className="flex items-start gap-2 rounded-sm border border-dashed border-line p-3 text-[13px] text-muted"><Lock size={15} aria-hidden="true" className="mt-0.5 shrink-0" />Con la cuenta demo marcás tus entrenos y reclamás el premio.</p>
      )}
      <LoadBar pct={pct} tone={complete ? "success" : "volt"} label={`Progreso de ${mission.title}`}>
        {complete ? <CheckCircle2 size={18} aria-label="Completa" className="text-success" /> : `${Math.min(progress, mission.threshold)}/${mission.threshold}`}
      </LoadBar>
      <div className="mt-auto flex flex-col gap-3 rounded-sm bg-accent/50 px-4 py-3">
        <p className="flex items-start gap-3">
          <Gift size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-volt-ink" />
          <span className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">Premio · +{mission.points} pts para tu box</span>
            <span className="block text-sm font-bold">{mission.reward}</span>
          </span>
        </p>
        {signedIn && claim && (
          <Button size="sm" variant="secondary" disabled aria-label={`Premio reclamado: ${mission.title}`}>
            <CheckCircle2 size={15} aria-hidden="true" />Premio reclamado{claim.code ? ` · ${claim.code}` : ""}
          </Button>
        )}
        {signedIn && !claim && complete && <Button size="sm" onClick={onClaim} aria-label={`Reclamar premio: ${mission.title}`}>Reclamar premio</Button>}
      </div>
    </article>
  );
}
