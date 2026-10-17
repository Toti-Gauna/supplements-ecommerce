import { Figure, type Pt } from "../figure";
import { Faint, Mesh, Shadow, SmallBall } from "./stage";

/** Ángulo (en grados, horario) que lleva el eje "arriba" de un implemento a apuntar hacia `dir`. */
const aim = (dir: Pt) => (Math.atan2(dir[0], -dir[1]) * 180) / Math.PI;

/** Raqueta de tenis desde el puño: mango, garganta abierta y cabeza ovalada con el encordado. */
function Racket({ at, dir }: { at: Pt; dir: Pt }) {
  const rx = 8.5, ry = 11.5, cy = -23;
  const strings = [-6, -3, 0, 3, 6].map((x) => {
    const h = ry * Math.sqrt(1 - (x / rx) ** 2);
    return `M${x} ${(cy - h).toFixed(1)}V${(cy + h).toFixed(1)}`;
  });
  const cross = [-8, -4, 0, 4, 8].map((y) => {
    const w = rx * Math.sqrt(1 - (y / ry) ** 2);
    return `M${(-w).toFixed(1)} ${cy + y}H${w.toFixed(1)}`;
  });
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${aim(dir).toFixed(1)})`}>
      <path d="M0 3V-9" strokeWidth="4.6" />
      <path d="M0 -8L-5 -13M0 -8L5 -13" strokeWidth="2.4" />
      <path d={[...strings, ...cross].join("")} strokeWidth=".9" strokeOpacity=".7" />
      <ellipse cx="0" cy={cy} rx={rx} ry={ry} strokeWidth="3.2" />
    </g>
  );
}

/** Paleta de pádel: cara maciza perforada, puente calado y mango con cordón. */
function Paddle({ at, dir }: { at: Pt; dir: Pt }) {
  const holes: string[] = [];
  for (let y = -36; y <= -16; y += 5) for (let x = -8; x <= 8; x += 5) {
    if ((x / 9.5) ** 2 + ((y + 26) / 12) ** 2 < 0.8) holes.push(`M${x} ${y}h.01`);
  }
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${aim(dir).toFixed(1)})`}>
      <path d="M0 4V-8" strokeWidth="5" />
      <path d="M0 -8C-11 -11 -12 -20 -12 -28C-12 -36 -7 -40 0 -40C7 -40 12 -36 12 -28C12 -20 11 -11 0 -8Z" fill="currentColor" fillOpacity=".24" strokeWidth="3" />
      <path d="M-3 -13L0 -10L3 -13Z" fill="currentColor" strokeWidth="1.2" />
      <path d={holes.join("")} strokeWidth="2.2" />
    </g>
  );
}

/** Tenis: saque en el punto de impacto, la estela del pique de la pelota y la red del otro lado. */
export function Tenis() {
  return (
    <>
      <Mesh x={118} y={156} w={38} h={20} step={5} o={0.2} />
      <Faint o={0.45} w={2.4}><path d="M118 155H156M118 155V186" /></Faint>
      <Faint o={0.4} w={1.8}><path d="M4 186H156M80 186v-5" /></Faint>
      <Shadow cx={64} rx={30} />
      <Faint o={0.35} w={2.2}><path d="M52 40C56 18 78 4 98 2" /></Faint>
      <Faint o={0.45} w={1.8} dash=".1 6"><path d="M86 104C100 76 112 44 118 22" /></Faint>
      <Figure pose={{
        head: [65, 57], neck: [68, 72], hip: [62, 118],
        arm: [[73, 74], [84, 52], [92, 34]], farArm: [[68, 74], [82, 92], [80, 108]],
        leg: [[62, 118], [70, 150], [70, 178], [79, 184]], farLeg: [[62, 118], [52, 150], [40, 170], [34, 180]],
      }} near={<Racket at={[92, 34]} dir={[0.55, -0.83]} />} />
      <SmallBall x={121} y={13} />
      <Faint o={0.55} w={1.8}><path d="M128 8l5-3M130 15h6M128 22l5 3" /></Faint>
    </>
  );
}

/** Pádel: volea de derecha en estocada, con los vidrios y el alambrado del fondo y la red baja adelante. */
export function Padel() {
  return (
    <>
      <Mesh x={6} y={10} w={148} h={34} step={7} o={0.14} />
      <path d="M6 46h72v104H6zM82 46h72v104H82z" fill="currentColor" fillOpacity=".05" strokeOpacity=".38" strokeWidth="2" />
      <Faint o={0.22} w={2}><path d="M14 76l22-22M20 86l32-32M90 76l22-22M96 86l32-32" /></Faint>
      <Faint o={0.4} w={1.8}><path d="M4 186H156" /></Faint>
      <Shadow cx={66} rx={36} />
      <Figure pose={{
        head: [86, 68], neck: [80, 82], hip: [64, 122],
        arm: [[82, 84], [100, 96], [112, 90]], farArm: [[78, 85], [62, 98], [52, 110]],
        leg: [[64, 122], [90, 146], [94, 180], [104, 184]], farLeg: [[64, 122], [50, 154], [34, 172], [26, 182]],
      }} near={<Paddle at={[112, 90]} dir={[0.5, -0.87]} />} />
      <SmallBall x={146} y={52} />
      <Faint o={0.45} w={1.8}><path d="M154 46h6M155 54h5" /></Faint>
      <Mesh x={124} y={160} w={36} h={26} step={5} o={0.24} />
      <path d="M124 158H160" strokeWidth="3" />
      <Faint o={0.5} w={3}><path d="M124 158V186" /></Faint>
    </>
  );
}

/** Hockey: conducción agachada con el palo en jota y la bocha pegada; el arco de jaula y la medialuna del área. */
export function Hockey() {
  return (
    <>
      <Mesh x={122} y={44} w={38} h={44} step={6} o={0.16} />
      <Faint o={0.3} w={2}><path d="M122 44l12-9H160M134 35v44l-12 9" /></Faint>
      <Faint o={0.5} w={3.2}><path d="M122 88V44H160M122 88h38" /></Faint>
      <Faint o={0.35} w={1.8} dash="6 5"><path d="M-4 200C30 178 130 178 164 200" /></Faint>
      <Faint o={0.4} w={1.8}><path d="M4 184H156" /></Faint>
      <Shadow cx={68} rx={36} y={186} />
      <Figure pose={{
        head: [98, 64], neck: [90, 76], hip: [62, 106],
        arm: [[92, 79], [104, 96], [98, 115]], farArm: [[86, 79], [78, 92], [86, 96]],
        leg: [[62, 106], [86, 136], [88, 176], [98, 182]], farLeg: [[62, 106], [50, 140], [38, 166], [32, 178]],
      }} near={<path d="M80 86L124 160Q129 169 137 169Q143 168 142 161" strokeWidth="4.6" />} />
      <Faint o={0.45} w={2}><path d="M156 166h4M158 174h2" /></Faint>
      <SmallBall x={150} y={172} r={4.8} />
    </>
  );
}
