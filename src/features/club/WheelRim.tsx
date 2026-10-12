import { useId, type CSSProperties } from "react";
import { LEDS, polar, VOLT, VOLT_SOFT } from "./wheel-art";

export type RimLights = "idle" | "chase" | "win";

/** Radios en la caja de 100 del dial: aro de goma y luces. El disco ocupa hasta `PLATE_R` (ver `WheelDial`). */
export const PLATE_R = 45.6;
const RIM_OUT = 50;
const LED_R = (PLATE_R + RIM_OUT) / 2;

/**
 * Aro de goma fijo alrededor del disco, con las luces LED: en reposo quedan a media luz, al girar se encienden en
 * cadena (tres cometas que corren hacia donde gira) y al ganar titilan todas juntas. Encima del disco va la luz del
 * estudio (brillo arriba a la izquierda y sombra abajo), que no gira con él. No recibe toques: pasan al disco.
 */
export function WheelRim({ lights = "idle", dir = 1 }: { lights?: RimLights; dir?: 1 | -1 }) {
  const uid = useId().replace(/:/g, "");
  const id = (k: string) => `${uid}${k}`;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible">
      <defs>
        <linearGradient id={id("rim")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a414d" />
          <stop offset=".35" stopColor="#161a21" />
          <stop offset=".7" stopColor="#0b0d11" />
          <stop offset="1" stopColor="#232831" />
        </linearGradient>
        <radialGradient id={id("lens")} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#fbffe8" />
          <stop offset=".45" stopColor={VOLT_SOFT} />
          <stop offset="1" stopColor={VOLT} />
        </radialGradient>
        <radialGradient id={id("halo")}>
          <stop offset="0" stopColor={VOLT} stopOpacity=".75" />
          <stop offset="1" stopColor={VOLT} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("key")} cx=".32" cy=".2" r=".75">
          <stop offset="0" stopColor="#fff" stopOpacity=".26" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".04" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("shade")} cx=".7" cy=".85" r=".8">
          <stop offset="0" stopColor="#000" stopOpacity=".34" />
          <stop offset=".6" stopColor="#000" stopOpacity=".08" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("vig")}>
          <stop offset=".86" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".45" />
        </radialGradient>
      </defs>
      {/* Luz del estudio sobre la goma (fija: el disco gira debajo). */}
      <circle cx="50" cy="50" r={PLATE_R} fill={`url(#${id("vig")})`} />
      <circle cx="50" cy="50" r={PLATE_R} fill={`url(#${id("shade")})`} />
      <circle cx="50" cy="50" r={PLATE_R} fill={`url(#${id("key")})`} />
      {/* Aro de goma con canto pulido. */}
      <path fillRule="evenodd" fill={`url(#${id("rim")})`} d={`M50 0a50 50 0 1 1 0 100a50 50 0 1 1 0-100ZM50 ${50 - PLATE_R}a${PLATE_R} ${PLATE_R} 0 1 0 0 ${PLATE_R * 2}a${PLATE_R} ${PLATE_R} 0 1 0 0-${PLATE_R * 2}Z`} />
      <circle cx="50" cy="50" r={RIM_OUT - 0.35} fill="none" stroke="#fff" strokeOpacity=".14" strokeWidth=".5" />
      <circle cx="50" cy="50" r={PLATE_R + 0.2} fill="none" stroke="#000" strokeOpacity=".8" strokeWidth=".8" />
      {Array.from({ length: LEDS }, (_, i) => {
        const [x, y] = polar(50, 50, LED_R, (i / LEDS) * 360);
        // Cadena: cada luz arranca un poco después que la de atrás, en el sentido del giro.
        const step = dir > 0 ? 7 - (i % 8) : i % 8;
        const style = lights === "chase" ? ({ animationDelay: `${step * -0.1}s` } as CSSProperties) : undefined;
        const idle = i % 2 ? 0.28 : 0.6;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="1.45" fill="#05070a" />
            <circle cx={x} cy={y} r="1.05" fill="#1e2611" />
            <g className={lights === "chase" ? "led-chase" : lights === "win" ? "led-win" : undefined} style={style} opacity={lights === "idle" ? idle : 1}>
              <circle cx={x} cy={y} r="3.2" fill={`url(#${id("halo")})`} />
              <circle cx={x} cy={y} r="1.05" fill={`url(#${id("lens")})`} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
