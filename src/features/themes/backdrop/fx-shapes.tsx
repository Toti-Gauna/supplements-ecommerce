import type { CSSProperties } from "react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
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

/** Burbujas pastel que suben con brillo (Pascuas). */
export function Bubbles({ colors }: { colors: string[] }) {
  return (
    <div className="fx-layer">
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="fx-bubble" style={v({ left: `${rand(i + 3) * 100}%`, "--z": `${3 + rand(i) * 6}vmin`, "--c": colors[i % colors.length]!, animationDuration: `${14 + rand(i + 1) * 10}s`, animationDelay: `${-rand(i + 2) * 20}s` })} />
      ))}
    </div>
  );
}

/** Huellas que caminan cruzando la página, paso a paso, en loop (Día del Animal). */
export function PawTrail() {
  const n = 12;
  return (
    <div className="fx-layer">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="fx-paw" style={v({ left: `${6 + (i / (n - 1)) * 88}%`, top: `${70 - Math.sin((i / (n - 1)) * Math.PI) * 30 + (i % 2 ? 3 : -3)}%`, rotate: `${80 - (i / (n - 1)) * 160}deg`, animationDelay: `${i * 0.45}s` })}>
          <Decor kind="paw" className="h-full w-full" />
        </span>
      ))}
    </div>
  );
}

/** Constelación dorada que titila, con una estrella fugaz cada tanto (Día del Padre). */
export function Constellation() {
  const pts: [number, number][] = [[12, 18], [24, 10], [36, 16], [48, 8], [62, 14], [74, 9], [86, 18], [78, 28], [64, 26]];
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <div className="fx-layer">
      <svg viewBox="0 0 100 40" preserveAspectRatio="xMidYMin slice" className="fx-const" aria-hidden="true">
        <path d={d} fill="none" stroke="#e9c27a" strokeWidth="0.15" strokeDasharray="0.6 0.5" opacity=".6" />
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.55" fill="#fff4d6" className="fx-star" style={{ animationDelay: `${i * 0.4}s` }} />)}
      </svg>
      <span className="fx-shoot" />
    </div>
  );
}

/** Anillos entrelazados que flotan (Día del Amigo). */
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
