"use client";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { CSSProperties } from "react";
import { Led } from "@/components/atoms/Led";
import { cn } from "@/lib/cn";

/** Tiempo de cada diapositiva con reproducción automática: lo marca la barra de carga del carril actual. */
export const HERO_INTERVAL = 5200;

const SQUARE = "plate grid size-11 shrink-0 place-items-center rounded-sm border border-line text-ink hover:border-ink/50 disabled:opacity-50";
const pad = (n: number) => String(n).padStart(2, "0");

interface HeroLanesProps {
  labels: string[];
  index: number;
  /** La barra del carril actual corre (autoplay activo) o queda congelada. */
  running: boolean;
  /** Con "reducir movimiento" no hay barra de carga: el carril actual queda lleno. */
  reduce: boolean;
  paused: boolean;
  /** Antes de hidratar no se dibuja la barra (no corre nada hasta saber si hay movimiento). */
  ready: boolean;
  onPick: (i: number) => void;
  onStep: (delta: number) => void;
  onToggle: () => void;
  /** La barra terminó de cargarse: pasa a la siguiente. */
  onLap: () => void;
}

/**
 * Franja de control debajo de la imagen, como los carriles pintados del piso del box: un segmento por diapositiva
 * (botón de 44 px de alto) cuyo relleno se carga con el tiempo del autoplay, el contador LED "01 / 04", la pausa y las
 * flechas en placas cuadradas de acero. Ningún control pisa la imagen.
 */
export function HeroLanes({ labels, index, running, reduce, paused, ready, onPick, onStep, onToggle, onLap }: HeroLanesProps) {
  const total = labels.length;
  return (
    <div className="plate border-t border-line">
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-1.5 sm:gap-3 sm:px-6">
        <p aria-hidden="true" className="flex shrink-0 items-end gap-1 pr-1 font-mono text-[11px] font-bold text-muted">
          <Led value={pad(index + 1)} label="" tone="volt" motion="none" className="h-5" />
          <span className="pb-px">/ {pad(total)}</span>
        </p>
        <div role="group" aria-label="Destacados" className="flex min-w-0 flex-1 gap-1">
          {labels.map((label, i) => (
            <button key={i} type="button" aria-label={`Ir a la diapositiva ${i + 1}: ${label}`} aria-current={i === index ? "true" : undefined}
              onClick={() => onPick(i)} className="group/lane flex min-h-11 min-w-0 flex-1 flex-col justify-center gap-1.5 px-0.5 text-left">
              <span aria-hidden="true" className={cn("hidden truncate font-mono text-[10px] font-bold uppercase tracking-[0.12em] lg:block", i === index ? "text-ink" : "text-muted group-hover/lane:text-ink")}>
                {pad(i + 1)} · {label}
              </span>
              <span aria-hidden="true" className="relative block h-1.5 overflow-hidden bg-ink/15">
                {i === index && ready && !reduce
                  ? <span key={index} onAnimationEnd={onLap} className="hero-fill absolute inset-0 bg-primary"
                    style={{ animationDuration: `${HERO_INTERVAL}ms`, animationPlayState: running ? "running" : "paused" } as CSSProperties} />
                  : <span className={cn("absolute inset-0", i === index ? "bg-primary" : "bg-transparent group-hover/lane:bg-ink/25")} />}
              </span>
            </button>
          ))}
        </div>
        <button type="button" data-carousel-playback aria-label={paused || reduce ? "Reproducir carrusel" : "Pausar carrusel"} disabled={reduce}
          title={reduce ? "Reproducción automática desactivada por reducir movimiento" : undefined} onClick={onToggle} className={SQUARE}>
          {paused || reduce ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
        <button type="button" aria-label="Diapositiva anterior" onClick={() => onStep(-1)} className={SQUARE}><ChevronLeft size={20} aria-hidden="true" /></button>
        <button type="button" aria-label="Diapositiva siguiente" onClick={() => onStep(1)} className={SQUARE}><ChevronRight size={20} aria-hidden="true" /></button>
      </div>
    </div>
  );
}
