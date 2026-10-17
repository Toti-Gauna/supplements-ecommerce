import { useId } from "react";
import { brand } from "@/config/brand";

/**
 * Arte de la taquilla de /regalo/ (R3b): la boletería de un estadio de noche, con el marcador LED "TAQUILLA", la
 * ventanilla con la luz adentro, el molinete y la entrada que asoma por la ranura. SVG propio (arte: colores fijos,
 * iguales en los dos modos). `state` cambia el cartel: esperando el código o entrada validada.
 */
export function BoothArt({ state = "idle", className }: { state?: "idle" | "valid"; className?: string }) {
  const id = useId().replace(/:/g, "");
  const ref = (n: string) => `url(#${id}${n})`;
  const volt = brand.signature.volt, plasma = brand.signature.plasma;
  const sign = state === "valid" ? "VALIDADA" : "TAQUILLA";
  return (
    <svg viewBox="0 0 640 460" role="img" aria-label={state === "valid" ? "Taquilla con la entrada validada" : "Taquilla de regalos de noche, con la entrada asomando por la ventanilla"} className={className}>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#06080b" /><stop offset="1" stopColor="#12161d" /></linearGradient>
        <linearGradient id={`${id}cone`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity="0.16" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></linearGradient>
        <linearGradient id={`${id}steel`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1a1f27" /><stop offset="0.55" stopColor="#3b4350" /><stop offset="0.8" stopColor="#8c96a5" /><stop offset="1" stopColor="#1a1f27" /></linearGradient>
        <radialGradient id={`${id}inside`} cx="0.5" cy="0.35" r="0.8"><stop offset="0" stopColor={plasma} stopOpacity="0.85" /><stop offset="0.6" stopColor="#1c1640" /><stop offset="1" stopColor="#07080c" /></radialGradient>
        <radialGradient id={`${id}halo`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={volt} stopOpacity="0.35" /><stop offset="1" stopColor={volt} stopOpacity="0" /></radialGradient>
        <filter id={`${id}glow`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <pattern id={`${id}led`} width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.1" fill="#ffffff" fillOpacity="0.07" /></pattern>
      </defs>
      <rect width="640" height="460" fill={ref("bg")} />
      {/* Piso de caucho con carriles de tiza en perspectiva. */}
      <path d="M0 372H640V460H0Z" fill="#0b0d11" />
      {[-260, -130, 0, 130, 260].map((x) => <path key={x} d={`M${320 + x * 0.35} 372L${320 + x * 1.6} 460`} stroke="#f2f0ea" strokeOpacity="0.08" strokeWidth="2" />)}
      {/* Reflectores. */}
      <path d="M150 0h40l120 372H40Z" fill={ref("cone")} />
      <path d="M450 0h40l110 372H330Z" fill={ref("cone")} />
      <ellipse cx="320" cy="250" rx="260" ry="170" fill={ref("halo")} />
      {/* Marcador LED arriba de la boletería. */}
      <rect x="138" y="44" width="364" height="70" rx="3" fill="#0a0c10" stroke="#2b313b" strokeWidth="3" />
      <rect x="146" y="52" width="348" height="54" fill={ref("led")} />
      <text x="320" y="92" textAnchor="middle" fontFamily="JetBrains Mono Variable, ui-monospace, monospace" fontWeight="800" fontSize="36" letterSpacing="9" fill={state === "valid" ? "#2ee6d6" : volt} filter={ref("glow")}>{sign}</text>
      <path d="M180 114v16M460 114v16" stroke="#2b313b" strokeWidth="5" />
      {/* Cuerpo de acero con la ventanilla iluminada. */}
      <rect x="150" y="128" width="340" height="244" rx="2" fill={ref("steel")} />
      <rect x="150" y="128" width="340" height="244" fill="none" stroke="#000" strokeOpacity="0.45" strokeWidth="3" />
      <rect x="192" y="152" width="256" height="140" fill={ref("inside")} />
      {/* Estante con potes adentro (siluetas). */}
      <path d="M200 252h240" stroke="#0a0c10" strokeWidth="6" />
      {[[222, 24, 34, volt], [258, 30, 44, "#f2f0ea"], [300, 22, 30, plasma], [336, 30, 40, "#2ee6d6"], [380, 26, 36, volt], [414, 18, 26, "#f2f0ea"]].map(([x, w, h, c], i) => (
        <g key={i}><rect x={Number(x)} y={249 - Number(h)} width={Number(w)} height={Number(h)} rx="5" fill="#0a0c10" /><rect x={Number(x) + 3} y={249 - Number(h) * 0.62} width={Number(w) - 6} height="6" fill={String(c)} fillOpacity="0.85" /></g>
      ))}
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${200 + i * 24} 152v140`} stroke="#0a0c10" strokeOpacity="0.55" strokeWidth="3" />)}
      <rect x="192" y="152" width="256" height="140" fill="none" stroke={volt} strokeOpacity="0.5" strokeWidth="2" />
      {/* Mostrador con la ranura y la entrada que asoma. */}
      <rect x="176" y="292" width="288" height="22" fill="#0d1015" />
      <rect x="276" y="298" width="88" height="6" rx="3" fill="#000" />
      <g transform="rotate(-9 320 330)">
        <rect x="262" y="300" width="116" height="70" fill="#f2f0ea" />
        <path d="M296 304v62" stroke="#0b0d10" strokeOpacity="0.4" strokeDasharray="4 4" strokeWidth="2" />
        <text x="279" y="352" fontFamily="JetBrains Mono Variable, ui-monospace, monospace" fontWeight="800" fontSize="10" fill="#0b0d10" transform="rotate(-90 279 352)">ENTRADA</text>
        <text x="306" y="322" fontFamily="JetBrains Mono Variable, ui-monospace, monospace" fontWeight="800" fontSize="11" fill="#0b0d10">REGALO</text>
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={306 + i * 4} y="332" width={i % 3 ? 2 : 3} height="26" fill="#0b0d10" />)}
      </g>
      {/* Chapa de la marca. */}
      <rect x="236" y="330" width="168" height="28" fill="#0a0c10" />
      <text x="320" y="350" textAnchor="middle" fontFamily="JetBrains Mono Variable, ui-monospace, monospace" fontWeight="800" fontSize="13" letterSpacing="3" fill="#f2f0ea">{`${brand.mark} · REGALOS`}</text>
      {/* Molinete. */}
      <rect x="530" y="250" width="16" height="122" fill="#3b4350" />
      <rect x="590" y="250" width="16" height="122" fill="#3b4350" />
      <circle cx="568" cy="290" r="14" fill="#8c96a5" />
      <path d="M568 290l-46-10M568 290l40 26M568 290l6-48" stroke="#c9d0da" strokeWidth="7" strokeLinecap="round" />
      <circle cx="538" cy="246" r="5" fill={state === "valid" ? "#2ee6d6" : "#ff4b3e"} filter={ref("glow")} />
      {/* Polvo de tiza en la luz. */}
      {[[96, 180], [120, 240], [520, 160], [560, 210], [470, 70], [80, 110]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#f2f0ea" fillOpacity="0.35" />)}
    </svg>
  );
}
