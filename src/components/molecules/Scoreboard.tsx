import type { ReactNode } from "react";
import { Led, LedPrice, type LedMotion, type LedTone } from "@/components/atoms/Led";
import { cn } from "@/lib/cn";

export interface ScoreCell {
  key: string;
  label: string;
  value: number;
  /** Pesos: se dibuja con el signo $. */
  money?: boolean;
  /** Ceros a la izquierda para los contadores ("08"). */
  pad?: number;
  tone?: LedTone;
  /** Lectura para lectores de pantalla (por defecto, el valor). */
  reading?: string;
  hint?: ReactNode;
  /** Ancho relativo en escritorio (las celdas de plata suelen ir más anchas). */
  wide?: boolean;
}

interface ScoreboardProps {
  cells: ScoreCell[];
  /** Nombre del marcador para lectores de pantalla. */
  label: string;
  motion?: LedMotion;
  className?: string;
}

/**
 * Marcador del box: placas de acero que encastran, separadas por la luz entre placas, cada una con su rótulo, su
 * cifra en LED y una nota. Se usa en el panel ("Hoy en tu tienda") y en la tienda (tira de datos de un producto).
 */
export function Scoreboard({ cells, label, motion = "power", className }: ScoreboardProps) {
  return (
    <dl aria-label={label} className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]", className)}>
      {cells.map((c) => (
        <div key={c.key} className={cn("plate flex min-w-0 flex-col gap-2 p-3 sm:p-4", c.wide && "col-span-2 sm:col-span-1")}>
          <dt className="eyebrow text-muted">{c.label}</dt>
          <dd>
            {c.money
              ? <LedPrice amount={c.value} tone={c.tone} motion={motion} className="h-9 sm:h-10" signClassName="text-3xl" />
              : <Led value={String(c.value).padStart(c.pad ?? 2, "0")} label={c.reading ?? String(c.value)} tone={c.tone} motion={motion} className="h-9 sm:h-10" />}
          </dd>
          {c.hint && <dd className="font-mono text-[11px] text-muted">{c.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
