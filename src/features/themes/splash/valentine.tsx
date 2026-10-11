"use client";
import type { CSSProperties } from "react";
import { Lola, Pancho } from "@/components/illustrations/characters";
import { SceneCss, rand, useAt } from "./kit";

const HEART = "M50 88C22 68 6 50 6 32 6 18 17 8 30 8c8 0 15 4 20 11 5-7 12-11 20-11 13 0 24 10 24 24 0 18-16 36-44 56z";
/** Hilos del plato (en la mesa de 400 × 200): arcos que arman el nido de fideos. */
const NEST = ["M164 140q36-22 72 0", "M170 136q30-20 60 2", "M160 134q40-14 78 4", "M176 130q24-14 50 2", "M168 142q32 6 64-4", "M182 126q18-10 38 2", "M158 138q20-24 50-12", "M196 124q22-6 42 12"];

/** Mesa con mantel a cuadros, plato y fideos (capa de adelante: tapa las patas de los perros). */
function Table() {
  return (
    <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <pattern id="vl-check" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#fbeef2" /><rect width="9" height="18" fill="#d9466f" opacity=".32" /><rect width="18" height="9" fill="#d9466f" opacity=".32" /></pattern>
        <pattern id="vl-check-top" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="scale(1 .42)"><rect width="18" height="18" fill="#fbeef2" /><rect width="9" height="18" fill="#d9466f" opacity=".32" /><rect width="18" height="9" fill="#d9466f" opacity=".32" /></pattern>
        <linearGradient id="vl-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".8" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <mask id="vl-mask"><rect width="400" height="200" fill="url(#vl-fade)" /></mask>
      </defs>
      <g mask="url(#vl-mask)">
        <path d="M4 146Q200 196 396 146V206H4Z" fill="url(#vl-check)" /><path d="M4 146Q200 196 396 146V206H4Z" fill="#5c1028" opacity=".28" />
        <ellipse cx="200" cy="146" rx="196" ry="30" fill="url(#vl-check-top)" />
        <ellipse cx="200" cy="146" rx="196" ry="30" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" />
      </g>
      <ellipse cx="200" cy="159" rx="80" ry="9" fill="#5c1028" opacity=".22" />
      <ellipse cx="200" cy="151" rx="76" ry="18" fill="#fffdf8" stroke="#ead9cf" strokeWidth="1.2" />
      <ellipse cx="200" cy="149" rx="54" ry="11.5" fill="#f3e9de" />
      <ellipse cx="200" cy="140" rx="40" ry="14" fill="#efbd5c" />
      <g fill="none" strokeLinecap="round" strokeWidth="2.6">{NEST.map((d, i) => <path key={d} d={d} stroke={i % 3 ? "#f4cd76" : "#e2a94a"} />)}</g>
      <path d="M184 128c4-8 28-9 33-1 3 5-5 9-16 9s-20-3-17-8z" fill="#c8343c" /><path d="M191 126c5-3 13-3 17 0" stroke="#e86a6a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="187" cy="129" r="7" fill="#7b3b24" /><circle cx="185" cy="126.5" r="2" fill="#a8603e" />
      <circle cx="213" cy="131" r="6.5" fill="#7b3b24" /><circle cx="211" cy="128.7" r="1.8" fill="#a8603e" />
      <path d="M198 121c4-6 11-6 12-2-3 4-8 5-12 2z" fill="#4e8a3a" />
    </svg>
  );
}

/**
 * San Valentín, con un guiño a "La dama y el vagabundo": Lola (la caniche del moño) y Pancho (el salchicha) cenan
 * del mismo plato y tiran de un solo fideo, tres sorbos, hasta que se tocan la nariz; cierran los ojos y nace un
 * corazón. Arriba, el logo queda dentro de un corazón grande; todo el grupo va centrado en la pantalla (el logo
 * sube con la regla de app/seasons.css). Perros y fideo se mueven con transform y los mismos tiempos, así el fideo
 * sigue pegado a las bocas aunque el teléfono esté ocupado.
 */
export function ValentineScene() {
  const at = useAt();
  const d = (s: number) => ({ animationDelay: `${at(s)}s` });
  return (
    <>
      <SceneCss id="valentin" css={CSS} />
      <svg viewBox="0 0 100 100" className="vl-heart overflow-visible" style={{ animationDelay: `${at(0.15)}s, ${at(3.1)}s` }}>
        <defs><radialGradient id="vl-glow" cx="50%" cy="42%" r="60%"><stop offset="0" stopColor="#ff7fa0" stopOpacity=".5" /><stop offset="1" stopColor="#a8274a" stopOpacity=".08" /></radialGradient></defs>
        <path d={HEART} fill="url(#vl-glow)" /><path d={HEART} fill="none" stroke="#ffd1dc" strokeWidth=".7" />
      </svg>
      <div className="vl-dinner" style={d(0.35)}>
        {[[10, 4, 24], [84, 0, 20]].map(([x, y, s], i) => (
          <span key={i} className="vl-bokeh" style={{ left: `${x}%`, top: `${y}%`, width: `${s}%`, ...d(0.5 + i * 0.15) } as CSSProperties} />
        ))}
        <div className="vl-dog vl-lola" style={{ animationDelay: `${at(0.3)}s, ${at(1.35)}s`, "--kiss": `${at(3)}s` } as CSSProperties}><Lola animated outfit={{ bow: "#e4577a" }} className="h-full w-full" /></div>
        <div className="vl-dog vl-pancho" style={{ animationDelay: `${at(0.42)}s, ${at(1.35)}s`, "--kiss": `${at(3)}s` } as CSSProperties}><Pancho animated flip className="h-full w-full" /></div>
        <svg viewBox="0 0 103.4 42" className="vl-strand overflow-visible" style={{ animationDelay: `${at(1.05)}s, ${at(1.35)}s` }}>
          <path d="M0 0C20 56 83.4 56 103.4 0" fill="none" stroke="#f4cd76" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
        <Table />
        <svg viewBox="0 0 100 100" className="vl-kiss" style={d(3.05)}><path d={HEART} fill="#ff6f93" stroke="#ffd1dc" strokeWidth="4" /></svg>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
          return <span key={i} className="vl-spark" style={{ "--tx": Math.cos(a) * (0.05 + rand(i) * 0.05), "--ty": Math.sin(a) * (0.04 + rand(i + 4) * 0.04) - 0.05, ...d(3.15 + rand(i + 9) * 0.15) } as CSSProperties} />;
        })}
      </div>
    </>
  );
}

