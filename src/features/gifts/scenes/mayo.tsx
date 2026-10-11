import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

const CELESTE = "#74acdf", WHITE = "#f5f8fc", GOLD = "#f6c54c", WOOD = "#7a5232";
const TOP = 86, RIM = 162; // punta y borde de la tela con el paraguas abierto
// Puntas de las varillas vistas de costado: más juntas hacia los bordes.
const rib = (k: number) => 150 - 100 * Math.cos((Math.PI * k) / 8);
const RIB = Array.from({ length: 9 }, (_, k) => rib(k));
const seam = (x: number) => `C${150 + (x - 150) * 0.55} ${TOP} ${x} ${RIM - 42} ${x} ${RIM}`;
const back = (x: number) => `C${x} ${RIM - 42} ${150 + (x - 150) * 0.55} ${TOP} 150 ${TOP}`;
const scallop = (k: number) => `Q${(rib(k) + rib(k + 1)) / 2} ${RIM - 9} ${rib(k + 1)} ${RIM}`;
const gore = (k: number) => `M150 ${TOP}${seam(rib(k))}${scallop(k)}${back(rib(k + 1))}Z`;
const DOME = `M150 ${TOP}${seam(rib(0))}${RIB.slice(1).map((_, k) => scallop(k)).join("")}${back(rib(8))}Z`;
// Apertura por golpe (0 = cerrado y atado, 1 = abierto del todo).
const OPEN = [0, 0.16, 0.34, 0.54, 0.74];
const RAIN = Array.from({ length: 30 }, (_, i) => ({ x: 10 + rand(i + 3) * 280, y: 6 + rand(i + 40) * 236, o: 0.3 + rand(i + 80) * 0.45 }));
// Confeti de la apertura (sin tapar la cara del sol).
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({ x: 12 + rand(i + 120) * 276, y: 14 + rand(i + 160) * 210, r: Math.round(rand(i + 200) * 180), c: [CELESTE, WHITE, "#bfe0f7"][i % 3] }))
  .filter((c) => Math.hypot(c.x - 150, c.y - 54) > 30).slice(0, 34);
const pt = (r: number, a: number) => `${(150 + r * Math.cos(a)).toFixed(1)} ${(54 + r * Math.sin(a)).toFixed(1)}`;

/** Sol de Mayo: 32 rayos (rectos y flamígeros alternados) y la cara. */
function Sun() {
  return (
    <>
      <circle cx="150" cy="54" r="60" fill="url(#my-halo)" />
      {Array.from({ length: 32 }, (_, i) => {
        const a = (i / 32) * Math.PI * 2;
        return i % 2 === 0
          ? <path key={i} d={`M${pt(20, a - 0.08)}L${pt(48, a)}L${pt(20, a + 0.08)}Z`} fill={GOLD} />
          : <path key={i} d={`M${pt(20, a - 0.05)}Q${pt(30, a + 0.12)} ${pt(35, a)}T${pt(44, a)}`} stroke={GOLD} strokeWidth="2" strokeLinecap="round" fill="none" />;
      })}
      <circle cx="150" cy="54" r="21" fill="url(#my-sun)" stroke="#d9a52c" strokeWidth="1.2" />
      <g transform="translate(150 54) scale(1.75) translate(-32 -32)" fill="none" stroke="#b07d17" strokeWidth="1.1" strokeLinecap="round">
        <path d="M26 29q2-1.5 4 0M34 29q2-1.5 4 0M32 31v4l-1.5.8M28.5 37.5q3.5 2 7 0" />
      </g>
    </>
  );
}

