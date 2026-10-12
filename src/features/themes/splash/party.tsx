"use client";
import { SceneCss, useDelay, vars } from "./kit";
import { Anchor, Burst, RigCss, Strip } from "./rig";
import { Decor } from "@/components/illustrations/seasonal/Decor";

const PCT = Array.from({ length: 11 }, (_, i) => `${i * 10}%`);
const FIREWORKS: [string, string, string[]][] = [
  ["calc(var(--bw) * -1 - 64px)", "calc(var(--bh) * -2.3)", ["#c8ff2e", "#ffffff"]],
  ["calc(var(--bw) + 64px)", "calc(var(--bh) * -2)", ["#8b72ff", "#c8ff2e"]],
  ["calc(var(--bw) * -1 - 56px)", "calc(var(--bh) * .3)", ["#2ee6d6", "#ffffff"]],
  ["calc(var(--bw) + 56px)", "calc(var(--bh) * .6)", ["#ff7aa8", "#c8ff2e"]],
];

/**
 * Año Nuevo, "versión 2027": abajo del logo se instala la actualización (barra de progreso que se llena de a 10 %),
 * arriba el año pasa de 2026 a 2027 y estallan los fuegos a los costados.
 */
export function NewYearScene() {
  const d = useDelay();
  return (
    <>
      <RigCss /><SceneCss id="party" css={CSS} />
      <Anchor s="0px" extra="8px">
        <p data-sc className="sc-above sc-tall ny-year font-display font-wide" style={d(0.4)}>202<Strip values={["6", "7"]} at={2.3} dur={0.01} /></p>
        <div data-sc className="sc-below ny-install font-lab" style={d(0.3)}>
          <p className="ny-label"><Strip values={["Instalando versión 2027", "Versión 2027 instalada"]} at={2.25} dur={0.01} /></p>
          <span className="ny-bar"><i style={d(0.45)} /></span>
          <p className="ny-pct"><Strip values={PCT} at={0.45} dur={1.8} /></p>
        </div>
        {FIREWORKS.map(([x, y, c], i) => <Burst key={i} x={x} y={y} at={2.35 + i * 0.22} colors={c} n={16} r="44px" />)}
      </Anchor>
    </>
  );
}

/** Corazón paramétrico clásico (x = 16 sen³t), en unidades que escala `--k`; bajado 1,25 para centrar el logo. */
const heartAt = (t: number) => [16 * Math.sin(t) ** 3, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 1.25] as const;
const HEARTS = Array.from({ length: 24 }, (_, i) => {
  const t = ((i + 0.5) / 24) * Math.PI * 2;
  const [x, y] = heartAt(t);
  return { x: x.toFixed(3), y: y.toFixed(3), from: Math.min(t, Math.PI * 2 - t) / Math.PI };
});
const OUTLINE = Array.from({ length: 97 }, (_, i) => heartAt((i / 96) * Math.PI * 2)).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("") + "Z";

/**
 * San Valentín, "entrenar de a dos": se dibuja un corazón grande alrededor del logo y 24 corazones lo recorren desde
 * el centro de arriba hasta la punta por los dos lados; late dos veces y abajo cruza la línea del pulso.
 */
export function ValentineScene() {
  const d = useDelay();
  return (
    <>
      <RigCss /><SceneCss id="party" css={CSS} />
      <div className="vl" style={d(1.85)}>
        <svg viewBox="-17 -14.5 34 31.5" preserveAspectRatio="none" className="vl-line" style={d(0.2)} aria-hidden="true">
          <path d={OUTLINE} fill="rgb(255 120 160 / .08)" stroke="#ffd1dc" strokeOpacity=".7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {HEARTS.map((h, i) => (
          <span key={i} data-sc className="vl-heart sc-pop" style={{ ...vars({ "--x": h.x, "--y": h.y }), ...d(0.3 + h.from * 1.3) }}>
            <Decor kind={i % 4 === 0 ? "pulse-heart" : "heart"} className="h-full w-full" />
          </span>
        ))}
        <div data-sc className="vl-ecg sc-tall">
          <span className="vl-win" style={d(1.1)}>
            <svg viewBox="0 0 400 40" preserveAspectRatio="none" style={d(1.1)} aria-hidden="true"><path d="M0 20H150l8-14 10 28 12-34 10 30 8-10H400" fill="none" stroke="#ffd1dc" strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" /></svg>
          </span>
        </div>
      </div>
    </>
  );
}

const CSS = `
.ny-year { color: #c8ff2e; font-size: clamp(40px, 13vw, 76px); line-height: 1.05; filter: drop-shadow(0 0 16px rgb(200 255 46 / .4)); opacity: 0; animation: sc-in 600ms ease-out both; }
.ny-install { display: grid; justify-items: center; gap: 8px; color: #e3ff8f; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; opacity: 0; animation: sc-in 400ms ease-out both; }
.ny-bar { position: relative; display: block; width: min(240px, 64vw); height: 10px; padding: 2px; border: 1px solid rgb(200 255 46 / .5); border-radius: 6px; }
.ny-bar i { display: block; height: 100%; border-radius: 3px; background: #c8ff2e; box-shadow: 0 0 10px rgb(200 255 46 / .8); transform-origin: 0 50%; transform: scaleX(0); animation: ny-fill 1.8s steps(10, end) both; }
.ny-pct { font-size: 13px; color: #fff; }
@keyframes ny-fill { to { transform: scaleX(1); } }
.vl { position: absolute; left: 50%; top: 50%; width: 0; height: 0; --s: 20px; --k: max(calc((var(--bw) + var(--s) / 2) * .106), calc((var(--bh) + var(--s) / 2) * .166)); animation: vl-beat 900ms ease-in-out both; }
@media (min-width: 640px) { .vl { --s: 28px; } }
.vl-line { position: absolute; left: calc(var(--k) * -17); top: calc(var(--k) * -14.5); width: calc(var(--k) * 34); height: calc(var(--k) * 31.5); overflow: visible; filter: drop-shadow(0 0 8px rgb(255 120 160 / .7)); opacity: 0; animation: sc-in 700ms ease-out both; }
.vl-heart { position: absolute; left: calc(var(--k) * var(--x) - var(--s) / 2); top: calc(var(--k) * var(--y) - var(--s) / 2); width: var(--s); height: var(--s); }
.vl-ecg { position: absolute; left: -50vw; width: 100vw; top: calc(var(--k) * 15.75 + var(--s) + 18px); height: 40px; }
.vl-win { position: absolute; inset: 0; overflow: hidden; transform: translateX(-100%); animation: vl-win 1.6s cubic-bezier(.6, 0, .2, 1) both; }
.vl-win svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: translateX(100%); animation: vl-trk 1.6s cubic-bezier(.6, 0, .2, 1) both; filter: drop-shadow(0 0 6px rgb(255 120 160 / .8)); }
@keyframes vl-beat { 0%, 100% { transform: none; } 20% { transform: scale(1.08); } 40% { transform: none; } 60% { transform: scale(1.05); } }
@keyframes vl-win { to { transform: translateX(0); } }
@keyframes vl-trk { to { transform: translateX(0); } }
`;