const CSS = `
.vl-heart { position: absolute; left: 50%; top: calc(50% - var(--vl-up)); width: var(--vl-h); height: var(--vl-h); margin: calc(var(--vl-h) * -.45) 0 0 calc(var(--vl-h) / -2); filter: drop-shadow(0 0 10px rgb(255 155 179 / .55)); opacity: 0; animation: vl-heart-in 1.3s cubic-bezier(.16,1,.3,1) both, vl-beat 1s ease-in-out 1; }
@media (max-height: 560px) { .vl-heart { display: none; } }
.vl-dinner { position: absolute; left: 50%; top: calc(50% - var(--vl-up) + var(--vl-h) * .43 + 8px); width: var(--vl-w); height: calc(var(--vl-w) / 2); margin-left: calc(var(--vl-w) / -2); opacity: 0; animation: vl-rise 900ms cubic-bezier(.16,1,.3,1) both; }
.vl-bokeh { position: absolute; aspect-ratio: 1; border-radius: 9999px; background: radial-gradient(closest-side, rgb(255 214 170 / .2), transparent); opacity: 0; animation: vl-fade 1.2s ease-out both; }
.vl-dog { position: absolute; width: 44%; height: 67.7%; animation-duration: 900ms, 1.7s; animation-timing-function: cubic-bezier(.16,1,.3,1), ease-in-out; animation-fill-mode: both; }
.vl-lola { left: 1.4%; top: 14%; animation-name: vl-in-left, vl-slurp-l; }
.vl-pancho { left: 58.375%; top: 3.15%; animation-name: vl-in-right, vl-slurp-r; }
.vl-dinner .vl-dog .pup-head { animation: none; }
.vl-dinner .vl-dog .pup-eye { animation: vl-eyes 600ms ease-in-out var(--kiss) both; }
.vl-strand { position: absolute; left: 37.28%; top: 41.25%; width: 25.85%; height: 21%; transform-origin: 50% 0; opacity: 0; animation-name: vl-fade, vl-slurp-s; animation-duration: 400ms, 1.7s; animation-timing-function: ease-out, ease-in-out; animation-fill-mode: both; }
.vl-kiss { position: absolute; left: 50%; top: 25%; width: 8%; margin: -4% 0 0 -4%; overflow: visible; filter: drop-shadow(0 0 6px #ff9bb3); opacity: 0; animation: vl-kiss 1.2s cubic-bezier(.2,1.4,.4,1) both; }
.vl-spark { position: absolute; left: 50%; top: 25%; width: 2.2%; aspect-ratio: 1; margin: -1.1% 0 0 -1.1%; border-radius: 9999px; background: #ffd1dc; box-shadow: 0 0 8px #ff9bb3; opacity: 0; animation: vl-spark 1s ease-out both; }
@keyframes vl-heart-in { from { opacity: 0; transform: scale(.88); } to { opacity: 1; transform: scale(1); } }
@keyframes vl-beat { 0%, 100% { scale: 1; } 25% { scale: 1.06; } 50% { scale: 1; } 75% { scale: 1.04; } }
@keyframes vl-rise { from { opacity: 0; transform: translateY(8%); } to { opacity: 1; transform: none; } }
@keyframes vl-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes vl-in-left { from { opacity: 0; translate: -40% 0; } to { opacity: 1; translate: 0 0; } }
@keyframes vl-in-right { from { opacity: 0; translate: 40% 0; } to { opacity: 1; translate: 0 0; } }
/* Tres sorbos: cada perro se acerca 40 de los 400 de la mesa. El fideo se achica con los mismos tiempos (ancho
   1 − 0,774·p, alto 1 − 0,7·p, con p el avance): sus puntas siguen pegadas a las bocas. */
@keyframes vl-slurp-l { 0% { transform: none; } 22%, 33% { transform: translateX(8.3%); } 55%, 66% { transform: translateX(15.66%); } 100% { transform: translateX(22.73%); } }
@keyframes vl-slurp-r { 0% { transform: none; } 22%, 33% { transform: translateX(-8.3%); } 55%, 66% { transform: translateX(-15.66%); } 100% { transform: translateX(-22.73%); } }
@keyframes vl-slurp-s { 0% { transform: none; } 22%, 33% { transform: scale(.7173, .7444); } 55%, 66% { transform: scale(.4667, .5177); } 100% { transform: scale(.226, .3); } }
@keyframes vl-eyes { 0% { transform: scaleY(1); } 100% { transform: scaleY(.12); } }
@keyframes vl-kiss { 0% { opacity: 0; transform: translateY(20%) scale(0); } 40% { opacity: 1; transform: translateY(-10%) scale(1.25); } 100% { opacity: 1; transform: translateY(-30%) scale(1); } }
@keyframes vl-spark { 0% { opacity: 0; transform: translate(0, 0) scale(.4); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(calc(var(--vl-w) * var(--tx)), calc(var(--vl-w) * var(--ty))) scale(1); } }
`;
