"use client";
import { useEffect, useRef, useState } from "react";
import { loadTrack } from "../audio/load";
import { renderAudio } from "../audio/render";
import { encodeWav } from "../audio/wav";
import { parseParams } from "../core/params";
import { PIECES } from "../pieces";
import { RECIPES } from "../recipes";
import { Controls } from "./Controls";
import { Gate } from "./Gate";
import { gsap, type Timeline } from "./gsap";
import { buildMaster } from "./master";
import { Stage } from "./Stage";
import { trackFor } from "./track";
import { createTransport } from "./transport";

/** API para grabar cuadro a cuadro (`scripts/trailer-export.mjs`) y para los tests: `seek` espera a que se pinte. */
export interface TrailerApi { ready: true; duration: number; seek: (t: number) => Promise<void>; wav: () => Promise<string> }
declare global { interface Window { __trailer?: TrailerApi } }

const paint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
const base64 = (bytes: Uint8Array) => { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };

/**
 * Reproductor: dibuja las escenas ocultas, arma el maestro tras cargar las fuentes y lo mueve con el transporte (el
 * audio manda cuando hay sonido). `?t=` congela un cuadro; `?export=1` deja todo quieto para grabar.
 */
export default function TrailerPlayer({ pieza }: { pieza: string }) {
  const spec = PIECES[pieza]!;
  const [params] = useState(() => parseParams(window.location.search, spec.duration));
  const [transport] = useState(() => createTransport(spec.duration));
  const stageRef = useRef<HTMLDivElement>(null);
  const [master, setMaster] = useState<Timeline | null>(null);
  const frozen = params.t !== null || params.exportMode;
  const [gate, setGate] = useState(!frozen && Boolean(spec.music));
  const [soundReady, setSoundReady] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    const reduced = params.reduced || matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Fuentes e imágenes (placas y arte de las escenas) listas antes de armar: el primer cuadro grabado ya está completo.
    const images = () => Promise.all(Array.from(stage.querySelectorAll("img"), (img) => img.decode().catch(() => undefined)));
    void document.fonts.ready.then(images).then(() => { if (!cancelled) ctx = gsap.context(() => setMaster(buildMaster(spec, stage, params.ratio, reduced)), stage); });
    return () => { cancelled = true; ctx?.revert(); setMaster(null); };
  }, [spec, params.ratio, params.reduced]);

  useEffect(() => {
    if (frozen || !spec.music) return;
    let off = false;
    void loadTrack(pieza, spec.duration, trackFor(spec)).then((b) => { if (!off) { transport.setBuffer(b); setSoundReady(true); } });
    return () => { off = true; transport.pause(); transport.playback.close(); };
  }, [spec, pieza, frozen, transport]);

  useEffect(() => {
    if (!master) return;
    transport.seek(params.t ?? 0);
    master.seek(transport.time(), false);
    if (!frozen && !spec.music && !matchMedia("(prefers-reduced-motion: reduce)").matches) transport.play();
    const tick = () => { master.seek(transport.time(), false); };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    window.__trailer = {
      ready: true, duration: spec.duration,
      seek: async (t) => { transport.pause(); transport.seek(t); master.seek(transport.time(), false); await paint(); },
      wav: async () => { const b = await renderAudio(trackFor(spec), spec.duration); return base64(encodeWav([b.getChannelData(0), b.getChannelData(1)], b.sampleRate)); },
    };
    return () => { gsap.ticker.remove(tick); gsap.ticker.lagSmoothing(500, 33); delete window.__trailer; };
  }, [master, transport, params.t, frozen, spec]);

  const start = (sound: boolean) => { if (sound) transport.playback.unlock(); else transport.mute(); setGate(false); transport.play(); };
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
      {!params.exportMode && master && <Controls spec={spec} pieza={pieza} clock={transport} params={params} />}
      {gate && master && <Gate ready={soundReady} onSound={() => start(true)} onMute={() => start(false)} />}
    </>
  );
}
