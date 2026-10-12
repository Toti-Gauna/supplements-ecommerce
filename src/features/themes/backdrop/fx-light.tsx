import type { CSSProperties } from "react";
import { rand } from "../AmbientField";

/** Efectos de luz del fondo de cada temática (CSS puro, solo transform/opacity; ver seasons.css). */
const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Luces desenfocadas que respiran (bokeh): luces de Navidad, brasas, corazones. */
export function Bokeh({ colors, count = 12, size = [10, 26] }: { colors: string[]; count?: number; size?: [number, number] }) {
  return (
    <div className="fx-layer">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="fx-bokeh" style={v({ left: `${rand(i + 11) * 100}%`, top: `${rand(i + 23) * 100}%`, "--z": `${size[0] + rand(i) * (size[1] - size[0])}vmin`, "--c": colors[i % colors.length]!, animationDuration: `${6 + rand(i + 5) * 6}s`, animationDelay: `${-rand(i + 7) * 8}s` })} />
      ))}
    </div>
  );
}

/** Haces de luz diagonales que barren la página (Black Friday, CyberMonday). */
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

/** Rayos de sol que giran lento desde arriba (Operación verano). */
export function SunRays({ color }: { color: string }) {
  return <div className="fx-layer"><span className="fx-sun" style={v({ "--c": color })} /></div>;
}

const ECG = "M0 60H430l14-28 18 64 22-90 20 78 14-24H760l10-16 12 34 14-18H1200";

/**
 * Línea de pulso que cruza la página (el motivo de la pantalla de carga): la línea queda quieta y tenue, y una
 * ventana la recorre encendida (ventana y trazo se mueven con transform opuestos).
 */
export function PulseLine({ color }: { color: string }) {
  const line = (o: number) => (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      <path d={ECG} fill="none" stroke={color} strokeOpacity={o} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
  return (
    <div className="fx-layer fx-pulse">
      <div className="fx-ecg">{line(0.12)}</div>
      <div className="fx-ecg fx-ecg-win"><div className="fx-ecg-trk">{line(0.7)}</div></div>
    </div>
  );
}
