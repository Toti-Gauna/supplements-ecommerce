"use client";
import type { CSSProperties } from "react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { SceneCss, rand, useAt } from "./kit";

const BACK = 10;
const FRONT = 10;
const STAMENS = 18;
const TULIPS = [0.9, 1.2, 1, 1.35, 1, 1.15, 0.85];

/** Pétalo con la base abajo al centro (100 × 160): degradé de la base a la punta, nervio y borde de luz. */
function Petal({ id, tones }: { id: string; tones: [string, string, string] }) {
  return (
    <svg viewBox="0 0 100 160" preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={tones[0]} /><stop offset=".55" stopColor={tones[1]} /><stop offset="1" stopColor={tones[2]} />
        </linearGradient>
      </defs>
      <path d="M50 160C20 132 2 78 18 36 27 13 41 3 50 0c9 3 23 13 32 36 16 42-2 96-32 124z" fill={`url(#${id})`} stroke="rgb(255 240 246 / .45)" strokeWidth="1.2" />
      <path d="M50 152C48 110 48 64 50 22" fill="none" stroke="rgb(255 255 255 / .28)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Día de la Madre: una flor se abre alrededor del logo, pétalo por pétalo (diez de atrás y diez de adelante),
 * aparecen los estambres en ronda y se sueltan unos pétalos. El logo queda en el corazón de la flor sobre un fondo
 * más hondo: ningún disco dorado le pasa por encima. Abajo nacen tulipanes. Solo transform y opacity.
 */
export function MothersScene() {
  const at = useAt();
  const d = (s: number) => ({ animationDelay: `${at(s)}s` });
  return (
    <>
      <SceneCss id="madre" css={CSS} />
      <div className="md-bloom" style={d(0)}>
        <span className="md-heart" style={d(0.1)} />
        {Array.from({ length: BACK }, (_, i) => (
          <span key={`b${i}`} className="md-slot md-back" style={{ rotate: `${i * (360 / BACK)}deg` } as CSSProperties}>
            <span className="md-petal" style={d(0.2 + i * 0.1)}><Petal id={`md-b${i}`} tones={["#b8346a", "#ee8fb5", "#ffd9e7"]} /></span>
          </span>
        ))}
        {Array.from({ length: FRONT }, (_, i) => (
          <span key={`f${i}`} className="md-slot md-front" style={{ rotate: `${18 + i * (360 / FRONT)}deg` } as CSSProperties}>
            <span className="md-petal" style={d(0.95 + i * 0.08)}><Petal id={`md-f${i}`} tones={["#d6497f", "#f7b3cd", "#fff0f5"]} /></span>
          </span>
        ))}
        {Array.from({ length: STAMENS }, (_, i) => (
          <span key={`s${i}`} className="md-stamen-slot" style={{ rotate: `${i * (360 / STAMENS)}deg` } as CSSProperties}>
            <span className="md-stamen" style={d(1.75 + i * 0.03)} />
          </span>
        ))}
      </div>
      {Array.from({ length: 10 }, (_, i) => (
        <span key={`p${i}`} className="md-fall" style={{ left: `${8 + rand(i + 40) * 84}%`, "--sx": `${(rand(i + 3) - 0.5) * 18}vmin`, animationDuration: `${2.6 + rand(i + 9) * 1.4}s`, ...d(1.9 + rand(i + 21) * 1.1) } as CSSProperties} />
      ))}
      <div className="md-tulips">
        {TULIPS.map((s, i) => (
          <span key={i} className="md-tulip" style={{ width: `calc(${s * 0.86} * var(--tu))`, height: `calc(${s} * var(--tu))`, "--sway": `${i % 2 ? 4 : -4}deg`, animationDelay: `${at(0.6 + i * 0.1)}s, ${at(1.8 + i * 0.1)}s` } as CSSProperties}>
            <Decor kind="tulip" className="h-full w-full" />
          </span>
        ))}
      </div>
    </>
  );
}

const CSS = `
/* La flor entera (radio r0 + len) no pasa del 37 % del alto: en un iPad apaisado no pisa el rótulo ni los tulipanes. */
.md-bloom { --r0: clamp(108px, 30vmin, 160px); --len: clamp(56px, min(18vmin, calc(37vh - var(--r0))), 150px); position: absolute; left: 50%; top: 50%; width: 0; height: 0; animation: md-turn 4.4s cubic-bezier(.3,0,.2,1) both; }
@media (min-width: 640px) and (min-height: 561px) { .md-bloom { --r0: clamp(140px, 30vmin, 160px); } }
@media (max-height: 560px) { .md-bloom { --r0: 104px; --len: 56px; } .md-tulips { --tu: 8vh; } }
.md-heart { position: absolute; left: calc(var(--r0) * -1.08); top: calc(var(--r0) * -1.08); width: calc(var(--r0) * 2.16); height: calc(var(--r0) * 2.16); border-radius: 9999px; background: radial-gradient(closest-side, rgb(64 14 38 / .62), rgb(64 14 38 / .38) 72%, transparent); opacity: 0; animation: md-fade 900ms ease-out both; }
.md-slot { position: absolute; left: calc(var(--w) / -2); width: var(--w); transform-origin: 50% 100%; }
.md-back { --l: var(--len); --w: calc(var(--len) * 1.1); top: calc((var(--r0) + var(--l)) * -1); height: calc(var(--r0) + var(--l)); }
.md-front { --l: calc(var(--len) * .7); --w: calc(var(--len) * .8); top: calc((var(--r0) + var(--l)) * -1); height: calc(var(--r0) + var(--l)); }
.md-petal { position: absolute; left: 0; top: 0; width: 100%; height: var(--l); transform-origin: 50% 100%; opacity: 0; animation: md-open 1.15s cubic-bezier(.16,1,.3,1) both; filter: drop-shadow(0 6px 10px rgb(60 10 34 / .35)); }
.md-stamen-slot { position: absolute; left: -3px; top: calc(var(--r0) * -1 + 4px); width: 6px; height: calc(var(--r0) - 4px); transform-origin: 50% 100%; }
.md-stamen { position: absolute; left: 0; top: 0; width: 6px; height: 6px; border-radius: 9999px; background: #ffe0a8; box-shadow: 0 0 8px rgb(255 224 168 / .8); opacity: 0; animation: md-pop 500ms cubic-bezier(.2,1.4,.4,1) both; }
.md-fall { position: absolute; top: 40%; width: 1.6vmin; height: 2.2vmin; border-radius: 60% 10%; background: #f5a8c6; opacity: 0; animation-name: md-fall; animation-timing-function: linear; animation-fill-mode: both; }
.md-fall:nth-child(3n) { background: #ffd1dc; }
.md-fall:nth-child(3n+1) { background: #e4577a; }
.md-tulips { --tu: min(9vh, 16vmin); position: absolute; inset-inline: 0; bottom: 0; display: flex; align-items: flex-end; justify-content: space-around; }
.md-tulip { display: block; transform-origin: 50% 100%; transform: scaleY(0); animation: md-grow 1s cubic-bezier(.16,1,.3,1) both, md-sway 1.2s ease-in-out 2 alternate; }
@keyframes md-turn { from { transform: rotate(-22deg) scale(.94); } to { transform: rotate(8deg) scale(1); } }
@keyframes md-fade { to { opacity: 1; } }
@keyframes md-open { 0% { opacity: 0; transform: scale(.3, 0) rotate(-18deg); } 45% { opacity: 1; } 100% { opacity: 1; transform: none; } }
@keyframes md-pop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
@keyframes md-fall { 0% { opacity: 0; transform: translate(0, 0) rotate(0); } 12% { opacity: .9; } 50% { transform: translate(var(--sx), 30vh) rotate(260deg); } 100% { opacity: 0; transform: translate(0, 62vh) rotate(520deg); } }
@keyframes md-grow { to { transform: scaleY(1); } }
@keyframes md-sway { from { transform: rotate(0); } to { transform: rotate(var(--sway)); } }
`;
