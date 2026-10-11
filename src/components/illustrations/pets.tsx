import { shade } from "@/lib/color";

/** Ilustraciones vectoriales propias (placeholders). viewBox 0 0 400 400. */
export function BowlDog({ tint = "#e88aa0" }: { tint?: string }) {
  const dark = shade(tint, -0.18);
  return (
    <g>
      <path d="M92 228c6 58 44 82 108 82s102-24 108-82Z" fill={tint} />
      <ellipse cx="200" cy="228" rx="108" ry="26" fill={dark} />
      <ellipse cx="200" cy="231" rx="90" ry="17" fill="#8a5a35" />
      <circle cx="176" cy="228" r="7" fill="#6b4425" /><circle cx="214" cy="232" r="6" fill="#6b4425" /><circle cx="238" cy="226" r="5" fill="#6b4425" />
      <ellipse cx="112" cy="168" rx="28" ry="42" fill={tint} transform="rotate(-18 112 168)" />
      <ellipse cx="82" cy="132" rx="14" ry="34" fill={dark} transform="rotate(-28 82 132)" />
      <ellipse cx="128" cy="118" rx="13" ry="32" fill={dark} transform="rotate(16 128 118)" />
      <ellipse cx="148" cy="190" rx="42" ry="15" fill={tint} transform="rotate(12 148 190)" />
      <ellipse cx="312" cy="180" rx="13" ry="38" fill={tint} transform="rotate(24 312 180)" />
      <ellipse cx="102" cy="150" rx="8" ry="14" fill="#fff" opacity=".35" transform="rotate(-18 102 150)" />
      <path d="M120 262c30 18 130 18 160 0" stroke="#fff" strokeOpacity=".3" strokeWidth="8" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function BowlWood({ tint = "#d8b98c" }: { tint?: string }) {
  const dark = shade(tint, -0.25);
  return (
    <g>
      {[[74, 186], [74, 228], [326, 186], [326, 228]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="24" fill={tint} />)}
      <rect x="70" y="190" width="260" height="46" rx="12" fill={tint} />
      <rect x="86" y="236" width="22" height="80" rx="6" fill={dark} /><rect x="292" y="236" width="22" height="80" rx="6" fill={dark} />
      <path d="M100 198h200" stroke={shade(tint, -0.1)} strokeWidth="4" />
      {[140, 260].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="190" rx="50" ry="16" fill="#b8bec4" />
          <ellipse cx={cx} cy="190" rx="40" ry="11" fill="#e4e8eb" />
        </g>
      ))}
      <text x="200" y="224" textAnchor="middle" fontSize="18" fontWeight="700" fill={dark} fontFamily="Georgia, serif">TOBY</text>
    </g>
  );
}

export function Collar({ tint = "#3d4a2a" }: { tint?: string }) {
  return (
    <g>
      <ellipse cx="200" cy="200" rx="130" ry="96" fill="none" stroke="#f2c94c" strokeWidth="22" />
      <ellipse cx="200" cy="200" rx="130" ry="96" fill="none" stroke="#6fb7e0" strokeWidth="22" strokeDasharray="9 9" />
      <ellipse cx="200" cy="200" rx="130" ry="96" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeDasharray="4 14" />
      <rect x="114" y="270" width="172" height="44" rx="14" fill="#fff" stroke="#e4dccb" strokeWidth="3" />
      <text x="200" y="302" textAnchor="middle" fontSize="28" fontWeight="800" fill={tint} fontFamily="ui-rounded, system-ui">LOLA</text>
      {[88, 312].map((x) => (
        <g key={x} transform={`translate(${x} 258)`} fill={tint}>
          <ellipse cx="0" cy="8" rx="11" ry="9" /><circle cx="-10" cy="-6" r="5" /><circle cx="0" cy="-10" r="5" /><circle cx="10" cy="-6" r="5" />
        </g>
      ))}
    </g>
  );
}

export function LeashHanger({ tint = "#d8b98c" }: { tint?: string }) {
  return (
    <g>
      <rect x="60" y="150" width="280" height="70" rx="10" fill={tint} />
      {[90, 130, 170, 210, 250, 290].map((x) => <path key={x} d={`M${x} 156v58`} stroke={shade(tint, -0.15)} strokeWidth="3" />)}
      <path d="M150 150c0-30 10-46 30-52l10-20 10 18c22 2 34 16 40 34l18 4-6 16Z" fill={shade(tint, -0.45)} />
      {[120, 200, 280].map((x) => <path key={x} d={`M${x} 220v26a14 14 0 0 0 28 0`} stroke="#555" strokeWidth="7" fill="none" strokeLinecap="round" />)}
      <path d="M228 262c-6 40-30 70-60 80" stroke="#c0503f" strokeWidth="10" fill="none" strokeLinecap="round" />
    </g>
  );
}