/** 25 de Mayo: el paraguas de 1810 bajo la lluvia. Cada golpe lo abre un poco más; al abrir, la lluvia es confeti y sale el sol. */
export default function MayoGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const t = opened ? 1 : OPEN[hits] ?? 0.74;
  const sx = 0.15 + 0.85 * t, sy = 1.32 - 0.32 * t;
  const swing = opened ? 0 : [0, 10, -12, 14, -16][hits] ?? 0;
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits + 20} colors={["#bfe0f7", CELESTE, WHITE]} count={9} y={40} spread={0.9} size={6} />}
        {opened && <RevealBurst colors={[CELESTE, WHITE, GOLD, "#bfe0f7"]} shapes={["square", "ribbon", "star"]} y={36} />}
      </>
    )}>
      <SceneStyle id="mayo" css={CSS} />
      <defs>
        <radialGradient id="my-sky" cx=".5" cy=".46" r=".5"><stop offset="0" stopColor="#2f6f9f" stopOpacity=".7" /><stop offset=".6" stopColor="#123a5c" stopOpacity=".45" /><stop offset="1" stopColor="#123a5c" stopOpacity="0" /></radialGradient>
        <radialGradient id="my-halo"><stop offset="0" stopColor="#ffe8a3" stopOpacity=".8" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
        <radialGradient id="my-sun" cx=".4" cy=".38" r=".7"><stop offset="0" stopColor="#ffeeb8" /><stop offset="1" stopColor={GOLD} /></radialGradient>
        <linearGradient id="my-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a2540" stopOpacity=".5" /><stop offset=".28" stopColor="#0a2540" stopOpacity="0" /><stop offset=".4" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#0a2540" stopOpacity=".55" />
        </linearGradient>
        <linearGradient id="my-wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a8743f" /><stop offset="1" stopColor="#5a3820" /></linearGradient>
      </defs>
      <circle cx="150" cy="150" r="150" fill="url(#my-sky)" />
      <Glow color={GOLD} hits={hits} total={total} opened={opened} />
      <ellipse className="my-shadow" cx="150" cy="258" rx="90" ry="9" fill="#000" opacity=".35" style={{ transform: `scaleX(${0.3 + 0.7 * t})` }} />

      {/* El Sol de Mayo asoma detrás del paraguas al abrir. */}
      <g className={`my-sun ${opened ? "is-open" : ""}`}><Sun /></g>

      {/* Lluvia: baja un tramo con cada golpe y se apaga al abrir. */}
      <g className="my-rain" style={{ transform: `translate(${-hits * 2}px, ${hits * 7}px)`, opacity: opened ? 0 : 1 }}>
        {RAIN.map((d, i) => <path key={i} d={`M${d.x.toFixed(1)} ${d.y.toFixed(1)}l-3 11`} stroke="#a9d3f2" strokeWidth="1.6" strokeLinecap="round" opacity={d.o} />)}
      </g>
      <g stroke="#a9d3f2" strokeWidth="1.2" fill="none" className="my-rain" style={{ opacity: opened ? 0 : 0.45 }}>
        {[46, 92, 214, 252].map((x, i) => <ellipse key={x} cx={x} cy={262 + (i % 2) * 6} rx={9 + i} ry="2.4" />)}
      </g>

      {/* Bastón y mango curvo de madera. */}
      <path d={`M150 ${TOP}V232`} stroke="#4a3220" strokeWidth="3.4" />
      <path d="M150 226V240C150 257 127 259 125 243" stroke="url(#my-wood)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M152 232v8c0 9-6 13-12 13" stroke="#e7c89b" strokeOpacity=".45" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <rect className="my-runner" x="145.5" y="-3" width="9" height="6" rx="2" fill="#3a2a1c" style={{ transform: `translateY(${TOP + 92 * sy}px)` }} />

      {/* Tela: gajos celestes y blancos con varillas; se despliega desde la punta. */}
      <g className={`my-canopy ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `scale(${sx}, ${sy})` }}>
        <g stroke="#3a2a1c" strokeWidth="1.2" style={{ opacity: Math.min(1, Math.max(0, (t - 0.2) * 3)) }} className="my-ribs">
          {RIB.slice(1, 8).map((x) => <path key={x} d={`M150 178L${x.toFixed(1)} ${RIM}`} vectorEffect="non-scaling-stroke" />)}
        </g>
        {RIB.slice(0, 8).map((x, k) => <path key={x} d={gore(k)} fill={k % 2 ? WHITE : CELESTE} />)}
        <path d={DOME} fill="url(#my-shade)" />
        {RIB.slice(1, 8).map((x) => <path key={x} d={`M150 ${TOP}${seam(x)}`} stroke="#2b4e72" strokeOpacity=".45" fill="none" vectorEffect="non-scaling-stroke" />)}
        {RIB.map((x) => <circle key={x} cx={x} cy={RIM} r="2.4" fill={WOOD} />)}
      </g>
      <path d={`M150 ${TOP}v-7`} stroke="#c9a24a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="150" cy={TOP - 8} r="2.4" fill={GOLD} />

      {/* Cerrado, la tela se junta sobre el bastón (se suelta con el primer golpe). */}
      <g className="my-pinch" style={{ opacity: hits > 0 || opened ? 0 : 1 }}>
        <path d="M135.5 184Q138 196 147 204H153Q162 196 164.5 184Q150 188 135.5 184Z" fill={CELESTE} />
        <path d="M145 186.5Q147 197 149 204H151.5Q152 196 154 186.6Z" fill={WHITE} />
        <path d="M135.5 184Q138 196 147 204H153Q162 196 164.5 184Q150 188 135.5 184Z" fill="url(#my-shade)" />
      </g>

      {/* Correa que lo tiene atado: se suelta con el primer golpe. */}
      <g className={`my-strap ${hits > 0 || opened ? "is-off" : ""}`}>
        <rect x="132" y="146" width="36" height="9" rx="3" fill="#1d3d5c" stroke="#0e2238" strokeWidth="1" />
        <circle cx="163" cy="150.5" r="2.6" fill={GOLD} />
      </g>

      {/* Escarapela en el mango, con sus cintas que se balancean. */}
      <g className="my-tails" style={{ transform: `rotate(${swing}deg)` }}>
        <path d="M148 220l-7 22 5-3 3 5 3-22zM152 220l7 22-5-3-3 5-3-22z" fill={CELESTE} stroke="#4f8fc8" strokeWidth=".8" />
      </g>
      <circle cx="150" cy="216" r="9.5" fill={CELESTE} stroke="#4f8fc8" strokeWidth="1.4" strokeDasharray="2 1.2" />
      <circle cx="150" cy="216" r="6" fill={WHITE} /><circle cx="150" cy="216" r="3" fill={CELESTE} />

      {/* Al abrir: la lluvia se vuelve confeti celeste y blanco. */}
      {opened && !reduce && CONFETTI.map((c, i) => (
        <g key={i} transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${c.r})`}>
          <rect className="my-conf" x="-2.5" y="-4" width="5" height="8" rx="1" fill={c.c}
            style={{ animationDelay: `${(i % 7) * 60}ms`, "--fall": `${18 + rand(i + 9) * 26}px`, "--spin": `${(rand(i + 4) - 0.5) * 400}deg` } as CSSProperties} />
        </g>
      ))}
    </SceneFrame>
  );
}

