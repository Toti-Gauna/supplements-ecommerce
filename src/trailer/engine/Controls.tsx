"use client";
import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/base-path";
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
export function Controls({ spec, pieza, clock, params }: { spec: TrailerSpec; pieza: string; clock: Clock; params: TrailerParams }) {
  const [playing, setPlaying] = useState(clock.playing());
  const downloads = useDownloads(pieza, params.ratio, params.dev);
  const range = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tick = () => {
      const t = clock.time();
      if (range.current) range.current.value = String(t);
      if (readout.current) readout.current.textContent = `${clock2(t)} / ${clock2(spec.duration)}${params.dev ? ` · ${sceneAt(spec, t)?.id ?? ""}` : ""}`;
      if (clock.playing() !== playing) setPlaying(clock.playing());
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
      {downloads.map((d) => (
        <a key={d.href} href={d.href} download data-download={d.label} className="rounded-xs border border-white/40 px-3 py-1.5 uppercase tracking-wider">{d.label}</a>
      ))}
      <a href={`?ratio=${other}`} className="underline underline-offset-2">{other.replace("x", ":")}</a>
    </div>
  );
}

/** Archivos exportados que existen para esta pieza (se pregunta con HEAD: en Pages un archivo ausente da 404). */
function useDownloads(pieza: string, ratio: string, dev: boolean) {
  const [found, setFound] = useState<Array<{ href: string; label: string }>>([]);
  useEffect(() => {
    let off = false;
    // Quien mira el trailer ve un solo botón y baja la versión liviana (la de email en 16:9, el vertical en 9:16); `?dev=1` muestra todas.
    const candidates = dev
      ? [{ name: `${pieza}-${ratio}.mp4`, label: "Descargar MP4" }, ...(ratio === "16x9" ? [{ name: `${pieza}-email.mp4`, label: "Para email" }] : [])]
      : [{ name: ratio === "16x9" ? `${pieza}-email.mp4` : `${pieza}-9x16.mp4`, label: "Descargar MP4" }];
    void Promise.all(candidates.map(async (c) => {
      const href = withBase(`/trailer/${c.name}`);
      try { return (await fetch(href, { method: "HEAD" })).ok ? { href, label: c.label } : null; } catch { return null; }
    })).then((r) => { if (!off) setFound(r.filter((x): x is { href: string; label: string } => x !== null)); });
    return () => { off = true; };
  }, [pieza, ratio, dev]);
  return found;
}
