"use client";
import { motion } from "motion/react";
import { useContext, useEffect, useState } from "react";
import { Lola, Pancho, type PupPose } from "@/components/illustrations/characters";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { Burst, EASE, Layer, SceneClock, rand, useAt } from "./kit";

/** Fase de la escena según el tiempo (los personajes cambian de pose: caminan, saludan, saltan). */
function usePhase(times: readonly number[]): number {
  const offset = useContext(SceneClock);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ids = times.map((t, i) => window.setTimeout(() => setPhase(i + 1), Math.max(0, t - offset * 1000)));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [times, offset]);
  return phase;
}

const FRIENDS_AT = [1850, 2550] as const;
const FRIENDS_POSE: PupPose[] = ["walk", "wave", "hop"];

/**
 * Día del Amigo: Pancho y Lola llegan caminando desde los costados con pañuelos de colores, chocan la pata,
 * aparece el mate humeando entre los dos y festejan saltando. Detrás, dos anillos se entrelazan.
 */
export function FriendsScene() {
  const at = useAt();
  const pose = FRIENDS_POSE[usePhase(FRIENDS_AT)]!;
  return (
    <>
      {[-1, 1].map((side, i) => (
        // Los anillos rodean el logo (su tamaño sale del alto del logo): "Volta" entra en la zona donde se cruzan.
        <motion.svg key={side} viewBox="0 0 100 100" className="absolute left-1/2 top-1/2 -translate-y-1/2 overflow-visible" style={{ width: "calc(var(--brand-h) * 2.5)", height: "calc(var(--brand-h) * 2.5)" }}
          initial={{ x: `${-50 + side * 160}%`, opacity: 0 }} animate={{ x: `${-50 + side * 12.5}%`, opacity: 0.8 }} transition={{ duration: 1.6, delay: at(0.2), ease: EASE }}>
          <motion.circle cx="50" cy="50" r="46" fill="none" stroke={i ? "#f3dca6" : "#b7d68f"} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: at(0.3), ease: EASE }}
            style={{ filter: `drop-shadow(0 0 4px ${i ? "#f3dca6" : "#b7d68f"})` }} />
        </motion.svg>
      ))}
      <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[20%] w-full">
        <path d="M0 90C220 40 420 80 620 60S1000 30 1200 70V200H0Z" fill="#2c4a22" /><path d="M0 130C260 95 520 125 760 110S1060 100 1200 115V200H0Z" fill="#355a29" />
      </svg>
      <motion.div className="absolute bottom-[6%] left-1/2 w-[36vmin]" initial={{ x: "-150vw" }} animate={{ x: "-98%" }} transition={{ duration: 1.65, delay: at(0.2), ease: [0.25, 0.6, 0.35, 1] }}>
        <Pancho pose={pose} animated outfit={{ bandana: "#b7d68f" }} className="w-full" />
      </motion.div>
      <motion.div className="absolute bottom-[6%] left-1/2 w-[34vmin]" initial={{ x: "150vw" }} animate={{ x: "-4%" }} transition={{ duration: 1.65, delay: at(0.2), ease: [0.25, 0.6, 0.35, 1] }}>
        <Lola pose={pose} animated flip outfit={{ bandana: "#ef9b6a" }} className="w-full" />
      </motion.div>
      <motion.span className="absolute bottom-[calc(6%+15vmin)] left-1/2 h-[9vmin] w-[9vmin] -translate-x-1/2" initial={{ scale: 0, y: 20 }} animate={{ scale: [0, 1.2, 1], y: 0 }} transition={{ duration: 0.7, delay: at(1.95), ease: EASE }}>
        <svg viewBox="0 0 40 40" className="absolute -top-[80%] left-[10%] h-[80%] w-[80%] overflow-visible">
          {[0, 1, 2].map((k) => (
            <motion.path key={k} d={`M${12 + k * 8} 38 C${6 + k * 8} 30 ${18 + k * 8} 24 ${12 + k * 8} 14 C${8 + k * 8} 8 ${16 + k * 8} 4 ${12 + k * 8} 0`} fill="none" stroke="#f6f1e8" strokeWidth="1.4" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1], opacity: [0, 0.7, 0] }} transition={{ duration: 1.6, delay: at(2.2 + k * 0.25), repeat: Infinity }} />
          ))}
        </svg>
        <Decor kind="mate" className="h-full w-full" />
      </motion.span>
      <Burst x="50%" y="72%" delay={1.9} colors={["#ef9b6a", "#f3dca6", "#e86a7c"]} count={14} radius={18} />
      <Burst x="50%" y="60%" delay={2.6} colors={["#f3dca6", "#b7d68f", "#ef9b6a", "#ffffff"]} count={26} radius={42} shape="streak" />
    </>
  );
}