const CSS = `
.my-canopy { transform-box: view-box; transform-origin: 150px ${TOP}px; transition: transform 650ms cubic-bezier(.34,1.56,.64,1); }
.my-runner, .my-rain { transform-box: fill-box; transform-origin: 50% 50%; }
.my-runner { transition: transform 650ms cubic-bezier(.34,1.56,.64,1); }
.my-shadow { transform-box: fill-box; transform-origin: 50% 50%; transition: transform 650ms cubic-bezier(.34,1.56,.64,1); }
.my-ribs, .my-pinch { transition: opacity 400ms; }
.my-rain { transition: transform 700ms cubic-bezier(.16,1,.3,1), opacity 400ms; }
.my-tails { transform-box: view-box; transform-origin: 150px 218px; transition: transform 500ms cubic-bezier(.34,1.56,.64,1); }
.my-strap { transform-box: fill-box; transform-origin: 0% 50%; transition: transform 500ms cubic-bezier(.3,.7,.4,1), opacity 500ms; }
.my-strap.is-off { transform: translate(-6px, 10px) rotate(-38deg); opacity: 0; }
.my-sun { opacity: 0; transform-box: view-box; transform-origin: 150px 54px; }
.my-sun.is-open { animation: my-sun 1.3s cubic-bezier(.16,1,.3,1) 150ms both; }
@keyframes my-sun { 0% { opacity: 0; transform: translateY(54px) scale(.4) rotate(-50deg); } 45% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.my-canopy.is-open { animation: my-open 900ms cubic-bezier(.3,.7,.4,1) both; }
@keyframes my-open { 0% { transform: scale(.779, 1.083); } 45% { transform: scale(1.1, .9); } 72% { transform: scale(.97, 1.03); } 100% { transform: none; } }
.my-conf { transform-box: fill-box; transform-origin: 50% 50%; animation: my-conf 1.4s cubic-bezier(.2,.6,.4,1) both; }
@keyframes my-conf { 0% { opacity: 0; transform: translateY(-40px) rotate(0); } 25% { opacity: 1; } 100% { opacity: 1; transform: translateY(var(--fall)) rotate(var(--spin)); } }
@media (prefers-reduced-motion: reduce) {
  .my-canopy, .my-runner, .my-shadow, .my-rain, .my-tails, .my-strap { transition: opacity 200ms; }
  .my-canopy.is-open { animation: none; }
  .my-sun.is-open { animation: none; opacity: 1; }
}
`;
