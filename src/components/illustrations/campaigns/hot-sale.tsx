import { Jar, Kettlebell, PropDefs, Tub } from "./props";
import { Athlete, Backdrop, Beam, Dust, FLOOR, Flare, useArtIds, W, type ArtIds } from "./stage";

const EMBER = "#ffd34d";
const FIRE = "#ff6a1f";

/** Llama: lengua con el núcleo claro, apoyada en (x, y). */
function Flame({ ids, x, y, h, tilt = 0 }: { ids: ArtIds; x: number; y: number; h: number; tilt?: number }) {
  const w = h * 0.42;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <path d={`M0 0c${-w} ${-h * 0.25} ${-w * 0.9} ${-h * 0.6} ${-w * 0.2} ${-h * 0.72}c${w * 0.1} ${-h * 0.1} ${w * 0.3} ${-h * 0.2} ${w * 0.2} ${-h}c${w * 0.6} ${h * 0.4} ${w * 1.1} ${h * 0.7} 0 ${h}z`} fill={ids.url("fire")} />
      <path d={`M0 0c${-w * 0.45} ${-h * 0.12} ${-w * 0.4} ${-h * 0.35} ${-w * 0.05} ${-h * 0.46}c${w * 0.35} ${h * 0.15} ${w * 0.45} ${h * 0.3} 0 ${h * 0.46}z`} fill="#fff6c8" opacity=".85" />
    </g>
  );
}

/**
 * Hot Sale: calor. Una pesa rusa al rojo en primer plano con llamas en la marca de arrastre, el aire que tiembla,
 * brasas subiendo y el atleta en lo alto del swing, a contraluz naranja.
 */
export function HotSale() {
  const ids = useArtIds();
  const s = 3.3, y = FLOOR + 14 - 184 * s;
  return (
    <>
      <Backdrop ids={ids} from="#5e1508" to="#b8391a" glow="#ff6a1f" glowAt={[430, 560]} />
      <PropDefs ids={ids} volt={EMBER} plasma={FIRE} />
      <defs>
        <linearGradient id={ids.id("fire")} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd34d" />
          <stop offset=".45" stopColor="#ff6a1f" />
          <stop offset="1" stopColor="#b8391a" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id={ids.id("hot")} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset=".3" stopColor="#ff8a1f" />
          <stop offset=".7" stopColor="#7a1c0c" />
          <stop offset="1" stopColor="#1a0806" />
        </linearGradient>
        <radialGradient id={ids.id("heat")} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ffb347" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Beam ids={ids} k="w" x0={520} x1={420} w={270} color="#ffb347" o={0.42} />
      {/* Aire caliente: ondas apenas visibles que tiemblan sobre la pared. */}
      <g fill="none" stroke="#fff" strokeOpacity=".06" strokeWidth="10">
        {[260, 330, 400].map((yy, i) => <path key={yy} d={`M-20 ${yy}q90 ${i % 2 ? -20 : 20} 180 0t180 0t180 0t180 0t120 0`} />)}
      </g>
      {/* Productos de la campaña, con el filo ámbar, a la izquierda. */}
      <Tub ids={ids} x={130} y={FLOOR + 120} s={0.92} body="#1a0d0a" band="#2a1410" accent={EMBER} tint="#ff6a1f" />
      <Jar ids={ids} x={262} y={FLOOR + 142} s={0.86} body="#1a0d0a" band="#2a1410" accent={EMBER} tint="#ffd34d" />
      {/* Atleta en lo alto del swing, a contraluz. */}
      <Athlete
        pose={{
          head: [66, 42], neck: [64, 58], hip: [60, 108], chest: 11,
          arm: [[66, 62], [92, 56], [118, 50]], farArm: [[62, 62], [88, 58], [114, 52]],
          leg: [[60, 108], [66, 146], [62, 180], [74, 184]], farLeg: [[60, 108], [54, 146], [50, 180], [62, 184]],
        }}
        x={150} y={y} s={s} color="#1a0604" rim={EMBER} rimDx={-2.6} rimDy={-1.2}
        near={<g><path d="M110 70q10-18 20 0" strokeWidth="5.5" /><circle cx="120" cy="84" r="15" fill="currentColor" stroke="none" /></g>}
      />
      <Flare ids={ids} k="a" cx={520} cy={110} color="#ffb347" s={0.8} o={0.8} />
      {/* Marca de arrastre con llamas y la pesa al rojo, en primer plano. */}
      <ellipse cx={580} cy={FLOOR + 170} rx={340} ry={140} fill={ids.url("heat")} />
      <path d={`M300 ${FLOOR + 194}q140-50 280-18`} stroke="#000" strokeOpacity=".6" strokeWidth="26" strokeLinecap="round" fill="none" />
      <path d={`M300 ${FLOOR + 194}q140-50 280-18`} stroke={FIRE} strokeOpacity=".8" strokeWidth="5" strokeLinecap="round" fill="none" />
      {[[340, 190, 90, -18], [396, 176, 150, -10], [452, 168, 210, -4], [506, 168, 160, 2], [552, 174, 110, 8]].map(([x, yy, h, t]) => (
        <Flame key={x} ids={ids} x={x!} y={FLOOR + yy!} h={h!} tilt={t} />
      ))}
      <ellipse cx={610} cy={FLOOR + 100} rx={200} ry={170} fill={ids.url("heat")} />
      <Kettlebell ids={ids} x={610} y={FLOOR + 190} r={120} color="#1a0b08" glow={ids.url("hot")} />
      <Dust seed={21} n={90} x={260} y={120} w={460} h={760} color={EMBER} rMax={2.6} o={0.7} />
      <Dust seed={22} n={40} x={330} y={460} w={400} h={420} color="#fff" rMax={1.6} o={0.5} />
      <path d={`M0 ${900}L${W} ${780}`} stroke={EMBER} strokeOpacity=".3" strokeWidth="2" />
    </>
  );
}
