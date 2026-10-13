import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Barra de progreso con forma de batería (el motivo de la marca): celdas que se encienden de izquierda a derecha y
 * un borne a la derecha. `pct` de 0 a 100. Las celdas encendidas entran en cadena una sola vez (CSS, sin bucles).
 */
export function BatteryMeter({ pct, cells = 10, label, className, tone = "volt" }: { pct: number; cells?: number; label: string; className?: string; tone?: "volt" | "success" | "danger" }) {
  const lit = Math.round((Math.min(100, Math.max(0, pct)) / 100) * cells);
  const color = tone === "success" ? "var(--color-success)" : tone === "danger" ? "var(--color-danger)" : "var(--led-volt)";
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}
      className={cn("relative flex items-center gap-[3px] rounded-md border border-line p-[3px] pr-[5px]", className)} style={{ "--cell": color } as CSSProperties}>
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} className={cn("h-2.5 flex-1 rounded-[2px]", i < lit ? "battery-cell-on bg-[var(--cell)] shadow-[0_0_8px_var(--cell)]" : "bg-ink/10")} style={{ animationDelay: `${i * 60}ms` }} />
      ))}
      <span aria-hidden="true" className="absolute -right-[4px] top-1/2 h-2 w-[3px] -translate-y-1/2 rounded-r-sm bg-line" />
    </div>
  );
}
