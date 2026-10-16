import { Figure } from "../figure";

/** Mancuerna horizontal centrada en el puño: barra, dos discos por lado y el collar. */
function Dumbbell({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 13} ${y}h26`} strokeWidth="3.4" />
      <path d={`M${x - 13} ${y - 9}h5v18h-5zM${x + 8} ${y - 9}h5v18h-5z`} fill="currentColor" strokeWidth="2" />
      <path d={`M${x - 16} ${y - 6}v12M${x + 16} ${y - 6}v12`} strokeWidth="3" />
    </g>
  );
}

/** Masa muscular: curl de bíceps doble con mancuernas, de frente y con el pecho abierto. */
export function MasaMuscular() {
  return (
    <>
      <ellipse cx="60" cy="191" rx="34" ry="3.6" fill="currentColor" fillOpacity=".2" stroke="none" />
      <g strokeOpacity=".5" strokeWidth="2"><path d="M14 74q-5 6-2 13M106 74q5 6 2 13M18 96q-3 3-1 7M102 96q3 3 1 7" /></g>
      <Figure pose={{
        head: [60, 30], neck: [60, 48], hip: [60, 104], chest: 13, waist: 8.5, headR: 11, flat: true,
        arm: [[47, 54], [30, 82], [27, 56]], farArm: [[73, 54], [90, 82], [93, 56]],
        leg: [[53, 104], [48, 148], [46, 186], [38, 189]], farLeg: [[67, 104], [72, 148], [74, 186], [82, 189]],
      }} near={<><Dumbbell x={27} y={52} /><Dumbbell x={93} y={52} /></>} />
    </>
  );
}

/** Fuerza: barra olímpica bloqueada sobre la cabeza (se arquea con el peso), discos grandes y magnesio en las manos. */
export function Fuerza() {
  const plates = (x: number, s: 1 | -1) =>
    `M${x} 6h${7 * s}v40h${-7 * s}zM${x + 8 * s} 12h${5 * s}v28h${-5 * s}z`;
  return (
    <>
      <ellipse cx="60" cy="191" rx="40" ry="3.6" fill="currentColor" fillOpacity=".2" stroke="none" />
      <g fill="currentColor" fillOpacity=".4" stroke="none">
        <circle cx="22" cy="14" r="1.6" /><circle cx="18" cy="34" r="1.3" /><circle cx="98" cy="14" r="1.6" /><circle cx="102" cy="34" r="1.3" />
      </g>
      <Figure pose={{
        head: [60, 46], neck: [60, 62], hip: [60, 114], chest: 13, waist: 8.5, headR: 11, flat: true,
        arm: [[47, 66], [36, 46], [28, 26]], farArm: [[73, 66], [84, 46], [92, 26]],
        leg: [[53, 114], [40, 150], [38, 186], [30, 189]], farLeg: [[67, 114], [80, 150], [82, 186], [90, 189]],
      }} near={
        <g>
          <path d="M4 27Q60 20 116 27" strokeWidth="3.6" />
          <path d={`${plates(5, 1)}${plates(115, -1)}`} fill="currentColor" strokeWidth="2.4" />
          <path d="M23 21v12M97 21v12" strokeWidth="3" />
        </g>
      } />
    </>
  );
}

/** Definición: sogas de batalla en media sentadilla, las dos ondas en fase opuesta y gotas de esfuerzo. */
export function Definicion() {
  return (
    <>
      <ellipse cx="38" cy="191" rx="32" ry="3.6" fill="currentColor" fillOpacity=".2" stroke="none" />
      <g fill="currentColor" fillOpacity=".5" stroke="none">
        <path d="M24 44q-3 5 0 7q3-2 0-7zM58 40q-3 5 0 7q3-2 0-7z" />
      </g>
      <g strokeOpacity=".4" strokeWidth="1.8"><path d="M76 84l3-5M94 82l3-5M112 92l4-4" /></g>
      <path d="M62 104c5 16 11 16 15 0s9-16 14 0s9 16 14 2s8-6 15-2" strokeWidth="4" strokeOpacity=".5" />
      <Figure pose={{
        head: [44, 58], neck: [42, 74], hip: [32, 116], chest: 10,
        arm: [[46, 78], [54, 100], [66, 108]], farArm: [[42, 78], [50, 97], [62, 104]],
        leg: [[32, 116], [56, 138], [54, 182], [64, 187]], farLeg: [[32, 116], [18, 148], [14, 184], [24, 188]],
      }} near={<path d="M66 108c5-17 11-17 15 0s9 17 14 0s9-14 14-2s7 8 12 4" strokeWidth="4" />} />
    </>
  );
}
