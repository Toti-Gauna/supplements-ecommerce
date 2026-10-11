import type { CSSProperties } from "react";
import { PRIDE } from "@/components/illustrations/seasonal/pride";
import { rand } from "../AmbientField";

/** Efectos de luz del fondo de cada temática (CSS puro, solo transform/opacity; ver seasons.css). */
const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Luces desenfocadas que respiran (bokeh): luces de Navidad, globos, corazones. */
export function Bokeh({ colors, count = 12, size = [10, 26] }: { colors: string[]; count?: number; size?: [number, number] }) {
  return (
    <div className="fx-layer">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="fx-bokeh" style={v({ left: `${rand(i + 11) * 100}%`, top: `${rand(i + 23) * 100}%`, "--z": `${size[0] + rand(i) * (size[1] - size[0])}vmin`, "--c": colors[i % colors.length]!, animationDuration: `${6 + rand(i + 5) * 6}s`, animationDelay: `${-rand(i + 7) * 8}s` })} />
      ))}
    </div>
  );
}

/** Haces de luz diagonales que barren la página (Black Friday). */
export function LightSweeps({ color }: { color: string }) {
  return (
    <div className="fx-layer">
      {[0, 1, 2].map((i) => <span key={i} className="fx-sweep" style={v({ "--c": color, animationDelay: `${-i * 5}s`, top: `${-20 + i * 30}%` })} />)}
    </div>
  );
}

/** Bancos de niebla que se desplazan (Halloween). */
export function Fog({ color }: { color: string }) {
  return (
    <div className="fx-layer">
      {[0, 1, 2].map((i) => <span key={i} className="fx-fog" style={v({ "--c": color, top: `${20 + i * 28}%`, animationDuration: `${26 + i * 8}s`, animationDelay: `${-i * 7}s` })} />)}
    </div>
  );
}

/** Resplandor de calor que late desde abajo (Hot Sale). */
export function HeatGlow({ color }: { color: string }) {
  return <div className="fx-layer"><span className="fx-heat" style={v({ "--c": color })} /><span className="fx-heat fx-heat-2" style={v({ "--c": color })} /></div>;
}

/** Arcoíris enorme y translúcido que brilla (Orgullo). */
export function Rainbow() {
  return (
    <div className="fx-layer">
      <svg viewBox="0 0 200 110" className="fx-rainbow" aria-hidden="true">
        {PRIDE.map((c, i) => <path key={c} d={`M${10 + i * 5} 108 A${90 - i * 5} ${90 - i * 5} 0 0 1 ${190 - i * 5} 108`} fill="none" stroke={c} strokeWidth="4.6" strokeLinecap="round" />)}
      </svg>
    </div>
  );
}

/** Rayos del Sol de Mayo que giran lento desde arriba (25 de Mayo). */
export function SunRays({ color }: { color: string }) {
  return <div className="fx-layer"><span className="fx-sun" style={v({ "--c": color })} /></div>;
}

/** Franjas celeste y blanca enormes que flamean como la bandera (20 de Junio). */
export function FlagBands({ celeste, white }: { celeste: string; white: string }) {
  return <div className="fx-layer"><span className="fx-flag" style={v({ "--c1": celeste, "--c2": white })} /><span className="fx-flag fx-flag-2" style={v({ "--c1": celeste, "--c2": white })} /></div>;
}
