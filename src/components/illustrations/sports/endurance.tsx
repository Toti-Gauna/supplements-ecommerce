import { useId } from "react";
import { Figure, type Pose } from "../figure";
import { Faint, Shadow } from "./stage";

/** Running: velocista en plena zancada saliendo de los tacos, con los andariveles de la pista. */
export function Running() {
  return (
    <>
      <Faint o={0.45} w={2}><path d="M2 186H158" /></Faint>
      <Faint o={0.22} w={1.6}><path d="M2 196H158M120 186l6 10M60 186l-4 10" /></Faint>
      <path d="M8 186l10-10h4l-2 10z" fill="currentColor" fillOpacity=".3" strokeOpacity=".5" strokeWidth="1.6" />
      <Shadow cx={70} rx={34} />
      <Faint o={0.4} w={2.4}><path d="M10 56h20M4 74h22M14 94h14M4 124h14" /></Faint>
      <Figure pose={{
        head: [102, 42], neck: [95, 58], hip: [74, 104],
        arm: [[92, 62], [72, 76], [60, 64]], farArm: [[97, 62], [112, 80], [126, 68]],
        leg: [[74, 104], [104, 112], [100, 144], [111, 147]], farLeg: [[74, 104], [60, 140], [42, 174], [36, 184]],
      }} />
    </>
  );
}

/** Rueda de ruta: llanta, cubierta y rayos tenues. */
function Wheel({ x, y }: { x: number; y: number }) {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 8;
    const dx = (Math.cos(a) * 21).toFixed(1), dy = (Math.sin(a) * 21).toFixed(1);
    return `M${x} ${y}m${dx} ${dy}l${(-2 * Number(dx)).toFixed(1)} ${(-2 * Number(dy)).toFixed(1)}`;
  });
  return (
    <g>
      <circle cx={x} cy={y} r="25" strokeWidth="3.6" />
      <circle cx={x} cy={y} r="20.5" strokeWidth="1.4" strokeOpacity=".45" />
      <path d={spokes.join("")} strokeWidth=".9" strokeOpacity=".35" />
      <circle cx={x} cy={y} r="2.8" fill="currentColor" stroke="none" />
    </g>
  );
}

/** Ciclismo: rutero acoplado sobre la bici, casco aero y pedalada, con la ruta y las líneas de velocidad. */
export function Ciclismo() {
  return (
    <>
      <Faint o={0.4} w={2}><path d="M2 176H158" /></Faint>
      <Faint o={0.22} w={2} dash="10 8"><path d="M6 188H156" /></Faint>
      <Shadow cx={82} rx={60} y={178} o={0.16} />
      <Faint o={0.4} w={2.2}><path d="M2 118h10M0 134h8M8 100h18M30 84h18" /></Faint>
      <Wheel x={38} y={150} />
      <Wheel x={124} y={150} />
      <g strokeWidth="3.4">
        <path d="M38 150L78 154L68 108ZM68 108H110M78 154L114 122M110 106L114 122L124 150" />
        <path d="M66 108l-2-6M58 101h14" strokeWidth="4" />
        <path d="M110 106l8-3c7 0 9 4 9 9s-3 8-8 8" strokeWidth="3" />
      </g>
      <circle cx="78" cy="154" r="7" strokeWidth="2.4" />
      <path d="M78 154L88 161M78 154L68 147" strokeWidth="3" />
      <Figure pose={{
        head: [114, 72], neck: [102, 80], hip: [64, 98], chest: 8.5, waist: 6.5,
        arm: [[102, 84], [112, 98], [124, 110]], farArm: [[99, 84], [108, 100], [121, 113]],
        leg: [[64, 98], [92, 120], [86, 156], [95, 161]], farLeg: [[64, 98], [88, 113], [64, 144], [71, 148]],
      }} />
      <path d="M100 76Q98 58 115 56.5Q129 57 130 70" strokeWidth="4.6" />
      <path d="M130 70l-6 1M104 62l-6-3" strokeWidth="2.6" />
    </>
  );
}

const WAVE = "q10-6 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0";
const SWIMMER: Pose = {
  head: [117, 111], neck: [104, 115], hip: [54, 121], headR: 9.5,
  arm: [[100, 113], [106, 82], [129, 97]], farArm: [[104, 119], [126, 125], [146, 127]],
  leg: [[54, 121], [32, 123], [12, 118], [4, 113]], farLeg: [[54, 121], [32, 129], [13, 133], [5, 137]],
};

/** Natación: crol con el brazo en el recobro sobre el agua, lo sumergido más tenue, banderines de espalda y el carril. */
export function Natacion() {
  const id = `sw${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const flags = Array.from({ length: 8 }, (_, i) => `M${8 + i * 20} ${28 + (i < 4 ? i : 7 - i) * 1.2}l9 0l-4.5 10z`);
  return (
    <>
      <clipPath id={`${id}-up`}><path d="M0 -20H160V116q-10-6-20 0t-20 0t-20 0t-20 0t-20 0t-20 0t-20 0t-20 0Z" /></clipPath>
      <clipPath id={`${id}-down`}><path d={`M0 116${WAVE}V220H0Z`} /></clipPath>
      <Faint o={0.45} w={1.4}><path d="M0 27Q80 36 160 27" /></Faint>
      <path d={flags.join("")} fill="currentColor" fillOpacity=".4" strokeOpacity=".5" strokeWidth="1" />
      <path d={`M0 116${WAVE}V184H0Z`} fill="currentColor" fillOpacity=".08" stroke="none" />
      <Faint o={0.24} w={1.6}><path d="M0 134q10-4 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0M10 152q10-4 20 0t20 0M90 152q10-4 20 0t20 0" /></Faint>
      <Faint o={0.32} w={5}><path d="M16 176H140M140 168v16" /></Faint>
      <g clipPath={`url(#${id}-down)`} opacity=".42"><Figure pose={SWIMMER} /></g>
      <g clipPath={`url(#${id}-up)`}><Figure pose={SWIMMER} /></g>
      <path d={`M0 116${WAVE}`} strokeWidth="2.6" strokeOpacity=".75" />
      <Faint o={0.6} w={2}><path d="M126 112q6-8 15-3M2 108q4-9 12-5M18 104q3-6 8-4" /></Faint>
      <g fill="currentColor" stroke="none" fillOpacity=".55">
        <circle cx="100" cy="96" r="1.8" /><circle cx="96" cy="104" r="1.4" /><circle cx="138" cy="98" r="1.5" /><circle cx="8" cy="98" r="1.6" /><circle cx="20" cy="96" r="1.2" /><circle cx="132" cy="100" r="1.4" />
      </g>
    </>
  );
}
