"use client";
import type { ReactNode } from "react";
import { Decor, type DecorKind } from "@/components/illustrations/seasonal/Decor";
import { SceneCss, useDelay, vars } from "./kit";

/**
 * Piezas comunes de las escenas de carga. Todo se ubica alrededor del logo compacto sin pisarlo: ThemeSplashScene mide
 * la caja del logo (`--bw`/`--bh`, medio ancho y medio alto; `--bd`, media diagonal) y cada aro calcula su radio para
 * que ninguna pieza toque esa caja. Lo que no debe pisar el logo lleva `data-sc` (lo mide un e2e).
 */
export type Shape = "frame" | "ellipse";

/** Punto del contorno: "frame" es un rectángulo redondeado (abraza al logo, que es ancho), "ellipse" una elipse. */
export function point(deg: number, shape: Shape): [number, number] {
  const r = (deg * Math.PI) / 180, p = shape === "frame" ? 0.5 : 1;
  const f = (v: number) => Math.sign(v) * Math.abs(v) ** p;
  return [Number(f(Math.cos(r)).toFixed(4)), Number(f(Math.sin(r)).toFixed(4))];
}

/** Ancla en el centro del logo con el radio de su aro (`--rx`/`--ry`) según el tamaño de pieza `s`. */
export function Anchor({ s, extra, shape = "frame", className = "", children }: { s?: string; extra?: string; shape?: Shape; className?: string; children: ReactNode }) {
  return <div className={`sc-ring ${shape === "ellipse" ? "sc-ell" : ""} ${className}`} style={vars({ ...(s ? { "--s": s } : {}), ...(extra ? { "--extra": extra } : {}) })}>{children}</div>;
}

/** Decoraciones en aro alrededor del logo: aparecen una por una desde `start` (cada `step` segundos). */
export function Ring({ kinds, count, from = -90, span = 360, start, step = 0.1, shape = "frame", s, extra, className = "", children }: {
  kinds: DecorKind[]; count: number; from?: number; span?: number; start: number; step?: number; shape?: Shape; s?: string; extra?: string; className?: string; children?: ReactNode;
}) {
  const d = useDelay();
  const full = span >= 360;
  return (
    <Anchor s={s} extra={extra} shape={shape}>
      {Array.from({ length: count }, (_, i) => {
        const [x, y] = point(from + (span * i) / (full ? count : Math.max(count - 1, 1)), shape);
        return (
          <span key={i} data-sc className={`sc-piece sc-pop ${className}`} style={{ ...vars({ "--x": `calc(var(--rx) * ${x})`, "--y": `calc(var(--ry) * ${y})`, "--tilt": `${i % 2 ? -4 : 4}deg` }), ...d(start + i * step) }}>
            <span className="sc-bob" style={d(start + i * step + 0.75)}><Decor kind={kinds[i % kinds.length]!} className="h-full w-full drop-shadow-[0_8px_14px_rgb(0_0_0/0.45)]" /></span>
          </span>
        );
      })}
      {children}
    </Anchor>
  );
}

/** Estallido de rayitos (fuegos, chispas, choque de shakers) en un punto relativo al ancla. */
export function Burst({ x, y, at, colors, n = 12, r = "46px" }: { x: string; y: string; at: number; colors: string[]; n?: number; r?: string }) {
  const d = useDelay();
  return (
    <span className="sc-burst" style={vars({ left: x, top: y, "--r": r, "--c0": colors[0]! })}>
      <b style={d(at)} />
      {Array.from({ length: n }, (_, i) => <i key={i} style={{ ...vars({ "--a": `${(i / n) * 360}deg`, "--c": colors[i % colors.length]! }), ...d(at + (i % 3) * 0.04) }} />)}
    </span>
  );
}

/** Texto que entra letra por letra. */
export function Letters({ text, at, step = 0.045, className = "" }: { text: string; at: number; step?: number; className?: string }) {
  const d = useDelay();
  return <span className={`sc-letters ${className}`}>{[...text].map((ch, i) => <span key={i} style={d(at + i * step)}>{ch === " " ? "\u00a0" : ch}</span>)}</span>;
}

