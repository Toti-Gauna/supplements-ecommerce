import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle } from "./kit";
import type { GiftSceneProps } from "./types";

const GOLD = "#e9c27a", STEEL = "#2e4862", NIGHT = "#16222f";
// Tornillos de la tapa: posición, golpe que lo hace saltar y giro de la ranura.
const SCREWS = [{ x: 82, at: 1, a: 20 }, { x: 116, at: 4, a: -35 }, { x: 150, at: 5, a: 10 }, { x: 184, at: 3, a: 60 }, { x: 218, at: 2, a: -15 }];
const SCREW_Y = 149;
const LIFT = [0, -1, -2, -3.5, -5], TILT = [0, -1.2, 1.5, -2, 2.6];
const LID = "M58 156L66 126Q68 120 74 120H226Q232 120 234 126L242 156Z";
// Destellos alrededor de lo que sale de la caja.
const SPARKS = [{ x: 86, y: 74, s: 1 }, { x: 214, y: 102, s: 0.8 }, { x: 108, y: 34, s: 0.7 }, { x: 200, y: 36, s: 1.1 }, { x: 236, y: 66, s: 0.6 }, { x: 66, y: 116, s: 0.7 }];

function Screw({ a }: { a: number }) {
  return (
    <>
      <circle r="6.6" fill="url(#pd-screw)" stroke="#8a6a2e" strokeWidth="1" />
      <path d="M-3.6 0H3.6M0-3.6V3.6" stroke="#6b4f1e" strokeWidth="1.7" strokeLinecap="round" transform={`rotate(${a})`} />
    </>
  );
}

const sparkle = "M0-10C1 -3 3 -1 10 0C3 1 1 3 0 10C-1 3-3 1-10 0C-3-1-1-3 0-10Z";

