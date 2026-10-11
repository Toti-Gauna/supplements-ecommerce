import { GoldGradient, RewardGlyph, glyphFor, shortValue } from "@/components/illustrations/RewardGlyph";
import type { WheelSegment } from "@/demo/fixtures/wheel";

/** Gajos alternados noche / oliva / crema; en los claros el ícono va en tinta, en los oscuros en dorado. */
const FILLS = ["url(#seg-night)", "url(#seg-olive)", "url(#seg-cream)", "url(#seg-night)", "url(#seg-olive)", "url(#seg-cream)", "url(#seg-night)", "url(#seg-brass)"];
const LIGHT = [false, false, true, false, false, true, false, true];

/** Disco de la ruleta en SVG puro: ícono del premio + valor corto en cada gajo. El giro lo aplica el contenedor. */
export function WheelDisc({ segments }: { segments: WheelSegment[] }) {
  const n = segments.length;
  const slice = 360 / n;
  const r = 200;
  const pt = (deg: number, radius: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [200 + radius * Math.cos(rad), 200 + radius * Math.sin(rad)] as const;
  };
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <GoldGradient />
      <defs>
        <radialGradient id="seg-night" cx="200" cy="200" r="200" gradientUnits="userSpaceOnUse"><stop offset=".25" stopColor="#2a3121" /><stop offset="1" stopColor="#14170f" /></radialGradient>
        <radialGradient id="seg-olive" cx="200" cy="200" r="200" gradientUnits="userSpaceOnUse"><stop offset=".25" stopColor="#56653b" /><stop offset="1" stopColor="#323c22" /></radialGradient>
        <radialGradient id="seg-cream" cx="200" cy="200" r="200" gradientUnits="userSpaceOnUse"><stop offset=".25" stopColor="#fffaf0" /><stop offset="1" stopColor="#e8dcc3" /></radialGradient>
        <radialGradient id="seg-brass" cx="200" cy="200" r="200" gradientUnits="userSpaceOnUse"><stop offset=".25" stopColor="#f3dca6" /><stop offset="1" stopColor="#b98b4a" /></radialGradient>
        <radialGradient id="wheel-shine" cx=".35" cy=".25" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".2" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      {segments.map((s, i) => {
        const [x1, y1] = pt(i * slice, r);
        const [x2, y2] = pt((i + 1) * slice, r);
        const mid = i * slice + slice / 2;
        const light = LIGHT[i % LIGHT.length];
        const ink = light ? "#1c2016" : "url(#volta-gold)";
        return (
          <g key={s.id} opacity={s.active ? 1 : 0.35}>
            <path d={`M200 200 L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`} fill={FILLS[i % FILLS.length]} stroke="#d2ad69" strokeWidth="1.2" />
            <g transform={`rotate(${mid} 200 200)`}>
              <g transform="translate(178 46) scale(.92)"><RewardGlyph kind={glyphFor(s.kind, s.label)} standalone={false} color={ink} /></g>
              <text x="200" y="114" textAnchor="middle" fill={light ? "#1c2016" : "#f6e7c4"} fontSize="15" fontWeight="800" letterSpacing="1" style={{ fontFamily: "var(--brand-display, serif)" }}>
                {shortValue(s.kind, s.value, s.label)}
              </text>
            </g>
          </g>
        );
      })}
      <circle cx="200" cy="200" r="198" fill="url(#wheel-shine)" />
      <circle cx="200" cy="200" r="196" fill="none" stroke="url(#volta-gold)" strokeWidth="3" />
      {Array.from({ length: n * 2 }, (_, i) => { const [x, y] = pt(i * (slice / 2), 187); return <circle key={i} cx={x} cy={y} r="3.2" fill="#f6e7c4" opacity={i % 2 ? 0.55 : 1} />; })}
    </svg>
  );
}
