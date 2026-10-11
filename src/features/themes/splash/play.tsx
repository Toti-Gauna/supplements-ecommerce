"use client";
import { motion } from "motion/react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { Layer, rand, useAt } from "./kit";

/** Día del Animal: huellas que cruzan la pantalla paso a paso y terminan en un corazón; huesitos flotan. */
export function AnimalScene() {
  const at = useAt();
  const steps = 13;
  return (
    <>
      <Layer>
        {Array.from({ length: steps }, (_, i) => {
          const t = i / (steps - 1);
          const left = 4 + t * 88;
          const top = 78 - Math.sin(t * Math.PI) * 52 + (i % 2 ? 4 : -4);
          return (
            <motion.span key={i} className="absolute h-[6vmin] w-[6vmin]" style={{ left: `${left}%`, top: `${top}%`, rotate: `${70 + (i % 2 ? 14 : -14) - t * 140}deg` }}
              initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: [0, 1, 0.55], scale: [0.4, 1.15, 1] }} transition={{ duration: 0.5, delay: at(0.25 + i * 0.22) }}>
              <Decor kind="paw" className="h-full w-full" />
            </motion.span>
          );
        })}
      </Layer>
      <motion.span className="absolute right-[3%] top-[66%] h-[9vmin] w-[11vmin]" initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.6, delay: at(0.25 + steps * 0.22) }}>
        <Decor kind="heart" className="h-full w-full" />
      </motion.span>
      <Layer>
        {Array.from({ length: 8 }, (_, i) => (
          // Los huesitos suben por los costados (0–35 % y 65–100 %): por el medio pasaban detrás del logo.
          <motion.span key={i} className="absolute h-[6vmin] w-[6vmin]" style={{ left: `${rand(i + 3) < 0.5 ? rand(i + 3) * 70 : 30 + rand(i + 3) * 70}%` }} initial={{ top: "105%", rotate: 0 }}
            animate={{ top: "-10%", rotate: 180 }} transition={{ duration: 4.5, delay: at(rand(i) * 1.5), ease: "linear" }}>
            <Decor kind="bone" className="h-full w-full opacity-60" />
          </motion.span>
        ))}
      </Layer>
    </>
  );
}

/** Día del Niño: globos de colores suben meciéndose, un barrilete cruza y llueven papelitos. */
export function KidsScene() {
  const at = useAt();
  return (
    <>
      <Layer>
        {Array.from({ length: 11 }, (_, i) => (
          <motion.span key={i} className="absolute" style={{ left: `${4 + i * 9 + rand(i) * 4}%`, width: `${8 + rand(i + 2) * 6}vmin`, height: `${10 + rand(i + 2) * 8}vmin`, filter: `hue-rotate(${i * 47}deg) saturate(1.2)` }}
            initial={{ top: "110%" }} animate={{ top: `${-30 + rand(i + 5) * 20}%`, x: [0, 14, -10, 8] }} transition={{ duration: 4 + rand(i) * 1.5, delay: at(rand(i + 9) * 0.8), ease: "easeOut" }}>
            <Decor kind="balloon" className="h-full w-full" />
          </motion.span>
        ))}
      </Layer>
      <motion.span className="absolute top-[10%] h-[16vmin] w-[14vmin]" initial={{ left: "-20%", rotate: -10 }} animate={{ left: "110%", top: ["10%", "4%", "14%", "6%"], rotate: [-10, 8, -6, 10] }} transition={{ duration: 4.2, delay: at(0.3), ease: "linear" }}>
        <Decor kind="kite" className="h-full w-full" />
      </motion.span>
      <Layer>
        {Array.from({ length: 34 }, (_, i) => (
          <motion.span key={i} className="absolute h-[1.4vmin] w-[0.8vmin] rounded-[1px]" style={{ left: `${rand(i + 1) * 100}%`, background: ["#ffd34d", "#4fb3e8", "#ef5b5b", "#7bd389"][i % 4] }}
            initial={{ top: "-5%" }} animate={{ top: "105%", rotate: 720 }} transition={{ duration: 2.6 + rand(i) * 1.6, delay: at(0.8 + rand(i + 3) * 1.6), ease: "linear" }} />
        ))}
      </Layer>
    </>
  );
}
