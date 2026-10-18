import { PropDefs, Shaker } from "../campaigns/props";
import { Beam, Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const CHALK = "#eef1f5";
const TURF = 330;
/** Marcador del predio, en la pared: ahí va el nombre y el descuento (dia-del-futbolista.css). */
export const FU_LED = { x: 536, y: 52, w: 180, h: 72 };
/** Arco de entrenamiento: palos de adelante (F) y el fondo de la red (K). */
const F = { l: 196, r: 604, top: 196, bot: 452 };
const K = { l: 250, r: 550, top: 236, bot: 420 };
/** Donde pega la pelota en la red (el CSS la lleva hasta acá) y donde queda (400,322 y 420,396 de 800 × 600). */
const HIT = { x: 400, y: 322 };
const BALL = { x: 420, y: 396, r: 24 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pt = (x: number, y: number) => `${Math.round(x)} ${Math.round(y)}`;

/** Red del fondo, con la pelota hundiéndola (`dent` > 0): cada nudo se corre hacia el golpe según qué tan cerca está. */
function backNet(dent: number) {
  const warp = (x: number, y: number) => {
    const d2 = ((x - HIT.x) / 120) ** 2 + ((y - HIT.y) / 90) ** 2;
    const k = dent * Math.exp(-d2);
    return pt(lerp(x, HIT.x, k), lerp(y, HIT.y, k));
  };
  const line = (n: number, f: (t: number) => [number, number]) => `M${Array.from({ length: n + 1 }, (_, i) => warp(...f(i / n))).join("L")}`;
  const v = Array.from({ length: 16 }, (_, i) => line(dent ? 18 : 1, (t) => [K.l + i * 20, lerp(K.top, K.bot, t)]));
  const h = Array.from({ length: 10 }, (_, i) => line(dent ? 30 : 1, (t) => [lerp(K.l, K.r, t), K.top + i * 20]));
  return [...v, ...h].join("");
}

/** Costados y techo de la red (no se mueven con el golpe). */
function sideNet() {
  const d: string[] = [];
  for (let i = 1; i < 6; i++) {
    const s = i / 6;
    for (const sg of [-1, 1]) {
      const fx = sg < 0 ? F.l : F.r, kx = sg < 0 ? K.l : K.r;
      d.push(`M${pt(lerp(fx, kx, s), lerp(F.top, K.top, s))}L${pt(lerp(fx, kx, s), lerp(F.bot, K.bot, s))}`);
    }
    d.push(`M${pt(lerp(F.l, K.l, s), lerp(F.top, K.top, s))}L${pt(lerp(F.r, K.r, s), lerp(F.top, K.top, s))}`);
  }
  for (let i = 1; i < 13; i++) {
    const t = i / 13;
    d.push(`M${pt(F.l, lerp(F.top, F.bot, t))}L${pt(K.l, lerp(K.top, K.bot, t))}M${pt(F.r, lerp(F.top, F.bot, t))}L${pt(K.r, lerp(K.top, K.bot, t))}`);
  }
  for (let i = 1; i < 20; i++) {
    const t = i / 20;
    d.push(`M${pt(lerp(F.l, F.r, t), F.top)}L${pt(lerp(K.l, K.r, t), K.top)}`);
  }
  return d.join("");
}

/** 1 · El predio de noche: pared, reflector, césped con las franjas, la base del arco, conos, shaker y el marcador. */
function Field() {
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#03100a"], [0.7, "#0a2a14"], [1, "#123d20"]]} />
        <VGrad id="turf" stops={[[0, "#0d4523"], [0.3, "#11592d"], [1, "#03140a"]]} />
      </defs>
      <PropDefs ids={ids} volt={CHALK} plasma="#16703a" />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={TURF} o={0.06} />
      <rect y={TURF} width={SW} height={SH - TURF} fill="url(#turf)" />
      <path d={[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => `M${400 + i * 70} ${TURF}L${400 + i * 300} ${SH}h150L${400 + i * 70 + 35} ${TURF}z`).filter((_, i) => i % 2 === 0).join("")} fill="#000" opacity=".12" />
      <Beam ids={ids} k="f" x0={260} x1={400} y1={430} w={300} color={CHALK} o={0.2} />
      <Glow id="halo" cx={400} cy={320} rx={330} ry={200} color="#2fbf62" o={0.22} />
      <path d={`M60 ${F.bot + 30}H740`} stroke={CHALK} strokeOpacity=".5" strokeWidth="5" />
      <path d={`M${F.l} ${F.bot}L${K.l} ${K.bot}H${K.r}L${F.r} ${F.bot}`} stroke="#c9ced6" strokeWidth="5" fill="none" />
      <ellipse cx={BALL.x} cy={K.bot} rx="30" ry="5" fill="#000" opacity=".45" />
      <Dust seed={2} n={40} x={160} y={60} w={420} h={300} rMax={1.8} o={0.35} />
      <LedBox {...FU_LED} color={CHALK} />
      {[[112, 540, 1], [704, 556, 1.1], [150, 600, 1.3]].map(([x, y, s]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
          <ellipse cx="0" cy="0" rx="26" ry="6" fill="#000" opacity=".4" />
          <path d="M-22 0L-6 -46h12L22 0z" fill="#ff7a1a" />
          <path d="M-14 -22h28" stroke={CHALK} strokeWidth="6" />
          <path d="M-22 0L-6 -46h12L22 0z" fill={ids.url("cyl")} opacity=".6" />
        </g>
      ))}
      <Shaker ids={ids} x={660} y={500} s={0.42} accent={CHALK} tint="#2ee6d6" />
      <Vignette o={0.7} />
    </Layer>
  );
}

function Net({ dent }: { dent: number }) {
  return (
    <Layer>
      {dent > 0 && <Glow id="dent" cx={HIT.x} cy={HIT.y} rx={110} ry={80} color="#000" o={0.5} />}
      <path d={backNet(dent)} stroke={CHALK} strokeOpacity=".38" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <path d={sideNet()} stroke={CHALK} strokeOpacity=".26" strokeWidth="1.4" fill="none" />
    </Layer>
  );
}

/** 2 · La red quieta · 3 · la red hundida por la pelota (el CSS cruza una con otra en el golpe). */
const NetRest = () => <Net dent={0} />;
const NetHit = () => <Net dent={0.34} />;

/** 4 · La pelota de entrenamiento, ya adentro del arco (el CSS la trae de cerca de la cámara). */
function Ball() {
  const { x, y, r } = BALL;
  const pent = (cx: number, cy: number, s: number) => `M${Array.from({ length: 5 }, (_, i) => { const a = (i * 72 - 90) * Math.PI / 180; return pt(cx + s * Math.cos(a), cy + s * Math.sin(a)); }).join("L")}Z`;
  return (
    <Layer>
      <defs>
        <clipPath id="ball"><circle cx={x} cy={y} r={r} /></clipPath>
        <radialGradient id="shade" cx=".35" cy=".3" r=".75">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".65" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={CHALK} />
      <path d={pent(x - 2, y - 2, r * 0.34) + pent(x - r * 0.86, y - r * 0.5, r * 0.3) + pent(x + r * 0.8, y - r * 0.6, r * 0.3) + pent(x + r * 0.56, y + r * 0.86, r * 0.3) + pent(x - r * 0.66, y + r * 0.8, r * 0.28)} fill="#12161d" clipPath="url(#ball)" />
      <path d={`M${x - 2} ${y - 2 - r * 0.34}L${x + r * 0.8} ${y - r * 0.6}M${x - 2 - r * 0.32} ${y - 2 - r * 0.1}L${x - r * 0.86} ${y - r * 0.5}M${x + r * 0.32} ${y + r * 0.2}L${x + r * 0.56} ${y + r * 0.86}`} stroke="#12161d" strokeWidth="1.2" strokeOpacity=".5" />
      <circle cx={x} cy={y} r={r} fill="url(#shade)" />
      <circle cx={x} cy={y} r={r} fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" />
    </Layer>
  );
}

/** 5 · Los palos y el travesaño, adelante de todo. */
function Frame() {
  return (
    <Layer>
      <defs><VGrad id="post" x2={1} y2={0} stops={[[0, "#8b95a3"], [0.4, "#ffffff"], [1, "#9aa4b2"]]} /></defs>
      <rect x={F.l - 10} y={F.top - 10} width={F.r - F.l + 20} height="12" rx="4" fill="url(#post)" />
      {[F.l, F.r].map((x) => <rect key={x} x={x - 7} y={F.top - 6} width="14" height={F.bot - F.top + 6} rx="4" fill="url(#post)" />)}
      <path d={`M${F.l - 8} ${F.top - 8}H${F.r + 8}`} stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
      {[F.l, F.r].map((x) => <ellipse key={`s${x}`} cx={x} cy={F.bot + 2} rx="16" ry="4" fill="#000" opacity=".5" />)}
    </Layer>
  );
}

export const diaDelFutbolistaLayers = [Field, NetRest, NetHit, Ball, Frame];
