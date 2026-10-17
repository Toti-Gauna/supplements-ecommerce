import { Kettlebell } from "@/components/illustrations/campaigns/b-gear";
import { Digits, Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import { Footing, GymBackdrop } from "../stage/backdrop";
import { FLOOR, type OpeningArtProps } from "../stage/types";

/** Cajón de pliometría (madera y filos de goma), donde aparece el regalo. */
function PlyoBox({ u, x, w, h, edge }: { u: string; x: number; w: number; h: number; edge: string }) {
  const y = FLOOR - h;
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={h} fill="#3b2d22" />
      <rect x={x - w / 2} y={y} width={w} height={h} fill={`url(#${u}-v)`} opacity=".55" />
      <path d={`M${x - w / 2 + 12} ${y + h * 0.35}h${w - 24}`} stroke="#000" strokeOpacity=".3" strokeWidth="3" />
      <ellipse cx={x} cy={y + h * 0.62} rx={w * 0.16} ry="9" fill="#120d09" />
      <rect x={x - w / 2} y={y - 6} width={w} height="8" fill={edge} opacity=".85" />
    </g>
  );
}

/**
 * Año Nuevo: el cronómetro del box. Cada toque marca un segundo de la cuenta regresiva (5, 4, 3, 2, 1); al llegar a
 * cero el marcador muestra 20:27, se prende toda la luz y el regalo aparece arriba del cajón.
 */
export default function AnoNuevo({ u, c, step, steps, t, opened }: OpeningArtProps) {
  const left = Math.max(0, steps - step);
  const k = opened ? 1 : t / steps;
  const value = opened ? "20:27" : `00:0${left}`;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={260} light="#e9e4ff" power={0.5 + 0.5 * k} seed={37} />
      {/* El cronómetro de pared: caja negra, marcador LED y los rótulos de rondas. */}
      <Glow cx={400} cy={330} rx={330} ry={150} color={c.accent} o={0.18 + 0.5 * k} />
      <rect x="130" y="230" width="540" height="200" rx="10" fill="#050608" stroke="#2c313a" strokeWidth="4" />
      <rect x="130" y="230" width="540" height="200" rx="10" fill={`url(#${u}-v)`} opacity=".25" />
      <g key={opened ? "open" : step} className="op-kick">
        <Digits value={value} x={192} y={262} h={136} color={opened ? c.accent : "#ff4d3d"} />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={240 + i * 66} y="446" width="46" height="10" rx="2" fill={i < (opened ? steps : step) ? c.accent : "#1f232a"} />
      ))}
      <PlyoBox u={u} x={400} w={240} h={150} edge={c.accent} />
      <Footing u={u} x={400} w={170} light="#e9e4ff" />
      {/* Al frente, las pesas rusas de la clase de las 7 (la primera del año). */}
      <Kettlebell u={u} cx={120} cy={900} r={46} color="#15171b" band={c.accent} />
      <Kettlebell u={u} cx={700} cy={910} r={38} color="#15171b" />
      {opened && <Dust x={120} y={120} w={560} h={420} n={34} seed={41} r={2.6} color={c.accent} o={0.7} />}
    </g>
  );
}
