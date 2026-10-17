import { Led, Percent, ledWidth } from "./led";
import { Jar, PropDefs, Rack, Tub } from "./props";
import { Athlete, Backdrop, Beam, Dust, FLOOR, Flare, useArtIds, W } from "./stage";

const VOLT = "#c8ff2e";

/**
 * Black Friday: el box a oscuras, un solo haz voltio sobre el rack con los potes de la campaña y el descuento en
 * el marcador LED colgado del rack. En primer plano, un atleta entra con su bolso, recortado por el filo de luz.
 */
export function BlackFriday() {
  const ids = useArtIds();
  const digits = "30", dh = 96, dw = ledWidth(digits, dh) + 24 + dh * 0.6;
  const dx = 400 - dw / 2;
  return (
    <>
      <Backdrop ids={ids} from="#050506" to="#26282e" glow="#3a3d46" glowAt={[400, 560]} />
      <PropDefs ids={ids} />
      {/* Haz voltio: entra desde arriba a la izquierda y cae sobre el estante. */}
      <Beam ids={ids} k="v" x0={300} x1={420} w={240} color={VOLT} o={0.42} />
      <Dust seed={11} n={70} x={250} y={60} w={330} h={640} rMax={2.4} o={0.45} />
      {/* Rack con los parantes, el marcador arriba y el estante de los potes. */}
      <Rack ids={ids} x={400} y={FLOOR} w={330} top={80} shelf={520} />
      <g>
        <rect x={dx - 26} y={116} width={dw + 52} height={dh + 60} rx="4" fill="#07080a" stroke="#2a2e36" strokeWidth="3" />
        <rect x={dx - 20} y={122} width={dw + 40} height={dh + 48} rx="2" fill="#020203" />
        <path d={`M${dx - 26} 118h${dw + 52}`} stroke="#fff" strokeOpacity=".18" strokeWidth="2" />
        <Led value={digits} x={dx + 8} y={146} h={dh} color={VOLT} />
        <Percent x={dx + 8 + ledWidth(digits, dh) + 22} y={146} h={dh} color={VOLT} />
        <rect x={dx - 20} y={122} width={dw + 40} height={dh + 48} fill={VOLT} opacity=".05" />
      </g>
      {/* Potes en el estante: el del medio bajo la luz, los otros en penumbra. */}
      <Tub ids={ids} x={400} y={520} s={0.86} tint="#8b72ff" />
      <Jar ids={ids} x={262} y={520} s={0.92} tint="#2ee6d6" lit={0.55} />
      <Tub ids={ids} x={540} y={520} s={0.6} tall tint="#ff6a3d" lit={0.5} />
      <Flare ids={ids} k="a" cx={458} cy={352} color={VOLT} s={0.55} o={0.75} />
      {/* Mancha en el piso delante del rack y la línea del filo voltio (corte en diagonal). */}
      <path d={`M0 ${H_CUT}L${W} ${H_CUT - 150}`} stroke={VOLT} strokeOpacity=".35" strokeWidth="2" />
      {/* Atleta entrando, de espaldas a la cámara, a contraluz con filo voltio. */}
      <Athlete
        pose={{
          head: [70, 46], neck: [66, 62], hip: [60, 112], chest: 11, waist: 7.5,
          arm: [[70, 66], [80, 92], [72, 114]], farArm: [[62, 66], [50, 90], [54, 112]],
          leg: [[60, 112], [78, 146], [84, 180], [96, 184]], farLeg: [[60, 112], [46, 148], [36, 178], [44, 184]],
        }}
        x={120} y={340} s={3.7} rim={VOLT} rimDx={2.4} rimDy={-1}
        near={<g><path d="M72 114v8" strokeWidth="3" /><rect x="50" y="120" width="48" height="34" rx="7" fill="currentColor" stroke="none" /></g>}
      />
      <Dust seed={5} n={40} x={60} y={420} w={300} h={560} color={VOLT} rMax={1.8} o={0.35} />
    </>
  );
}

const H_CUT = 940;
