import type { CSSProperties } from "react";
import { Lola, Pancho } from "@/components/illustrations/characters";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle } from "./kit";
import type { GiftSceneProps } from "./types";

const GREEN = "#4a6a2c", CREAM = "#f3dca6", EDGE = "#c9a96a", PINK = "#e86a7c";
const KX = 150, KY = 144; // nudo del moño, arriba de la tapa
// Boca de cada perro (en unidades de la escena) y cuánto tironea en cada golpe (alternados).
const MOUTH = { pancho: [100, 222], lola: [209, 210] } as const;
const pull = (hits: number, mine: 0 | 1) => (hits === 0 ? 0 : hits % 2 === mine ? 9 : 2);
// Moño: cada golpe lo estira hacia quien tira y lo va desarmando.
const LOOP = [{ a: 0, x: 1, y: 1 }, { a: -10, x: 1.14, y: 0.86 }, { a: 8, x: 1.24, y: 0.72 }, { a: -14, x: 1.36, y: 0.56 }, { a: 12, x: 1.46, y: 0.42 }];
const HEARTS = [{ x: 100, y: 96, s: 0.9, c: PINK }, { x: 204, y: 92, s: 0.75, c: "#f3a0a8" }, { x: 116, y: 54, s: 0.6, c: CREAM }, { x: 196, y: 44, s: 0.85, c: PINK }, { x: 140, y: 30, s: 0.55, c: "#f3a0a8" }];
const HEART = "M0 10C-12 2-14-6-8-10C-4-12.5-1-10 0-7C1-10 4-12.5 8-10C14-6 12 2 0 10Z";

/** Giro y estiramiento de una punta de la cinta, desde el nudo, para que siga a la boca que tironea. */
function tail([ex, ey]: readonly [number, number], dx: number) {
  const a = Math.atan2(ey - KY, ex + dx - KX) - Math.atan2(ey - KY, ex - KX);
  return `rotate(${((a * 180) / Math.PI).toFixed(2)}deg) scale(${(Math.hypot(ex + dx - KX, ey - KY) / Math.hypot(ex - KX, ey - KY)).toFixed(3)})`;
}

