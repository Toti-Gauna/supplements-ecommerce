import type { CSSProperties } from "react";
import { Pancho } from "@/components/illustrations/characters";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

const DOOR = "M124 256V214A22 22 0 0 1 168 214V256Z";
const ROOF = "M146 70L56 150Q53 158 61 161L146 89L231 161Q239 158 236 150Z";
/** Cuánto baja la cabeza del cachorro dentro de la puerta según los golpes (0 = asomado del todo). */
const PEEK = [44, 26, 14, 6, 0];
/** Huellitas en el piso: una por golpe, caminando hacia la cucha. */
const PRINTS = [[32, 282, 70], [54, 268, 100], [78, 284, 75], [100, 270, 105]];
const BONES = [[-120, -120, -200], [130, -110, 240], [-150, -10, -160], [150, -20, 200], [-40, -160, 120], [60, -165, -140]];
const bone = <><rect x="-8" y="-2.6" width="16" height="5.2" fill="#f3dca6" />{[[-8, -2.6], [-8, 2.6], [8, -2.6], [8, 2.6]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.3" fill="#f3dca6" />)}</>;
const paw = <><ellipse cy="2" rx="4.6" ry="3.8" /><circle cx="-4.6" cy="-3.4" r="1.9" /><circle cx="-1.6" cy="-5.8" r="1.9" /><circle cx="1.8" cy="-5.8" r="1.9" /><circle cx="4.8" cy="-3.4" r="1.9" /></>;

/** Cara del cachorro (colores de Pancho): orejas caídas que se mueven, ojos con brillo y, contento, la lengua afuera. */
function PeekingPup({ happy, beat }: { happy: boolean; beat: string }) {
  return (
    <g transform="translate(146 230) scale(1.15)">
      {[1, -1].map((side) => (
        <g key={side} transform={`scale(${side} 1)`}>
          <g className={beat && `an-cu-ear-${beat}`} style={{ transformOrigin: "-10px -9px" }}>
            <path d="M-10-10C-20-11-24 0-20 11C-18 16-12 14-11 8C-10 3-9-4-10-10Z" fill="#6e3f26" />
          </g>
        </g>
      ))}
      <ellipse rx="14" ry="13" fill="#a8743f" />
      <path d="M-9-11Q0-17 9-11" stroke="#8a5232" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cy="6.5" rx="8.5" ry="6.5" fill="#d9a16b" />
      {happy ? (
        <>
          <path d="M-8.5-2.5Q-5.5-6-2.5-2.5M2.5-2.5Q5.5-6 8.5-2.5" stroke="#1a120b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-2.4 9.5Q0 17 2.4 9.5Z" fill="#e86a7c" />
          <circle cx="-10" cy="4" r="2.4" fill="#e86a7c" opacity=".45" /><circle cx="10" cy="4" r="2.4" fill="#e86a7c" opacity=".45" />
        </>
      ) : (
        <g className={beat && `an-cu-blink-${beat}`}>
          <circle cx="-5.5" cy="-3" r="2.9" fill="#1a120b" /><circle cx="5.5" cy="-3" r="2.9" fill="#1a120b" />
          <circle cx="-6.4" cy="-4" r="1" fill="#fff" /><circle cx="4.6" cy="-4" r="1" fill="#fff" />
        </g>
      )}
      <ellipse cy="3.2" rx="3.6" ry="2.6" fill="#2a1a0f" /><ellipse cx="-1" cy="2.4" rx="1.1" ry=".7" fill="#fff" opacity=".6" />
      <path d="M-3.5 8.6Q0 11.4 3.5 8.6" stroke="#2a1a0f" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Día del Animal: la cucha de Pancho. Se sacude, aparecen huellitas y un cachorro asoma por la puerta; al abrir se levanta el techo y sale Pancho. */
export default function AnimalGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const pick = (v: number[]) => (opened ? v[4] : v[Math.min(hits, 4)]) ?? 0;
  const beat = hits > 0 && !opened ? (hits % 2 ? "a" : "b") : "";
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits * 13} colors={["#c99258", "#8e3b24", "#f3dca6"]} shape="square" count={7} y={34} spread={0.7} size={5} />}
        {opened && (
          <>
            <RevealBurst colors={["#f3dca6", "#ff8fa3", "#d2ad69", "#ffffff"]} shapes={["heart", "dot", "star"]} y={38} />
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="an-cu-heart absolute h-3.5 w-3.5" style={{ left: `${36 + rand(i) * 30}%`, top: `${28 + rand(i + 5) * 10}%`, animationDelay: `${450 + i * 120}ms`, "--drift": `${(rand(i * 7) - 0.5) * 90}px` } as CSSProperties} />
            ))}
          </>
        )}
      </>
    )}>
      <SceneStyle id="dia-del-animal" css={CSS} />
      <defs>
        <linearGradient id="an-cu-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d09a60" /><stop offset=".6" stopColor="#b07a45" /><stop offset="1" stopColor="#7f5230" /></linearGradient>
        <linearGradient id="an-cu-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c0623e" /><stop offset=".5" stopColor="#9c4a2c" /><stop offset="1" stopColor="#6e2f1b" /></linearGradient>
        <linearGradient id="an-cu-hole" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f0a06" /><stop offset="1" stopColor="#2a1c10" /></linearGradient>
        <linearGradient id="an-cu-bowl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e6c487" /><stop offset=".6" stopColor="#d2ad69" /><stop offset="1" stopColor="#8a6a2e" /></linearGradient>
        <clipPath id="an-cu-door"><path d={DOOR} /></clipPath>
      </defs>
      <Glow color="#f3dca6" hits={hits} total={total} opened={opened} />
      <ellipse cx="160" cy="258" rx="108" ry="10" fill="#000" opacity=".35" />

      {/* Huellitas: aparecen de a una, como sellos. */}
      {PRINTS.map(([x, y, r], i) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${r}) scale(1.25)`}><g className={`an-cu-print ${hits > i || opened ? "is-on" : ""}`} fill="#f3dca6">{paw}</g></g>
      ))}

      {/* Platito con hueso: el hueso salta con cada golpe. */}
      <g className={beat && `an-cu-hop-${beat}`}>
        <g transform="translate(241 238) rotate(-8)">{bone}</g>
      </g>
      <path d="M216 242H266L259 257H223Z" fill="url(#an-cu-bowl)" /><ellipse cx="241" cy="242" rx="25" ry="4" fill="#8a6a2e" /><path d="M222 247H260" stroke="#fff" strokeOpacity=".3" strokeWidth="2" />
      <text x="241" y="254" textAnchor="middle" fontFamily="var(--font-display, serif)" fontSize="7" fontWeight="700" fill="#5b4318" letterSpacing="1">P</text>

      {/* La cucha: se sacude con cada golpe (alterna la animación para que se reinicie). */}
      <g className={beat && `an-cu-shake-${beat}`}>
        {opened && <path d="M84 150H208L200 141H92Z" fill="#3a2614" />}

        {/* Pancho sale de adentro con un moño de regalo en la cabeza. */}
        {opened && (
          <g className="an-cu-pup">
            <g transform="translate(63 45) scale(.5)"><Pancho pose="wave" animated={!reduce} className="pup-brief" /></g>
            <g transform="translate(176 85) rotate(-14)">
              <path d="M0 0C-10-12-24-8-20 2C-17 9-6 6 0 0ZM0 0C10-12 24-8 20 2C17 9 6 6 0 0Z" fill="#e0484f" />
              <path d="M-2 1L-9 14L-4 12L-2 16ZM2 1L9 14L4 12L2 16Z" fill="#a82b33" /><circle r="4.5" fill="#c8323a" /><path d="M-15-3Q-10-7-4-2M15-3Q10-7 4-2" stroke="#ff9aa0" strokeWidth="1.4" fill="none" />
            </g>
          </g>
        )}

        {/* Paredes de madera con el cartel y la puerta. */}
        <rect x="84" y="150" width="124" height="106" fill="url(#an-cu-wood)" />
        {[163, 176, 189, 202, 215, 228, 241].map((y) => <path key={y} d={`M84 ${y}H208`} stroke="#6e4527" strokeOpacity=".35" strokeWidth="1.2" />)}
        <rect x="84" y="150" width="124" height="5" fill="#6e4527" /><rect x="84" y="150" width="6" height="106" fill="#6e4527" opacity=".7" /><rect x="202" y="150" width="6" height="106" fill="#5a381f" opacity=".8" />
        <path d={DOOR} fill="url(#an-cu-hole)" stroke="#6e4527" strokeWidth="4" />
        {/* Un cachorro asoma por la puerta: con cada golpe sube un poco más, mira, mueve las orejas y al final se pone contento. */}
        <g clipPath="url(#an-cu-door)">
          <g className="an-cu-peek" data-peek={opened ? "out" : Math.min(hits, 4)} style={{ transform: `translateY(${opened ? 46 : PEEK[Math.min(hits, 4)] ?? 0}px)` }}>
            <g className={beat && `an-cu-tilt-${beat}`}><PeekingPup happy={hits >= 3} beat={beat} /></g>
          </g>
        </g>
        {/* Las patitas se apoyan en el umbral cuando ya asomó la cara. */}
        <g className={`an-cu-paws ${hits >= 2 && !opened ? "is-on" : ""}`} fill="#a8743f" stroke="#6e3f26" strokeWidth="1.2">
          <ellipse cx="136" cy="254" rx="6.5" ry="4" /><ellipse cx="156" cy="254" rx="6.5" ry="4" />
          <path d="M133 254v2.4M136 254.4v2.6M139 254v2.4M153 254v2.4M156 254.4v2.6M159 254v2.4" stroke="#6e3f26" strokeWidth=".9" strokeLinecap="round" />
        </g>
        <g className="an-cu-sign" style={{ transform: `rotate(${opened ? -3 : pick([-2, 4, -6, 7, -9])}deg)` }}>
          <rect x="108" y="161" width="76" height="21" rx="3" fill="#f3dca6" stroke="#8a6a2e" strokeWidth="1.5" />
          <text x="146" y="176" textAnchor="middle" fontFamily="var(--font-display, serif)" fontSize="11.5" fontWeight="800" fill="#3a2a14" letterSpacing="1.5">PANCHO</text>
          <circle cx="113" cy="171.5" r="1.5" fill="#8a6a2e" /><circle cx="179" cy="171.5" r="1.5" fill="#8a6a2e" />
        </g>

        {/* Techo a dos aguas con el frontón: se afloja con los golpes y al abrir se levanta. */}
        <g className={`an-cu-roof ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `translateY(${pick([0, -1, -2, -4, -7])}px) rotate(${pick([0, -1, 1.5, -2, 2.5])}deg)` }}>
          <g className={beat && `an-cu-rattle-${beat}`}>
            <path d="M84 151L146 95L208 151Z" fill="url(#an-cu-wood)" /><path d="M115 151V123M146 151V96M177 151V123" stroke="#6e4527" strokeOpacity=".35" strokeWidth="1.2" />
            <circle cx="146" cy="128" r="11" fill="#2e2216" stroke="#6e4527" strokeWidth="2.5" />
            <g transform="translate(146 129) scale(1.05)" fill="#f3dca6">{paw}</g>
            <path d={ROOF} fill="url(#an-cu-roof)" />
            <path d="M139 84L66 149M153 84L226 149" stroke="#5a2414" strokeOpacity=".5" strokeWidth="2" strokeDasharray="9 5" />
            <path d="M146 72L58 151M146 72L234 151" stroke="#d97a52" strokeOpacity=".6" strokeWidth="1.5" />
            <rect x="138" y="66" width="16" height="10" rx="4" fill="#6e2f1b" />
          </g>
        </g>
      </g>
      {/* Pastito al pie de la cucha. */}
      <path d="M80 258q2-9 5-1q1-8 4 0q2-6 4 1M200 258q2-8 4 0q2-9 5-1q1-6 3 1" stroke="#7a8a4f" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Huesitos que salen volando. */}
      {opened && !reduce && BONES.map(([tx, ty, r], i) => (
        <g key={i} transform="translate(146 140)">
          <g className="an-cu-bone" style={{ "--tx": `${tx}px`, "--ty": `${ty}px`, "--r": `${r}deg`, animationDelay: `${150 + i * 60}ms` } as CSSProperties}>{bone}</g>
        </g>
      ))}
    </SceneFrame>
  );
}