/** Día del Padre: caja de herramientas atornillada. Cada golpe hace saltar un tornillo; al abrir sube el regalo de papá. */
export default function FatherGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const h = opened ? 4 : Math.min(hits, 4);
  const lift = LIFT[h] ?? 0, tilt = TILT[h] ?? 0;
  const leak = [0, 0.25, 0.45, 0.65, 0.85][hits] ?? 0.85;
  const last = SCREWS.find((s) => s.at === hits);
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {last && !opened && <Debris key={hits} seed={hits + 80} colors={[GOLD, "#fff1c9", "#9aa6b2"]} shape="star" count={7} x={last.x / 3} y={SCREW_Y / 3} spread={0.6} size={6} />}
        {opened && <RevealBurst colors={[GOLD, "#fff1c9", "#7d9cbc", "#ffffff"]} shapes={["star", "square"]} y={36} />}
      </>
    )}>
      <SceneStyle id="padre" css={CSS} />
      <defs>
        <radialGradient id="pd-sky" cx=".5" cy=".46" r=".5"><stop offset="0" stopColor={STEEL} stopOpacity=".75" /><stop offset=".6" stopColor={NIGHT} stopOpacity=".5" /><stop offset="1" stopColor={NIGHT} stopOpacity="0" /></radialGradient>
        <linearGradient id="pd-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3d6083" /><stop offset=".45" stopColor={STEEL} /><stop offset="1" stopColor="#1d3045" /></linearGradient>
        <linearGradient id="pd-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a7ea3" /><stop offset="1" stopColor="#34557a" /></linearGradient>
        <linearGradient id="pd-sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".3" stopColor="#fff" stopOpacity=".14" /><stop offset=".42" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <radialGradient id="pd-screw" cx=".35" cy=".35" r=".75"><stop offset="0" stopColor="#fff3cf" /><stop offset=".55" stopColor={GOLD} /><stop offset="1" stopColor="#b08a3e" /></radialGradient>
        <linearGradient id="pd-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2f5f8" /><stop offset=".5" stopColor="#b9c4cf" /><stop offset="1" stopColor="#7b8896" /></linearGradient>
        <radialGradient id="pd-glow"><stop offset="0" stopColor="#fff1c9" stopOpacity=".95" /><stop offset=".5" stopColor={GOLD} stopOpacity=".35" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
        <clipPath id="pd-mouth"><rect x="0" y="-40" width="300" height="194" /></clipPath>
      </defs>
      <circle cx="150" cy="150" r="150" fill="url(#pd-sky)" />
      <Glow color={GOLD} hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="258" rx="104" ry="9" fill="#000" opacity=".4" />

      {/* Cuerpo metálico con refuerzos dorados y la chapa. */}
      <rect x="62" y="152" width="176" height="98" rx="7" fill="url(#pd-body)" />
      <rect x="62" y="152" width="176" height="98" rx="7" fill="url(#pd-sheen)" />
      <path d="M66 196H234M66 230H234" stroke="#0f1b28" strokeOpacity=".5" strokeWidth="1.5" /><path d="M66 198H234M66 232H234" stroke="#fff" strokeOpacity=".12" />
      <path d="M62 234V243Q62 250 69 250H78M238 234V243Q238 250 231 250H222" stroke={GOLD} strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="122" y="202" width="56" height="20" rx="3" fill={GOLD} stroke="#a37f3c" />
      <text x="150" y="216.5" textAnchor="middle" fontFamily="var(--font-display, serif)" fontSize="12" fontWeight="700" letterSpacing="2.5" fill={NIGHT}>PAPÁ</text>
      {opened && <rect className="pd-inside" x="66" y="152" width="168" height="8" rx="2" fill="#0e1824" />}
      <rect x="64" y="150" width="172" height="8" fill="#ffe6a6" style={{ opacity: opened ? 0.6 : leak, transition: "opacity 400ms" }} />

      {/* Manija: se pliega hacia atrás cuando se abre la tapa. */}
      <g className={`pd-handle ${opened ? "is-open" : ""}`} style={{ transform: `translateY(${lift}px)` }}>
        <path d="M124 121V106Q124 98 132 98H168Q176 98 176 106V121" stroke={NIGHT} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M128 104Q130 101 134 101H166" stroke="#fff" strokeOpacity=".22" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <rect x="116" y="116" width="15" height="6" rx="2" fill={GOLD} /><rect x="169" y="116" width="15" height="6" rx="2" fill={GOLD} />
      </g>

      {/* Tapa con la franja de tornillos: se afloja con cada golpe y al abrir se vuelca hacia atrás. */}
      <g className={`pd-lid ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `translateY(${lift}px) rotate(${tilt}deg)` }}>
        <path d={LID} fill="url(#pd-lid)" />
        <path d="M68 128H232" stroke="#fff" strokeOpacity=".25" strokeWidth="1.5" />
        <rect x="59" y="141" width="182" height="16" rx="2" fill="#1b2a3a" /><path d="M59 141.5H241M59 156.5H241" stroke={GOLD} strokeWidth="1.2" />
        {SCREWS.map((s) => (
          <g key={s.x} transform={`translate(${s.x} ${SCREW_Y})`}>
            <circle r="4.2" fill="#0b131c" stroke="#5a7896" strokeWidth="1" />
            <g className={`pd-screw ${hits >= s.at || opened ? "is-out" : ""} ${s.at === 5 ? "is-last" : ""}`} style={{ "--dx": `${(s.x - 150) * 0.9 || 10}px` } as CSSProperties}>
              <Screw a={s.a} />
            </g>
          </g>
        ))}
        <path className="pd-inner" d={LID} fill="#122030" stroke={GOLD} strokeWidth="2" />
      </g>

      {/* Lo que hay adentro: sube al abrir (recortado por la boca de la caja). */}
      {opened && (
        <g clipPath="url(#pd-mouth)">
          <g className="pd-prize"><g transform="translate(150 106) scale(1.2) translate(-150 -106)">
            <circle cx="150" cy="96" r="64" fill="url(#pd-glow)" />
            <g transform="translate(150 114) rotate(-32)">
              <rect x="-60" y="-6.5" width="88" height="13" rx="6.5" fill="url(#pd-steel)" stroke="#5d6a78" strokeWidth=".8" />
              <circle cx="-50" cy="0" r="3" fill="#4a5664" />
              <path d="M24-10L44-14C57-16 67-10 67-4H52V4H67C67 10 57 16 44 14L24 10Z" fill="url(#pd-steel)" stroke="#5d6a78" strokeWidth=".8" />
              <rect x="34" y="-3.2" width="12" height="6.4" rx="1.5" fill="#8a97a6" /><path d="M37-3v6M40-3v6M43-3v6" stroke="#5d6a78" strokeWidth=".9" />
              <path d="M-54-3H20" stroke="#fff" strokeOpacity=".7" strokeWidth="1.4" strokeLinecap="round" />
            </g>
            <g stroke={GOLD} strokeWidth=".9">
              <path d="M150 114C134 94 110 98 114 112C118 126 138 122 150 114ZM150 114C166 94 190 98 186 112C182 126 162 122 150 114Z" fill="#8a2a3c" />
              <path d="M146 116L134 142L142 138L145 146L150 118ZM154 116L166 142L158 138L155 146L150 118Z" fill="#6a1e2c" />
            </g>
            <circle cx="150" cy="114" r="6.5" fill="#a63a4e" stroke={GOLD} strokeWidth="1.2" />
            <g transform="translate(150 72) rotate(-9)">
              <ellipse cx="0" cy="0" rx="44" ry="8.5" fill="#26303c" />
              <path d="M-27-2C-29-28-17-34 0-30C17-34 29-28 27-2Z" fill="#3a4859" />
              <path d="M-27.4-9H27.4L27-2H-27Z" fill={GOLD} /><path d="M-6-30q6 5 12 0" stroke="#1c242e" strokeWidth="1.6" fill="none" />
              <path d="M-40-2Q0 6 40-2" stroke="#fff" strokeOpacity=".18" strokeWidth="1.4" fill="none" />
            </g>
          </g></g>
        </g>
      )}

      {/* El último tornillo sale volando por su cuenta mientras se abre la tapa. */}
      {opened && !reduce && <g transform={`translate(150 ${SCREW_Y + lift})`}><g className="pd-screw is-flying"><Screw a={10} /></g></g>}

      {opened && SPARKS.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
          <path className="pd-spark" d={sparkle} fill="#fff1c9" style={{ animationDelay: `${500 + i * 90}ms` }} />
        </g>
      ))}
    </SceneFrame>
  );
}

const CSS = `
.pd-lid { transform-box: view-box; transform-origin: 150px 156px; transition: transform 420ms cubic-bezier(.34,1.56,.64,1); }
.pd-handle { transform-box: fill-box; transform-origin: 50% 100%; transition: transform 420ms cubic-bezier(.34,1.56,.64,1); }
.pd-screw { transform-box: fill-box; transform-origin: 50% 50%; }
.pd-screw.is-out:not(.is-last) { animation: pd-pop 850ms cubic-bezier(.3,.6,.5,1) both; }
.pd-screw.is-out.is-last { opacity: 0; }
.pd-screw.is-flying { animation: pd-pop 900ms cubic-bezier(.3,.6,.5,1) both; }
@keyframes pd-pop { 0% { transform: none; opacity: 1; } 30% { transform: translate(calc(var(--dx, 10px) * .35), -64px) rotate(320deg); opacity: 1; } 100% { transform: translate(var(--dx, 10px), 150px) rotate(820deg); opacity: 0; } }
.pd-inner { opacity: 0; }
.pd-lid.is-open { transform-origin: 150px 120px; animation: pd-lid 800ms cubic-bezier(.3,.7,.3,1) 80ms both; }
.pd-lid.is-open .pd-inner { animation: pd-inner 800ms steps(1, end) 80ms both; }
@keyframes pd-lid { 0% { transform: translateY(-5px) rotate(2.6deg); } 38% { transform: translateY(-16px) scaleY(.12); } 70% { transform: translateY(-4px) scaleY(-.72); } 100% { transform: translateY(-2px) scaleY(-.62); } }
@keyframes pd-inner { 0% { opacity: 0; } 40%, 100% { opacity: 1; } }
.pd-handle.is-open { transform-box: fill-box; transform-origin: 50% 100%; animation: pd-handle 300ms ease-in 80ms both; }
@keyframes pd-handle { to { transform: translateY(-10px) scaleY(.2); opacity: 0; } }
.pd-prize { transform-box: view-box; transform-origin: 150px 110px; animation: pd-rise 900ms cubic-bezier(.34,1.45,.64,1) 260ms both; }
@keyframes pd-rise { 0% { transform: translateY(120px); } 100% { transform: none; } }
.pd-spark { transform-box: fill-box; transform-origin: 50% 50%; animation: pd-spark 700ms cubic-bezier(.34,1.56,.64,1) both; }
@keyframes pd-spark { 0% { opacity: 0; transform: scale(0) rotate(-90deg); } 60% { opacity: 1; transform: scale(1.4) rotate(10deg); } 100% { opacity: .9; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .pd-lid, .pd-handle { transform-box: fill-box; transform-origin: 50% 100%; transition: none; }
  .pd-screw.is-out:not(.is-last) { animation: none; opacity: 0; }
  .pd-lid.is-open { animation: none; transform: translateY(-2px) scaleY(-.62); }
  .pd-lid.is-open .pd-inner { animation: none; opacity: 1; }
  .pd-handle.is-open { animation: none; opacity: 0; }
  .pd-prize, .pd-spark { animation: none; }
}
`;
