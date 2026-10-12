import type { CSSProperties } from "react";
import { rand } from "../AmbientField";

/** Efectos con formas del fondo de cada temática (CSS puro; ver seasons.css). */
const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Fuegos artificiales que estallan en distintos puntos, en loop (Año Nuevo). */
export function FireworksLoop({ colors }: { colors: string[] }) {
  const spots = [[18, 22, 0], [76, 16, 1.8], [52, 40, 3.6], [30, 62, 5.4], [84, 58, 7.2]];
  return (
    <div className="fx-layer">
      {spots.map(([x, y, d], s) => (
        <span key={s} className="fx-fw" style={v({ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` })}>
          {Array.from({ length: 14 }, (_, i) => <i key={i} style={v({ "--a": `${(i / 14) * 360}deg`, "--c": colors[(i + s) % colors.length]!, animationDelay: `${d}s` })} />)}
        </span>
      ))}
    </div>
  );
}

/** Constelación que titila, con una estrella fugaz cada tanto (Día del Padre). */
export function Constellation({ color }: { color: string }) {
  const pts: [number, number][] = [[12, 18], [24, 10], [36, 16], [48, 8], [62, 14], [74, 9], [86, 18], [78, 28], [64, 26]];
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <div className="fx-layer">
      <svg viewBox="0 0 100 40" preserveAspectRatio="xMidYMin slice" className="fx-const" aria-hidden="true">
        <path d={d} fill="none" stroke={color} strokeWidth="0.15" strokeDasharray="0.6 0.5" opacity=".6" />
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.55" fill="#fff6dc" className="fx-star" style={{ animationDelay: `${i * 0.4}s` }} />)}
      </svg>
      <span className="fx-shoot" />
    </div>
  );
}

/** Anillos que flotan, como discos vistos de frente (Día del Amigo). */
export function Rings({ colors }: { colors: string[] }) {
  return (
    <div className="fx-layer">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="fx-ring" style={v({ left: `${rand(i + 4) * 90}%`, top: `${rand(i + 9) * 90}%`, "--z": `${18 + rand(i) * 22}vmin`, "--c": colors[i % colors.length]!, animationDuration: `${18 + rand(i + 2) * 12}s`, animationDelay: `${-rand(i) * 10}s` })} />
      ))}
    </div>
  );
}

/** Flor gigante translúcida que gira muy lento (Día de la Madre) o corazón que late (San Valentín). */
export function Watermark({ kind, color }: { kind: "flower" | "heart"; color: string }) {
  return (
    <div className="fx-layer">
      {kind === "flower" ? (
        <span className="fx-flower" style={v({ "--c": color })}>{Array.from({ length: 10 }, (_, i) => <i key={i} style={v({ rotate: `${i * 36}deg` })} />)}</span>
      ) : (
        <svg viewBox="0 0 100 100" className="fx-heart" aria-hidden="true"><path d="M50 88C22 68 6 50 6 32 6 18 17 8 30 8c8 0 15 4 20 11 5-7 12-11 20-11 13 0 24 10 24 24 0 18-16 36-44 56z" fill={color} /></svg>
      )}
    </div>
  );
}

/** Pistas de circuito a lo ancho (trazo y punto final), con nodos que se prenden en cadena (CyberMonday). */
const TRACES: [string, number, number][] = [
  ["M0 8H18L24 14H44", 44, 14], ["M100 6H80L74 12H58", 58, 12], ["M0 26H12L18 20H30", 30, 20], ["M100 30H86L80 24H66", 66, 24],
  ["M0 46H22L28 52H48", 48, 52], ["M100 50H76L70 44H56", 56, 44], ["M34 60V52L40 46H50", 50, 46], ["M62 0V8L56 14H50", 50, 14],
];
export function Circuit({ color, glow }: { color: string; glow: string }) {
  return (
    <div className="fx-layer">
      <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" className="fx-circuit" aria-hidden="true">
        {TRACES.map(([d], i) => <path key={i} d={d} fill="none" stroke={color} strokeWidth="0.25" opacity=".35" />)}
        {TRACES.map(([, x, y], i) => <circle key={`n${i}`} cx={x} cy={y} r="0.9" fill={glow} className="fx-node" style={{ animationDelay: `${i * 0.45}s` }} />)}
      </svg>
    </div>
  );
}

/** Olas que van y vienen al pie de la página (Operación verano). */
export function Waves({ colors }: { colors: [string, string] }) {
  const wave = "M0 30Q50 10 100 30T200 30T300 30T400 30V60H0z";
  return (
    <div className="fx-layer">
      {colors.map((c, i) => (
        <svg key={c} viewBox="0 0 400 60" preserveAspectRatio="none" className={`fx-wave fx-wave-${i}`} aria-hidden="true"><path d={wave} fill={c} /></svg>
      ))}
    </div>
  );
}
