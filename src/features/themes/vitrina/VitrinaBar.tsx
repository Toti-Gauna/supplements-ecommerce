"use client";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import type { CSSProperties } from "react";
import { Led } from "@/components/atoms/Led";
import { cn } from "@/lib/cn";
import { formatDayRange } from "@/lib/date";
import { VITRINA_INTERVAL, useVitrina } from "./useVitrina";

const SQUARE = "grid size-11 shrink-0 place-items-center border border-white/20 text-on-night hover:border-(--season-accent) hover:text-(--season-accent)";
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Barra del modo vitrina: abajo, sobre la tienda (que sigue usable), con el número de fecha en marcador, su nombre y
 * sus días, anterior / pausa / siguiente, la barra de tiempo de la reproducción automática y "Salir" (o Escape). Es
 * una herramienta de la demo de venta: no se guarda nada y al salir la tienda queda como estaba.
 */
export function VitrinaBar() {
  const { theme, index, total, playing, running, setPlaying, step, exit } = useVitrina();
  if (!theme) return null;
  return (
    <section aria-label="Modo vitrina" data-vitrina={theme.id}
      className="fixed inset-x-0 bottom-0 z-[70] border-t-2 border-(--season-accent) bg-night/95 pb-[env(safe-area-inset-bottom)] text-on-night shadow-[0_-18px_40px_-20px_rgb(0_0_0/0.9)] backdrop-blur">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
        {running && <span key={`${theme.id}-${index}`} className="hero-fill absolute inset-0 bg-on-night/70" style={{ animationDuration: `${VITRINA_INTERVAL}ms` } as CSSProperties} />}
      </span>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:flex-nowrap sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <p aria-hidden="true" className="flex shrink-0 items-end gap-1 font-mono text-[11px] font-bold text-night-muted">
            <Led value={pad(index + 1)} label="" tone="chalk" motion="flip" className="h-6" />
            <span className="pb-px">/ {pad(total)}</span>
          </p>
          <p aria-live={running ? "off" : "polite"} className="min-w-0">
            <span className="eyebrow block text-night-muted">Modo vitrina · {index + 1} de {total}</span>
            <strong className="block truncate text-[15px]">{theme.name} <span className="font-mono text-[11px] font-normal text-night-muted">{formatDayRange(theme.startsOn, theme.endsOn)}</span></strong>
          </p>
        </div>
        <div className="flex items-center gap-1.5 max-sm:w-full max-sm:justify-between">
          <button type="button" onClick={() => step(-1)} aria-label="Fecha anterior" className={SQUARE}><ChevronLeft size={20} aria-hidden="true" /></button>
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pausar la vitrina" : "Reproducir la vitrina"} className={SQUARE}>
            {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Fecha siguiente" className={SQUARE}><ChevronRight size={20} aria-hidden="true" /></button>
          <button type="button" onClick={exit} className={cn(SQUARE, "w-auto gap-1.5 px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em]", "flex")}>
            <X size={16} aria-hidden="true" />Salir <span className="text-night-muted max-sm:hidden">(Esc)</span>
          </button>
        </div>
      </div>
    </section>
  );
}
