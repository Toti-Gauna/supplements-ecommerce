import BoxingBag from "../BoxingBag";
import { GymBackdrop } from "../stage/backdrop";
import type { OpeningArtProps } from "../stage/types";
import type { GiftOccasion } from "@/demo/types";

/** Bolsa lejana del fondo, en penumbra y desenfocada (el box tiene más de una). */
function FarBag({ u, x, h }: { u: string; x: number; h: number }) {
  return (
    <g filter={`url(#${u}-soft)`} opacity=".55">
      <path d={`M${x} 0V${120}`} stroke="#3a424c" strokeWidth="3" strokeDasharray="6 4" />
      <rect x={x - 38} y="120" width="76" height={h} rx="20" fill="#0d0f13" />
      <rect x={x - 38} y="120" width="76" height={h} rx="20" fill={`url(#${u}-cyl)`} opacity=".6" />
      <rect x={x + 26} y="132" width="5" height={h - 24} rx="2.5" fill="#e7e2d4" opacity=".18" />
    </g>
  );
}

/**
 * Bolsa de boxeo original (sin fecha), rehecha para R3b: ahora cuelga en un box de verdad, con dos bolsas lejanas en
 * penumbra, el reflector encima, las cuerdas del ring al fondo y el piso de goma. La bolsa es el dibujo de siempre.
 */
export default function OriginalBackdrop({ u, c }: OpeningArtProps) {
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={300} seed={11} />
      <FarBag u={u} x={110} h={250} />
      <FarBag u={u} x={700} h={230} />
      <g opacity=".35">
        {[560, 600, 640].map((y) => <path key={y} d={`M0 ${y + 40}Q400 ${y + 22} 800 ${y + 40}`} stroke="#c9ced6" strokeWidth="3" fill="none" />)}
        <rect x="24" y="560" width="10" height="200" fill="#1a1e24" />
        <rect x="766" y="560" width="10" height="200" fill="#1a1e24" />
      </g>
    </g>
  );
}

/** La bolsa de siempre en su lugar del escenario: cuelga del techo y apoya la sombra en el piso. */
export function OriginalBag({ occasion, hits, total, opened, reduce }: { occasion: GiftOccasion; hits: number; total: number; opened: boolean; reduce: boolean }) {
  return (
    <div className="absolute left-[12.5%] top-[3%] h-[81.8%] w-[75%]">
      <BoxingBag occasion={occasion} hits={hits} total={total} opened={opened} reduce={reduce} />
    </div>
  );
}
