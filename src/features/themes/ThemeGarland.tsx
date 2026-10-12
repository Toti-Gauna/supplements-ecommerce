"use client";
import type { SeasonId } from "@/demo/types";
import { skinOf } from "./skins";
import { useCurrentTheme } from "./useCurrentTheme";

/**
 * Guirnalda que cuelga debajo del header, con cuatro estilos: lamparitas (fiestas de noche), tira de LED cuadrados
 * (CyberMonday), discos de pesas colgando (fechas de gimnasio) y banderines en el resto.
 */
type Style = "lights" | "leds" | "plates" | "pennants";
const LOOK: Record<SeasonId, { style: Style; colors?: string[] }> = {
  "dia-de-la-madre": { style: "pennants", colors: ["#f5a8c6", "#ffd6e7", "#e4577a", "#ffffff"] },
  halloween: { style: "lights", colors: ["#ff8a1f", "#a77be0", "#a6ff4d"] },
  "cyber-monday": { style: "leds", colors: ["#3ff0e0", "#ff4fd8", "#c8ff2e"] },
  "black-friday": { style: "lights", colors: ["#c8ff2e", "#ffffff", "#e3ff8f"] },
  navidad: { style: "lights", colors: ["#e5544a", "#f3c84c", "#4fb36a", "#8fd3ff"] },
  "ano-nuevo": { style: "lights", colors: ["#c8ff2e", "#8b72ff", "#2ee6d6", "#ff7aa8"] },
  "san-valentin": { style: "pennants", colors: ["#ff9bb3", "#ffffff", "#c2184c", "#ffd1dc"] },
  "vuelta-al-gym": { style: "plates" },
  "hot-sale": { style: "lights", colors: ["#ff8a3c", "#ffd34d", "#ff5a1f"] },
  "dia-del-padre": { style: "plates" },
  "dia-del-amigo": { style: "pennants", colors: ["#5ee8da", "#e3ff8f", "#ffffff", "#0f766e"] },
  "operacion-verano": { style: "pennants", colors: ["#ffd34d", "#5ee8da", "#ffffff", "#0b6f96"] },
};
/** Discos con los colores reglamentarios (rojo 25, azul 20, amarillo 15, verde 10). */
const PLATES = ["#d6262f", "#2450c9", "#f2c018", "#1a8a4a"];
const W = 1200, H = 34, N = 24;

export function ThemeGarland() {
  const { theme } = useCurrentTheme();
  if (!theme) return null;
  const skin = skinOf(theme.id);
  const { style, colors = PLATES } = LOOK[theme.id];
  const y = (x: number) => 6 + Math.sin((x / W) * Math.PI * 6 - Math.PI / 2) * -5 + 5;
  const wire = Array.from({ length: 121 }, (_, i) => `${i === 0 ? "M" : "L"}${(i / 120) * W} ${y((i / 120) * W).toFixed(2)}`).join("");
  return (
    <div aria-hidden="true" data-garland={style} className="garland pointer-events-none absolute inset-x-0 z-30 h-[34px] overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice" className="h-full w-full">
        <path d={wire} fill="none" stroke={style === "plates" ? "#9aa3ad" : skin.from} strokeWidth="1.6" opacity=".7" vectorEffect="non-scaling-stroke" />
        {Array.from({ length: N }, (_, i) => {
          const x = ((i + 0.5) / N) * W;
          const c = colors[i % colors.length]!;
          const at = `translate(${x} ${y(x)})`;
          if (style === "lights") return (
            <g key={i} transform={at}>
              <rect x="-2" y="0" width="4" height="4" rx="1" fill="#3a3f47" />
              <ellipse cx="0" cy="10" rx="4" ry="6.5" fill={c} className="garland-bulb" style={{ color: c, animationDelay: `${(i % 6) * 0.35}s` }} />
            </g>
          );
          if (style === "leds") return <rect key={i} x={x - 4} y={y(x) + 2} width="8" height="8" rx="1.5" fill={c} className="garland-bulb" style={{ color: c, animationDelay: `${(i % 4) * 0.5}s` }} />;
          if (style === "plates") return (
            <g key={i} transform={at}>
              <path d="M0 0v4" stroke="#9aa3ad" strokeWidth="1.2" />
              <circle cy="11" r="7" fill={c} /><circle cy="11" r="4.6" fill="none" stroke="#000" strokeOpacity=".25" />
              <circle cy="11" r="2" fill="#d9dee5" />
            </g>
          );
          return <path key={i} d={`M${x - 14} ${y(x - 14)} L${x + 14} ${y(x + 14)} L${x} ${y(x) + 22} Z`} fill={c} opacity=".92" />;
        })}
      </svg>
    </div>
  );
}
