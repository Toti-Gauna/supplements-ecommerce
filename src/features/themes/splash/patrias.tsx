"use client";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { CELESTE } from "@/components/illustrations/seasonal/patrias";
import { Burst, EASE, Firework, Layer, Letters, rand, useAt } from "./kit";

const PATRIA = [CELESTE, "#ffffff", "#f6c54c"];

/**
 * 25 de Mayo: llueve sobre la plaza y se abren los paraguas; aparece el Cabildo, para la lluvia, sale el
 * Sol de Mayo detrás de la torre, los paraguas se cierran y vuelan escarapelas. Las empanadas humean.
 */
export function MayoScene() {
  const at = useAt();
  return (
    // --u: un "vmin" que achica el Sol y el Cabildo cuando la pantalla es baja, para que entren debajo del logo.
    <div className="absolute inset-0" style={{ "--u": "min(1vmin, calc((36vh - var(--brand-h) / 2 - 16px) / 48))" } as CSSProperties}>
      <Layer>
        {Array.from({ length: 42 }, (_, i) => (
          <motion.span key={i} className="absolute h-[5vmin] w-[0.25vmin] rounded-full bg-[linear-gradient(transparent,rgb(200_225_245/0.8))]" style={{ left: `${rand(i) * 100}%`, rotate: "12deg" }}
            initial={{ top: "-8%", opacity: 0 }} animate={{ top: ["-8%", "108%"], opacity: [0, 0.8, 0.8, 0] }} transition={{ duration: 0.75 + rand(i + 2) * 0.3, delay: at(rand(i + 5) * 0.6), repeat: 2, ease: "linear" }} />
        ))}
      </Layer>
      <Letters text="1810" delay={0.6} className="font-display absolute left-1/2 top-[15%] -translate-x-1/2 text-[11vmin] leading-none text-[#f6c54c] [text-shadow:0_4px_24px_rgb(0_0_0/0.35)]" />
      <motion.span className="absolute bottom-[14%] left-1/2 h-[calc(var(--u)*48)] w-[calc(var(--u)*48)] -translate-x-1/2" initial={{ y: "40%", opacity: 0 }} animate={{ y: 0, opacity: 1, rotate: 25 }}
        transition={{ y: { duration: 1.2, delay: at(2.1), ease: EASE }, opacity: { duration: 0.8, delay: at(2.1) }, rotate: { duration: 5, delay: at(2.1), ease: "linear" } }}>
        <Decor kind="sol-de-mayo" className="h-full w-full [filter:drop-shadow(0_0_30px_rgb(246_197_76/0.7))]" />
      </motion.span>
      <motion.span className="absolute bottom-[5%] left-1/2 h-[calc(var(--u)*40)] w-[calc(var(--u)*58)] -translate-x-1/2" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: at(0.5), ease: EASE }}>
        <Decor kind="cabildo" className="h-full w-full [filter:drop-shadow(0_16px_24px_rgb(0_0_0/0.35))]" />
      </motion.span>
      <div className="absolute inset-x-0 bottom-[2%] flex justify-around px-[2%]">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span key={i} className="relative block h-[11vmin] w-[11vmin]" style={{ marginBottom: `${(i % 2) * 3}vmin`, visibility: i === 3 ? "hidden" : undefined }}>
            <motion.span className="absolute inset-0 origin-bottom" initial={{ scale: 0 }} animate={{ scale: [0, 1.1, 1, 1, 0], rotate: [0, 0, (i % 2 ? 6 : -6), 0, 0] }}
              transition={{ duration: 2.6, delay: at(0.3 + i * 0.12), times: [0, 0.12, 0.2, 0.8, 1] }}>
              <Decor kind="paraguas" className="h-full w-full" />
            </motion.span>
            <motion.span className="absolute inset-[15%]" initial={{ scale: 0, y: 0 }} animate={{ scale: [0, 1.2, 1], y: [0, -40 - rand(i) * 30, -20] }} transition={{ duration: 0.9, delay: at(2.9 + i * 0.07), ease: EASE }}>
              <Decor kind="escarapela" className="h-full w-full" />
            </motion.span>
          </span>
        ))}
      </div>
      {[["right-[3%] bottom-[20%]", 1.3, -6], ["right-[12%] bottom-[16%]", 1.45, 8]].map(([place, d, r]) => (
        <motion.span key={place as string} className={`absolute h-[13vmin] w-[13vmin] ${place}`} initial={{ x: 60, opacity: 0, rotate: 10 }} animate={{ x: 0, opacity: 1, rotate: r as number }} transition={{ duration: 0.9, delay: at(d as number), ease: EASE }}>
          <Decor kind="empanada" className="h-full w-full" />
        </motion.span>
      ))}
      <Burst x="50%" y="72%" delay={2.9} colors={PATRIA} count={22} radius={36} />
    </div>
  );
}

/** Mástil y bandera que sube flameando (la onda se anima entre dos formas). */
const WAVE_A = "M0 5C14 -2 26 12 40 5S66 -2 80 5V52C66 45 54 59 40 52S14 45 0 52Z";
const WAVE_B = "M0 5C14 12 26 -2 40 5S66 12 80 5V52C66 59 54 45 40 52S14 59 0 52Z";