/** Día del Amigo: Pancho y Lola tironean del moño de una caja. Al abrir se desata y salen corazones y un mate. */
export default function FriendGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const h = Math.min(hits, 4);
  const p = opened ? 0 : pull(hits, 1), l = opened ? 0 : pull(hits, 0); // Pancho tira en los impares, Lola en los pares
  const loop = LOOP[h] ?? { a: 0, x: 1, y: 1 };
  const lean = (dx: number, dir: number) => ({ transform: opened ? undefined : `translateX(${((dx * dir) / 110) * 100}%) rotate(${dx > 4 ? dir * 5 : 0}deg)` });
  const bow = opened ? "is-open" : "";
  return (
    <SceneFrame overlay={
      <>
        <div className={`am-dog absolute ${opened ? "is-open" : ""}`} style={{ left: "0%", top: "58.9%", width: "36.7%", ...lean(p, -1) }}>
          <Pancho pose={opened ? "hop" : "stand"} outfit={{ bandana: "#b7d68f" }} className="block aspect-[13/10] h-auto w-full" />
        </div>
        <div className={`am-dog am-lola absolute ${opened ? "is-open" : ""}`} style={{ left: "63.3%", top: "59.3%", width: "36.7%", ...lean(l, 1) }}>
          <Lola pose={opened ? "wave" : "stand"} outfit={{ bandana: "#ef9b6a" }} flip className="block aspect-[13/10] h-auto w-full" />
        </div>
        {!reduce && hits > 0 && !opened && <Debris key={hits} seed={hits + 100} colors={[CREAM, "#fff4d6", PINK]} shape={hits % 2 ? "ribbon" : "heart"} count={7} x={50} y={50} spread={0.7} size={7} />}
        {!reduce && opened && <RevealBurst colors={[CREAM, PINK, "#b7d68f", "#fff4d6"]} shapes={["heart", "star", "dot"]} y={40} />}
      </>
    }>
      <SceneStyle id="amigo" css={CSS} />
      <defs>
        <radialGradient id="am-sky" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor={GREEN} stopOpacity=".55" /><stop offset=".6" stopColor="#22381f" stopOpacity=".45" /><stop offset="1" stopColor="#22381f" stopOpacity="0" /></radialGradient>
        <linearGradient id="am-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5d8236" /><stop offset=".6" stopColor={GREEN} /><stop offset="1" stopColor="#34501c" /></linearGradient>
        <linearGradient id="am-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f9844" /><stop offset="1" stopColor="#4f7330" /></linearGradient>
        <linearGradient id="am-gourd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a8693d" /><stop offset=".45" stopColor="#8a5232" /><stop offset="1" stopColor="#5e351d" /></linearGradient>
        <linearGradient id="am-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#9aa6b2" /></linearGradient>
        <radialGradient id="am-glow"><stop offset="0" stopColor="#fff4d6" stopOpacity=".95" /><stop offset=".5" stopColor={CREAM} stopOpacity=".35" /><stop offset="1" stopColor={CREAM} stopOpacity="0" /></radialGradient>
        <clipPath id="am-mouth"><rect x="0" y="-20" width="300" height="184" /></clipPath>
      </defs>
      <circle cx="150" cy="160" r="150" fill="url(#am-sky)" />
      <Glow color={CREAM} hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="258" rx="62" ry="7" fill="#000" opacity=".35" />

      {/* Caja verde con huellitas y cinta crema. */}
      <rect x="100" y="164" width="100" height="92" rx="4" fill="url(#am-body)" />
      <g fill="#2f461a" opacity=".45">
        {([[116, 238], [184, 188], [118, 186], [182, 240]] as const).map(([x, y]) => (
          <g key={x + y} transform={`translate(${x} ${y})`}><ellipse cy="2" rx="4" ry="3.2" /><circle cx="-4.4" cy="-3" r="1.6" /><circle cx="-1.5" cy="-5" r="1.6" /><circle cx="1.5" cy="-5" r="1.6" /><circle cx="4.4" cy="-3" r="1.6" /></g>
        ))}
      </g>
      <g className={`am-band ${bow}`}>
        <rect x="141" y="164" width="18" height="92" fill={CREAM} /><path d="M141 164v92M159 164v92" stroke={EDGE} />
        <rect x="100" y="204" width="100" height="14" fill={CREAM} /><path d="M100 204h100M100 218h100" stroke={EDGE} />
      </g>

      {opened && <path className="am-inside" d="M101 164H199V171Q150 179 101 171Z" fill="#1c2e14" stroke="#fff4d6" strokeOpacity=".5" />}

      {/* Lo que hay adentro: sale un mate con brillo y corazones. */}
      {opened && (
        <g clipPath="url(#am-mouth)">
          <circle className="am-rise" cx="150" cy="112" r="72" fill="url(#am-glow)" />
          <g className="am-rise">
            <path d="M155 100L173 56" stroke="url(#am-metal)" strokeWidth="3.4" strokeLinecap="round" /><path d="M171 60q4-6 9-4" stroke="#cfd6de" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M135 102C128 110 119 120 121 134C123 148 135 155 150 155C165 155 177 148 179 134C181 120 172 110 165 102Z" fill="url(#am-gourd)" />
            <path d="M122 132Q150 141 178 132" stroke={CREAM} strokeWidth="2.4" fill="none" strokeDasharray="1 4" strokeLinecap="round" />
            <path d="M130 116q-5 12 2 26" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" fill="none" />
            <ellipse cx="150" cy="155" rx="13" ry="3" fill="#3e2414" />
            <path d="M134.5 102H165.5L163.5 110H136.5Z" fill="url(#am-metal)" /><path d="M137 106.5h26" stroke="#7b8896" strokeWidth=".8" />
            <path d="M136 102Q150 88 164 102Z" fill="#7d9a3a" /><ellipse cx="150" cy="102" rx="15.5" ry="3.4" fill="none" stroke="#e8edf2" strokeWidth="1.6" />
            <path className="am-shine" d="M182 88c.8-5 2-6.2 7-7-5-.8-6.2-2-7-7-.8 5-2 6.2-7 7 5 .8 6.2 2 7 7z" fill="#fff" />
          </g>
          {HEARTS.map((ht, i) => (
            <g key={i} transform={`translate(${ht.x} ${ht.y}) scale(${ht.s})`}>
              <path className="am-heart" d={HEART} fill={ht.c} style={{ "--fy": `${(160 - ht.y) / ht.s}px`, "--fx": `${(150 - ht.x) / ht.s}px`, animationDelay: `${380 + i * 90}ms` } as CSSProperties} />
            </g>
          ))}
        </g>
      )}

      {/* Tapa: al abrir salta y sale volando girando. */}
      <g className={`am-lid ${bow}`}>
        <rect x="94" y="144" width="112" height="24" rx="3" fill="url(#am-lid)" /><rect x="94" y="164" width="112" height="4" fill="#000" opacity=".18" />
        <rect x="141" y="144" width="18" height="24" fill={CREAM} /><path d="M141 144v24M159 144v24" stroke={EDGE} />
      </g>

      {/* Puntas de la cinta: cada perro muerde una y tironea. */}
      {([["pancho", -p, "am-tail-l"], ["lola", l, "am-tail-r"]] as const).map(([who, dx, cls]) => {
        const [ex, ey] = MOUTH[who];
        return (
          <g key={who} className={`am-tail ${cls} ${bow}`} style={{ transform: opened ? undefined : tail(MOUTH[who], dx) }}>
            <path d={`M${KX} ${KY}Q${(KX + ex) / 2} ${(KY + ey) / 2 + 6} ${ex} ${ey}`} stroke={EDGE} strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d={`M${KX} ${KY}Q${(KX + ex) / 2} ${(KY + ey) / 2 + 6} ${ex} ${ey}`} stroke={CREAM} strokeWidth="6.4" strokeLinecap="round" fill="none" />
          </g>
        );
      })}

      {/* Moño: rulos que se estiran y se desarman; al abrir salen volando. */}
      <g className={`am-loop am-loop-l ${bow}`} style={{ transform: opened ? undefined : `rotate(${loop.a + (p > 4 ? -6 : 0)}deg) scale(${loop.x}, ${loop.y})` }}>
        <path d="M150 144C130 114 100 118 104 135C108 150 134 149 150 144Z" fill={CREAM} stroke={EDGE} strokeWidth="1.4" />
        <path d="M146 142C132 130 116 128 112 134" stroke={EDGE} strokeWidth="1.2" fill="none" />
      </g>
      <g className={`am-loop am-loop-r ${bow}`} style={{ transform: opened ? undefined : `rotate(${-loop.a + (l > 4 ? 6 : 0)}deg) scale(${loop.x}, ${loop.y})` }}>
        <path d="M150 144C170 114 200 118 196 135C192 150 166 149 150 144Z" fill={CREAM} stroke={EDGE} strokeWidth="1.4" />
        <path d="M154 142C168 130 184 128 188 134" stroke={EDGE} strokeWidth="1.2" fill="none" />
      </g>
      <circle className={`am-knot ${bow}`} cx={KX} cy={KY} r="8" fill={CREAM} stroke={EDGE} strokeWidth="1.4" style={{ transform: opened ? undefined : `scale(${1 - h * 0.08})` }} />
    </SceneFrame>
  );
}

