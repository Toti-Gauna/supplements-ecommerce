type Pt = readonly [number, number];

const LINE = "#4a5058";
const MARK = "#0a7770";
const BODY = "#dcdfd9";

/** Ángulo (grados) del vector a→b. */
const dir = (a: Pt, b: Pt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const polar = (c: Pt, r: number, deg: number): Pt => [c[0] + r * Math.cos((deg * Math.PI) / 180), c[1] + r * Math.sin((deg * Math.PI) / 180)];

/** Arco de medición entre dos segmentos que salen de `c`, con su lectura en grados. */
function Angle({ c, a, b, r }: { c: Pt; a: Pt; b: Pt; r: number }) {
  let a0 = dir(c, a);
  let a1 = dir(c, b);
  if (a1 < a0) [a0, a1] = [a1, a0];
  if (a1 - a0 > 180) [a0, a1] = [a1, a0 + 360];
  const [p0, p1, lp] = [polar(c, r, a0), polar(c, r, a1), polar(c, r + 24, (a0 + a1) / 2)];
  return (
    <g>
      <path d={`M${p0[0]} ${p0[1]}A${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`} fill="none" stroke={MARK} strokeWidth="1.8" />
      <text x={lp[0]} y={lp[1] + 6} textAnchor="middle" fill={MARK} fontSize="17" fontWeight="700">{Math.round(a1 - a0)}°</text>
    </g>
  );
}

const seg = (a: Pt, b: Pt) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;

/**
 * Sentadilla trasera dibujada como diagrama biomecánico: silueta de segmentos (sin cara), esqueleto con marcadores
 * de captura, ángulos de rodilla y cadera, el disco de 20 kg y la trayectoria de la barra. Decorativo, detrás del
 * producto en el hero.
 */
export function AthleteDiagram({ floor: F }: { floor: number }) {
  const k = 1.4;
  const P = (x: number, y: number): Pt => [84 + x * k, F - y * k];
  const toe = P(0, 0), heel = P(42, 0), ankle = P(38, 8), knee = P(2, 66), hip = P(72, 56);
  const shoulder = P(40, 140), elbow = P(70, 118), hand = P(52, 138), head = P(30, 164), bar = P(46, 145);
  const limbs: [Pt, Pt, number][] = [[heel, toe, 9], [ankle, knee, 15], [knee, hip, 22], [hip, shoulder, 30], [shoulder, elbow, 11], [elbow, hand, 10]];
  return (
    <g aria-hidden="true" fontFamily="var(--mono)">
      <circle cx={bar[0]} cy={bar[1]} r="112" fill="none" stroke="#a9aea7" strokeWidth="1.6" />
      <circle cx={bar[0]} cy={bar[1]} r="94" fill="none" stroke="#a9aea7" strokeWidth=".9" strokeDasharray="2 5" />
      <circle cx={bar[0]} cy={bar[1]} r="16" fill="none" stroke="#a9aea7" strokeWidth="1.6" />
      <text x={bar[0]} y={bar[1] - 124} textAnchor="middle" fontSize="15" fill={LINE}>Ø 450 mm · 20 kg</text>
      <path d={`M${bar[0]} ${bar[1] - 140}V${bar[1] - 182}M${bar[0] - 6} ${bar[1] - 170}L${bar[0]} ${bar[1] - 182}L${bar[0] + 6} ${bar[1] - 170}`} stroke={LINE} strokeWidth="1.2" strokeDasharray="4 4" fill="none" />
      <text x={bar[0] + 12} y={bar[1] - 164} fontSize="15" fill={LINE}>trayectoria</text>
      <g stroke={BODY} strokeLinecap="round">{limbs.map(([a, b, w], i) => <path key={i} d={seg(a, b)} strokeWidth={w * k} />)}</g>
      <circle cx={head[0]} cy={head[1]} r={13 * k} fill={BODY} />
      <path d={[toe, heel, ankle, knee, hip, shoulder, elbow, hand].map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join("")} fill="none" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={seg(shoulder, head)} stroke={LINE} strokeWidth="1.6" />
      <Angle c={knee} a={ankle} b={hip} r={26} />
      <Angle c={hip} a={knee} b={shoulder} r={28} />
      {[ankle, knee, hip, shoulder, elbow].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" fill="#2ee6d6" stroke="#131518" strokeWidth="1.5" />
      ))}
    </g>
  );
}