const FATHERS_AT = [2300] as const;

/**
 * Día del Padre: noche en la rambla. Bajo el farol llegan Panchito (el cachorro) y Pancho con sombrero y corbata;
 * el cachorro salta con un regalo y papá se saca el sombrero. Estrellas y una estrella fugaz.
 */
export function FathersScene() {
  const at = useAt();
  const phase = usePhase(FATHERS_AT);
  return (
    <>
      <Layer>
        {Array.from({ length: 36 }, (_, i) => (
          <motion.span key={i} className="absolute h-[0.35vmin] w-[0.35vmin] rounded-full bg-white" style={{ left: `${rand(i) * 100}%`, top: `${rand(i + 9) * 55}%` }}
            animate={{ opacity: [0.1, 0.9, 0.2] }} transition={{ duration: 1.5 + rand(i) * 2, repeat: Infinity, repeatType: "mirror" }} />
        ))}
      </Layer>
      <motion.span className="absolute h-[0.4vmin] w-[22vmin] rounded-full bg-[linear-gradient(90deg,transparent,#fff)]" style={{ rotate: "-24deg" }}
        initial={{ left: "70%", top: "6%", opacity: 0 }} animate={{ left: "20%", top: "30%", opacity: [0, 1, 0] }} transition={{ duration: 0.9, delay: at(2.8), ease: "easeIn" }} />
      <motion.div className="absolute bottom-[8%] right-[7%] h-[62vmin] w-[18vmin]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <span className="absolute -left-[60%] top-[6%] h-[110%] w-[220%] bg-[radial-gradient(40%_60%_at_50%_10%,rgb(255_216_140/0.45),transparent_70%)]" />
        <svg viewBox="0 0 30 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax meet">
          <path d="M15 14v84M9 98h12" stroke="#11161d" strokeWidth="2.4" strokeLinecap="round" /><path d="M8 8h14l-3 8h-8z" fill="#11161d" />
          <motion.ellipse cx="15" cy="14" rx="5" ry="3" fill="#ffd88c" animate={{ opacity: [0.7, 1, 0.85] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }} />
        </svg>
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 h-[9%] bg-[linear-gradient(#1c2a3a,#121b26)]"><span className="absolute inset-x-0 top-0 h-[2px] bg-[#e9c27a]/40" /></div>
      <motion.div className="absolute bottom-[7%] left-[50%] w-[38vmin]" initial={{ x: "-140vw" }} animate={{ x: "-92%" }} transition={{ duration: 2.1, delay: at(0.3), ease: [0.25, 0.6, 0.35, 1] }}>
        <Pancho pose={phase ? "stand" : "walk"} animated outfit={{ hat: "fedora", tie: "#7a2434" }} className={`w-full ${phase ? "pup-tip" : ""}`} />
      </motion.div>
      <motion.div className="absolute bottom-[7%] left-[50%] w-[24vmin]" initial={{ x: "-120vw" }} animate={{ x: "8%" }} transition={{ duration: 2, delay: at(0.15), ease: [0.25, 0.6, 0.35, 1] }}>
        <Pancho pose={phase ? "hop" : "walk"} pup animated className="w-full" />
        <motion.span className="absolute -top-[46%] left-[46%] h-[11vmin] w-[11vmin]" initial={{ scale: 0, y: 20 }} animate={phase ? { scale: [0, 1.2, 1], y: 0 } : {}} transition={{ duration: 0.6, ease: EASE }}>
          <Decor kind="gift" className="h-full w-full" />
        </motion.span>
      </motion.div>
      <Burst x="44%" y="62%" delay={2.4} colors={["#e9c27a", "#fff4d6", "#a9c6e6"]} count={18} radius={26} />
    </>
  );
}
