import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Sparkline } from "@/components/molecules/Sparkline";
import { cn } from "@/lib/cn";

interface KpiTileProps {
  label: string;
  value: ReactNode;
  delta?: number | null;
  spark?: number[];
  hint?: string;
  dark?: boolean;
  className?: string;
}

/** KPI con variación (ícono + texto, no solo color) y tendencia opcional. */
export function KpiTile({ label, value, delta, spark, hint = "demo", dark, className }: KpiTileProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className={cn("flex min-h-36 flex-col justify-between gap-3 rounded-3xl p-5", className, dark ? "bg-night text-[#f6f1e8]" : "bg-surface shadow-[var(--shadow-card)]")}>
      <div className="flex items-start justify-between gap-2">
        <span className={cn("text-sm font-bold", dark ? "text-[#cfc6b3]" : "text-muted")}>{label}</span>
        {delta !== undefined && delta !== null && (
          <span className={cn("flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-extrabold", up ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
            {up ? <ArrowUpRight size={13} aria-hidden="true" /> : <ArrowDownRight size={13} aria-hidden="true" />}{up ? "+" : ""}{delta}%<span className="sr-only"> contra la semana anterior</span>
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-display whitespace-nowrap text-[2rem] leading-none tabular-nums">{value}</span>
        {spark && <Sparkline values={spark} label={`Tendencia de ${label}`} className={cn("h-9 w-28", dark ? "text-brass" : "text-primary")} />}
      </div>
      <span className={cn("text-[11px] font-semibold uppercase tracking-wider", dark ? "text-[#cfc6b3]" : "text-muted")}>{hint}</span>
    </div>
  );
}