/** Contador que pasa por `values` en `dur` segundos (como el porcentaje de la batería del splash). */
export function Strip({ values, at, dur }: { values: string[]; at: number; dur: number }) {
  const d = useDelay();
  return (
    <span className="sc-strip">
      <span style={{ ...vars({ "--n": values.length - 1, "--dur": `${dur}s` }), ...d(at) }}>{values.map((v, i) => <span key={i}>{v}</span>)}</span>
    </span>
  );
}

/** CSS común de las escenas (una sola vez en el <head>). */
export function RigCss() {
  return <SceneCss id="rig" css={CSS} />;
}

const CSS = `
.season-scene { --bw: 84px; --bh: 54px; --bd: 100px; --s: 40px; }
@media (min-width: 640px) { .season-scene { --bw: 126px; --bh: 68px; --bd: 144px; --s: 60px; } }
@media (max-height: 560px) { .season-scene { --s: 34px; } .season-scene .sc-tall { display: none; } }
.sc-ring { position: absolute; left: 50%; top: 50%; width: 0; height: 0;
  --g: calc((var(--bw) + var(--s) / 2) * var(--gk, .2) + var(--g0, 6px) + var(--extra, 0px));
  --rx: calc(var(--bw) + var(--s) / 2 + var(--g)); --ry: calc(var(--bh) + var(--s) / 2 + var(--g)); }
.sc-ring.sc-ell { --gk: .45; --g0: 4px; }
.sc-piece { position: absolute; left: calc(var(--x) - var(--s) / 2); top: calc(var(--y) - var(--s) / 2); width: var(--s); height: var(--s); }
.sc-pop { opacity: 0; animation: sc-pop 720ms cubic-bezier(.2, 1.45, .4, 1) both; }
.sc-bob { display: block; width: 100%; height: 100%; animation: sc-bob 1.6s ease-in-out 2 alternate both; }
.sc-below, .sc-above { position: absolute; left: 0; translate: -50% 0; white-space: nowrap; text-align: center; }
.sc-below { top: calc(var(--ry) + var(--s) / 2 + 14px); }
.sc-above { bottom: calc(var(--ry) + var(--s) / 2 + 14px); }
.sc-burst { position: absolute; width: 0; height: 0; }
.sc-burst b { position: absolute; left: -22px; top: -22px; width: 44px; height: 44px; border-radius: 9999px; background: radial-gradient(closest-side, var(--c0), transparent); opacity: 0; animation: sc-flash 700ms ease-out both; }
.sc-burst i { position: absolute; left: -1.5px; top: 0; width: 3px; height: 12px; border-radius: 3px; background: var(--c); box-shadow: 0 0 8px var(--c); transform-origin: 50% 0; opacity: 0; animation: sc-ray 1s cubic-bezier(.2, .8, .3, 1) both; }
.sc-letters > span { display: inline-block; opacity: 0; animation: sc-letter 620ms cubic-bezier(.16, 1, .3, 1) both; }
.sc-strip { display: inline-block; height: 1.2em; overflow: hidden; line-height: 1.2em; vertical-align: bottom; }
.sc-strip > span { display: flex; flex-direction: column; animation: sc-count var(--dur) steps(var(--n), end) both; }
.sc-fade { opacity: 0; animation: sc-in 500ms ease-out both; }
@keyframes sc-pop { from { opacity: 0; transform: scale(.2) rotate(-25deg); } 45% { opacity: 1; } to { opacity: 1; transform: none; } }
@keyframes sc-bob { to { transform: translateY(-5px) rotate(var(--tilt, 3deg)); } }
@keyframes sc-flash { 0% { opacity: 0; transform: scale(.3); } 25% { opacity: 1; } 100% { opacity: 0; transform: scale(1.9); } }
@keyframes sc-ray { 0% { opacity: 0; transform: rotate(var(--a)) translateY(4px) scaleY(.4); } 18% { opacity: 1; } 100% { opacity: 0; transform: rotate(var(--a)) translateY(var(--r)) scaleY(1); } }
@keyframes sc-letter { from { opacity: 0; transform: translateY(.45em) scale(.85); } to { opacity: 1; transform: none; } }
@keyframes sc-count { to { transform: translateY(calc(var(--n) * -1.2em)); } }
@keyframes sc-in { to { opacity: 1; } }
`;
