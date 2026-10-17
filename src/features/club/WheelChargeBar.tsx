"use client";
import { cn } from "@/lib/cn";
import { useBarCharge } from "./useBarCharge";

const PLATES = 12;
/** Colores reglamentarios de los discos (rojo, azul, amarillo, verde) de afuera hacia adentro: arte, iguales siempre. */
const PLATE_COLOR = ["#d6312b", "#1f5fd6", "#f2c21b", "#1f9a4a", "#d6312b", "#1f5fd6"];

/**
 * El gesto de gimnasio del Disco olímpico: una barra olímpica que se carga de discos mientras mantenés apretado
 * "Cargá la barra" y, al soltar, el disco gira con esa fuerza. La carga se lee como `progressbar` (no solo color).
 * Con "reducir movimiento" no hay carga: un toque gira directo, sin animación.
 */
export function WheelChargeBar({ onRelease, enabled, reduce }: { onRelease: (charge: number) => void; enabled: boolean; reduce: boolean }) {
  const { charge, holding, handlers } = useBarCharge(onRelease, enabled && !reduce);
  const pct = Math.round(charge * 100);
  const lit = Math.round(charge * PLATES);
  const side = (dir: 1 | -1) => (
    <span className={cn("flex items-center gap-[3px]", dir < 0 && "flex-row-reverse")}>
      {Array.from({ length: PLATES / 2 }, (_, i) => {
        const on = dir > 0 ? i * 2 < lit : i * 2 + 1 < lit;
        return <span key={i} className="rounded-[1px] transition-[opacity,height] duration-75" style={{ width: 7, height: 34 - i * 3, background: PLATE_COLOR[i], opacity: on ? 1 : 0.14 }} />;
      })}
    </span>
  );
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div role="progressbar" aria-label="Carga de la barra" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
        className="flex h-12 w-full max-w-[22rem] items-center justify-center gap-1">
        {side(-1)}
        <span aria-hidden="true" className="h-2 flex-1 rounded-full bg-[linear-gradient(180deg,#e9edf2,#8a929c_55%,#4d545d)] shadow-[0_0_0_1px_rgb(0_0_0/0.4)]" />
        {side(1)}
      </div>
      {reduce ? (
        <button type="button" disabled={!enabled} onClick={() => onRelease(0.5)}
          className="min-h-12 rounded-sm bg-volt px-7 font-mono text-sm font-bold uppercase tracking-[0.08em] text-night disabled:opacity-45">Cargá la barra y girá</button>
      ) : (
        <button type="button" disabled={!enabled} {...handlers} aria-describedby="charge-hint"
          className={cn("min-h-12 touch-none select-none rounded-sm px-7 font-mono text-sm font-bold uppercase tracking-[0.08em] transition-colors disabled:opacity-45",
            holding ? "bg-volt-soft text-night" : "bg-volt text-night shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-3px_0_rgb(0_0_0/0.28)]")}>
          {holding ? (charge >= 1 ? "¡Soltá!" : "Cargando…") : "Cargá la barra"}
        </button>
      )}
      {!reduce && <p id="charge-hint" className="text-xs text-night-muted">Mantené apretado y soltá: más carga, más vueltas.</p>}
    </div>
  );
}