/** 20 de Junio: la bandera sube por el mástil flameando, detrás nace el Sol de Mayo y estallan papelitos celestes y blancos. */
export function BanderaScene() {
  const at = useAt();
  return (
    <>
      <motion.span className="absolute right-[2%] top-[12%] h-[42vmin] w-[42vmin]" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 0.95, scale: 1, rotate: 40 }}
        transition={{ opacity: { duration: 0.8, delay: at(2) }, scale: { duration: 1, delay: at(2), ease: EASE }, rotate: { duration: 5, delay: at(2), ease: "linear" } }}>
        <Decor kind="sol-de-mayo" className="h-full w-full [filter:drop-shadow(0_0_40px_rgb(246_207_90/0.8))]" />
      </motion.span>
      <div className="absolute left-[10%] top-[10%] h-[74%] w-[44vmin]">
        <span className="absolute bottom-0 left-0 top-0 w-[0.9vmin] rounded-full bg-[linear-gradient(90deg,#efe0b8,#b99a5c)]" />
        <span className="absolute -left-[0.6vmin] -top-[1.6vmin] h-[2.2vmin] w-[2.2vmin] rounded-full bg-[#f6cf5a]" />
        <motion.svg viewBox="0 0 80 56" className="absolute left-[0.9vmin] w-[38vmin] overflow-visible [filter:drop-shadow(0_12px_18px_rgb(0_0_0/0.3))]"
          initial={{ top: "78%" }} animate={{ top: "2%" }} transition={{ duration: 2.1, delay: at(0.3), ease: [0.4, 0, 0.2, 1] }}>
          <defs><clipPath id="bandera-wave"><motion.path d={WAVE_A} animate={{ d: [WAVE_A, WAVE_B, WAVE_A] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} /></clipPath></defs>
          <g clipPath="url(#bandera-wave)">
            <rect width="80" height="20" fill={CELESTE} /><rect y="20" width="80" height="17" fill="#fff" /><rect y="37" width="80" height="20" fill={CELESTE} />
            <circle cx="40" cy="28.5" r="5" fill="#f6c54c" />
          </g>
        </motion.svg>
      </div>
      <Burst x="12%" y="92%" delay={2.5} colors={PATRIA} count={20} radius={40} shape="streak" />
      <Burst x="88%" y="92%" delay={2.7} colors={PATRIA} count={20} radius={40} shape="streak" />
      <motion.span className="absolute bottom-[8%] right-[8%] h-[14vmin] w-[14vmin]" initial={{ scale: 0, rotate: -30 }} animate={{ scale: [0, 1.2, 1], rotate: 0 }} transition={{ duration: 0.8, delay: at(1.6), ease: EASE }}>
        <Decor kind="escarapela" className="h-full w-full" />
      </motion.span>
    </>
  );
}

/** 9 de Julio: noche en Tucumán; la Casa Histórica aparece, se enciende la puerta y la celebran fuegos celestes, blancos y dorados. */
export function IndependenciaScene() {
  const at = useAt();
  const colors = ["#bfe3fb", "#ffffff", "#f3d27a"];
  return (
    <>
      <Layer>
        {Array.from({ length: 36 }, (_, i) => (
          <motion.span key={i} className="absolute rounded-full bg-white" style={{ left: `${rand(i) * 100}%`, top: `${rand(i + 40) * 50}%`, width: `${0.2 + rand(i + 7) * 0.3}vmin`, height: `${0.2 + rand(i + 7) * 0.3}vmin` }}
            animate={{ opacity: [0.15, 1, 0.3] }} transition={{ duration: 1.4 + rand(i) * 1.4, repeat: Infinity, repeatType: "mirror", delay: at(rand(i + 2)) }} />
        ))}
      </Layer>
      {[["16%", "20%", 1.3], ["80%", "16%", 1.8], ["30%", "34%", 2.3], ["68%", "32%", 2.8], ["50%", "14%", 3.2]].map(([x, y, d], i) => (
        <Firework key={i} x={x as string} y={y as string} delay={d as number} colors={[colors[i % 3]!, colors[(i + 1) % 3]!, CELESTE]} />
      ))}
      <Letters text="1816" delay={0.6} className="font-display absolute left-1/2 top-[15%] -translate-x-1/2 text-[11vmin] leading-none text-[#f3d27a] [text-shadow:0_0_30px_rgb(243_210_122/0.45)]" />
      <motion.span className="absolute bottom-[3%] left-1/2 -translate-x-1/2" style={{ width: "min(50vmin, calc(47vh - var(--brand-h) / 2 - 16px))", aspectRatio: "1" }} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.2, delay: at(0.2), ease: EASE }}>
        <Decor kind="casa-tucuman" className="h-full w-full [filter:drop-shadow(0_18px_30px_rgb(0_0_0/0.5))]" />
        <motion.span className="absolute bottom-[1%] left-1/2 h-[34%] w-[20%] -translate-x-1/2 rounded-t-full bg-[radial-gradient(60%_80%_at_50%_100%,rgb(255_214_130/0.85),transparent)] mix-blend-screen"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.75] }} transition={{ duration: 1.2, delay: at(1.1) }} />
      </motion.span>
    </>
  );
}