const CSS = `
.an-cu-print { transform-box: fill-box; transform-origin: 50% 50%; opacity: 0; transform: scale(1.8); transition: transform 380ms cubic-bezier(.34,1.56,.64,1), opacity 300ms; }
.an-cu-print.is-on { opacity: .75; transform: none; }
.an-cu-sign { transform-box: view-box; transform-origin: 146px 162px; transition: transform 500ms cubic-bezier(.34,1.56,.64,1); }
.an-cu-roof { transform-box: view-box; transform-origin: 146px 152px; transition: transform 380ms cubic-bezier(.34,1.56,.64,1); }
.an-cu-peek { transition: transform 450ms cubic-bezier(.34,1.56,.64,1); }
.an-cu-paws { opacity: 0; transform: translateY(4px); transition: opacity 250ms, transform 350ms cubic-bezier(.34,1.56,.64,1); }
.an-cu-paws.is-on { opacity: 1; transform: none; }
/* Cada golpe reinicia su animación alternando dos nombres iguales (a/b) sin remontar. */
.an-cu-shake-a, .an-cu-shake-b { transform-box: view-box; transform-origin: 146px 256px; }
.an-cu-shake-a { animation: an-cu-shake 520ms ease-out both; }
.an-cu-shake-b { animation: an-cu-shake2 520ms ease-out both; }
@keyframes an-cu-shake { 0%, 100% { transform: none; } 20% { transform: rotate(-2.5deg); } 45% { transform: rotate(2deg); } 70% { transform: rotate(-1deg); } }
@keyframes an-cu-shake2 { 0%, 100% { transform: none; } 20% { transform: rotate(2.5deg); } 45% { transform: rotate(-2deg); } 70% { transform: rotate(1deg); } }
.an-cu-rattle-a { animation: an-cu-rattle 480ms cubic-bezier(.3,.7,.4,1) both; }
.an-cu-rattle-b { animation: an-cu-rattle2 480ms cubic-bezier(.3,.7,.4,1) both; }
@keyframes an-cu-rattle { 0%, 100% { transform: none; } 30% { transform: translateY(-9px); } 60% { transform: translateY(1px); } }
@keyframes an-cu-rattle2 { 0%, 100% { transform: none; } 30% { transform: translateY(-9px); } 60% { transform: translateY(1px); } }
/* El cachorro ladea la cabeza, sacude las orejas y parpadea con cada golpe (una vez, sin quedar en loop). */
.an-cu-tilt-a, .an-cu-tilt-b { transform-box: view-box; transform-origin: 146px 246px; }
.an-cu-tilt-a { animation: an-cu-tilt 640ms cubic-bezier(.34,1.56,.64,1) both; }
.an-cu-tilt-b { animation: an-cu-tilt2 640ms cubic-bezier(.34,1.56,.64,1) both; }
@keyframes an-cu-tilt { 0%, 100% { transform: none; } 40% { transform: rotate(-9deg); } 75% { transform: rotate(3deg); } }
@keyframes an-cu-tilt2 { 0%, 100% { transform: none; } 40% { transform: rotate(9deg); } 75% { transform: rotate(-3deg); } }
.an-cu-ear-a { animation: an-cu-ear 300ms ease-in-out 2 alternate both; }
.an-cu-ear-b { animation: an-cu-ear2 300ms ease-in-out 2 alternate both; }
@keyframes an-cu-ear { from { rotate: 0deg; } to { rotate: -16deg; } }
@keyframes an-cu-ear2 { from { rotate: 0deg; } to { rotate: -16deg; } }
.an-cu-blink-a, .an-cu-blink-b { transform-box: fill-box; transform-origin: 50% 50%; }
.an-cu-blink-a { animation: an-cu-blink 360ms ease-in-out 280ms both; }
.an-cu-blink-b { animation: an-cu-blink2 360ms ease-in-out 280ms both; }
@keyframes an-cu-blink { 0%, 100% { transform: none; } 50% { transform: scaleY(.1); } }
@keyframes an-cu-blink2 { 0%, 100% { transform: none; } 50% { transform: scaleY(.1); } }
.an-cu-hop-a { animation: an-cu-hop 520ms cubic-bezier(.3,.7,.4,1) both; }
.an-cu-hop-b { animation: an-cu-hop2 520ms cubic-bezier(.3,.7,.4,1) both; }
@keyframes an-cu-hop { 0%, 100% { transform: none; } 35% { transform: translateY(-14px); } 65% { transform: translateY(1px); } }
@keyframes an-cu-hop2 { 0%, 100% { transform: none; } 35% { transform: translateY(-14px); } 65% { transform: translateY(1px); } }
.an-cu-roof.is-open { animation: an-cu-roof 1.1s cubic-bezier(.3,.7,.4,1) both; }
@keyframes an-cu-roof { 0% { transform: none; } 28% { transform: translateY(-46px) rotate(-5deg); } 100% { transform: translate(-30px,-190px) rotate(-22deg); opacity: 0; } }
.an-cu-pup { animation: an-cu-pup 900ms cubic-bezier(.34,1.56,.64,1) 280ms both; }
@keyframes an-cu-pup { from { transform: translateY(72px); } to { transform: none; } }
.an-cu-bone { transform-box: fill-box; transform-origin: 50% 50%; opacity: 0; animation: an-cu-bone 1.3s cubic-bezier(.25,.6,.4,1) both; }
@keyframes an-cu-bone { 0% { opacity: 0; transform: translate(0,0) scale(.4) rotate(0); } 12% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1.3) rotate(var(--r)); } }
.an-cu-heart { background: #ff8fa3; clip-path: path('M7 12.6C1.4 8.4 0 5.6 0 3.6 0 1.4 1.7 0 3.6 0 5 0 6.2.8 7 2.1 7.8.8 9 0 10.4 0 12.3 0 14 1.4 14 3.6 14 5.6 12.6 8.4 7 12.6Z'); opacity: 0; animation: an-cu-heart 2s ease-out both; }
@keyframes an-cu-heart { 0% { opacity: 0; transform: translate(0,0) scale(.5); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--drift), -110px) scale(1.1); } }
@media (prefers-reduced-motion: reduce) {
  .an-cu-print, .an-cu-sign, .an-cu-roof, .an-cu-peek, .an-cu-paws { transition: opacity 200ms; }
  .an-cu-shake-a, .an-cu-shake-b, .an-cu-rattle-a, .an-cu-rattle-b, .an-cu-tilt-a, .an-cu-tilt-b, .an-cu-ear-a, .an-cu-ear-b, .an-cu-blink-a, .an-cu-blink-b, .an-cu-hop-a, .an-cu-hop-b, .an-cu-pup { animation: none; }
  .an-cu-roof.is-open { animation: none; opacity: 0; }
}
`;
