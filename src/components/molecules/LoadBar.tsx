import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "volt" | "success";
/** El voltio sale del marcador (`--led-volt`): se lee en papel, en el box y sobre las bandas noche de los dos modos. */
const FILL: Record<Tone, string> = { volt: "var(--led-volt)", success: "var(--color-success)" };

interface LoadBarProps {
  /** De 0 a 100. */
  pct: number;
  /** Lectura para lectores de pantalla ("Progreso de Primera compra"). */
  label: string;
  tone?: Tone;
  /** Lo que va a la derecha de la barra (el porcentaje, un ícono de completo). Nunca solo color. */
  children?: ReactNode;
  className?: string;
}

/**
 * Barra de carga del box (reemplaza al anillo de Velmar): un riel recto con marcas cada 10 %, la carga con canto
 * duro y la lectura al costado. Se llena una sola vez al aparecer; con "reducir movimiento", quieta.
 */
export function LoadBar({ pct, label, tone = "volt", children, className }: LoadBarProps) {
  const value = Math.round(Math.min(100, Math.max(0, pct)));
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className={cn("flex items-center gap-3", className)}>
      <span className="bevel relative h-3 min-w-0 flex-1 overflow-hidden border border-current/20 bg-current/5">
        <span aria-hidden="true" className="progress-fill absolute inset-y-0 left-0 shadow-[2px_0_0_rgb(0_0_0/0.35)]"
          style={{ width: `${value}%`, "--to": `${value}%`, background: FILL[tone] } as CSSProperties} />
        <span aria-hidden="true" className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_calc(10%-1px),rgb(0_0_0/0.3)_calc(10%-1px)_10%)]" />
      </span>
      {children && <span className="shrink-0 font-mono text-[13px] font-bold tabular-nums">{children}</span>}
    </div>
  );
}
