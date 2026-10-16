import { Figure } from "../figure";

const shadow = (cx: number, rx: number, o = 0.2) => <ellipse cx={cx} cy="191" rx={rx} ry={rx / 9} fill="currentColor" fillOpacity={o} stroke="none" />;

/** Energía: salto a la soga en el aire; la soga pasa bajo los pies y deja su estela por arriba. */
export function Energia() {
  return (
    <>
      {shadow(60, 20, 0.14)}
      <g strokeWidth="2">
        <path d="M24 98C14 40 32 8 60 8C88 8 106 40 96 98" strokeOpacity=".22" />
        <path d="M24 98C8 70 12 36 26 22M96 98C112 70 108 36 94 22" strokeOpacity=".14" />
      </g>
      <g strokeOpacity=".5" strokeWidth="2"><path d="M10 30l-6-4M8 46H1M110 30l6-4M112 46h7" /></g>
      <Figure pose={{
        head: [60, 32], neck: [60, 48], hip: [60, 100], chest: 12, waist: 8, headR: 11, flat: true,
        arm: [[48, 53], [40, 76], [27, 92]], farArm: [[72, 53], [80, 76], [93, 92]],
        leg: [[54, 100], [47, 134], [54, 164], [49, 170]], farLeg: [[66, 100], [73, 134], [66, 164], [71, 170]],
      }} near={
        <g>
          <path d="M24 98C16 160 30 184 60 184C90 184 104 160 96 98" strokeWidth="2.6" />
          <path d="M27 92l-4 9M93 92l4 9" strokeWidth="4.4" />
        </g>
      } />
    </>
  );
}

/** Resistencia: fondista en zancada larga, con el pulso en lo alto y la ruta con su línea punteada. */
export function Resistencia() {
  return (
    <>
      {shadow(54, 34)}
      <path d="M2 20h24l5-11 7 22 5-11h20" strokeWidth="2.2" strokeOpacity=".45" />
      <g strokeOpacity=".4" strokeWidth="2.4"><path d="M4 64h14M2 82h12M8 118h10" /></g>
      <path d="M4 196h112" strokeWidth="2" strokeOpacity=".22" strokeDasharray="10 8" />
      <Figure pose={{
        head: [68, 30], neck: [64, 46], hip: [56, 100],
        arm: [[62, 50], [50, 72], [41, 64]], farArm: [[65, 50], [80, 68], [90, 57]],
        leg: [[56, 100], [80, 122], [74, 158], [85, 163]], farLeg: [[56, 100], [46, 136], [26, 154], [20, 163]],
      }} />
    </>
  );
}

/** Recuperación: elongación lateral con el brazo en arco sobre la cabeza, el rolo de espuma y la luna del descanso. */
export function Recuperacion() {
  return (
    <>
      {shadow(56, 32)}
      <path d="M103 9a11 11 0 1 0 9 17a9 9 0 1 1-9-17Z" fill="currentColor" fillOpacity=".45" stroke="none" />
      <g strokeOpacity=".3" strokeWidth="1.8"><path d="M92 52q6-4 12 0t12 0M96 62q6-4 12 0t8 0" /></g>
      <path d="M30 34q-12 30 0 64" strokeWidth="2" strokeOpacity=".35" strokeDasharray="3 5" />
      <rect x="86" y="174" width="32" height="15" rx="7.5" fill="currentColor" fillOpacity=".24" strokeWidth="2.6" />
      <ellipse cx="110.5" cy="181.5" rx="3.5" ry="7.5" strokeWidth="2" />
      <path d="M93 178v8M99 178v8M105 178v8" strokeWidth="2" strokeOpacity=".5" />
      <Figure pose={{
        head: [67, 35], neck: [63, 51], hip: [56, 104], chest: 12, waist: 8, headR: 11, flat: true,
        arm: [[52, 55], [45, 23], [78, 8]], farArm: [[74, 56], [86, 78], [69, 97]],
        leg: [[50, 104], [42, 146], [38, 186], [30, 189]], farLeg: [[62, 104], [70, 146], [74, 186], [82, 189]],
      }} />
    </>
  );
}

/** Salud: postura del árbol sobre la colchoneta, manos juntas arriba y un halo de respiración. */
export function Salud() {
  return (
    <>
      <circle cx="60" cy="84" r="50" strokeWidth="1.6" strokeOpacity=".16" />
      <circle cx="60" cy="84" r="40" strokeWidth="1.4" strokeOpacity=".1" strokeDasharray="3 6" />
      <g fill="currentColor" fillOpacity=".5" stroke="none">
        <path d="M14 46l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6zM104 76l1.2 3.3 3.3 1.2-3.3 1.2-1.2 3.3-1.2-3.3-3.3-1.2 3.3-1.2z" />
      </g>
      <path d="M12 191h88" strokeWidth="6" strokeOpacity=".3" />
      <circle cx="105" cy="187" r="5" strokeWidth="2.4" strokeOpacity=".45" />
      <Figure pose={{
        head: [60, 36], neck: [60, 52], hip: [60, 108], chest: 12, waist: 8, headR: 11, flat: true,
        arm: [[50, 54], [40, 28], [58, 6]], farArm: [[70, 54], [80, 28], [62, 6]],
        leg: [[56, 108], [57, 148], [58, 186], [52, 189]], farLeg: [[64, 108], [88, 130], [62, 146], [59, 141]],
      }} />
    </>
  );
}
