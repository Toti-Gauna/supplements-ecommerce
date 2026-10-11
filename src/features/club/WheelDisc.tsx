import { useId } from "react";
import { RewardGlyph, glyphFor, shortValue } from "@/components/illustrations/RewardGlyph";
import { DISPLAY_FONT, MONO_FONT } from "@/config/brand";
import type { WheelSegment } from "@/demo/fixtures/wheel";
import { cn } from "@/lib/cn";
import { PLATES, plateFor, polar, RUBBER_FLECKS, sectorPath, VOLT } from "./wheel-art";

const C = 200;
/** Radios en la caja de 400: borde del disco, labio de goma, cara, aro interno y hueco de la maza. */
const R = { edge: 200, lip: 179, ring: 80, recess: 70, hub: 58 };

/**
 * Disco olímpico en SVG: un gajo por premio con los colores reglamentarios, goma con motas, labio y aro en relieve,
 * el peso en relieve sobre el borde y, en cada gajo, el ícono del premio con su valor corto. El giro lo aplica el
 * contenedor; la luz (fija) la pone `WheelRim` encima. `landed` resalta el gajo ganador mientras titilan las luces.
 */
export function WheelDisc({ segments, landed = null }: { segments: WheelSegment[]; landed?: number | null }) {
  const uid = useId().replace(/:/g, "");
  const n = segments.length;
  const slice = 360 / n;
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <defs>
        {PLATES.map((p, i) => (
          <radialGradient key={i} id={`${uid}p${i}`} cx={C} cy={C} r={R.edge} gradientUnits="userSpaceOnUse">
            <stop offset=".3" stopColor={p.dark} />
            <stop offset=".44" stopColor={p.base} />
            <stop offset=".7" stopColor={p.light} stopOpacity=".9" />
            <stop offset=".86" stopColor={p.base} />
            <stop offset=".95" stopColor={p.base} />
            <stop offset="1" stopColor={p.dark} />
          </radialGradient>
        ))}
      </defs>
      <circle cx={C} cy={C} r={R.edge} fill="#07090c" />
      {segments.map((s, i) => (
        <path key={s.id} d={sectorPath(C, C, R.hub - 4, R.edge, i * slice, (i + 1) * slice)} fill={`url(#${uid}p${i % PLATES.length})`} />
      ))}
      {/* Motas de la goma y relieve: hueco hacia la maza, aro interno, labio y canto. */}
      <g>{RUBBER_FLECKS.map(([x, y, r, light], i) => <circle key={i} cx={x} cy={y} r={r} fill={light ? "#fff" : "#000"} opacity={light ? 0.13 : 0.2} />)}</g>
      <circle cx={C} cy={C} r={(R.hub + R.recess) / 2} fill="none" stroke="#000" strokeOpacity=".32" strokeWidth={R.recess - R.hub} />
      <circle cx={C} cy={C} r={R.ring} fill="none" stroke="#000" strokeOpacity=".45" strokeWidth="2.2" />
      <circle cx={C} cy={C} r={R.ring + 2.2} fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="1.2" />
      <circle cx={C} cy={C} r={(R.lip + R.edge) / 2} fill="none" stroke="#000" strokeOpacity=".16" strokeWidth={R.edge - R.lip} />
      <circle cx={C} cy={C} r={R.lip} fill="none" stroke="#000" strokeOpacity=".5" strokeWidth="2.4" />
      <circle cx={C} cy={C} r={R.lip + 2.4} fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="1.2" />
      {segments.map((_, i) => {
        const [x1, y1] = polar(C, C, R.hub, i * slice);
        const [x2, y2] = polar(C, C, R.edge, i * slice);
        const [x3, y3] = polar(C, C, R.edge, i * slice + 0.7);
        return (
          <g key={i}>
            <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#05070a" strokeOpacity=".6" strokeWidth="2.6" />
            <path d={`M${x1} ${y1}L${x3} ${y3}`} stroke="#fff" strokeOpacity=".12" strokeWidth="1" />
          </g>
        );
      })}
      {segments.map((s, i) => <SegmentLabel key={s.id} segment={s} index={i} slice={slice} />)}
      {/* Gajo ganador: los demás se apagan y él queda con filo voltio. */}
      {landed !== null && segments.map((s, i) => (
        <path key={s.id} d={sectorPath(C, C, R.hub, R.edge - 1, i * slice, (i + 1) * slice)}
          className={cn("transition-opacity duration-300", i === landed ? "wheel-landed" : undefined)}
          fill={i === landed ? "#fff" : "#000"} fillOpacity={i === landed ? 0.08 : 0.5}
          stroke={i === landed ? VOLT : "none"} strokeWidth="4" strokeLinejoin="round" />
      ))}
      <circle cx={C} cy={C} r={R.edge - 1} fill="none" stroke="#000" strokeOpacity=".7" strokeWidth="2" />
    </svg>
  );
}

/** Ícono y valor del premio (de pie hacia afuera) y el peso del disco en relieve sobre el labio. */
function SegmentLabel({ segment: s, index, slice }: { segment: WheelSegment; index: number; slice: number }) {
  const plate = plateFor(index);
  const value = shortValue(s.kind, s.value, s.label);
  const darkInk = plate.ink !== "#ffffff";
  const shadow = darkInk ? "#fff" : "#000";
  return (
    <g transform={`rotate(${index * slice + slice / 2} ${C} ${C})`} opacity={s.active ? 1 : 0.4}>
      <g transform={`translate(${C - 19.2} ${C - 125}) scale(.8)`}>
        <g transform="translate(0 1.4)" opacity=".3"><RewardGlyph kind={glyphFor(s.kind, s.label)} standalone={false} color={shadow} /></g>
        <RewardGlyph kind={glyphFor(s.kind, s.label)} standalone={false} color={plate.ink} />
      </g>
      {[shadow, plate.ink].map((fill, k) => (
        <text key={k} x={C} y={C - 139 + (k ? 0 : 1.6)} textAnchor="middle" fill={fill} opacity={k ? 1 : 0.32}
          fontSize={value.length > 5 ? 20 : 24} fontWeight="800" letterSpacing=".4" style={{ fontFamily: DISPLAY_FONT, fontStretch: "112%" }}>
          {value}
        </text>
      ))}
      <text x={C} y={C - R.lip - 6.5} textAnchor="middle" fill="#000" fillOpacity=".42" fontSize="8.5" fontWeight="700" letterSpacing="2.2" style={{ fontFamily: MONO_FONT }}>
        {plate.weight}
      </text>
    </g>
  );
}
