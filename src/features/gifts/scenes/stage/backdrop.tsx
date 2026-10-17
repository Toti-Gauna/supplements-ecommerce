import { Beam, Drop, Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import { tone } from "@/components/illustrations/supplements/defs";
import { FLOOR, type StageColors } from "./types";

interface Props {
  u: string;
  c: StageColors;
  /** Dónde cae el reflector (x) y cuánto se abre en el piso. */
  beam?: number;
  spread?: number;
  /** Color de la luz (por defecto, blanco cálido de estudio). */
  light?: string;
  /** Intensidad del reflector, de 0 a 1 (Halloween lo prende de a poco). */
  power?: number;
  /** Paneles de la pared: líneas verticales cada 100 px y una franja de LED con el acento. */
  panels?: boolean;
  seed?: number;
}

/**
 * Escenario de gimnasio común a todas las aperturas: pared de paneles con la luz de la fecha, una franja LED, el
 * reflector con su cono y el charco en el piso de goma con líneas de fuga. Ilustración: colores literales.
 */
export function GymBackdrop({ u, c, beam = 400, spread = 280, light = "#f6f2e6", power = 1, panels = true, seed = 3 }: Props) {
  const lanes = Array.from({ length: 11 }, (_, i) => `M${-500 + i * 180} 1000L${200 + i * 40} ${FLOOR}`).join("");
  return (
    <g>
      <rect width="800" height={FLOOR} fill={tone(c.from, -0.35)} opacity=".55" />
      <Glow cx={400} cy={FLOOR - 140} rx={520} ry={360} color={c.to} o={0.55} />
      {panels && (
        <>
          <path d={Array.from({ length: 9 }, (_, i) => `M${i * 100} 0V${FLOOR}`).join("") + `M0 ${FLOOR - 120}H800`} stroke="#fff" strokeOpacity=".04" strokeWidth="2" />
          <rect y="118" width="800" height="3" fill={c.accent} opacity=".45" />
          <Glow cx={400} cy={120} rx={460} ry={46} color={c.accent} o={0.22} />
        </>
      )}
      <rect y={FLOOR} width="800" height={1000 - FLOOR} fill="#0b0d10" />
      <path d={lanes + "M0 820H800M0 905H800"} stroke="#f2f0ea" strokeOpacity=".08" strokeWidth="1.5" />
      <path d={`M0 ${FLOOR}H800`} stroke="#fff" strokeOpacity=".1" strokeWidth="2" />
      <g opacity={power}>
        <Beam u={u} x={beam} top={36} bottom={spread} o={0.62} color={light} />
        <Glow cx={beam} cy={FLOOR + 14} rx={spread * 1.15} ry={56} color={light} o={0.5} />
        <path d={`M${beam - 40} 0h80l-8 24h-64Z`} fill="#22282f" />
        <ellipse cx={beam} cy="24" rx="32" ry="4" fill="#fffdf2" />
        <Dust x={beam - spread * 0.7} y={120} w={spread * 1.4} h={560} n={26} seed={seed} r={2} color={light} o={0.45} />
      </g>
      <Drop u={u} cx={beam} cy={FLOOR + 10} rx={spread * 0.9} ry={20} o={0.5} />
    </g>
  );
}

/** Piso iluminado bajo un objeto: sombra de contacto más un charco suave. */
export function Footing({ u, x, w, light = "#f6f2e6", y = FLOOR + 8 }: { u: string; x: number; w: number; light?: string; y?: number }) {
  return (
    <g>
      <Glow cx={x} cy={y + 4} rx={w * 1.2} ry={w * 0.16} color={light} o={0.3} />
      <Drop u={u} cx={x} cy={y} rx={w} ry={w * 0.09} />
    </g>
  );
}
