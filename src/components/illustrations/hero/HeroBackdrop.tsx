import type { ReactNode } from "react";
import { brand } from "@/config/brand";

/**
 * Fondo de la escena del carrusel (lienzo 1000 × 640, horizonte en y = 440): un box de noche con paneles de pared,
 * racks de mancuernas a contraluz, dos tubos de neón (acento de temporada), el reflector con su cono, bruma y el
 * piso de caucho con carriles en perspectiva. `figure` (el atleta) va detrás de los racks. Los ids llevan `uid`
 * porque puede haber varias escenas por página.
 */
const HORIZON = 440;
const VP = { x: 500, y: 250 };

/** Juntas de los paneles de la pared y líneas del piso hacia el punto de fuga (un solo trazo cada uno). */
const WALL = Array.from({ length: 13 }, (_, i) => `M${i * 84 - 4} 0V${HORIZON}`).join("") + `M0 62H1000M0 ${HORIZON - 96}H1000`;
const FLOOR = [
  ...Array.from({ length: 15 }, (_, i) => {
    const xb = -620 + i * 160;
    const xh = VP.x + (xb - VP.x) * ((HORIZON - VP.y) / (640 - VP.y));
    return `M${xb} 640L${xh.toFixed(1)} ${HORIZON}`;
  }),
  ...[452, 470, 498, 540, 600].map((y) => `M0 ${y}H1000`),
].join("");

/** Mancuernas apoyadas en un rack de dos estantes, a contraluz contra la bruma. */
function dumbbells(x0: number, count: number): string {
  return Array.from({ length: count * 2 }, (_, k) => {
    const row = k % 2, i = Math.floor(k / 2);
    const x = x0 + i * 46 + row * 10, y = row ? 404 : 372, s = 1 - row * 0.12 + (i % 3) * 0.04;
    const h = 22 * s, w = 9 * s;
    return `M${x} ${y - h / 2}h${w}v${h}h-${w}ZM${x + w} ${y - 2}h${16 * s}v4h-${16 * s}ZM${x + w + 16 * s} ${y - h / 2}h${w}v${h}h-${w}Z`;
  }).join("");
}

const DUST: [number, number, number][] = [[478, 120, 1.6], [522, 168, 1.1], [455, 214, 1.4], [548, 236, 1], [430, 300, 1.8], [575, 290, 1.2], [500, 252, 0.9], [404, 372, 1.3], [598, 360, 1.5], [520, 330, 1], [470, 404, 1.2], [612, 420, 0.9]];

export function HeroBackdrop({ uid, figure }: { uid: string; figure?: ReactNode }) {
  const id = (k: string) => `${uid}-${k}`;
  const plasma = brand.signature.plasma;
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={id("wall")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07090c" /><stop offset=".75" stopColor="#12161c" /><stop offset="1" stopColor="#191e25" /></linearGradient>
        <linearGradient id={id("floor")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14181e" /><stop offset=".4" stopColor="#0a0c10" /><stop offset="1" stopColor="#040506" /></linearGradient>
        <radialGradient id={id("haze")} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor={plasma} stopOpacity=".26" /><stop offset=".6" stopColor={plasma} stopOpacity=".07" /><stop offset="1" stopColor={plasma} stopOpacity="0" /></radialGradient>
        <radialGradient id={id("white")} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#f4f1e8" stopOpacity=".5" /><stop offset=".45" stopColor="#f4f1e8" stopOpacity=".12" /><stop offset="1" stopColor="#f4f1e8" stopOpacity="0" /></radialGradient>
        <linearGradient id={id("cone")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf8ef" stopOpacity=".34" /><stop offset=".7" stopColor="#fbf8ef" stopOpacity=".08" /><stop offset="1" stopColor="#fbf8ef" stopOpacity=".02" /></linearGradient>
        <linearGradient id={id("steel")} x1="0" x2="1"><stop offset="0" stopColor="#1c2025" /><stop offset=".5" stopColor="#4d545b" /><stop offset="1" stopColor="#15181b" /></linearGradient>
      </defs>
      <rect width="1000" height={HORIZON} fill={`url(#${id("wall")})`} />
      <path d={WALL} stroke="#fff" strokeOpacity=".035" strokeWidth="2" />
      <ellipse cx="500" cy="390" rx="560" ry="230" fill={`url(#${id("haze")})`} />
      <path d={`M60 150H330M670 150H940`} className="hs-neon" strokeWidth="5" strokeLinecap="square" />
      {figure}
      <path d={dumbbells(38, 7)} fill="#0f1217" stroke="#323a44" strokeOpacity=".6" strokeWidth="1" />
      <path d={dumbbells(668, 7)} fill="#0f1217" stroke="#323a44" strokeOpacity=".6" strokeWidth="1" />
      <path d="M30 420H366M660 420H996M30 388H366M660 388H996" stroke="#2a3038" strokeWidth="4" />
      <rect y={HORIZON} width="1000" height={640 - HORIZON} fill={`url(#${id("floor")})`} />
      <path d={FLOOR} stroke="#f2f0ea" strokeOpacity=".06" strokeWidth="1.5" />
      <path d="M402 640L466 440M598 640L534 440" stroke="#f2f0ea" strokeOpacity=".16" strokeWidth="5" strokeDasharray="26 18" />
      <g className="rk-spot">
        <path d="M462 34h76l290 560H172Z" fill={`url(#${id("cone")})`} />
        <path d="M484 34h32l140 520H344Z" fill="#fbf8ef" opacity=".07" />
        <ellipse cx="500" cy="560" rx="360" ry="78" fill={`url(#${id("white")})`} />
        {DUST.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.25 + (i % 3) * 0.12} />)}
        <ellipse cx="500" cy="34" rx="200" ry="2.5" fill="#fffdf5" opacity=".55" />
        <circle cx="500" cy="34" r="46" fill={`url(#${id("white")})`} />
      </g>
      <path d="M452 0h96l-12 32h-72Z" fill={`url(#${id("steel")})`} />
      <ellipse cx="500" cy="33" rx="36" ry="4" fill="#fffdf5" />
    </g>
  );
}