const CSS = `
.am-dog { transform-origin: 50% 100%; transition: transform 450ms cubic-bezier(.34,1.56,.64,1); }
.am-dog.is-open { animation: am-hop 520ms cubic-bezier(.3,0,.4,1) 250ms 2 both; }
.am-lola.is-open { animation-delay: 380ms; }
@keyframes am-hop { 0%, 100% { transform: none; } 45% { transform: translateY(-14%) rotate(-3deg); } }
.am-tail, .am-loop, .am-knot { transform-box: view-box; transform-origin: ${KX}px ${KY}px; transition: transform 450ms cubic-bezier(.34,1.56,.64,1); }
.am-loop.is-open { animation: am-fly 700ms cubic-bezier(.3,.7,.4,1) both; }
.am-loop-l.is-open { --fx: -70px; --rot: -160deg; }
.am-loop-r.is-open { --fx: 70px; --rot: 160deg; }
@keyframes am-fly { 0% { transform: scale(1.46, .42); } 30% { transform: translate(calc(var(--fx) * .3), -30px) scale(1.1); opacity: 1; } 100% { transform: translate(var(--fx), -120px) rotate(var(--rot)) scale(.6); opacity: 0; } }
.am-knot.is-open { animation: am-pop 300ms ease-in both; }
@keyframes am-pop { 0% { transform: scale(.68); } 40% { transform: scale(1.3); } 100% { transform: scale(0); opacity: 0; } }
.am-tail.is-open { animation: am-drop 500ms ease-in both; }
@keyframes am-drop { to { transform: translateY(24px) scaleY(.7); opacity: 0; } }
.am-band.is-open { animation: am-band 500ms ease-in 150ms both; }
.am-inside { animation: am-band 400ms ease-out 200ms reverse both; }
@keyframes am-band { to { opacity: 0; } }
.am-lid { transform-box: fill-box; transform-origin: 50% 50%; }
.am-lid.is-open { animation: am-lid 900ms cubic-bezier(.3,.7,.4,1) 160ms both; }
@keyframes am-lid { 0% { transform: none; } 28% { transform: translate(-14px, -46px) rotate(-14deg); } 100% { transform: translate(-120px, -150px) rotate(-80deg) scale(.8); opacity: 0; } }
.am-rise { transform-box: fill-box; transform-origin: 50% 100%; animation: am-rise 900ms cubic-bezier(.34,1.45,.64,1) 320ms both; }
@keyframes am-rise { 0% { transform: translateY(90px); } 100% { transform: none; } }
.am-heart { transform-box: fill-box; transform-origin: 50% 50%; animation: am-heart 900ms cubic-bezier(.34,1.3,.64,1) both; }
@keyframes am-heart { 0% { opacity: 0; transform: translate(var(--fx), var(--fy)) scale(.3); } 25% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.am-shine { transform-box: fill-box; transform-origin: 50% 50%; animation: am-shine 700ms cubic-bezier(.34,1.56,.64,1) 1000ms both; }
@keyframes am-shine { 0% { opacity: 0; transform: scale(0) rotate(-90deg); } 100% { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .am-dog, .am-tail, .am-loop, .am-knot { transition: none; }
  .am-dog.is-open, .am-rise, .am-heart, .am-shine, .am-inside { animation: none; }
  .am-loop.is-open, .am-knot.is-open, .am-tail.is-open, .am-band.is-open { animation: none; opacity: 0; }
  .am-lid.is-open { animation: none; opacity: 0; }
}
`;
