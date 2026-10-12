"use client";
import { motion, type MotionValue } from "motion/react";
import { useId } from "react";
import { VOLT } from "./wheel-art";

/**
 * Puntero de la ruleta: una traba de barra (collar con palanca) arriba del disco, con la lengüeta de acero que marca
 * el gajo. `kick` lo hace cabecear cada vez que pasa un gajo (el "clic" del disco).
 */
export function WheelCollar({ kick }: { kick?: MotionValue<number> }) {
  const uid = useId().replace(/:/g, "");
  const id = (k: string) => `${uid}${k}`;
  return (
    <motion.svg aria-hidden="true" viewBox="0 0 64 70" style={{ rotate: kick ?? 0, transformOrigin: "50% 26%" }}
      className="pointer-events-none absolute left-1/2 top-[-4.8%] z-20 w-[14%] min-w-10 -translate-x-1/2 drop-shadow-[0_6px_6px_rgb(0_0_0/0.55)]">
      <defs>
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b434f" />
          <stop offset=".45" stopColor="#1a1f27" />
          <stop offset="1" stopColor="#0b0e12" />
        </linearGradient>
        <linearGradient id={id("steel")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d8693" />
          <stop offset=".45" stopColor="#f2f4f7" />
          <stop offset="1" stopColor="#6b7480" />
        </linearGradient>
      </defs>
      {/* Lengüeta de acero que apunta al gajo. */}
      <path d="M24 30h16l-6.4 34.5a1.6 1.6 0 0 1-3.2 0Z" fill={`url(#${id("steel")})`} stroke="#0b0e12" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M32 33v26" stroke="#fff" strokeOpacity=".55" strokeWidth=".9" strokeLinecap="round" />
      {/* Cuerpo de la traba: anillo con estrías de agarre y la palanca cerrada en voltio. */}
      <rect x="6" y="12" width="52" height="22" rx="8" fill={`url(#${id("body")})`} stroke="#05070a" strokeWidth="1.6" />
      <rect x="9" y="14.5" width="46" height="4" rx="2" fill="#fff" fillOpacity=".13" />
      <path d="M12 20v10M16 20v10M20 20v10" stroke="#05070a" strokeOpacity=".75" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 20v10M17 20v10M21 20v10" stroke="#fff" strokeOpacity=".1" strokeWidth=".8" strokeLinecap="round" />
      <path d="M50 13.5 17 6.5" stroke="#05070a" strokeWidth="8.5" strokeLinecap="round" />
      <path d="M50 13.5 17 6.5" stroke={VOLT} strokeWidth="5.4" strokeLinecap="round" />
      <path d="M46 11.6 22 6.4" stroke="#fff" strokeOpacity=".5" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="50" cy="14" r="4.6" fill="#05070a" />
      <circle cx="50" cy="14" r="3.1" fill={`url(#${id("steel")})`} />
      <circle cx="44" cy="25" r="2.2" fill={VOLT} />
      <circle cx="43.4" cy="24.4" r=".7" fill="#fff" fillOpacity=".9" />
    </motion.svg>
  );
}
