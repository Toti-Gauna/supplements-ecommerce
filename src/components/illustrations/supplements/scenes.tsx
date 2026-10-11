import { DISPLAY_SVG, tone } from "./defs";

/**
 * Escenarios de la librería (400 × 400). El estudio usa --studio-1/2/3 con respaldo (las temáticas lo cambian;
 * pasado a imagen para el Estudio de contenido queda el respaldo).
 */
export function StudioDefs() {
  return (
    <defs>
      <linearGradient id="st-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={{ stopColor: "var(--studio-1, #1b212b)" }} />
        <stop offset=".72" style={{ stopColor: "var(--studio-2, #10141a)" }} />
        <stop offset="1" style={{ stopColor: "var(--studio-3, #07090c)" }} />
      </linearGradient>
      <radialGradient id="st-glow" cx=".5" cy=".44" r=".52">
        <stop offset="0" stopColor="#8b72ff" stopOpacity=".34" />
        <stop offset=".55" stopColor="#8b72ff" stopOpacity=".08" />
        <stop offset="1" stopColor="#8b72ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="st-volt" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#c8ff2e" stopOpacity=".4" />
        <stop offset="1" stopColor="#c8ff2e" stopOpacity="0" />
      </radialGradient>
      <pattern id="st-dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="#fff" opacity=".1" /></pattern>
    </defs>
  );
}

export function GymDefs() {
  return (
    <defs>
      <linearGradient id="gy-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#151a22" /><stop offset="1" stopColor="#0b0e13" /></linearGradient>
      <linearGradient id="gy-led" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8ff2e" stopOpacity=".55" /><stop offset="1" stopColor="#c8ff2e" stopOpacity="0" /></linearGradient>
      <pattern id="gy-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="#fff" opacity=".07" /></pattern>
    </defs>
  );
}

/** `bare`: sin fondo (solo el pedestal), para apoyar el envase sobre un banner o una banda oscura. */
export function Studio({ bare = false }: { bare?: boolean }) {
  return (
    <g aria-hidden="true">
      <StudioDefs />
      {!bare && (
        <>
          <rect width="400" height="400" fill="url(#st-bg)" />
          <rect width="400" height="300" fill="url(#st-dots)" />
          <rect width="400" height="400" fill="url(#st-glow)" />
          <path d="M-10-10H110L320 400H210Z" fill="#fff" opacity=".035" />
        </>
      )}
      <ellipse cx="200" cy="350" rx="176" ry="34" fill="url(#st-volt)" opacity=".45" />
      <path d="M52 334v14a148 20 0 0 0 296 0v-14" fill="#0b0e13" />
      <ellipse cx="200" cy="334" rx="148" ry="20" fill="#181d26" />
      <ellipse cx="200" cy="334" rx="148" ry="20" fill="none" stroke="#c8ff2e" strokeOpacity=".6" strokeWidth="1.4" />
      <ellipse cx="200" cy="331" rx="110" ry="10" fill="url(#sp-shadow)" />
    </g>
  );
}

/** Gimnasio de noche: tira de LED, piso de goma, disco apoyado y mancuerna. */
export function GymScene() {
  return (
    <g aria-hidden="true">
      <GymDefs />
      <rect width="400" height="300" fill="url(#gy-wall)" />
      <rect width="400" height="300" fill="url(#gy-dots)" />
      <rect y="64" width="400" height="3" fill="#c8ff2e" opacity=".85" />
      <rect y="69" width="400" height="70" fill="url(#gy-led)" opacity=".22" />
      <rect y="300" width="400" height="100" fill="#0d1015" />
      <g stroke="#fff" strokeOpacity=".05">{[100, 200, 300].map((x) => <path key={x} d={`M${x} 300l${(x - 200) * 0.6} 100`} />)}<path d="M0 340h400" /></g>
      <path d="M0 300h400" stroke="#c8ff2e" strokeOpacity=".2" />
      {/* Disco de 20 kg apoyado contra la pared (azul reglamentario). */}
      <g transform="translate(58 236)">
        <circle r="96" fill="#1f4fb8" />
        <circle r="96" fill="url(#sp-cyl)" opacity=".6" />
        <circle r="70" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="2" />
        <circle r="24" fill="#c9ced6" />
        <circle r="13" fill="#0b0e13" />
        <text x="18" y="-38" fill="#fff" opacity=".85" style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize="22">20</text>
      </g>
      {/* Mancuerna hexagonal en el piso. */}
      <g transform="translate(318 352)">
        <rect x="-36" y="-4" width="72" height="8" rx="3" fill="#9aa3ad" />
        <path d="M-58-20h22v40h-22l-8-10v-20z" fill={tone("#1a1f27", 0.05)} />
        <path d="M58-20h-22v40h22l8-10v-20z" fill="#1a1f27" />
        <path d="M-58-20h22v6h-22z M36-20h22v6h-22z" fill="#fff" opacity=".1" />
      </g>
      <ellipse cx="210" cy="336" rx="120" ry="12" fill="url(#sp-shadow)" />
    </g>
  );
}
