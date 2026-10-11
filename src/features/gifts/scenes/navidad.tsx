import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

/** Montoncitos de nieve sobre la tapa: `at` = golpe con el que se caen hacia `d`. */
const SNOW = [
  { cx: 92, cy: 126, w: 24, at: 1, d: -1 },
  { cx: 208, cy: 126, w: 24, at: 2, d: 1 },
  { cx: 120, cy: 120, w: 21, at: 3, d: -1 },
  { cx: 180, cy: 120, w: 21, at: 4, d: 1 },
];
const LEAF = "M0 0C4-6 8-4 10-8C12-3 16-4 18-9C20-3 24-4 27-8C28-4 32-2 37 0C32 2 28 4 27 8C24 4 20 3 18 9C16 4 12 3 10 8C8 4 4 6 0 0Z";
const star = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, k = i % 2 ? r : R; return `${(cx + Math.cos(a) * k).toFixed(1)},${(cy + Math.sin(a) * k).toFixed(1)}`; }).join(" ");

/** Navidad: el regalo de Papá Noel. Se cae la nieve, se afloja el cinturón y, al abrir, sube una estrella. */
export default function ChristmasGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const pick = (v: number[]) => (opened ? v[4] : v[Math.min(hits, 4)]) ?? 0;
  const sag = pick([0, 1, 2, 3, 4.5]);
  const bell = (x: number, d: number) => (
    <g key={`${x}-${hits}`} className={`nv-bell ${hits > 0 && !opened ? "is-jump" : ""}`} style={{ "--d": d } as CSSProperties}>
      <path d={`M150 130 Q${(150 + x) / 2} ${132} ${x} 140`} stroke="#8e1a20" strokeWidth="2.2" fill="none" />
      <circle cx={x} cy="150" r="10.5" fill="url(#nv-bell)" />
      <ellipse cx={x} cy="149" rx="10.5" ry="2.6" fill="none" stroke="#a87418" strokeWidth="1.4" />
      <path d={`M${x - 5.5} 155H${x + 5.5}`} stroke="#5c3d08" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx={x - 3.5} cy="144.5" rx="2.6" ry="1.6" fill="#fff" opacity=".8" />
    </g>
  );
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits * 3} colors={["#ffffff", "#e6f1fa", "#bcd6ea"]} shape="flake" count={10} y={41} spread={0.9} size={9} />}
        {opened && (
          <>
            <RevealBurst colors={["#ffffff", "#f3c84c", "#e6f1fa", "#d93a40"]} shapes={["flake", "star", "dot"]} y={44} />
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="nv-fall absolute" style={{ left: `${6 + rand(i * 3) * 88}%`, top: "-4%", width: 6 + rand(i) * 7, height: 6 + rand(i) * 7, animationDelay: `${250 + i * 110}ms`, "--drift": `${(rand(i * 7) - 0.5) * 70}px` } as CSSProperties} />
            ))}
          </>
        )}
      </>
    )}>
      <SceneStyle id="navidad" css={CSS} />
      <defs>
        <linearGradient id="nv-box" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#cf3a41" /><stop offset=".55" stopColor="#b3242b" /><stop offset="1" stopColor="#7e161c" /></linearGradient>
        <linearGradient id="nv-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".6" stopColor="#f1ebe0" /><stop offset="1" stopColor="#d2c7b5" /></linearGradient>
        <linearGradient id="nv-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#cfe2f1" /></linearGradient>
        <linearGradient id="nv-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1b8" /><stop offset=".45" stopColor="#f3c84c" /><stop offset="1" stopColor="#b9831c" /></linearGradient>
        <radialGradient id="nv-bell" cx=".35" cy=".3"><stop offset="0" stopColor="#fff4c4" /><stop offset=".5" stopColor="#f3c84c" /><stop offset="1" stopColor="#9a6a12" /></radialGradient>
        <linearGradient id="nv-seam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a0" /><stop offset="1" stopColor="#ffe9a0" stopOpacity="0" /></linearGradient>
        <linearGradient id="nv-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff1b8" stopOpacity=".75" /><stop offset="1" stopColor="#fff1b8" stopOpacity="0" /></linearGradient>
        <radialGradient id="nv-puff"><stop offset="0" stopColor="#fff" /><stop offset=".55" stopColor="#f4f9fd" stopOpacity=".9" /><stop offset="1" stopColor="#e6f1fa" stopOpacity="0" /></radialGradient>
        <radialGradient id="nv-halo"><stop offset="0" stopColor="#fff6cf" stopOpacity=".95" /><stop offset=".4" stopColor="#f3c84c" stopOpacity=".45" /><stop offset="1" stopColor="#f3c84c" stopOpacity="0" /></radialGradient>
      </defs>
      <Glow color="#f3c84c" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="258" rx="94" ry="10" fill="#000" opacity=".35" />
      {/* Luz de la estrella saliendo de la caja. */}
      {opened && (
        <>
          <path className="nv-beam" d="M92 154L208 154L176 64L124 64Z" fill="url(#nv-beam)" />
          <path d="M80 154L220 154L212 145L88 145Z" fill="#4e0b10" /><path d="M88 145H212" stroke="#ffe9a0" strokeWidth="2" opacity=".8" />
        </>
      )}

      {/* Caja roja con ruedo de piel y luz que se escapa bajo la tapa. */}
      <rect x="80" y="154" width="140" height="102" rx="6" fill="url(#nv-box)" />
      <path d="M96 170V240M204 170V240" stroke="#fff" strokeOpacity=".07" strokeWidth="10" />
      <rect className="nv-heat" x="80" y="156" width="140" height="22" fill="url(#nv-seam)" style={{ opacity: pick([0, 0.25, 0.45, 0.65, 0.9]) }} />
      <rect x="80" y="243" width="140" height="13" rx="5" fill="url(#nv-fur)" />
      {Array.from({ length: 15 }, (_, i) => <circle key={i} cx={83 + i * 9.6 + (rand(i + 2) - 0.5) * 3} cy={245 + rand(i * 2) * 1.5} r={4.6 + rand(i + 11) * 2.2} fill="url(#nv-fur)" />)}

      {/* Nieve en el piso, delante de la caja: crece con lo que se cae de la tapa. */}
      <g className="nv-drift" style={{ transform: `scale(${pick([0.62, 0.72, 0.82, 0.92, 1.04])}, ${pick([0.3, 0.5, 0.68, 0.84, 1])})` }}>
        <path d="M58 262C62 254 74 252 84 254C90 246 104 246 110 252C120 248 132 250 138 255C148 250 162 250 168 255C176 248 192 248 198 253C206 247 222 249 226 255C234 254 242 258 242 262Z" fill="url(#nv-snow)" />
      </g>

      {/* Cinturón de Papá Noel: se afloja golpe a golpe y al abrir se desabrocha y cae. */}
      <g className={`nv-belt-l ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `rotate(${sag}deg)` }}>
        <rect x="80" y="196" width="72" height="22" fill="#1d1a1f" /><path d="M80 198H152" stroke="#4a4450" strokeWidth="1.5" />
      </g>
      <g className={`nv-belt-r ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `rotate(${-sag}deg)` }}>
        <rect x="148" y="196" width="72" height="22" fill="#1d1a1f" /><path d="M148 198H220" stroke="#4a4450" strokeWidth="1.5" />
        {[184, 196, 208].map((x) => <circle key={x} cx={x} cy="207" r="2.2" fill="#09080a" stroke="#4a4450" strokeWidth=".8" />)}
      </g>
      <g className={`nv-buckle ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `translateY(${sag * 1.2}px) rotate(${pick([0, -4, 7, -10, 14])}deg)` }}>
        <rect x="131" y="191" width="38" height="32" rx="5" fill="url(#nv-gold)" />
        <rect x="139" y="198" width="22" height="18" rx="2.5" fill="#1d1a1f" />
        <g className="nv-prong" style={{ transform: `rotate(${pick([0, 14, 28, 42, 58])}deg)` }}><rect x="148" y="197" width="4" height="20" rx="2" fill="url(#nv-gold)" /></g>
        <path d="M134 195l6 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".85" />
      </g>

      {/* Tapa de piel esponjosa con nieve, acebo y cascabeles: se levanta de a poco y salta al abrir. */}
      <g className={`nv-lid ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `translateY(${pick([0, 0, -2, -4, -7])}px)` }}>
        <rect x="70" y="130" width="160" height="28" rx="13" fill="url(#nv-fur)" />
        {Array.from({ length: 13 }, (_, i) => <circle key={`t${i}`} cx={76 + i * 12} cy="132" r="7" fill="url(#nv-fur)" />)}
        {Array.from({ length: 14 }, (_, i) => <circle key={`b${i}`} cx={76 + i * 11.5 + (rand(i) - 0.5) * 3} cy={156 + rand(i + 7) * 2.5} r={6 + rand(i * 3) * 2.6} fill="url(#nv-fur)" />)}
        {Array.from({ length: 16 }, (_, i) => <path key={`c${i}`} d={`M${78 + rand(i + 3) * 140} ${138 + rand(i * 5) * 16}q3 -3.5 6 0`} stroke="#cdbfa8" strokeWidth="1.3" fill="none" strokeLinecap="round" />)}
        <path d="M70 136C68 124 82 119 94 122C104 114 120 116 128 120C138 112 160 112 170 119C180 113 198 114 206 121C218 118 232 124 230 136C210 132 190 134 150 133C112 134 90 132 70 136Z" fill="url(#nv-snow)" />
        {SNOW.map((s) => (
          <g key={s.at} className={`nv-snow ${hits >= s.at || opened ? "is-off" : ""}`} style={{ "--d": s.d } as CSSProperties}>
            <ellipse cx={s.cx} cy={s.cy} rx={s.w} ry={s.w * 0.46} fill="url(#nv-snow)" />
            <ellipse cx={s.cx + s.d * 4} cy={s.cy - s.w * 0.42} rx={s.w * 0.6} ry={s.w * 0.42} fill="url(#nv-snow)" />
            <circle cx={s.cx - 6} cy={s.cy - s.w * 0.5} r="1.4" fill="#fff" />
          </g>
        ))}
        <g transform="translate(150 120) rotate(-150)"><path d={LEAF} fill="#1f6243" /><path d="M2 0H34" stroke="#3f9a6b" strokeWidth="1.2" /></g>
        <g transform="translate(150 120) rotate(-30)"><path d={LEAF} fill="#2a7a52" /><path d="M2 0H34" stroke="#5cb386" strokeWidth="1.2" /></g>
        {bell(131, 1)}{bell(169, -1)}
        {([[144, 118], [156, 117], [150, 126]] as const).map(([x, y]) => <g key={x}><circle cx={x} cy={y} r="5.6" fill="#c8202a" /><circle cx={x - 1.8} cy={y - 1.8} r="1.6" fill="#fff" opacity=".7" /></g>)}
      </g>

      {/* Apertura: explosión de nieve y estrella dorada que sube. */}
      {opened && (
        <>
          <g className="nv-puff">
            {Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2; return <circle key={i} cx={150 + Math.cos(a) * 30} cy={138 + Math.sin(a) * 10} r={16 + rand(i) * 10} fill="url(#nv-puff)" style={{ "--px": `${Math.cos(a) * 50}px`, "--py": `${Math.sin(a) * 30 - 20}px` } as CSSProperties} />; })}
          </g>
          <g className="nv-star">
            <circle cx="150" cy="80" r="66" fill="url(#nv-halo)" />
            <g className="nv-rays">{[0, 45, 90, 135].map((a) => <path key={a} d="M150 24L153.5 77L150 136L146.5 77Z" fill="#fff6cf" opacity={a % 90 ? 0.45 : 0.85} transform={`rotate(${a} 150 80)`} />)}</g>
            <polygon points={star(150, 80, 36, 15)} fill="url(#nv-gold)" stroke="#fff1b8" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points={star(150, 80, 16, 7)} fill="#fff8dc" opacity=".8" />
          </g>
        </>
      )}
    </SceneFrame>
  );
}

