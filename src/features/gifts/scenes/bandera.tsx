import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

const CELESTE = "#74acdf", WHITE = "#f7f9fc", GOLD = "#f6cf5a";
const HOIST = 99, W = 142, H = 90, TOP = 58; // bandera izada: borde de la driza, tamaño y altura final
// Altura y despliegue por golpe (0 = plegada abajo).
const STEP = [{ y: 144, s: 0.16 }, { y: 124, s: 0.32 }, { y: 106, s: 0.5 }, { y: 90, s: 0.66 }, { y: 74, s: 0.82 }];
const SLICES = 20, SUN = { x: HOIST + W / 2, y: TOP + H / 2 };
const CONFETTI = Array.from({ length: 30 }, (_, i) => ({ x: 14 + rand(i + 300) * 272, y: 40 + rand(i + 340) * 190, c: [CELESTE, WHITE, GOLD][i % 3] }));
const ray = (r: number, a: number) => `${(SUN.x + r * Math.cos(a)).toFixed(1)} ${(SUN.y + r * Math.sin(a)).toFixed(1)}`;

/** Día de la Bandera: el mástil con la bandera plegada. Cada golpe la iza un tramo; al abrir llega arriba y flamea. */
export default function FlagGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const st = (opened ? undefined : STEP[Math.min(hits, 4)]) ?? { y: TOP, s: 1 };
  const p = opened ? 1 : hits / total;
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits + 40} colors={[CELESTE, WHITE, GOLD]} shape="ribbon" count={7} x={(HOIST + 70 * st.s) / 3} y={(st.y + 45) / 3} spread={0.7} size={6} />}
        {opened && <RevealBurst colors={[CELESTE, WHITE, GOLD, "#ffe9a8"]} shapes={["square", "ribbon", "star"]} x={56} y={32} />}
      </>
    )}>
      <SceneStyle id="bandera" css={CSS} />
      <defs>
        <radialGradient id="bd-sky" cx=".5" cy=".45" r=".5"><stop offset="0" stopColor="#2f74ad" stopOpacity=".7" /><stop offset=".6" stopColor="#0f3f6b" stopOpacity=".45" /><stop offset="1" stopColor="#0f3f6b" stopOpacity="0" /></radialGradient>
        <linearGradient id="bd-pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fbf7ee" /><stop offset=".55" stopColor="#d9d1bd" /><stop offset="1" stopColor="#9c937d" /></linearGradient>
        <linearGradient id="bd-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfd6de" /><stop offset="1" stopColor="#7d8894" /></linearGradient>
        <radialGradient id="bd-gold" cx=".35" cy=".35" r=".7"><stop offset="0" stopColor="#fff2c2" /><stop offset="1" stopColor="#c9962e" /></radialGradient>
        <radialGradient id="bd-shine"><stop offset="0" stopColor="#fff6d2" stopOpacity=".95" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
        {/* Pliegues: franjas de sombra que se repiten a lo ancho. */}
        <linearGradient id="bd-pleat" x1="0" y1="0" x2="14" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
          <stop offset="0" stopColor="#0b2c4d" stopOpacity=".5" /><stop offset=".45" stopColor="#fff" stopOpacity=".2" /><stop offset="1" stopColor="#0b2c4d" stopOpacity=".5" />
        </linearGradient>
        {/* Ondas suaves de la tela al viento (siempre). */}
        <linearGradient id="bd-fold" x1={HOIST} y1="0" x2={HOIST + W} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0b2c4d" stopOpacity=".18" /><stop offset=".22" stopColor="#fff" stopOpacity=".16" /><stop offset=".48" stopColor="#0b2c4d" stopOpacity=".16" />
          <stop offset=".72" stopColor="#fff" stopOpacity=".14" /><stop offset="1" stopColor="#0b2c4d" stopOpacity=".24" />
        </linearGradient>
        <clipPath id="bd-edge"><path d={`M${HOIST} ${TOP}C${HOIST + 24} ${TOP - 4} ${HOIST + 47} ${TOP + 4} ${SUN.x} ${TOP}S${HOIST + W - 23} ${TOP - 4} ${HOIST + W} ${TOP + 1}V${TOP + H + 1}C${HOIST + W - 23} ${TOP + H - 4} ${SUN.x + 23} ${TOP + H + 4} ${SUN.x} ${TOP + H}S${HOIST + 24} ${TOP + H - 4} ${HOIST} ${TOP + H}Z`} /></clipPath>
        <g id="bd-art" clipPath="url(#bd-edge)">
          <rect x={HOIST} y={TOP} width={W} height={H / 3} fill={CELESTE} />
          <rect x={HOIST} y={TOP + H / 3} width={W} height={H / 3} fill={WHITE} />
          <rect x={HOIST} y={TOP + (2 * H) / 3} width={W} height={H / 3} fill={CELESTE} />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${ray(8, (i / 16) * Math.PI * 2)}L${ray(i % 2 ? 11.5 : 13.5, (i / 16) * Math.PI * 2)}`} stroke="#e0a92a" strokeWidth="1.6" strokeLinecap="round" />)}
          <circle cx={SUN.x} cy={SUN.y} r="7.5" fill="url(#bd-gold)" />
          <rect x={HOIST} y={TOP} width={W} height={H} fill="url(#bd-fold)" />
          <rect x={HOIST} y={TOP} width={W} height={H} fill="url(#bd-pleat)" className="bd-pleats" style={{ opacity: 0.9 * (1 - st.s) }} />
        </g>
        {Array.from({ length: SLICES }, (_, i) => (
          <clipPath key={i} id={`bd-c${i}`}><rect x={HOIST + (W / SLICES) * i - 0.4} y={TOP - 10} width={W / SLICES + 0.8} height={H + 20} /></clipPath>
        ))}
      </defs>
      <circle cx="150" cy="150" r="150" fill="url(#bd-sky)" />
      <Glow color={GOLD} hits={hits} total={total} opened={opened} />
      <ellipse cx="128" cy="258" rx="92" ry="9" fill="#000" opacity=".35" />

      {/* Mástil, remate dorado y roldana (gira con cada golpe). */}
      <rect x="81" y="38" width="6" height="204" rx="3" fill="url(#bd-pole)" />
      <path d="M84 20l4 9h-8z" fill={GOLD} /><circle cx="84" cy="32" r="5.5" fill="url(#bd-gold)" />
      <path d="M86 44h7" stroke="#8d8573" strokeWidth="2.4" />
      <g className="bd-pulley" style={{ transform: `rotate(${(opened ? 5 : hits) * 130}deg)` }}>
        <circle cx="93" cy="46" r="6.2" fill="#3f4a56" stroke="#20272f" strokeWidth="1" />
        <path d="M93 40.5v11M87.5 46h11" stroke="#9aa6b2" strokeWidth="1.2" /><circle cx="93" cy="46" r="1.8" fill={GOLD} />
      </g>

      {/* Driza: la soga corre con cada golpe (una mano sube, la otra baja) y el sobrante cuelga del cornamusa. */}
      <path d="M87.3 46V212" stroke="#d9c79f" strokeWidth="1.6" strokeDasharray="3 2" className="bd-rope" style={{ strokeDashoffset: -(opened ? 5 : hits) * 22 }} />
      <path d={`M${HOIST} 46V206L89 214`} stroke="#d9c79f" strokeWidth="1.6" fill="none" strokeDasharray="3 2" className="bd-rope" style={{ strokeDashoffset: (opened ? 5 : hits) * 22 }} />
      <rect x="85" y="210" width="10" height="4" rx="2" fill="#4a5562" />
      <path className="bd-coil" d="M90 214C84 236 104 240 102 222C101 214 94 218 96 228" stroke="#d9c79f" strokeWidth="1.6" fill="none" style={{ transform: `scaleY(${0.35 + 0.65 * p})` }} />

      {/* Bandera: se iza y se despliega; al abrir flamea en franjas desfasadas. */}
      <g className="bd-flag" style={{ transform: `translateY(${st.y - TOP}px)` }}>
        <g className="bd-unfurl" style={{ transform: `scaleX(${st.s})` }}>
          {Array.from({ length: SLICES }, (_, i) => (
            <g key={i} className={opened ? "bd-slice is-open" : "bd-slice"} style={{ animationDelay: `${160 + i * 20}ms` }}>
              <g clipPath={`url(#bd-c${i})`}><use href="#bd-art" /></g>
            </g>
          ))}
        </g>
        <circle cx={HOIST} cy={TOP + 4} r="2.2" fill="#8d8573" /><circle cx={HOIST} cy={TOP + H - 4} r="2.2" fill="#8d8573" />
        {opened && <circle className="bd-sunshine" cx={SUN.x} cy={SUN.y} r="34" fill="url(#bd-shine)" />}
      </g>

      {/* Pedestal de piedra. */}
      <path d="M60 256h50l-4-12H64z" fill="url(#bd-stone)" /><rect x="68" y="236" width="32" height="9" rx="2" fill="#aab4bf" />
      <path d="M64 244h42" stroke="#fff" strokeOpacity=".35" />

      {/* Confeti celeste y blanco que cae de arriba. */}
      {opened && !reduce && CONFETTI.map((c, i) => (
        <g key={i} transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${Math.round(rand(i + 7) * 180)})`}>
          <rect className="bd-conf" x="-2.5" y="-4" width="5" height="8" rx="1" fill={c.c}
            style={{ animationDelay: `${100 + (i % 6) * 80}ms`, "--from": `${-c.y - 20}px`, "--spin": `${(rand(i + 11) - 0.5) * 520}deg` } as CSSProperties} />
        </g>
      ))}
    </SceneFrame>
  );
}

const CSS = `
.bd-flag { transform-box: view-box; transform-origin: 0 0; transition: transform 650ms cubic-bezier(.34,1.4,.64,1); }
.bd-unfurl { transform-box: view-box; transform-origin: ${HOIST}px 0; transition: transform 650ms cubic-bezier(.34,1.56,.64,1); }
.bd-pleats { transition: opacity 600ms; }
.bd-pulley { transform-box: view-box; transform-origin: 93px 46px; transition: transform 650ms cubic-bezier(.16,1,.3,1); }
.bd-rope { transition: stroke-dashoffset 650ms cubic-bezier(.16,1,.3,1); }
.bd-coil { transform-box: fill-box; transform-origin: 30% 0; transition: transform 650ms cubic-bezier(.34,1.56,.64,1); }
.bd-slice.is-open { transform-box: view-box; transform-origin: ${HOIST}px ${SUN.y}px; animation: bd-wave 1s ease-in-out both; }
@keyframes bd-wave { 0% { transform: none; } 22% { transform: translateY(-7px) scaleY(1.03); } 50% { transform: translateY(6px) scaleY(.97); } 76% { transform: translateY(-3px); } 100% { transform: none; } }
.bd-sunshine { transform-box: fill-box; transform-origin: 50% 50%; animation: bd-shine 1.2s cubic-bezier(.16,1,.3,1) 300ms both; }
@keyframes bd-shine { 0% { opacity: 0; transform: scale(.3); } 40% { opacity: 1; transform: scale(1.2); } 100% { opacity: .55; transform: scale(1); } }
.bd-conf { transform-box: fill-box; transform-origin: 50% 50%; animation: bd-fall 1.3s cubic-bezier(.25,.7,.4,1) both; }
@keyframes bd-fall { 0% { opacity: 0; transform: translateY(var(--from)) rotate(0); } 15% { opacity: 1; } 100% { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .bd-flag, .bd-unfurl, .bd-pulley, .bd-rope, .bd-coil { transition: opacity 200ms; }
  .bd-slice.is-open { animation: none; }
  .bd-sunshine { animation: none; opacity: .55; }
}
`;
