import { Led, ledWidth } from "./led";
import { PropDefs, Shaker, Tub } from "./props";
import { Athlete, Backdrop, Beam, Dust, FLOOR, Flare, rng, useArtIds, W } from "./stage";

const VOLT = "#c8ff2e";
const PLASMA = "#8b72ff";

/** Fuego artificial de tiza: rayos punteados que salen del centro y partículas más lejos. */
function ChalkBurst({ cx, cy, r, seed, color = "#fff" }: { cx: number; cy: number; r: number; seed: number; color?: string }) {
  const rnd = rng(seed);
  const at = (a: number, l: number) => `${Math.round(cx + Math.cos(a) * l)} ${Math.round(cy + Math.sin(a) * l)}`;
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + rnd() * 0.2;
    return `M${at(a, r * 0.12)}L${at(a, r * (0.55 + rnd() * 0.45))}`;
  }).join("");
  const sparks = Array.from({ length: 24 }, () => `M${at(rnd() * Math.PI * 2, r * (0.7 + rnd() * 0.5))}h0`).join("");
  return (
    <g fill="none" strokeLinecap="round">
      <path d={rays} stroke={color} strokeOpacity=".75" strokeWidth={Math.round(r * 0.016 * 10) / 10} strokeDasharray={`${Math.round(r * 0.05)} ${Math.round(r * 0.04)}`} />
      <path d={sparks} stroke={color} strokeOpacity=".85" strokeWidth={Math.round(r * 0.04)} />
      <circle cx={cx} cy={cy} r={Math.round(r * 0.07)} fill="#fff" />
    </g>
  );
}

/**
 * Año Nuevo: "actualización de versión". El marcador muestra el año nuevo y una barra de carga de discos casi
 * completa; fuegos artificiales de tiza y un atleta que aterriza el salto al cajón con los brazos en V.
 */
export function AnoNuevo() {
  const ids = useArtIds();
  const year = "2027", dh = 92, dw = ledWidth(year, dh);
  const box = { x: 530, y: FLOOR + 150, w: 230, h: 190 };
  return (
    <>
      <Backdrop ids={ids} from="#0d1330" to="#3a2a8f" glow="#5a3fe6" glowAt={[400, 480]} />
      <PropDefs ids={ids} volt={VOLT} plasma={PLASMA} />
      <Beam ids={ids} k="a" x0={150} x1={420} w={230} color={VOLT} o={0.32} />
      <Beam ids={ids} k="b" x0={650} x1={380} w={230} color={PLASMA} o={0.36} />
      {/* Fuegos de tiza. */}
      <ChalkBurst cx={170} cy={200} r={150} seed={61} />
      <ChalkBurst cx={640} cy={120} r={96} seed={62} color="#e3ff8f" />
      <ChalkBurst cx={690} cy={400} r={70} seed={63} color="#d9c4ff" />
      {/* Marcador: el año y la barra de carga de discos. */}
      <g>
        <rect x={400 - dw / 2 - 40} y={236} width={dw + 80} height={dh + 110} rx="4" fill="#07080f" stroke="#2a2e4a" strokeWidth="3" />
        <path d={`M${400 - dw / 2 - 40} 238h${dw + 80}`} stroke="#fff" strokeOpacity=".2" strokeWidth="2" />
        <Led value={year} x={400 - dw / 2 + 6} y={258} h={dh} color={VOLT} />
        {Array.from({ length: 12 }, (_, i) => {
          const lit = i < 11;
          return <rect key={i} x={400 - dw / 2 - 20 + i * ((dw + 40) / 12) + 3} y={dh + 272} width={(dw + 40) / 12 - 6} height="26" rx="3" fill={lit ? VOLT : "#1a1f3a"} opacity={lit ? 0.9 : 1} />;
        })}
        <rect x={400 - dw / 2 - 20 + 11 * ((dw + 40) / 12) + 3} y={dh + 272} width={(dw + 40) / 12 - 6} height="26" rx="3" fill="#fff" opacity=".35" />
        <rect x={400 - dw / 2 - 40} y={236} width={dw + 80} height={dh + 110} fill={VOLT} opacity=".04" />
      </g>
      {/* Cajón y el atleta aterrizando con los brazos en V. */}
      <path d={`M${box.x} ${box.y}h${box.w}v${-box.h}h${-box.w}z`} fill="#13172e" />
      <path d={`M${box.x} ${box.y - box.h}l30 -22h${box.w}l-30 22z`} fill="#1f2448" />
      <path d={`M${box.x + box.w} ${box.y}v${-box.h}l30 -22v${box.h}z`} fill="#0b0e1e" />
      <path d={`M${box.x} ${box.y - box.h}h${box.w}`} stroke={VOLT} strokeOpacity=".7" strokeWidth="3" />
      <Athlete
        pose={{
          head: [64, 30], neck: [62, 46], hip: [60, 96], chest: 10.5,
          arm: [[68, 50], [86, 30], [98, 6]], farArm: [[56, 50], [40, 30], [30, 6]],
          leg: [[60, 96], [74, 126], [68, 160], [82, 162]], farLeg: [[60, 96], [48, 126], [46, 160], [58, 162]],
        }}
        x={470} y={box.y - box.h - 162 * 3} s={3} color="#05061a" rim={VOLT} rimDx={-2.4} rimDy={-1}
      />
      <Flare ids={ids} k="h" cx={590} cy={box.y - box.h - 470} color={VOLT} s={0.6} o={0.8} />
      {/* Productos: el pote y el shaker, a la izquierda. */}
      <Tub ids={ids} x={170} y={FLOOR + 210} s={0.98} body="#0f1230" band="#171b42" accent={VOLT} tint={PLASMA} />
      <Shaker ids={ids} x={300} y={FLOOR + 226} s={0.9} body="#171b42" accent={VOLT} tint="#2ee6d6" />
      <Dust seed={64} n={110} x={0} y={0} w={W} h={FLOOR + 120} rMax={2.6} o={0.6} />
    </>
  );
}