const CSS = `
.nv-snow, .nv-belt-l, .nv-belt-r, .nv-buckle, .nv-prong, .nv-lid, .nv-bell { transform-box: fill-box; transition: transform 420ms cubic-bezier(.34,1.56,.64,1), opacity 420ms; }
.nv-snow { transform-origin: 50% 100%; }
.nv-snow.is-off { opacity: 0; transform: translate(calc(var(--d) * 34px), 34px) rotate(calc(var(--d) * 50deg)) scale(.5); }
.nv-belt-l { transform-origin: 0% 50%; }
.nv-belt-r { transform-origin: 100% 50%; }
.nv-buckle { transform-origin: 50% 50%; }
.nv-prong { transform-origin: 50% 0%; }
.nv-lid { transform-origin: 50% 100%; }
.nv-bell { transform-origin: 50% 0%; }
.nv-bell.is-jump { animation: nv-jingle 680ms cubic-bezier(.3,.7,.4,1) both; }
@keyframes nv-jingle { 0%, 100% { transform: none; } 22% { transform: translateY(-14px) rotate(calc(var(--d) * -22deg)); } 48% { transform: translateY(2px) rotate(calc(var(--d) * 12deg)); } 74% { transform: translateY(-3px) rotate(calc(var(--d) * -5deg)); } }
.nv-drift { transform-box: view-box; transform-origin: 150px 262px; transition: transform 700ms cubic-bezier(.16,1,.3,1); }
.nv-heat { transition: opacity 400ms; }
.nv-belt-l.is-open { animation: nv-belt-l 950ms cubic-bezier(.45,0,.7,.4) both; }
.nv-belt-r.is-open { animation: nv-belt-r 950ms cubic-bezier(.45,0,.7,.4) both; }
@keyframes nv-belt-l { 0% { transform: rotate(4.5deg); } 22% { transform: translate(-8px,-6px) rotate(-8deg); } 100% { transform: translate(-46px,96px) rotate(58deg); opacity: 0; } }
@keyframes nv-belt-r { 0% { transform: rotate(-4.5deg); } 22% { transform: translate(8px,-6px) rotate(8deg); } 100% { transform: translate(46px,96px) rotate(-58deg); opacity: 0; } }
.nv-buckle.is-open { animation: nv-buckle 1s cubic-bezier(.3,.7,.4,1) both; }
@keyframes nv-buckle { 20% { transform: translateY(-18px) rotate(-30deg) scale(1.15); } 100% { transform: translate(20px,110px) rotate(280deg); opacity: 0; } }
.nv-lid.is-open { animation: nv-lid 1s cubic-bezier(.3,.7,.4,1) 120ms both; }
@keyframes nv-lid { 0% { transform: none; } 22% { transform: translateY(-30px) scale(1.05,.94); } 100% { transform: translate(-70px,-200px) rotate(-40deg); opacity: 0; } }
.nv-puff circle { transform-box: fill-box; transform-origin: 50% 50%; opacity: 0; animation: nv-puff 1.1s cubic-bezier(.16,1,.3,1) 160ms both; }
@keyframes nv-puff { 0% { opacity: .95; transform: scale(.3); } 100% { opacity: 0; transform: translate(var(--px), var(--py)) scale(1.7); } }
.nv-beam { transform-box: fill-box; transform-origin: 50% 100%; animation: nv-beam 1.2s cubic-bezier(.16,1,.3,1) 250ms both; }
@keyframes nv-beam { from { opacity: 0; transform: scaleY(.2); } to { opacity: 1; transform: none; } }
.nv-star { transform-box: fill-box; transform-origin: 50% 50%; animation: nv-star 1.3s cubic-bezier(.34,1.56,.64,1) 260ms both; }
@keyframes nv-star { 0% { opacity: 0; transform: translateY(80px) scale(.2) rotate(-120deg); } 50% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.nv-rays { transform-box: view-box; transform-origin: 150px 80px; animation: nv-rays 1.6s cubic-bezier(.16,1,.3,1) 500ms both; }
@keyframes nv-rays { from { transform: scale(0) rotate(-60deg); } to { transform: none; } }
.nv-fall { background: #fff; clip-path: polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%); opacity: 0; animation: nv-fall 2.6s linear both; }
@keyframes nv-fall { 0% { opacity: 0; transform: translate(0,0) rotate(0); } 12% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--drift), 330px) rotate(260deg); } }
@media (prefers-reduced-motion: reduce) {
  .nv-snow, .nv-belt-l, .nv-belt-r, .nv-buckle, .nv-prong, .nv-lid, .nv-bell, .nv-drift { transition: opacity 200ms; }
  .nv-bell.is-jump, .nv-beam, .nv-star, .nv-rays { animation: none; }
  .nv-belt-l.is-open, .nv-belt-r.is-open, .nv-buckle.is-open, .nv-lid.is-open { animation: none; opacity: 0; }
  .nv-puff, .nv-fall { display: none; }
}
`;
