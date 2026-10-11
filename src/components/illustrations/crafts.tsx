import { shade } from "@/lib/color";

/** Ilustraciones de los productos vistos en el Instagram de Volta (placeholders). viewBox 0 0 400 400. */

function NfcWaves({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" transform={`translate(${x} ${y})`}>
      <path d="M0-8a11 11 0 0 1 0 16" /><path d="M9-16a22 22 0 0 1 0 32" /><path d="M18-24a33 33 0 0 1 0 48" />
    </g>
  );
}

/** Placa NFC con la imagen del cliente: zona de imagen redondeada sobre una placa con borde. */
export function NfcPlate({ tint = "#f7f3ea" }: { tint?: string }) {
  return (
    <g>
      <rect x="96" y="96" width="208" height="208" rx="34" fill={shade(tint, -0.1)} transform="translate(6 10)" />
      <rect x="96" y="96" width="208" height="208" rx="34" fill={tint} stroke={shade(tint, -0.14)} strokeWidth="3" />
      <rect x="120" y="120" width="160" height="160" rx="22" fill="#cfdcc4" />
      <circle cx="238" cy="160" r="16" fill="#f3d27a" />
      <path d="M120 252l46-52 34 36 26-22 54 44v0a22 22 0 0 1-22 22H142a22 22 0 0 1-22-22Z" fill="#7d9668" />
      <NfcWaves x={268} y={292} color={shade(tint, -0.35)} />
    </g>
  );
}

/** Placa NFC "Seguinos": ícono de cámara genérico, lista para el mostrador. */
export function NfcSocial({ tint = "#f7f3ea" }: { tint?: string }) {
  const ink = shade(tint, -0.55);
  return (
    <g>
      <rect x="96" y="96" width="208" height="208" rx="44" fill={shade(tint, -0.1)} transform="translate(6 10)" />
      <rect x="96" y="96" width="208" height="208" rx="44" fill={tint} stroke={shade(tint, -0.14)} strokeWidth="3" />
      <rect x="140" y="140" width="120" height="120" rx="34" fill="none" stroke={ink} strokeWidth="14" />
      <circle cx="200" cy="200" r="28" fill="none" stroke={ink} strokeWidth="14" />
      <circle cx="236" cy="164" r="8" fill={ink} />
      <NfcWaves x={270} y={282} color={ink} />
    </g>
  );
}

/** Vela en lata pintada: tapa apoyada atrás, franjas del color de la variante y sol. */
export function CandleTin({ tint = "#74acdf" }: { tint?: string }) {
  return (
    <g>
      <ellipse cx="250" cy="182" rx="74" ry="24" fill="#d9dde0" />
      <ellipse cx="250" cy="178" rx="74" ry="24" fill="#fff" />
      <path d="M176 178a74 24 0 0 0 148 0" fill="none" stroke={tint} strokeWidth="12" />
      <circle cx="250" cy="176" r="11" fill="#e8b84a" />
      <path d="M110 220v84a90 30 0 0 0 180 0v-84Z" fill="#fff" />
      <path d="M110 232v26a90 30 0 0 0 180 0v-26a90 30 0 0 1-180 0Z" fill={tint} />
      <path d="M110 286v18a90 30 0 0 0 180 0v-18a90 30 0 0 1-180 0Z" fill={tint} />
      <circle cx="200" cy="280" r="12" fill="#e8b84a" />
      <ellipse cx="200" cy="220" rx="90" ry="30" fill="#c4c9cd" />
      <ellipse cx="200" cy="220" rx="80" ry="24" fill="#f6ecd6" />
      <path d="M200 216v-16" stroke="#23251d" strokeWidth="4" />
    </g>
  );
}

/** Vela souvenir: cuenco de madera, flores de cera (color de la variante) y nombre grabado. */
export function CandleBowl({ tint: petal = "#f2a9a2" }: { tint?: string }) {
  const tint = "#a8693a";
  return (
    <g>
      <path d="M100 210c0 70 44 104 100 104s100-34 100-104Z" fill={tint} />
      <path d="M118 236c20 50 144 50 164 0" stroke={shade(tint, 0.18)} strokeOpacity=".5" strokeWidth="4" fill="none" />
      <ellipse cx="200" cy="210" rx="100" ry="30" fill={shade(tint, -0.2)} />
      <ellipse cx="200" cy="212" rx="86" ry="22" fill="#fbf4ea" />
      {[[160, 200], [236, 198], [200, 220]].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-12" rx="12" ry="16" fill={petal} transform={`rotate(${a})`} />)}
          <circle r="10" fill={shade(petal, -0.12)} />
        </g>
      ))}
      <text x="200" y="282" textAnchor="middle" fontSize="30" fill="#fff" fontFamily="Caveat, 'Segoe Script', cursive">Ámbar</text>
    </g>
  );
}

/** Guía aplicadora de etiquetas para velas, impresa en 3D. */
export function LabelGuide({ tint = "#2f9e5b" }: { tint?: string }) {
  const dark = shade(tint, -0.2);
  return (
    <g>
      <path d="M70 300l40-40h180l40 40Z" fill={dark} />
      <rect x="70" y="300" width="260" height="20" rx="4" fill={shade(tint, -0.3)} />
      {[110, 254].map((x) => (
        <g key={x}>
          <rect x={x} y="110" width="36" height="160" rx="4" fill={tint} />
          {[130, 160, 190, 220, 250].map((y) => <path key={y} d={`M${x} ${y}h36`} stroke={dark} strokeWidth="3" />)}
        </g>
      ))}
      <path d="M156 130h88l-6 140h-76Z" fill="#e8f1f4" fillOpacity=".85" stroke="#c9d6dc" strokeWidth="3" />
      <rect x="152" y="190" width="96" height="48" rx="3" fill="#f6efe2" />
      <path d="M190 206l10-8 10 8M190 222l10-8 10 8" stroke="#3d4a2a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}
