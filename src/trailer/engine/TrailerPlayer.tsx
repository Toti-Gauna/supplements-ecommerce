"use client";
import { useEffect, useRef, useState } from "react";
import { createClock } from "../core/clock";
import { parseParams } from "../core/params";
import { PIECES } from "../pieces";
import { RECIPES } from "../recipes";
import { Controls } from "./Controls";
import { gsap, type Timeline } from "./gsap";
import { buildMaster } from "./master";
import { Stage } from "./Stage";

/** API para grabar cuadro a cuadro (`scripts/trailer-export.mjs`) y para los tests: `seek` espera a que se pinte. */
export interface TrailerApi { ready: true; duration: number; seek: (t: number) => Promise<void> }
declare global { interface Window { __trailer?: TrailerApi } }

const paint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/**
 * Reproductor: dibuja todas las escenas en el escenario (ocultas), arma el maestro cuando cargaron las fuentes y lo
 * mueve con el reloj en cada tick. `?t=` congela un cuadro; `?export=1` deja todo quieto para grabar.
 */
export default function TrailerPlayer({ pieza }: { pieza: string }) {
  const spec = PIECES[pieza]!;
  const [params] = useState(() => parseParams(window.location.search, spec.duration));
  const [clock] = useState(() => createClock(() => performance.now() / 1000, spec.duration));
  const stageRef = useRef<HTMLDivElement>(null);
  const [master, setMaster] = useState<Timeline | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => setMaster(buildMaster(spec, stage, params.ratio)), stage);
    });
    return () => { cancelled = true; ctx?.revert(); setMaster(null); };
  }, [spec, params.ratio]);

  useEffect(() => {
    if (!master) return;
    const frozen = params.t !== null || params.exportMode;
    clock.seek(params.t ?? 0);
    master.seek(clock.time(), false);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!frozen && !still) clock.play();
    const tick = () => { master.seek(clock.time(), false); };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    window.__trailer = { ready: true, duration: spec.duration, seek: async (t) => { clock.pause(); clock.seek(t); master.seek(clock.time(), false); await paint(); } };
    return () => { gsap.ticker.remove(tick); gsap.ticker.lagSmoothing(500, 33); delete window.__trailer; };
  }, [master, clock, params, spec.duration]);

  return (
    <>
      <Stage ref={stageRef} ratio={params.ratio}>
        {spec.scenes.map((scene) => {
          const { Component } = RECIPES[scene.recipe]!;
          return (
            <div key={scene.id} data-escena={scene.id} className="absolute inset-0" style={{ visibility: "hidden", opacity: 0 }}>
              <Component props={scene.props ?? {}} ratio={params.ratio} />
            </div>
          );
        })}
      </Stage>
      {!params.exportMode && master && <Controls spec={spec} clock={clock} params={params} />}
    </>
  );
}
