"use client";
import { useEffect, useRef, useState } from "react";
import type { Clock } from "../core/clock";
import type { TrailerParams } from "../core/params";
import { sceneAt } from "../core/timeline";
import type { TrailerSpec } from "../core/types";
import { gsap } from "./gsap";

const clock2 = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;

/**
 * Barra de control (fuera del escenario): reproducir/pausar, recorrer el trailer y, con `?dev=1`, la escena y el
 * segundo exacto. Se actualiza con el ticker de GSAP escribiendo en el DOM, sin renderizar React en cada cuadro.
 */
export function Controls({ spec, clock, params }: { spec: TrailerSpec; clock: Clock; params: TrailerParams }) {
  const [playing, setPlaying] = useState(clock.playing());
  const range = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tick = () => {
      const t = clock.time();
      if (range.current) range.current.value = String(t);
      if (readout.current) readout.current.textContent = `${clock2(t)} / ${clock2(spec.duration)}${params.dev ? ` · ${sceneAt(spec, t)?.id ?? ""}` : ""}`;
      if (!clock.playing() && playing) setPlaying(false);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [clock, spec, params.dev, playing]);

  const toggle = () => { if (clock.playing()) clock.pause(); else clock.play(); setPlaying(clock.playing()); };
  const other = params.ratio === "16x9" ? "9x16" : "16x9";
  return (
    <div data-trailer-controls className="fixed inset-x-0 bottom-0 z-[80] flex items-center gap-3 bg-black/70 px-4 py-2 font-mono text-xs text-white backdrop-blur">
      <button type="button" onClick={toggle} className="min-w-20 rounded-xs border border-white/40 px-3 py-1.5 uppercase tracking-wider">
        {playing ? "Pausa" : "Reproducir"}
      </button>
      <input ref={range} type="range" aria-label="Recorrer el trailer" min={0} max={spec.duration} step={0.01} defaultValue={0} className="flex-1"
        onInput={(e) => { clock.seek(Number(e.currentTarget.value)); }} />
      <span ref={readout} aria-live="off" className="tabular-nums">0:00.0</span>
      <a href={`?ratio=${other}`} className="underline underline-offset-2">{other.replace("x", ":")}</a>
    </div>
  );
}
