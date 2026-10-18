import type { CSSProperties } from "react";
import { withBase } from "@/lib/base-path";
import { TR } from "./kit";
import { HAIR } from "./tpl";

/**
 * Equipos en CSS 3D de la pieza T1 ("No es solo software"): un celular y una notebook con bisel `#121416`, filo volt de 1 px
 * (2 en el escenario) y un poco de espesor (capas de la misma silueta, cada una un paso más atrás). Cada equipo es un bloque
 * `preserve-3d` que se posiciona por su centro; el timeline dibuja su contorno (`strokeDashoffset`) y prende su pantalla.
 */
export const BEZEL = "#121416";
const LAYERS = 8, STEP = 3;
/** Largo normalizado del contorno: el trazo se dibuja de 1 a 0 sin medir cada rect. */
const PATH = 1000;

export interface DeviceSpec { id: string; shot: string }
export const PHONE = { w: 380, h: 780, pad: 12, r: 52 } as const;
/** La pantalla de la notebook mide 1040 × 650; el bisel la rodea. */
export const LAPTOP = { sw: 1040, sh: 650, bezel: 22, base: { w: 1180, d: 560, t: 18 } } as const;
const lidW = LAPTOP.sw + LAPTOP.bezel * 2, lidH = LAPTOP.sh + LAPTOP.bezel * 2;
export const LAPTOP_BOX = { w: lidW, h: lidH };

/** Contorno de un equipo: un rect redondeado que se dibuja con `strokeDashoffset` (1000 → 0). */
function Outline({ id, w, h, r, z = 0 }: { id: string; w: number; h: number; r: number; z?: number }) {
  return (
    <svg aria-hidden="true" className="absolute left-0 top-0 overflow-visible" width={w} height={h} style={{ transform: `translateZ(${z}px)` }}>
      <rect data-t={`${id}-line`} x={HAIR / 2} y={HAIR / 2} width={w - HAIR} height={h - HAIR} rx={r} fill="none" stroke={TR.volt} strokeWidth={HAIR}
        pathLength={PATH} strokeDasharray={PATH} strokeDashoffset={0} />
    </svg>
  );
}

function Screen({ id, shot, style }: { id: string; shot: string; style: CSSProperties }) {
  return (
    <div data-t={`${id}-screen`} className="absolute overflow-hidden" style={{ background: "#000", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- pantalla del equipo (placa del trailer, se decodifica antes de grabar) */}
      <img src={withBase(`/trailer/shots/t1/${shot}.jpg`)} alt="" aria-hidden="true" className="block size-full max-w-none object-cover object-top" />
    </div>
  );
}

/** Extrusión: la misma silueta repetida hacia atrás, así al girar se ve el canto del equipo. */
const layers = (w: number, h: number, r: number) =>
  Array.from({ length: LAYERS }, (_, i) => (
    <div key={i} aria-hidden="true" className="absolute left-0 top-0" style={{ width: w, height: h, borderRadius: r, background: BEZEL, transform: `translateZ(${-(i + 1) * STEP}px)` }} />
  ));

/** Celular de 380 × 780. `cx`/`cy` son su centro en el escenario; `z` lo adelanta; `ry` lo gira de entrada. */
export function Phone({ id, shot, cx, cy, z = 0, ry = 0 }: DeviceSpec & { cx: number; cy: number; z?: number; ry?: number }) {
  const { w, h, pad, r } = PHONE;
  return (
    <div data-t={`${id}-dev`} className="absolute" style={{ left: cx - w / 2, top: cy - h / 2, width: w, height: h, transformStyle: "preserve-3d", transform: `translateZ(${z}px) rotateY(${ry}deg)` }}>
      {layers(w, h, r)}
      <div className="absolute inset-0" style={{ borderRadius: r, background: BEZEL, boxShadow: "0 40px 90px rgb(0 0 0 / .55)" }}>
        <Screen id={id} shot={shot} style={{ left: pad, top: pad, width: w - pad * 2, height: h - pad * 2, borderRadius: r - pad }} />
      </div>
      <Outline id={id} w={w} h={h} r={r} />
      <Outline id={id} w={w} h={h} r={r} z={-LAYERS * STEP} />
    </div>
  );
}

/** Notebook: la tapa (pantalla de 1040 × 650 con su bisel) y la base apoyada hacia el que mira. `cx`/`cy` es el centro de la tapa. */
export function Laptop({ id, shot, cx, cy, rx = 0 }: DeviceSpec & { cx: number; cy: number; rx?: number }) {
  const { bezel, base } = LAPTOP, edge = `1px solid ${TR.volt}55`;
  return (
    <div data-t={`${id}-dev`} className="absolute" style={{ left: cx - lidW / 2, top: cy - lidH / 2, width: lidW, height: lidH, transformStyle: "preserve-3d", transformOrigin: "50% 100%", transform: `rotateX(${rx}deg)` }}>
      {layers(lidW, lidH, 20)}
      <div className="absolute inset-0" style={{ borderRadius: 20, background: BEZEL, boxShadow: "0 50px 100px rgb(0 0 0 / .5)" }}>
        <Screen id={id} shot={shot} style={{ left: bezel, top: bezel, width: LAPTOP.sw, height: LAPTOP.sh, borderRadius: 6 }} />
      </div>
      <Outline id={id} w={lidW} h={lidH} r={20} />
      {/* Base: una losa que sale de la bisagra hacia adelante (arriba) y su canto delantero. */}
      <div aria-hidden="true" className="absolute" style={{ left: (lidW - base.w) / 2, top: lidH, width: base.w, height: base.d, background: `linear-gradient(${BEZEL}, #1b1e21)`, borderRadius: "0 0 18px 18px", transformOrigin: "50% 0", transform: "rotateX(90deg)", outline: edge }} />
      <div aria-hidden="true" className="absolute" style={{ left: (lidW - base.w) / 2, top: lidH, width: base.w, height: base.t, background: "#0d0f10", borderRadius: "0 0 18px 18px", transform: `translateZ(${base.d}px)`, borderBottom: `${HAIR}px solid ${TR.volt}` }} />
    </div>
  );
}
