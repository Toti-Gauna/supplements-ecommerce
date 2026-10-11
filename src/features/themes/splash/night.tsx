"use client";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { Moon, SantaSleigh, WitchOnBroom } from "@/components/illustrations/seasonal/scenes";
import { EASE, Layer, rand, useAt } from "./kit";

/** Navidad: cielo estrellado, colinas nevadas en capas y Papá Noel cruzando la luna con estela dorada. */
export function ChristmasScene() {
  const at = useAt();
  return (
    <>
      <Layer>
        {Array.from({ length: 34 }, (_, i) => (
          <motion.span key={i} className="absolute rounded-full bg-white" style={{ left: `${rand(i) * 100}%`, top: `${rand(i + 50) * 55}%`, width: `${0.2 + rand(i + 9) * 0.35}vmin`, height: `${0.2 + rand(i + 9) * 0.35}vmin` }}
            animate={{ opacity: [0.15, 1, 0.3] }} transition={{ duration: 1.4 + rand(i) * 1.6, repeat: Infinity, repeatType: "mirror", delay: at(rand(i + 3)) }} />
        ))}
      </Layer>
      <motion.span className="absolute right-[7%] top-[8%] h-[30vmin] w-[30vmin] [filter:drop-shadow(0_0_50px_rgb(255_250_225/0.5))]" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, ease: EASE }}>
        <Moon className="h-full w-full" tint="#f3efd9" />
      </motion.span>
      <motion.div className="absolute left-0 top-[14%] flex w-[min(64vmin,460px)] items-center" initial={{ x: "-70vw", y: "8vh", rotate: -4 }} animate={{ x: "130vw", y: ["8vh", "-3vh", "2vh"], rotate: [-4, -8, -2] }} transition={{ duration: 3.8, delay: at(0.4), ease: [0.45, 0.05, 0.35, 1] }}>
        <span className="relative mr-[-2%] h-[1.2vmin] w-[40vmin] rounded-full bg-[linear-gradient(90deg,transparent,rgb(243_200_76/0.25),rgb(255_236_170/0.9))] blur-[1px]">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.span key={i} className="absolute top-1/2 h-[0.7vmin] w-[0.7vmin] -translate-y-1/2 rounded-full bg-[#ffe9a8] shadow-[0_0_8px_#ffd76a]" style={{ left: `${i * 10}%`, marginTop: `${(rand(i) - 0.5) * 3}vmin` }}
              animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: at(rand(i + 2) * 0.6) }} />
          ))}
        </span>
        <SantaSleigh className="w-[60%] shrink-0" color="#07130d" />
      </motion.div>
      <motion.svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full" initial={{ y: "40%" }} animate={{ y: 0 }} transition={{ duration: 1.4, ease: EASE }}>
        <path d="M0 140 C200 70 380 120 560 90 C760 55 960 120 1200 80 V300 H0Z" fill="#0d3324" />
        <path d="M0 200 C240 140 420 190 640 160 C840 135 1000 180 1200 150 V300 H0Z" fill="#134634" />
        <path d="M0 250 C260 205 520 240 760 220 C960 205 1080 230 1200 215 V300 H0Z" fill="#dfe9ee" />
        <path d="M0 250 C260 205 520 240 760 220 C960 205 1080 230 1200 215" fill="none" stroke="#fff" strokeWidth="3" opacity=".7" />
      </motion.svg>
      <div className="absolute inset-x-0 bottom-[11%] flex items-end justify-around px-[3%]">
        {[0.8, 1.15, 0.7, 1.3, 0.9, 1.05].map((s, i) => (
          <motion.span key={i} className="block origin-bottom" style={{ width: `${s * 10}vmin`, height: `${s * 10}vmin` }} initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ duration: 0.8, delay: at(0.7 + i * 0.12), ease: EASE }}>
            <Decor kind="tree" className="h-full w-full" />
          </motion.span>
        ))}
      </div>
    </>
  );
}

