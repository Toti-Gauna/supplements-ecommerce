"use client";
import { motion } from "motion/react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { PRIDE } from "@/components/illustrations/seasonal/pride";
import { Burst, EASE, Layer, rand, useAt } from "./kit";

/** Cinta ondulada de lado a lado (desplazada en y por banda). */
const ribbon = (y: number, amp: number, phase: number) =>
  `M-20 ${y} ${Array.from({ length: 9 }, (_, i) => `S${i * 30 + 15} ${y + Math.sin(i + phase) * amp} ${i * 30 + 30} ${y + Math.sin(i + 0.6 + phase) * amp * 0.6}`).join(" ")}`;

/**
 * Orgullo: un haz de luz blanca entra a un prisma y sale abierto en los seis colores, hacia arriba (por encima del
 * logo: en pantallas apaisadas el abanico hacia abajo le pasaba por detrás); abajo, seis cintas
 * onduladas cruzan la pantalla y estalla un corazón arcoíris.
 */
export function PrideScene() {
  const at = useAt();
  return (
    <>
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMinYMin slice" className="absolute inset-x-0 top-[10%] h-[44%] w-full overflow-visible">
        <motion.path d="M-10 46 L52 30" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px #fff)" }}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: at(0.2), ease: "easeIn" }} />
        <motion.path d="M54 14 L70 42 L38 42 Z" fill="rgb(255 255 255 / 0.08)" stroke="rgb(255 255 255 / 0.75)" strokeWidth="0.8" strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }} style={{ transformOrigin: "54px 32px", transformBox: "view-box" }} />
        {PRIDE.map((c, i) => (
          <motion.path key={c} d={`M60 ${32 + i * 0.9} L214 ${-34 + i * 9}`} stroke={c} strokeWidth="3.2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 2.5px ${c})` }}
            initial={{ pathLength: 0, opacity: 0.95 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: at(0.85 + i * 0.06), ease: EASE }} />
        ))}
      </svg>
      <svg viewBox="0 0 240 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[10%] h-[24%] w-full overflow-visible">
        {PRIDE.map((c, i) => (
          <motion.path key={c} d={ribbon(10 + i * 7, 6, i * 0.35)} fill="none" stroke={c} strokeWidth="5.6" strokeLinecap="round" opacity=".92"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: at(1.2 + i * 0.09), ease: EASE }} />
        ))}
      </svg>
      <motion.span className="absolute bottom-[14%] left-1/2 h-[16vmin] w-[16vmin] -translate-x-1/2 [filter:drop-shadow(0_10px_24px_rgb(0_0_0/0.45))]"
        initial={{ scale: 0, rotate: -12 }} animate={{ scale: [0, 1.25, 1], rotate: 0 }} transition={{ duration: 0.7, delay: at(2.6), ease: EASE }}>
        <Decor kind="pride-heart" className="h-full w-full" />
      </motion.span>
      <Burst x="50%" y="78%" delay={2.65} colors={PRIDE} count={24} radius={34} size={1.1} />
      <Layer>
        {Array.from({ length: 9 }, (_, i) => (
          <motion.span key={i} className="absolute h-[5vmin] w-[5vmin]" style={{ left: `${6 + rand(i + 4) * 88}%` }} initial={{ top: "105%", opacity: 0 }}
            animate={{ top: `${20 + rand(i) * 30}%`, opacity: [0, 0.8, 0] }} transition={{ duration: 3, delay: at(1 + rand(i + 1) * 1.6), ease: "easeOut" }}>
            <Decor kind="pride-heart" className="h-full w-full" />
          </motion.span>
        ))}
      </Layer>
    </>
  );
}
