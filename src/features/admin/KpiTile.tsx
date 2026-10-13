import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Led, LedPrice } from "@/components/atoms/Led";
import { Sparkline } from "@/components/molecules/Sparkline";
import { cn } from "@/lib/cn";

interface KpiTileProps {
  label: string;
  value: number;
  /** Pesos: el marcador lleva el signo $. */
  money?: boolean;
  delta?: number | null;
  spark?: number[];
  hint?: string;
  /** Lo que pide acción: el marcador se enciende en ámbar y la placa lleva la cinta de aviso. */
  alert?: boolean;
  className?: string;
}

/** KPI como marcador LED del box: rótulo, cifra en 7 segmentos, variación (ícono + texto, no solo color) y tendencia. */
export function KpiTile({ label, value, money, delta, spark, hint = "demo", alert, className }: KpiTileProps) {
  const up = (delta ?? 0) >= 0;
  const tone = alert && value > 0 ? "amber" : "volt";
  return (
    <div className={cn("plate relative flex min-h-36 flex-col justify-between gap-3 overflow-hidden rounded-sm border border-line p-4 sm:p-5", className)}>
      {alert && value > 0 && <span aria-hidden="true" className="hazard absolute inset-y-0 left-0 w-1.5" />}
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow text-muted">{label}</span>
        {delta !== undefined && delta !== null && (
          <span className={cn("flex items-center gap-0.5 rounded-xs px-1.5 py-0.5 font-mono text-xs font-bold", up ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
            {up ? <ArrowUpRight size={13} aria-hidden="true" /> : <ArrowDownRight size={13} aria-hidden="true" />}{up ? "+" : ""}{delta}%<span className="sr-only"> contra la semana anterior</span>
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        {money
          ? <LedPrice amount={value} tone={tone} className="h-9 sm:h-10" signClassName="text-3xl" />
          : <Led value={String(value).padStart(2, "0")} label={String(value)} tone={tone} className="h-9 sm:h-10" />}
        {spark && <Sparkline values={spark} label={`Tendencia de ${label}`} className="h-9 w-28 text-volt-ink" />}
      </div>
      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">{hint}</span>
    </div>
  );
}
