import { Gift, PartyPopper } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { Celebration } from "./Celebration";

export interface MissionProgressProps {
  title: string;
  reward: string;
  pctFrom: number;
  pctTo: number;
  valueLabel: string;
  status: "progress" | "completes-now" | "complete";
  note?: string;
  compact?: boolean;
}

/** Barra de progreso animada (de pctFrom a pctTo) con celebración breve al completar. */
export function MissionProgress({ title, reward, pctFrom, pctTo, valueLabel, status, note, compact }: MissionProgressProps) {
  const style = { "--from": `${pctFrom}%`, "--to": `${pctTo}%`, width: `${pctTo}%` } as CSSProperties;
  const done = status !== "progress";
  return (
    <div className={cn("relative rounded-2xl border bg-surface", compact ? "p-3" : "p-4", done ? "border-success/40" : "border-line")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-ink">{title}</p>
          <p className="flex items-center gap-1 text-sm text-muted"><Gift size={14} aria-hidden="true" /> {reward}</p>
        </div>
        <span className="shrink-0 text-sm font-bold tabular-nums text-primary">{valueLabel}</span>
      </div>
      <div
        className="mt-3 h-3 overflow-hidden rounded-full bg-accent"
        role="progressbar"
        aria-label={`Progreso de ${title}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pctTo}
      >
        <div className={cn("progress-fill h-full rounded-full", done ? "bg-success" : "bg-primary")} style={style} />
      </div>
      {status === "completes-now" && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-success" role="status">
          <PartyPopper size={16} aria-hidden="true" /> ¡Con este pedido completás la misión!
        </p>
      )}
      {status === "complete" && <p className="mt-2 text-sm font-bold text-success">Misión cumplida</p>}
      {note && <p className="mt-2 text-xs text-muted">{note}</p>}
      {status === "completes-now" && <Celebration />}
    </div>
  );
}