/** Halloween: luna gigante con nubes, murciélagos que salen volando de la luna, bruja, cementerio y niebla. */
export function HalloweenScene() {
  const at = useAt();
  return (
    // La luna va entera arriba del logo (antes le quedaba detrás y el logo naranja no se leía): su tamaño sale del
    // espacio libre entre el rótulo y el logo.
    <div className="absolute inset-0" style={{ "--moon": "min(40vmin, calc(37vh - var(--brand-h) / 2 - 16px))", "--moon-top": "calc(50% - var(--brand-h) / 2 - 16px - var(--moon))" } as CSSProperties}>
      <motion.span className="absolute left-1/2 -translate-x-1/2 [filter:drop-shadow(0_0_60px_rgb(255_150_50/0.6))]" style={{ top: "var(--moon-top)", width: "var(--moon)", height: "var(--moon)" }}
        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: EASE }}>
        <Moon className="h-full w-full" tint="#ffa94d" />
      </motion.span>
      {[0, 1].map((i) => (
        <motion.span key={i} className="absolute h-[9vmin] w-[46vmin] rounded-full bg-[radial-gradient(closest-side,rgb(60_36_80/0.85),transparent)] blur-[6px]" style={{ top: `calc(var(--moon-top) + var(--moon) * ${0.3 + i * 0.3})` }}
          initial={{ x: i ? "110vw" : "-40vw", opacity: 0.85 }} animate={{ x: i ? "-40vw" : "110vw" }} transition={{ duration: 5, ease: "linear" }} />
      ))}
      <div className="absolute left-1/2" style={{ top: "calc(var(--moon-top) + var(--moon) / 2)" }}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = rand(i + 7) * Math.PI * 2;
          const d = 40 + rand(i) * 40;
          return (
            <motion.span key={i} className="absolute h-[7vmin] w-[7vmin]" initial={{ x: 0, y: 0, scale: 0.1, opacity: 0 }}
              animate={{ x: `${Math.cos(a) * d}vmin`, y: `${Math.sin(a) * d * 0.7}vmin`, scale: [0.1, 1, 0.8], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.2, delay: at(0.6 + rand(i + 1) * 0.6), ease: "easeOut" }}>
              <Decor kind="bat" className="h-full w-full [filter:brightness(0.6)]" />
            </motion.span>
          );
        })}
      </div>
      <motion.span className="absolute left-0 w-[min(46vmin,320px)]" style={{ top: "calc(var(--moon-top) + var(--moon) * 0.15)" }} initial={{ x: "-50vw", y: "5vh" }} animate={{ x: "120vw", y: ["5vh", "-4vh", "1vh"] }} transition={{ duration: 3, delay: at(1.3), ease: [0.45, 0.05, 0.35, 1] }}>
        <WitchOnBroom className="w-full" />
      </motion.span>
      <motion.svg viewBox="0 0 1200 260" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[28%] w-full" initial={{ y: "50%" }} animate={{ y: 0 }} transition={{ duration: 1.3, ease: EASE }}>
        <path d="M0 150 C180 110 360 150 600 120 C840 95 1000 140 1200 115 V260 H0Z" fill="#160c1f" />
        {[140, 320, 860, 1040].map((x, i) => <path key={x} d={`M${x} 140 v-${46 + i * 6} a16 16 0 0 1 32 0 v${46 + i * 6} z`} fill="#22142e" />)}
        <path d="M980 120 v-80 M980 70 l-26 -22 M980 86 l30 -26 M980 54 l14 -18" stroke="#120a18" strokeWidth="7" strokeLinecap="round" />
      </motion.svg>
      <div className="scene-fog" />
      {[["6%", "16vmin", 0.8], ["78%", "19vmin", 1], ["34%", "10vmin", 1.2]].map(([left, size, delay]) => (
        <motion.span key={left as string} className="absolute bottom-[4%]" style={{ left: left as string, width: size as string, height: size as string }} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: at(delay as number), ease: EASE }}>
          <Decor kind="pumpkin" className="scene-glow h-full w-full" />
        </motion.span>
      ))}
    </div>
  );
}
